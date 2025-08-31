from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from content_manager import ContentManager
import uvicorn
import os
import logging
from dotenv import load_dotenv
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
import secrets
import hashlib
from pydantic import BaseModel
from reportlab.lib.pagesizes import A4, letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, Frame, PageTemplate, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm, mm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus.tableofcontents import TableOfContents
import tempfile
import asyncio
import aiofiles
import requests
from io import BytesIO
import base64

# Load environment variables
load_dotenv()

# Logging configuration
logging.basicConfig(level=logging.INFO)

# MongoDB connection - SINGLE SOURCE OF TRUTH (GitHub ENV priority)
mongo_url = (
    os.environ.get('MONGO_URI') or           # GitHub ENV (primary)
    os.environ.get('DATABASE_URL') or        # Railway fallback
    os.environ.get('MONGO_URL', 'mongodb://localhost:27017')  # Local fallback
)

logging.info(f"🔗 Connecting to MongoDB: {mongo_url[:50]}{'...' if len(mongo_url) > 50 else ''}")
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'grras_database')]

# Initialize Content Manager - MONGODB ONLY (No JSON fallbacks during normal operation)
content_manager = ContentManager(
    storage_type="mongo",  # FORCED MongoDB - single source of truth
    mongo_client=client,   # Always provide MongoDB client
    db_name=os.environ.get('DB_NAME', 'grras_database')
)

# Create FastAPI app
app = FastAPI(
    title="GRRAS Solutions Training Institute API",
    description="Professional IT Training Institute API",
    version="1.0.0"
)

# CORS Configuration 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Railway deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Admin credentials
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'grras@admin2024')

# Pydantic models
class LoginRequest(BaseModel):
    password: str

class ContentRequest(BaseModel):
    content: Dict[str, Any]
    isDraft: Optional[bool] = False

class LeadRequest(BaseModel):
    name: str
    email: str
    phone: str
    course: str
    message: Optional[str] = ""

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin JWT token"""
    token = credentials.credentials
    
    # Simple token verification (in production, use proper JWT)
    expected_token = hashlib.sha256(f"grras_admin_{ADMIN_PASSWORD}".encode()).hexdigest()
    if token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    
    return True

# API Routes
api_router = APIRouter(prefix="/api")

@api_router.get("/health")
async def health_check():
    """API Health Check"""
    try:
        # Test MongoDB connection
        await db.list_collection_names()
        return {"status": "healthy", "database": "connected", "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        logging.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "error": str(e), "timestamp": datetime.utcnow().isoformat()}

@api_router.post("/admin/login")
async def admin_login(request: LoginRequest):
    """Admin authentication"""
    if request.password == ADMIN_PASSWORD:
        # Generate simple token (in production, use proper JWT)
        token = hashlib.sha256(f"grras_admin_{ADMIN_PASSWORD}".encode()).hexdigest()
        return {"token": token, "message": "Login successful"}
    else:
        raise HTTPException(status_code=401, detail="Invalid password")

@api_router.get("/content")
async def get_content():
    """Get all CMS content"""
    try:
        content = await content_manager.get_content()
        return {"content": content, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        logging.error(f"Error fetching content: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch content")

@api_router.post("/content")
async def save_content(request: ContentRequest, admin_verified: bool = Depends(verify_admin_token)):
    """Save CMS content (Admin only)"""
    try:
        updated_content = await content_manager.save_content(
            request.content, 
            user="admin", 
            is_draft=request.isDraft
        )
        return {
            "message": "Content saved successfully", 
            "content": updated_content,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logging.error(f"Error saving content: {e}")
        raise HTTPException(status_code=500, detail="Failed to save content")

@api_router.get("/courses")
async def get_courses():
    """Get all courses from CMS"""
    try:
        content = await content_manager.get_content()
        courses = content.get("courses", [])
        
        # Filter only visible courses and sort by order
        visible_courses = [
            course for course in courses 
            if course.get("visible", True)
        ]
        visible_courses.sort(key=lambda x: x.get("order", 999))
        
        return {
            "courses": visible_courses,
            "total": len(visible_courses),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logging.error(f"Error fetching courses: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch courses")

@api_router.get("/courses/{slug}")
async def get_course(slug: str):
    """Get specific course by slug"""
    try:
        content = await content_manager.get_content()
        courses = content.get("courses", [])
        
        course = next((c for c in courses if c.get("slug") == slug), None)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return course
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching course {slug}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch course")

@api_router.post("/courses/{slug}/syllabus")
async def generate_syllabus(slug: str, name: str = Form(...), email: str = Form(...), phone: str = Form(...)):
    """Generate and download course syllabus PDF"""
    try:
        # Get course data from CMS
        content = await content_manager.get_content()
        courses = content.get("courses", [])
        course = next((c for c in courses if c.get("slug") == slug), None)
        
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        # Get institute data from CMS
        institute = content.get("institute", {})
        branding = content.get("branding", {})
        
        # Ensure required fields exist with comprehensive defaults
        course_name = course.get("title", "Course")
        course_description = course.get("overview", course.get("oneLiner", "Professional training course"))
        tools = course.get("tools", [])
        highlights = course.get("highlights", [])
        learning_outcomes = course.get("learningOutcomes", [])
        career_roles = course.get("careerRoles", [])
        duration = course.get("duration", "Contact for details")
        fees = course.get("fees", "Contact for details")
        level = course.get("level", "All Levels")
        certificate_info = course.get("certificateInfo", "Certificate provided on successful completion")
        eligibility = course.get("eligibility", "Contact for eligibility criteria")
        
        # Create temporary PDF file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            pdf_path = tmp_file.name
        
        # Professional PDF template class
        class ProfessionalTemplate:
            def __init__(self, pdf_path, institute_data, branding_data, course_data):
                self.pdf_path = pdf_path
                self.institute_data = institute_data
                self.branding_data = branding_data
                self.course_data = course_data
                self.logo_image = None
                self.setup_logo()
                
            def setup_logo(self):
                """Download and prepare logo for PDF"""
                logo_url = self.branding_data.get("logoUrl", "")
                if logo_url and logo_url.startswith('http'):
                    try:
                        response = requests.get(logo_url, timeout=10)
                        if response.status_code == 200:
                            self.logo_image = BytesIO(response.content)
                            logging.info("✅ Logo loaded successfully")
                        else:
                            logging.warning(f"Failed to load logo: HTTP {response.status_code}")
                    except Exception as e:
                        logging.warning(f"Error loading logo: {e}")
                        
            def create_header_footer_template(self, canvas_obj, doc):
                """Professional header and footer for each page"""
                canvas_obj.saveState()
                
                # Page dimensions
                page_width = A4[0]
                page_height = A4[1]
                
                # Header section
                header_y = page_height - 40*mm
                
                # Header background
                canvas_obj.setFillColor(colors.HexColor('#DC2626'))
                canvas_obj.rect(0, header_y, page_width, 25*mm, fill=True, stroke=False)
                
                # Logo in header
                if self.logo_image:
                    try:
                        self.logo_image.seek(0)  # Reset stream position
                        img = Image(self.logo_image, width=40*mm, height=15*mm)
                        img.drawOn(canvas_obj, 20*mm, header_y + 5*mm)
                    except Exception as e:
                        logging.warning(f"Error drawing logo: {e}")
                
                # Institute name in header
                canvas_obj.setFillColor(colors.white)
                canvas_obj.setFont("Helvetica-Bold", 16)
                institute_name = self.institute_data.get("name", "GRRAS Solutions Training Institute")
                canvas_obj.drawString(70*mm, header_y + 12*mm, institute_name)
                
                canvas_obj.setFont("Helvetica", 10)
                canvas_obj.drawString(70*mm, header_y + 7*mm, 
                                    self.institute_data.get("tagline", "Empowering Futures Through Technology"))
                
                # Footer section
                footer_y = 15*mm
                
                # Footer line
                canvas_obj.setStrokeColor(colors.HexColor('#DC2626'))
                canvas_obj.setLineWidth(1)
                canvas_obj.line(20*mm, footer_y + 10*mm, page_width - 20*mm, footer_y + 10*mm)
                
                # Footer content
                canvas_obj.setFillColor(colors.HexColor('#6B7280'))
                canvas_obj.setFont("Helvetica", 8)
                
                # Left footer: Contact info
                phone = ', '.join(self.institute_data.get("phones", ["090019 91227"]))
                canvas_obj.drawString(20*mm, footer_y + 5*mm, f"📞 {phone}")
                
                email = ', '.join(self.institute_data.get("emails", ["info@grrassolutions.com"]))
                canvas_obj.drawString(20*mm, footer_y + 1*mm, f"📧 {email}")
                
                # Right footer: Page number and date
                page_num = canvas_obj.getPageNumber()
                canvas_obj.drawRightString(page_width - 20*mm, footer_y + 5*mm, f"Page {page_num}")
                
                current_date = datetime.now().strftime("%B %Y")
                canvas_obj.drawRightString(page_width - 20*mm, footer_y + 1*mm, f"Generated: {current_date}")
                
                canvas_obj.restoreState()
        
        # Initialize professional template
        template_handler = ProfessionalTemplate(pdf_path, institute, branding, course)
        
        # Enhanced PDF generation with professional layout
        doc = SimpleDocTemplate(
            pdf_path, 
            pagesize=A4, 
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=30*mm,
            bottomMargin=25*mm
        )
        
        # Set up page template with header/footer
        def on_first_page(canvas, doc):
            template_handler.create_header_footer_template(canvas, doc)
            
        def on_later_pages(canvas, doc):
            template_handler.create_header_footer_template(canvas, doc)
        
        doc.pageTemplates = [
            PageTemplate(id='first', frames=[Frame(20*mm, 25*mm, A4[0]-40*mm, A4[1]-55*mm, 
                                                 leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0)],
                        onPage=on_first_page),
            PageTemplate(id='later', frames=[Frame(20*mm, 25*mm, A4[0]-40*mm, A4[1]-55*mm,
                                                 leftPadding=0, bottomPadding=0, rightPadding=0, topPadding=0)],
                        onPage=on_later_pages)
        ]
        
        styles = getSampleStyleSheet()
        
        # Professional Typography Styles
        title_style = ParagraphStyle(
            'CourseTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=15,
            spaceBefore=20,
            textColor=colors.HexColor('#DC2626'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        section_heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceBefore=18,
            spaceAfter=10,
            textColor=colors.white,
            fontName='Helvetica-Bold',
            backColor=colors.HexColor('#DC2626'),
            borderPadding=(8, 12, 8, 12),  # top, right, bottom, left
            alignment=TA_LEFT
        )
        
        subsection_heading_style = ParagraphStyle(
            'SubsectionHeading',
            parent=styles['Heading3'],
            fontSize=12,
            spaceBefore=12,
            spaceAfter=6,
            textColor=colors.HexColor('#DC2626'),
            fontName='Helvetica-Bold',
            leftIndent=0
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            leading=14,
            textColor=colors.HexColor('#374151'),
            alignment=TA_JUSTIFY,
            firstLineIndent=0
        )
        
        bullet_style = ParagraphStyle(
            'Bullet',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=4,
            leading=13,
            leftIndent=15,
            bulletIndent=10,
            textColor=colors.HexColor('#4B5563')
        )
        
        highlight_box_style = ParagraphStyle(
            'HighlightBox',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6,
            leading=13,
            textColor=colors.HexColor('#065F46'),
            backColor=colors.HexColor('#F0FDF4'),
            borderColor=colors.HexColor('#10B981'),
            borderWidth=1,
            borderPadding=(6, 8, 6, 8)
        )
        
        info_box_style = ParagraphStyle(
            'InfoBox',
            parent=styles['Normal'],
            fontSize=9,
            spaceAfter=8,
            leading=12,
            textColor=colors.HexColor('#1E40AF'),
            backColor=colors.HexColor('#F0F9FF'),
            borderColor=colors.HexColor('#3B82F6'),
            borderWidth=1,
            borderPadding=(8, 10, 8, 10),
            alignment=TA_CENTER
        )
        
        # Professional PDF content structure
        content_elements = []
        
        # Title page content (header/footer handled by template)
        content_elements.append(Spacer(1, 20*mm))
        
        # Course title section
        content_elements.append(Paragraph("COURSE SYLLABUS", title_style))
        content_elements.append(Spacer(1, 5*mm))
        
        # Course name with decorative line
        content_elements.append(Paragraph(f"{course_name}", title_style))
        content_elements.append(Spacer(1, 10*mm))
        
        # Professional course overview box
        if course_description:
            overview_content = f"<b>Course Overview:</b><br/>{course_description}"
            content_elements.append(Paragraph(overview_content, info_box_style))
            content_elements.append(Spacer(1, 8*mm))
        
        # Course details in professional table
        course_details = [
            ['Course Information', ''],
            ['Duration', duration],
            ['Level', level],
            ['Investment', fees],
            ['Eligibility', eligibility]
        ]
        
        # Professional table styling
        course_table = Table(course_details, colWidths=[45*mm, 120*mm])
        course_table.setStyle(TableStyle([
            # Header row
            ('SPAN', (0, 0), (1, 0)),
            ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#DC2626')),
            ('TEXTCOLOR', (0, 0), (1, 0), colors.white),
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (1, 0), 12),
            ('ALIGN', (0, 0), (1, 0), 'CENTER'),
            
            # Data rows
            ('BACKGROUND', (0, 1), (0, -1), colors.HexColor('#F8FAFC')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#374151')),
            
            # Borders and padding
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        content_elements.append(course_table)
        content_elements.append(Spacer(1, 12*mm))
        
        # Course Overview
        if course_description:
            content_elements.append(Paragraph("📋 Course Overview", heading_style))
            content_elements.append(Paragraph(course_description, normal_style))
            content_elements.append(Spacer(1, 15))
        
        # Course Highlights with enhanced styling
        if highlights:
            content_elements.append(Paragraph("⭐ Course Highlights", heading_style))
            highlights_table = []
            for i in range(0, len(highlights[:8]), 2):  # Two columns layout
                row = []
                row.append(f"✓ {highlights[i]}")
                if i + 1 < len(highlights[:8]):
                    row.append(f"✓ {highlights[i + 1]}")
                else:
                    row.append("")
                highlights_table.append(row)
            
            if highlights_table:
                table = Table(highlights_table, colWidths=[3*inch, 3*inch])
                table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#059669')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 5),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 5),
                    ('TOPPADDING', (0, 0), (-1, -1), 3),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 3)
                ]))
                content_elements.append(table)
            content_elements.append(Spacer(1, 15))
        
        # Tools/Technologies section with icons
        if tools:
            content_elements.append(Paragraph("🛠️ Tools & Technologies Covered", heading_style))
            tools_list = []
            for i in range(0, len(tools), 3):  # Three columns layout
                row = []
                for j in range(3):
                    if i + j < len(tools):
                        row.append(f"• {tools[i + j]}")
                    else:
                        row.append("")
                tools_list.append(row)
            
            if tools_list:
                tools_table = Table(tools_list, colWidths=[2*inch, 2*inch, 2*inch])
                tools_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#374151')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 5),
                    ('TOPPADDING', (0, 0), (-1, -1), 3),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 3)
                ]))
                content_elements.append(tools_table)
            content_elements.append(Spacer(1, 15))
        
        # Learning Outcomes with better presentation
        if learning_outcomes:
            content_elements.append(Paragraph("🎯 What You'll Learn", heading_style))
            for i, outcome in enumerate(learning_outcomes[:8], 1):
                content_elements.append(Paragraph(f"{i}. {outcome}", bullet_style))
            content_elements.append(Spacer(1, 15))
        else:
            # Enhanced default learning outcomes
            content_elements.append(Paragraph("🎯 Learning Outcomes", heading_style))
            content_elements.append(Paragraph("Upon successful completion of this program, you will:", normal_style))
            default_outcomes = [
                "Master industry-relevant skills and technologies",
                "Gain practical experience through hands-on projects",
                "Be prepared for industry certifications",
                "Develop strong problem-solving capabilities",
                "Build a professional portfolio",
                "Understand industry best practices"
            ]
            for i, outcome in enumerate(default_outcomes, 1):
                content_elements.append(Paragraph(f"{i}. {outcome}", bullet_style))
            content_elements.append(Spacer(1, 15))
        
        # Career Opportunities with salary ranges if available
        if career_roles:
            content_elements.append(Paragraph("💼 Career Opportunities", heading_style))
            roles_table = []
            for i in range(0, len(career_roles[:8]), 2):
                row = []
                row.append(f"→ {career_roles[i]}")
                if i + 1 < len(career_roles[:8]):
                    row.append(f"→ {career_roles[i + 1]}")
                else:
                    row.append("")
                roles_table.append(row)
            
            if roles_table:
                table = Table(roles_table, colWidths=[3*inch, 3*inch])
                table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#7C2D12')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 5),
                    ('TOPPADDING', (0, 0), (-1, -1), 3),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 3)
                ]))
                content_elements.append(table)
            content_elements.append(Spacer(1, 15))
        
        # Certificate Information with enhanced styling
        content_elements.append(Paragraph("🏆 Certificate Information", heading_style))
        content_elements.append(Paragraph(certificate_info, normal_style))
        
        # Add certification benefits
        cert_benefits = [
            "Industry-recognized certificate upon successful completion",
            "Digital certificate with verification QR code",
            "Certificate can be shared on LinkedIn and other platforms",
            "Lifetime validity with institute verification"
        ]
        for benefit in cert_benefits:
            content_elements.append(Paragraph(f"✓ {benefit}", highlight_style))
        
        content_elements.append(Spacer(1, 20))
        
        # Page break for contact information
        content_elements.append(PageBreak())
        
        # Contact Information with enhanced styling
        address = institute.get("address", "A-81, Singh Bhoomi Khatipura Rd, Jaipur, Rajasthan")
        phones = institute.get("phones", ["090019 91227"])
        emails = institute.get("emails", ["info@grrassolutions.com"])
        website = institute.get("website", "https://grrassolutions.com")
        
        content_elements.append(Paragraph("📞 Contact Information", heading_style))
        
        # Contact details in a professional table
        contact_data = [
            ['🏢 Institute', institute_name],
            ['📍 Address', address],
            ['📱 Phone', ', '.join(phones)],
            ['📧 Email', ', '.join(emails)],
            ['🌐 Website', website]
        ]
        
        contact_table = Table(contact_data, colWidths=[1.5*inch, 4.5*inch])
        contact_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3F4F6')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#111827')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6)
        ]))
        
        content_elements.append(contact_table)
        content_elements.append(Spacer(1, 25))
        
        # Admission Process
        content_elements.append(Paragraph("📋 Admission Process", heading_style))
        admission_steps = [
            "1. Submit your inquiry online or visit our campus",
            "2. Meet with our expert counselors for course guidance", 
            "3. Complete enrollment with required documents",
            "4. Join orientation and start your learning journey"
        ]
        
        for step in admission_steps:
            content_elements.append(Paragraph(step, bullet_style))
        
        content_elements.append(Spacer(1, 20))
        
        # Call to Action
        cta_style = ParagraphStyle(
            'CTAStyle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#DC2626'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
            borderWidth=2,
            borderColor=colors.HexColor('#DC2626'),
            borderPadding=10,
            backColor=colors.HexColor('#FEF2F2')
        )
        
        content_elements.append(Paragraph("🚀 Ready to Start Your IT Career? Contact Our Counselors Today!", cta_style))
        content_elements.append(Spacer(1, 15))
        
        # Footer with generation info
        footer_style = ParagraphStyle(
            'FooterStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#6B7280'),
            alignment=TA_CENTER
        )
        
        current_date = datetime.now().strftime("%B %d, %Y")
        content_elements.append(Paragraph(f"Generated on {current_date} | {institute_name}", footer_style))
        content_elements.append(Paragraph("This syllabus is subject to updates. Please contact us for the latest information.", footer_style))
        
        # Build PDF
        doc.build(content_elements)
        
        # Store lead information
        try:
            lead_data = {
                "name": name,
                "email": email,
                "phone": phone,
                "course": course_name,
                "type": "syllabus_download",
                "timestamp": datetime.utcnow().isoformat(),
                "ip": "Railway-Server"
            }
            
            # Save to MongoDB
            collection = db.leads
            await collection.insert_one(lead_data)
            
        except Exception as e:
            logging.warning(f"Failed to store lead data: {e}")
        
        # Return PDF file
        return FileResponse(
            pdf_path, 
            filename=f"{course_name.replace(' ', '_')}_Syllabus.pdf",
            media_type="application/pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error generating syllabus for {slug}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate syllabus")

@api_router.get("/leads")
async def get_leads(admin_verified: bool = Depends(verify_admin_token)):
    """Get all leads (Admin only)"""
    try:
        collection = db.leads
        leads = await collection.find({}).sort("timestamp", -1).to_list(1000)
        
        # Convert ObjectId to string for JSON serialization
        for lead in leads:
            if "_id" in lead:
                lead["_id"] = str(lead["_id"])
        
        return {
            "leads": leads,
            "total": len(leads),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logging.error(f"Error fetching leads: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch leads")

@api_router.post("/contact")
async def submit_contact(request: LeadRequest):
    """Submit contact form"""
    try:
        lead_data = {
            "name": request.name,
            "email": request.email,
            "phone": request.phone,
            "course": request.course,
            "message": request.message,
            "type": "contact_form",
            "timestamp": datetime.utcnow().isoformat(),
            "ip": "Railway-Server"
        }
        
        # Save to MongoDB
        collection = db.leads
        await collection.insert_one(lead_data)
        
        return {"message": "Contact form submitted successfully"}
        
    except Exception as e:
        logging.error(f"Error submitting contact form: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")

# Include API router
app.include_router(api_router)

# Root endpoint
@app.get("/")
async def root():
    """API Root - Redirect to health check"""
    return RedirectResponse(url="/api/health")

if __name__ == "__main__":
    # Railway deployment
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from content_manager import ContentManager
import uvicorn
import os
import logging
from dotenv import load_dotenv
from datetime import datetime
from typing import Dict, Any, Optional, List
import hashlib
from pydantic import BaseModel
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import requests
from io import BytesIO
from bson import ObjectId
from bson.errors import InvalidId

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
    pdf_buffer = None
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
        
        # Extract course details with NULL SAFETY
        course_name = course.get("title") or course.get("name") or slug.replace("-", " ").title()
        course_description = course.get("overview") or course.get("description") or ""
        highlights = course.get("highlights") or []
        tools = course.get("tools") or []
        learning_outcomes = course.get("learningOutcomes") or []
        career_roles = course.get("careerRoles") or []
        duration = course.get("duration") or "Contact for details"
        fees = course.get("fees") or "Contact for details"
        level = course.get("level") or "All Levels"
        certificate_info = course.get("certificateInfo") or "Certificate provided on successful completion"
        eligibility = course.get("eligibility") or "Contact for eligibility criteria"
        
        # Ensure all list fields are actually lists
        if not isinstance(highlights, list):
            highlights = []
        if not isinstance(tools, list):
            tools = []
        if not isinstance(learning_outcomes, list):
            learning_outcomes = []
        if not isinstance(career_roles, list):
            career_roles = []
        
        # Generate PDF IN MEMORY
        pdf_buffer = BytesIO()
        
        # Professional PDF Template Class
        class GRRASPDFTemplate:
            def __init__(self, institute_data, branding_data, course_data):
                self.institute_data = institute_data
                self.branding_data = branding_data
                self.course_data = course_data
                self.logo_image_data = None
                self.setup_logo()
                
            def setup_logo(self):
                """Download and prepare logo with correct aspect ratio"""
                logo_url = self.branding_data.get("logoUrl", "")
                if logo_url and logo_url.startswith('http'):
                    try:
                        response = requests.get(logo_url, timeout=10)
                        if response.status_code == 200:
                            self.logo_image_data = BytesIO(response.content)
                            logging.info("✅ Logo loaded for PDF template")
                        else:
                            logging.warning(f"Logo load failed: HTTP {response.status_code}")
                    except Exception as e:
                        logging.warning(f"Logo loading error: {e}")
                        
            def create_header_footer(self, canvas_obj, doc):
                """Create header and footer for each page"""
                canvas_obj.saveState()
                
                page_width = A4[0]
                page_height = A4[1]
                
                # HEADER - Clean professional design
                header_height = 20*mm
                header_y = page_height - header_height
                
                # Header background - subtle red stripe
                canvas_obj.setFillColor(colors.HexColor('#DC2626'))
                canvas_obj.rect(0, page_height - 8*mm, page_width, 8*mm, fill=True, stroke=False)
                
                # Logo with correct aspect ratio
                if self.logo_image_data:
                    try:
                        self.logo_image_data.seek(0)
                        # Maintain aspect ratio: max 35mm width, 12mm height
                        logo_img = Image(self.logo_image_data, width=35*mm, height=12*mm, kind='proportional')
                        logo_img.drawOn(canvas_obj, 20*mm, page_height - 15*mm)
                    except Exception as e:
                        logging.warning(f"Logo drawing error: {e}")
                
                # Institute name and website in header
                canvas_obj.setFillColor(colors.HexColor('#1F2937'))
                canvas_obj.setFont("Helvetica-Bold", 12)
                institute_name = self.institute_data.get("name", "GRRAS Solutions Training Institute")
                canvas_obj.drawString(65*mm, page_height - 10*mm, institute_name)
                
                canvas_obj.setFont("Helvetica", 9)
                canvas_obj.setFillColor(colors.HexColor('#DC2626'))
                canvas_obj.drawString(65*mm, page_height - 14*mm, "https://www.grras.tech")
                
                # FOOTER - Page number and website on every page
                footer_y = 15*mm
                canvas_obj.setFillColor(colors.HexColor('#6B7280'))
                canvas_obj.setFont("Helvetica", 8)
                
                # Page number and website
                page_num = canvas_obj.getPageNumber()
                canvas_obj.drawString(20*mm, footer_y, f"Page {page_num}")
                canvas_obj.drawRightString(page_width - 20*mm, footer_y, "www.grras.tech")
                
                # Full contact info only on LAST page
                total_pages = getattr(doc, 'page_count', 1)
                if page_num == total_pages:
                    self.add_contact_footer(canvas_obj, footer_y)
                
                canvas_obj.restoreState()
                
            def add_contact_footer(self, canvas_obj, footer_y):
                """Add full contact information on last page"""
                canvas_obj.setFont("Helvetica", 8)
                canvas_obj.setFillColor(colors.HexColor('#374151'))
                
                address = self.institute_data.get("address", "A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012")
                phone = ', '.join(self.institute_data.get("phones", ["090019 91227"]))
                email = ', '.join(self.institute_data.get("emails", ["info@grrassolutions.com"]))
                
                # Contact details in compact format
                contact_y = footer_y + 8*mm
                canvas_obj.drawString(20*mm, contact_y, f"Address: {address}")
                canvas_obj.drawString(20*mm, contact_y - 3*mm, f"Phone: {phone} | Email: {email}")
        
        # Initialize template handler
        template_handler = GRRASPDFTemplate(institute, branding, course)
        
        # Create PDF document
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=25*mm,
            bottomMargin=20*mm
        )
        

        
        def create_header_footer(canvas, doc):
            template_handler.create_header_footer(canvas, doc)
            
        doc.page_count = 2  # Default estimate
        
        styles = getSampleStyleSheet()
        
        # GRRAS PDF Typography Styles - following specific rules
        title_style = ParagraphStyle(
            'CourseTitle',
            parent=styles['Heading1'],
            fontSize=22,
            spaceAfter=12,
            spaceBefore=15,
            textColor=colors.HexColor('#DC2626'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        section_heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontSize=13,
            spaceBefore=15,
            spaceAfter=8,
            textColor=colors.white,
            fontName='Helvetica-Bold',
            backColor=colors.HexColor('#DC2626'),
            borderPadding=6,
            alignment=TA_LEFT,
            keepWithNext=True  # Keep heading with content
        )
        
        body_text_style = ParagraphStyle(
            'BodyText',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=5,
            leading=13,
            textColor=colors.HexColor('#374151'),
            alignment=TA_LEFT,
            firstLineIndent=0
        )
        
        bullet_list_style = ParagraphStyle(
            'BulletList',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=3,
            leading=13,
            leftIndent=12,
            bulletIndent=8,
            textColor=colors.HexColor('#374151')
        )
        
        number_list_style = ParagraphStyle(
            'NumberList',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=4,
            leading=13,
            leftIndent=15,
            textColor=colors.HexColor('#374151')
        )
        
        certification_box_style = ParagraphStyle(
            'CertificationBox',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=8,
            leading=13,
            textColor=colors.HexColor('#0F766E'),
            backColor=colors.HexColor('#F0FDFA'),
            borderColor=colors.HexColor('#14B8A6'),
            borderWidth=1,
            borderPadding=8,
            alignment=TA_LEFT
        )
        
        info_label_style = ParagraphStyle(
            'InfoLabel',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=2,
            leading=12,
            textColor=colors.HexColor('#374151'),
            fontName='Helvetica'
        )
        
        # PDF Content Generation - Following GRRAS Rules
        content_elements = []
        
        # Course Title
        content_elements.append(Spacer(1, 10*mm))
        content_elements.append(Paragraph("COURSE SYLLABUS", title_style))
        content_elements.append(Paragraph(f"{course_name}", title_style))
        content_elements.append(Spacer(1, 8*mm))
        
        # Course Overview (if available)
        if course_description:
            content_elements.append(Paragraph("Course Overview", section_heading_style))
            content_elements.append(Paragraph(course_description, body_text_style))
            content_elements.append(Spacer(1, 8*mm))
        
        # Course Information - Label: Value format with ₹ for fee
        content_elements.append(Paragraph("Course Information", section_heading_style))
        
        # Format fee with ₹ symbol
        formatted_fee = fees
        if fees and fees.lower() not in ['contact for details', 'on request', 'varies']:
            # Add ₹ symbol if not already present and it's a number
            if not fees.startswith('₹') and any(char.isdigit() for char in fees):
                formatted_fee = f"₹ {fees}"
        
        course_info_items = [
            f"<b>Duration:</b> {duration}",
            f"<b>Level:</b> {level}",
            f"<b>Fee:</b> {formatted_fee}",
            f"<b>Eligibility:</b> {eligibility}"
        ]
        
        for item in course_info_items:
            content_elements.append(Paragraph(item, info_label_style))
        
        content_elements.append(Spacer(1, 8*mm))
        
        # Course Highlights - each item one line, keep together
        if highlights:
            highlights_section = []
            highlights_section.append(Paragraph("Course Highlights", section_heading_style))
            
            for highlight in highlights[:12]:  # Limit for space
                highlights_section.append(Paragraph(f"✓ {highlight}", bullet_list_style))
            
            # Keep highlights together on same page
            content_elements.append(KeepTogether(highlights_section))
            content_elements.append(Spacer(1, 8*mm))
        
        # Learning Outcomes - each item one line, keep together  
        if learning_outcomes:
            outcomes_section = []
            outcomes_section.append(Paragraph("What You'll Learn", section_heading_style))
            
            for i, outcome in enumerate(learning_outcomes[:12], 1):
                outcomes_section.append(Paragraph(f"{i}. {outcome}", number_list_style))
            
            content_elements.append(KeepTogether(outcomes_section))
            content_elements.append(Spacer(1, 8*mm))
        
        # Tools & Technologies - Multi-column grid (3 columns)
        if tools:
            content_elements.append(Paragraph("Tools & Technologies Covered", section_heading_style))
            
            # Create 3-column grid
            tools_data = []
            for i in range(0, len(tools), 3):
                row = []
                for j in range(3):
                    if i + j < len(tools):
                        row.append(f"• {tools[i + j]}")
                    else:
                        row.append("")
                tools_data.append(row)
            
            if tools_data:
                tools_table = Table(tools_data, colWidths=[53*mm, 53*mm, 54*mm])
                tools_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#374151')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 2),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
                ]))
                content_elements.append(tools_table)
            content_elements.append(Spacer(1, 8*mm))
        
        # Career Opportunities
        if career_roles:
            careers_section = []
            careers_section.append(Paragraph("Career Opportunities", section_heading_style))
            
            for role in career_roles[:10]:
                careers_section.append(Paragraph(f"→ {role}", bullet_list_style))
            
            content_elements.append(KeepTogether(careers_section))
            content_elements.append(Spacer(1, 8*mm))
        
        # Certification Section - Styled block with icon
        cert_content = f"🏆 <b>Certification Details</b><br/><br/>{certificate_info}<br/><br/>"
        cert_content += "✓ Industry-recognized certificate upon completion<br/>"
        cert_content += "✓ Digital verification available<br/>"
        cert_content += "✓ LinkedIn profile enhancement ready<br/>"
        cert_content += "✓ Lifetime validity with institute backing"
        
        # Add QR code info if available
        qr_info = course.get("certificateQR") or course.get("verificationLink")
        if qr_info:
            cert_content += f"<br/><br/>📱 <b>Verification:</b> {qr_info}"
        
        content_elements.append(Paragraph(cert_content, certification_box_style))
        content_elements.append(Spacer(1, 10*mm))
        
        # Course Highlights Section
        if highlights:
            content_elements.append(Paragraph("COURSE HIGHLIGHTS", section_heading_style))
            content_elements.append(Spacer(1, 3*mm))
            
            # Create highlights in a professional grid
            highlights_data = []
            for i in range(0, len(highlights[:8]), 2):
                row = []
                row.append(f"✓ {highlights[i]}")
                if i + 1 < len(highlights[:8]):
                    row.append(f"✓ {highlights[i + 1]}")
                else:
                    row.append("")
                highlights_data.append(row)
            
            if highlights_data:
                highlights_table = Table(highlights_data, colWidths=[80*mm, 80*mm])
                highlights_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#059669')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 3),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 3),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 2)
                ]))
                content_elements.append(highlights_table)
            content_elements.append(Spacer(1, 8*mm))
        
        # Learning Outcomes Section
        if learning_outcomes:
            content_elements.append(Paragraph("LEARNING OUTCOMES", section_heading_style))
            content_elements.append(Spacer(1, 3*mm))
            
            for i, outcome in enumerate(learning_outcomes[:10], 1):
                content_elements.append(Paragraph(f"{i}. {outcome}", number_list_style))
            content_elements.append(Spacer(1, 8*mm))
        
        # Tools & Technologies Section
        if tools:
            content_elements.append(Paragraph("TOOLS & TECHNOLOGIES", section_heading_style))
            content_elements.append(Spacer(1, 3*mm))
            
            tools_data = []
            for i in range(0, len(tools), 3):
                row = []
                for j in range(3):
                    if i + j < len(tools):
                        row.append(f"• {tools[i + j]}")
                    else:
                        row.append("")
                tools_data.append(row)
            
            if tools_data:
                tools_table = Table(tools_data, colWidths=[53*mm, 53*mm, 54*mm])
                tools_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 9),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#4B5563')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 2),
                    ('TOPPADDING', (0, 0), (-1, -1), 1),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 1)
                ]))
                content_elements.append(tools_table)
            content_elements.append(Spacer(1, 8*mm))
        
        # Career Opportunities Section
        if career_roles:
            content_elements.append(Paragraph("CAREER OPPORTUNITIES", section_heading_style))
            content_elements.append(Spacer(1, 3*mm))
            
            careers_data = []
            for i in range(0, len(career_roles[:8]), 2):
                row = []
                row.append(f"→ {career_roles[i]}")
                if i + 1 < len(career_roles[:8]):
                    row.append(f"→ {career_roles[i + 1]}")
                else:
                    row.append("")
                careers_data.append(row)
            
            if careers_data:
                careers_table = Table(careers_data, colWidths=[80*mm, 80*mm])
                careers_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#7C2D12')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 3),
                    ('TOPPADDING', (0, 0), (-1, -1), 2),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 2)
                ]))
                content_elements.append(careers_table)
            content_elements.append(Spacer(1, 8*mm))
        
        # Certificate Information
        content_elements.append(Paragraph("CERTIFICATION DETAILS", section_heading_style))
        content_elements.append(Spacer(1, 3*mm))
        content_elements.append(Paragraph(certificate_info, body_text_style))
        
        # Certification benefits in highlight box
        cert_benefits = [
            "✓ Industry-recognized certificate upon completion",
            "✓ Digital verification with QR code",
            "✓ LinkedIn profile enhancement ready",
            "✓ Lifetime validity with institute backing"
        ]
        
        for benefit in cert_benefits:
            content_elements.append(Paragraph(benefit, bullet_list_style))
        
        content_elements.append(Spacer(1, 10*mm))
        
        # Admission Process - Numbered list with consistent punctuation
        content_elements.append(Paragraph("Admission Process", section_heading_style))
        
        admission_steps = [
            "Submit your inquiry online or visit our campus for course consultation.",
            "Meet with our expert counselors to discuss career goals and course fit.", 
            "Complete admission with required documents and secure your seat.",
            "Join orientation session and begin your learning journey."
        ]
        
        for i, step in enumerate(admission_steps, 1):
            content_elements.append(Paragraph(f"{i}. {step}", number_list_style))
        
        content_elements.append(Spacer(1, 10*mm))
        
        # Call-to-Action
        cta_content = "🚀 <b>Ready to Transform Your Career? Join GRRAS Today!</b><br/><br/>"
        cta_content += "Contact our counselors for personalized guidance and enrollment assistance.<br/>"
        cta_content += "Visit us at: https://www.grras.tech"
        
        content_elements.append(Paragraph(cta_content, certification_box_style))
        
        # Add generation date - DD Mon YYYY format
        current_date = datetime.now().strftime("%d %b %Y")
        content_elements.append(Spacer(1, 8*mm))
        content_elements.append(Paragraph(f"<i>Generated on: {current_date}</i>", body_text_style))
        
        # Build PDF with GRRAS template
        try:
            doc.build(content_elements, onFirstPage=create_header_footer, onLaterPages=create_header_footer)
            logging.info(f"✅ GRRAS PDF generated for {course_name}")
        except Exception as e:
            logging.error(f"PDF generation error: {e}")
            # Fallback to simple document
            try:
                pdf_buffer.seek(0)  # Reset buffer
                simple_doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
                simple_doc.build(content_elements)
                logging.info("✅ Fallback PDF generation successful")
            except Exception as fallback_error:
                logging.error(f"Fallback PDF generation also failed: {fallback_error}")
                raise HTTPException(status_code=422, detail=f"Failed to generate syllabus: {str(fallback_error)}")
        
        # Store lead information (non-blocking)
        try:
            lead_data = {
                "name": name,
                "email": email,
                "phone": phone,
                "course": course_name,
                "type": "syllabus_download",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Save to MongoDB
            collection = db.leads
            await collection.insert_one(lead_data)
            logging.info(f"✅ Lead saved for syllabus download: {email}")
            
        except Exception as e:
            logging.warning(f"Failed to store lead data: {e}")
        
        # Return PDF from memory
        pdf_buffer.seek(0)
        pdf_content = pdf_buffer.getvalue()
        
        if not pdf_content:
            raise HTTPException(status_code=422, detail="Failed to generate syllabus: PDF content is empty")
        
        # Create safe filename
        safe_filename = f"{slug}-syllabus.pdf"
        
        # Create response with proper headers
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={safe_filename}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        logging.error(f"Error generating syllabus for {slug}: {e}\nStack trace: {error_details}")
        raise HTTPException(status_code=422, detail=f"Failed to generate syllabus: {str(e)}")
    finally:
        # Clean up resources
        if pdf_buffer:
            pdf_buffer.close()

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

class BulkDeleteRequest(BaseModel):
    lead_ids: List[str]
    
    class Config:
        json_schema_extra = {
            "example": {
                "lead_ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
            }
        }

@api_router.delete("/leads/bulk")
async def delete_multiple_leads(request: BulkDeleteRequest, admin_verified: bool = Depends(verify_admin_token)):
    """Delete multiple leads (Admin only)"""
    logging.info(f"🔍 Bulk delete endpoint called with request: {request}")
    logging.info(f"🔍 Request lead_ids: {request.lead_ids}")
    logging.info(f"🔍 Admin verified: {admin_verified}")
    try:
        logging.info("🔍 Starting bulk delete validation...")
        # Validate all ObjectId formats
        object_ids = []
        for lead_id in request.lead_ids:
            try:
                logging.info(f"🔍 Converting lead_id: {lead_id} (type: {type(lead_id)})")
                object_id = ObjectId(lead_id)
                object_ids.append(object_id)
                logging.info(f"✅ Successfully converted: {object_id}")
            except InvalidId as e:
                logging.error(f"❌ Invalid ObjectId: {lead_id} - {e}")
                raise HTTPException(status_code=400, detail=f"Invalid lead ID format: {lead_id}")
            except Exception as e:
                logging.error(f"❌ Unexpected error converting {lead_id}: {e}")
                raise HTTPException(status_code=400, detail=f"Invalid lead ID format: {lead_id}")
        
        collection = db.leads
        result = await collection.delete_many({"_id": {"$in": object_ids}})
        
        logging.info(f"✅ Bulk deleted {result.deleted_count} leads")
        return {
            "message": f"Successfully deleted {result.deleted_count} leads",
            "deleted_count": result.deleted_count,
            "requested_count": len(request.lead_ids)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error bulk deleting leads: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete leads")

@api_router.delete("/leads/{lead_id}")
async def delete_lead(lead_id: str, admin_verified: bool = Depends(verify_admin_token)):
    """Delete a specific lead (Admin only)"""
    try:
        # Validate ObjectId format
        try:
            object_id = ObjectId(lead_id)
        except InvalidId:
            raise HTTPException(status_code=400, detail="Invalid lead ID format")
        
        collection = db.leads
        result = await collection.delete_one({"_id": object_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        logging.info(f"✅ Lead deleted: {lead_id}")
        return {"message": "Lead deleted successfully", "lead_id": lead_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting lead {lead_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete lead")

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
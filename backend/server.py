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
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, Frame, PageTemplate
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import tempfile
import asyncio
import aiofiles
import requests
from io import BytesIO

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
        
        # Enhanced PDF generation with custom page template
        doc = SimpleDocTemplate(
            pdf_path, 
            pagesize=A4, 
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2.5*cm,
            bottomMargin=2*cm
        )
        
        styles = getSampleStyleSheet()
        
        # Enhanced custom styles with better typography
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=28,
            spaceAfter=20,
            spaceBefore=10,
            textColor=colors.HexColor('#DC2626'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        institute_style = ParagraphStyle(
            'InstituteTitle',
            parent=styles['Heading1'],
            fontSize=22,
            spaceAfter=5,
            textColor=colors.HexColor('#1F2937'),
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        subtitle_style = ParagraphStyle(
            'SubtitleStyle',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=20,
            textColor=colors.HexColor('#6B7280'),
            alignment=TA_CENTER,
            fontName='Helvetica'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=12,
            textColor=colors.HexColor('#DC2626'),
            fontName='Helvetica-Bold',
            borderWidth=1,
            borderColor=colors.HexColor('#FEE2E2'),
            borderPadding=8,
            backColor=colors.HexColor('#FEF2F2')
        )
        
        subheading_style = ParagraphStyle(
            'SubHeading',
            parent=styles['Heading3'],
            fontSize=14,
            spaceBefore=15,
            spaceAfter=8,
            textColor=colors.HexColor('#374151'),
            fontName='Helvetica-Bold'
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            leading=16,
            textColor=colors.HexColor('#374151'),
            alignment=TA_JUSTIFY
        )
        
        bullet_style = ParagraphStyle(
            'BulletStyle',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            leading=15,
            leftIndent=20,
            bulletIndent=10,
            textColor=colors.HexColor('#374151')
        )
        
        highlight_style = ParagraphStyle(
            'HighlightStyle',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            leading=15,
            leftIndent=15,
            textColor=colors.HexColor('#059669'),
            fontName='Helvetica-Bold'
        )
        
        # Build content with enhanced layout
        content_elements = []
        
        # Header with logo and institute info
        institute_name = institute.get("name", "GRRAS Solutions Training Institute")
        institute_tagline = institute.get("tagline", "Empowering Futures Through Technology")
        
        # Try to add logo from URL
        logo_url = branding.get("logoUrl", "")
        if logo_url and logo_url.startswith('http'):
            try:
                # Download and embed logo
                response = requests.get(logo_url, timeout=10)
                if response.status_code == 200:
                    logo_data = BytesIO(response.content)
                    logo_img = Image(logo_data, width=2*inch, height=0.8*inch)
                    logo_img.hAlign = 'CENTER'
                    content_elements.append(logo_img)
                    content_elements.append(Spacer(1, 10))
            except Exception as e:
                logging.warning(f"Failed to load logo: {e}")
                # Fallback to text header
                content_elements.append(Paragraph("🎓", title_style))
        
        # Institute header
        content_elements.append(Paragraph(institute_name, institute_style))
        content_elements.append(Paragraph(institute_tagline, subtitle_style))
        content_elements.append(Spacer(1, 15))
        
        # Course title with enhanced styling
        content_elements.append(Paragraph(f"Course Syllabus", title_style))
        content_elements.append(Paragraph(f"{course_name}", institute_style))
        content_elements.append(Spacer(1, 25))
        
        # Professional course information table
        course_info_data = [
            ['Duration', duration],
            ['Level', level],
            ['Fees', fees],
            ['Eligibility', eligibility[:100] + '...' if len(eligibility) > 100 else eligibility]
        ]
        
        course_info_table = Table(course_info_data, colWidths=[2*inch, 4*inch])
        course_info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F3F4F6')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#374151')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#111827')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')])
        ]))
        
        content_elements.append(course_info_table)
        content_elements.append(Spacer(1, 25))
        
        # Course Details
        content_elements.append(Paragraph("Course Information", heading_style))
        content_elements.append(Paragraph(f"<b>Duration:</b> {duration}", normal_style))
        content_elements.append(Paragraph(f"<b>Fees:</b> {fees}", normal_style))
        content_elements.append(Paragraph(f"<b>Level:</b> {level}", normal_style))
        content_elements.append(Paragraph(f"<b>Eligibility:</b> {eligibility}", normal_style))
        content_elements.append(Spacer(1, 20))
        
        # Course Overview
        if course_description:
            content_elements.append(Paragraph("Course Overview", heading_style))
            content_elements.append(Paragraph(course_description, normal_style))
            content_elements.append(Spacer(1, 20))
        
        # Course Highlights
        if highlights:
            content_elements.append(Paragraph("Course Highlights", heading_style))
            for highlight in highlights[:8]:  # Limit to 8 highlights for space
                content_elements.append(Paragraph(f"✓ {highlight}", normal_style))
            content_elements.append(Spacer(1, 20))
        
        # Tools/Technologies section
        if tools:
            content_elements.append(Paragraph("Tools & Technologies Covered", heading_style))
            for tool in tools:
                content_elements.append(Paragraph(f"• {tool}", normal_style))
            content_elements.append(Spacer(1, 20))
        
        # Learning Outcomes
        if learning_outcomes:
            content_elements.append(Paragraph("What You'll Learn", heading_style))
            for outcome in learning_outcomes[:6]:  # Limit to 6 outcomes for space
                content_elements.append(Paragraph(f"🎯 {outcome}", normal_style))
            content_elements.append(Spacer(1, 20))
        else:
            # Default learning outcomes if none specified
            content_elements.append(Paragraph("Learning Outcomes", heading_style))
            content_elements.append(Paragraph("Upon successful completion of this program, students will:", normal_style))
            content_elements.append(Paragraph("• Master industry-relevant skills and technologies", normal_style))
            content_elements.append(Paragraph("• Gain practical experience through projects", normal_style))
            content_elements.append(Paragraph("• Be prepared for industry certifications", normal_style))
            content_elements.append(Paragraph("• Develop problem-solving capabilities", normal_style))
            content_elements.append(Spacer(1, 20))
        
        # Career Opportunities
        if career_roles:
            content_elements.append(Paragraph("Career Opportunities", heading_style))
            for role in career_roles[:6]:  # Limit to 6 roles for space
                content_elements.append(Paragraph(f"💼 {role}", normal_style))
            content_elements.append(Spacer(1, 20))
        
        # Certificate Information
        content_elements.append(Paragraph("Certificate Information", heading_style))
        content_elements.append(Paragraph(certificate_info, normal_style))
        content_elements.append(Spacer(1, 20))
        
        # Contact Information
        institute_name = institute.get("name", "GRRAS Solutions Training Institute")
        address = institute.get("address", "A-81, Singh Bhoomi Khatipura Rd, Jaipur, Rajasthan")
        phones = institute.get("phones", ["090019 91227"])
        emails = institute.get("emails", ["info@grrassolutions.com"])
        
        content_elements.append(Paragraph("Contact Information", heading_style))
        content_elements.append(Paragraph(f"<b>Institute:</b> {institute_name}", normal_style))
        content_elements.append(Paragraph(f"<b>Address:</b> {address}", normal_style))
        content_elements.append(Paragraph(f"<b>Phone:</b> {', '.join(phones)}", normal_style))
        content_elements.append(Paragraph(f"<b>Email:</b> {', '.join(emails)}", normal_style))
        content_elements.append(Spacer(1, 20))
        
        # Footer
        content_elements.append(Paragraph("For more information and admissions, please contact our counselors.", normal_style))
        
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
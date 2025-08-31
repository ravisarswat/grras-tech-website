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
        
        # Generate PDF
        doc = SimpleDocTemplate(pdf_path, pagesize=A4, topMargin=1*inch)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#DC2626'),
            alignment=1  # Center alignment
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor('#DC2626')
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            leading=14
        )
        
        # Build content
        content_elements = []
        
        # Header with logo and institute info
        try:
            # Try to add logo (with error handling)
            logo_url = branding.get("logoUrl", "")
            if logo_url:
                try:
                    # This is a simplified approach - in production you'd want better logo handling
                    content_elements.append(Paragraph("🎓 GRRAS Solutions Training Institute", title_style))
                except:
                    content_elements.append(Paragraph("🎓 GRRAS Solutions Training Institute", title_style))
            else:
                content_elements.append(Paragraph("🎓 GRRAS Solutions Training Institute", title_style))
        except:
            content_elements.append(Paragraph("📚 Professional IT Training Institute", normal_style))
        
        content_elements.append(Spacer(1, 20))
        
        # Course title
        content_elements.append(Paragraph(f"Course Syllabus: {course_name}", title_style))
        content_elements.append(Spacer(1, 20))
        
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
# FastAPI Server with Enhanced Blog Date Management and Newsletter Subscription
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
import uuid
from pydantic import BaseModel
from typing import Optional
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

@api_router.post("/content/migrate")
async def migrate_content(admin_verified: bool = Depends(verify_admin_token)):
    """Migrate existing content to include new course organization features (Admin only)"""
    try:
        # Get current content
        current_content = await content_manager.get_content()
        
        # Get default content with new structures
        default_content = content_manager.get_default_content()
        
        # Merge new structures if they don't exist
        if 'courseCategories' not in current_content:
            current_content['courseCategories'] = default_content['courseCategories']
            logging.info("✅ Added courseCategories to existing content")
        
        if 'learningPaths' not in current_content:
            current_content['learningPaths'] = default_content['learningPaths']
            logging.info("✅ Added learningPaths to existing content")
        
        # Update pages.home with new course discovery features if not present
        if 'pages' in current_content and 'home' in current_content['pages']:
            home_page = current_content['pages']['home']
            default_home = default_content['pages']['home']
            
            # Add course discovery features if missing
            if 'courseCategories' not in home_page:
                home_page['courseCategories'] = default_home['courseCategories']
                logging.info("✅ Added courseCategories section to homepage")
            
            if 'learningPaths' not in home_page:
                home_page['learningPaths'] = default_home['learningPaths']
                logging.info("✅ Added learningPaths section to homepage")
            
            if 'courseDiscovery' not in home_page:
                home_page['courseDiscovery'] = default_home['courseDiscovery']
                logging.info("✅ Added courseDiscovery section to homepage")
        
        # Save updated content
        updated_content = await content_manager.save_content(
            current_content, 
            user="system-migration", 
            is_draft=False
        )
        
        return {
            "message": "Content migrated successfully to include course organization features",
            "added_features": [
                "courseCategories" if 'courseCategories' not in await content_manager.get_content() else None,
                "learningPaths" if 'learningPaths' not in await content_manager.get_content() else None,
                "courseDiscovery homepage features"
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logging.error(f"Error migrating content: {e}")
        raise HTTPException(status_code=500, detail="Failed to migrate content")

@api_router.post("/content")
async def save_content(request: ContentRequest, admin_verified: bool = Depends(verify_admin_token)):
    """Save CMS content (Admin only)"""
    try:
        # Add timestamp to force cache refresh
        request.content['lastUpdated'] = datetime.utcnow().isoformat()
        request.content['adminSyncId'] = str(uuid.uuid4())[:8]
        
        updated_content = await content_manager.save_content(
            request.content, 
            user="admin", 
            is_draft=request.isDraft
        )
        
        logging.info(f"✅ Content saved successfully - AdminSyncId: {request.content.get('adminSyncId', 'N/A')}")
        
        # Count only visible courses for sync verification
        all_courses = updated_content.get('courses', [])
        visible_courses_count = len([
            course for course in all_courses 
            if course.get("visible", True)
        ])
        
        return {
            "message": "Content saved successfully", 
            "content": updated_content,
            "timestamp": datetime.utcnow().isoformat(),
            "adminSyncId": request.content.get('adminSyncId'),
            "coursesCount": visible_courses_count
        }
    except Exception as e:
        logging.error(f"Error saving content: {e}")
        raise HTTPException(status_code=500, detail="Failed to save content")

@api_router.post("/admin/force-sync")
async def force_sync(admin_verified: bool = Depends(verify_admin_token)):
    """Force synchronization between admin panel and website (Admin only)"""
    try:
        # Get current content
        current_content = await content_manager.get_content()
        
        # Add force sync markers
        current_content['lastForceSync'] = datetime.utcnow().isoformat()
        current_content['forceSyncId'] = str(uuid.uuid4())[:8]
        
        # Save back to force database refresh
        updated_content = await content_manager.save_content(
            current_content, 
            user="admin-force-sync", 
            is_draft=False
        )
        
        # Count only visible courses for sync verification
        all_courses = updated_content.get('courses', [])
        visible_courses_count = len([
            course for course in all_courses 
            if course.get("visible", True)
        ])
        logging.info(f"✅ Force sync completed - {visible_courses_count} visible courses synchronized (total: {len(all_courses)})")
        
        return {
            "message": "Force synchronization completed successfully",
            "timestamp": datetime.utcnow().isoformat(),
            "forceSyncId": current_content.get('forceSyncId'),
            "coursesCount": visible_courses_count,
            "lastSync": current_content.get('lastForceSync')
        }
    except Exception as e:
        logging.error(f"Error in force sync: {e}")
        raise HTTPException(status_code=500, detail="Failed to force synchronization")

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
        
        # Professional PDF Template with Working Headers/Footers
        def create_header_footer(canvas_obj, doc):
            """Create professional header and footer for each page"""
            canvas_obj.saveState()
            
            page_width, page_height = A4
            
            # === PROFESSIONAL HEADER ===
            # Red header background
            canvas_obj.setFillColor(colors.HexColor('#DC2626'))
            canvas_obj.rect(0, page_height - 15*mm, page_width, 15*mm, fill=1)
            
            # GRRAS logo area (try to load logo)
            logo_url = branding.get("logoUrl", "")
            logo_drawn = False
            if logo_url and logo_url.startswith('http'):
                try:
                    response = requests.get(logo_url, timeout=5)
                    if response.status_code == 200:
                        logo_data = BytesIO(response.content)
                        logo_img = Image(logo_data, width=30*mm, height=10*mm)
                        logo_img.drawOn(canvas_obj, 15*mm, page_height - 13*mm)
                        logo_drawn = True
                        logging.info("✅ Logo successfully added to PDF")
                except Exception as e:
                    logging.warning(f"Logo load failed: {e}")
            
            # Institute name in header
            canvas_obj.setFillColor(colors.white)
            canvas_obj.setFont("Helvetica-Bold", 14)
            institute_name = institute.get("name", "GRRAS Solutions Training Institute")
            x_pos = 50*mm if logo_drawn else 15*mm
            canvas_obj.drawString(x_pos, page_height - 8*mm, institute_name)
            
            canvas_obj.setFont("Helvetica", 10)
            canvas_obj.drawString(x_pos, page_height - 12*mm, "www.grras.tech")
            
            # === PROFESSIONAL FOOTER ===
            # Footer line
            canvas_obj.setStrokeColor(colors.HexColor('#DC2626'))
            canvas_obj.setLineWidth(0.5)
            canvas_obj.line(15*mm, 15*mm, page_width - 15*mm, 15*mm)
            
            # Page number and contact
            canvas_obj.setFillColor(colors.HexColor('#666666'))
            canvas_obj.setFont("Helvetica", 9)
            page_num = canvas_obj.getPageNumber()
            canvas_obj.drawString(15*mm, 10*mm, f"Page {page_num}")
            
            # Contact info in footer
            phone = ', '.join(institute.get("phones", ["090019 91227"]))
            canvas_obj.drawRightString(page_width - 15*mm, 10*mm, f"Phone: {phone}")
            
            # Email on second line
            email = ', '.join(institute.get("emails", ["info@grrassolutions.com"]))
            canvas_obj.drawRightString(page_width - 15*mm, 6*mm, f"Email: {email}")
            
            canvas_obj.restoreState()
        
        # Create PDF document with proper margins for header/footer
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,
            rightMargin=15*mm,
            leftMargin=15*mm,
            topMargin=20*mm,  # Space for header
            bottomMargin=25*mm  # Space for footer
        )
        
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
        
        # Format fee with safe rupee symbol (avoid encoding issues)
        formatted_fee = str(fees) if fees else "Contact for details"
        if fees and fees.lower() not in ['contact for details', 'on request', 'varies']:
            # Add Rs. if not already present and contains numbers
            if not any(symbol in str(fees).lower() for symbol in ['rs', 'inr', 'rupee']) and any(char.isdigit() for char in str(fees)):
                formatted_fee = f"Rs. {fees}"
            elif '₹' in str(fees):
                # Replace ₹ with Rs. to avoid encoding issues
                formatted_fee = str(fees).replace('₹', 'Rs.')
            elif '■' in str(fees):
                # Fix corrupted rupee symbol
                formatted_fee = str(fees).replace('■', 'Rs. ')
        
        course_info_items = [
            f"<b>Duration:</b> {duration}",
            f"<b>Level:</b> {level}",
            f"<b>Fee:</b> {formatted_fee}",
            f"<b>Eligibility:</b> {eligibility}"
        ]
        
        for item in course_info_items:
            content_elements.append(Paragraph(item, info_label_style))
        
        content_elements.append(Spacer(1, 8*mm))
        
        # Course Highlights Section (NO DUPLICATES)
        if highlights:
            content_elements.append(Paragraph("Course Highlights", section_heading_style))
            
            for highlight in highlights[:8]:  # Limit for space
                # Clean highlight text - remove any unicode issues
                clean_highlight = str(highlight).replace('✓', '•').replace('$', '').replace('\\', '')
                content_elements.append(Paragraph(f"• {clean_highlight}", bullet_list_style))
            
            content_elements.append(Spacer(1, 8*mm))
        
        # Learning Outcomes Section (NO DUPLICATES)
        if learning_outcomes:
            content_elements.append(Paragraph("What You'll Learn", section_heading_style))
            
            for i, outcome in enumerate(learning_outcomes[:8], 1):
                # Clean outcome text
                clean_outcome = str(outcome).replace('$', '').replace('\\', '')
                content_elements.append(Paragraph(f"{i}. {clean_outcome}", number_list_style))
            
            content_elements.append(Spacer(1, 8*mm))
        
        # Tools & Technologies Section (NO DUPLICATES) 
        if tools:
            content_elements.append(Paragraph("Tools & Technologies", section_heading_style))
            
            # Create clean 2-column layout (better fitting)
            tools_data = []
            for i in range(0, len(tools), 2):
                row = []
                for j in range(2):
                    if i + j < len(tools):
                        clean_tool = str(tools[i + j]).replace('$', '').replace('\\', '')
                        row.append(f"• {clean_tool}")
                    else:
                        row.append("")
                tools_data.append(row)
            
            if tools_data:
                tools_table = Table(tools_data, colWidths=[80*mm, 80*mm])
                tools_table.setStyle(TableStyle([
                    ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#374151')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('LEFTPADDING', (0, 0), (-1, -1), 5),
                    ('TOPPADDING', (0, 0), (-1, -1), 3),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ]))
                content_elements.append(tools_table)
            content_elements.append(Spacer(1, 8*mm))
        
        # Career Opportunities Section (NO DUPLICATES)
        if career_roles:
            content_elements.append(Paragraph("Career Opportunities", section_heading_style))
            
            for role in career_roles[:6]:
                clean_role = str(role).replace('$', '').replace('\\', '')
                content_elements.append(Paragraph(f"• {clean_role}", bullet_list_style))
            
            content_elements.append(Spacer(1, 8*mm))
        
        # Certification Section (NO DUPLICATES) - Clean and Professional
        content_elements.append(Paragraph("Certification Details", section_heading_style))
        
        # Clean certificate info
        clean_cert_info = str(certificate_info).replace('$', '').replace('\\', '')
        content_elements.append(Paragraph(clean_cert_info, body_text_style))
        content_elements.append(Spacer(1, 4*mm))
        
        # Certificate benefits - no unicode symbols that cause issues
        cert_benefits = [
            "• Industry-recognized certificate upon completion",
            "• Digital verification available", 
            "• LinkedIn profile enhancement ready",
            "• Lifetime validity with institute backing"
        ]
        
        for benefit in cert_benefits:
            content_elements.append(Paragraph(benefit, bullet_list_style))
        

        
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
        
        # Build PDF with WORKING GRRAS template
        try:
            # ENSURE header/footer function is called for EVERY page
            doc.build(content_elements, 
                     onFirstPage=create_header_footer, 
                     onLaterPages=create_header_footer)
            logging.info(f"✅ GRRAS PDF with headers/footers generated for {course_name}")
        except Exception as e:
            logging.error(f"PDF generation error: {e}")
            # Fallback without headers if main generation fails
            try:
                pdf_buffer.seek(0)  # Reset buffer
                pdf_buffer.truncate(0)  # Clear buffer completely
                simple_doc = SimpleDocTemplate(pdf_buffer, pagesize=A4)
                simple_doc.build(content_elements)
                logging.info("✅ Fallback PDF generation (without headers) successful")
            except Exception as fallback_error:
                logging.error(f"Complete PDF generation failure: {fallback_error}")
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

class BlogPostRequest(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    category: Optional[str] = "general"
    tags: Optional[List[str]] = []
    author: Optional[str] = "GRRAS Team"
    published: Optional[bool] = True
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None

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
async def submit_contact(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    message: str = Form(...),
    course: str = Form(None)
):
    """Submit contact form"""
    try:
        # Store in leads collection
        lead_data = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "phone": phone,
            "message": message,
            "course": course,
            "type": "contact_form",
            "timestamp": datetime.utcnow(),
            "source": "website"
        }
        
        collection = db.leads
        await collection.insert_one(lead_data)
        
        logging.info(f"✅ Contact form submitted: {name} ({email})")
        return {"message": "Contact form submitted successfully", "lead_id": lead_data["id"]}
    except Exception as e:
        logging.error(f"Error submitting contact form: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")

# Blog API Endpoints

@api_router.get("/blog")
async def get_blog_posts(
    page: int = 1,
    limit: int = 12,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None
):
    """Get paginated blog posts"""
    try:
        content = await content_manager.get_content()
        blog_section = content.get("blog", {})
        blog_posts = blog_section.get("posts", []) if isinstance(blog_section, dict) else []
        
        # Filter published posts only for public API (check status field for existing posts)
        published_posts = [
            post for post in blog_posts 
            if post.get("published", True) or post.get("status") == "published"
        ]
        
        # Apply filters
        if category:
            published_posts = [post for post in published_posts if post.get("category", "").lower() == category.lower()]
        
        if tag:
            published_posts = [post for post in published_posts if tag.lower() in [t.lower() for t in post.get("tags", [])]]
        
        if search:
            search_lower = search.lower()
            published_posts = [
                post for post in published_posts 
                if search_lower in post.get("title", "").lower() 
                or search_lower in post.get("content", "").lower()
                or search_lower in post.get("excerpt", "").lower()
            ]
        
        # Sort by created date (newest first)
        published_posts.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        
        # Pagination
        total = len(published_posts)
        start = (page - 1) * limit
        end = start + limit
        paginated_posts = published_posts[start:end]
        
        # Calculate reading time for each post
        for post in paginated_posts:
            word_count = len(post.get("content", "").split())
            reading_time = max(1, round(word_count / 200))  # 200 words per minute
            post["reading_time"] = reading_time
        
        return {
            "posts": paginated_posts,
            "pagination": {
                "current_page": page,
                "total_pages": (total + limit - 1) // limit,
                "total_posts": total,
                "has_next": end < total,
                "has_prev": page > 1
            }
        }
    except Exception as e:
        logging.error(f"Error fetching blog posts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog posts")

@api_router.get("/blog/categories")
async def get_blog_categories():
    """Get all blog categories with post counts"""
    try:
        content = await content_manager.get_content()
        blog_section = content.get("blog", {})
        blog_posts = blog_section.get("posts", []) if isinstance(blog_section, dict) else []
        
        # Count posts by category
        category_counts = {}
        for post in blog_posts:
            if post.get("published", True) or post.get("status") == "published":
                # Use category field or derive from tags
                category = post.get("category")
                if not category and post.get("tags"):
                    # Use first tag as category if no category field
                    category = post.get("tags", ["general"])[0]
                else:
                    category = category or "general"
                category_counts[category] = category_counts.get(category, 0) + 1
        
        return {"categories": category_counts}
    except Exception as e:
        logging.error(f"Error fetching blog categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog categories")

@api_router.get("/blog/tags")
async def get_blog_tags():
    """Get all blog tags with usage counts"""
    try:
        content = await content_manager.get_content()
        blog_section = content.get("blog", {})
        blog_posts = blog_section.get("posts", []) if isinstance(blog_section, dict) else []
        
        # Count tags usage
        tag_counts = {}
        for post in blog_posts:
            if post.get("published", True) or post.get("status") == "published":
                for tag in post.get("tags", []):
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        return {"tags": tag_counts}
    except Exception as e:
        logging.error(f"Error fetching blog tags: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog tags")

@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    """Get individual blog post by slug"""
    try:
        content = await content_manager.get_content()
        blog_section = content.get("blog", {})
        blog_posts = blog_section.get("posts", []) if isinstance(blog_section, dict) else []
        
        # Find post by slug (check both published field and status)
        post = next((
            p for p in blog_posts 
            if p.get("slug") == slug and (p.get("published", True) or p.get("status") == "published")
        ), None)
        
        if not post:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        # Calculate reading time
        word_count = len(post.get("body", post.get("content", "")).split())
        reading_time = max(1, round(word_count / 200))
        post["reading_time"] = reading_time
        
        # Get related posts (same category, different slug)
        related_posts = [
            p for p in blog_posts 
            if p.get("category") == post.get("category") 
            and p.get("slug") != slug 
            and p.get("published", True)
        ][:3]  # Limit to 3 related posts
        
        return {
            "post": post,
            "related_posts": related_posts
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching blog post {slug}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog post")

@api_router.post("/admin/blog")
async def create_blog_post(post: BlogPostRequest, admin_verified: bool = Depends(verify_admin_token)):
    """Create new blog post (Admin only)"""
    try:
        content = await content_manager.get_content()
        
        # Initialize blog structure if it doesn't exist
        if "blog" not in content:
            content["blog"] = {"settings": {"postsPerPage": 6, "enableComments": False, "moderateComments": True}, "posts": []}
        elif not isinstance(content["blog"], dict):
            content["blog"] = {"settings": {"postsPerPage": 6, "enableComments": False, "moderateComments": True}, "posts": []}
        elif "posts" not in content["blog"]:
            content["blog"]["posts"] = []
        
        blog_posts = content["blog"]["posts"]
        
        # Create new post
        new_post = {
            "id": str(uuid.uuid4()),
            "slug": post.slug,
            "title": post.title,
            "body": post.content,  # Use 'body' to match existing structure
            "content": post.content,  # Keep both for compatibility
            "summary": post.excerpt or post.content[:200] + "...",
            "excerpt": post.excerpt or post.content[:200] + "...",
            "coverImage": post.featured_image or "",
            "featured_image": post.featured_image,
            "category": post.category,
            "tags": post.tags,
            "author": post.author,
            "published": post.published,
            "createdAt": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "meta_title": post.meta_title or post.title,
            "meta_description": post.meta_description or (post.excerpt or post.content[:160]),
            "meta_keywords": post.meta_keywords or ", ".join(post.tags)
        }
        
        # Check for duplicate slug
        if any(p.get("slug") == post.slug for p in blog_posts):
            raise HTTPException(status_code=400, detail="Blog post with this slug already exists")
        
        blog_posts.append(new_post)
        
        # Save content
        await content_manager.save_content(content, user="admin", is_draft=False)
        
        logging.info(f"✅ Blog post created: {post.title} ({post.slug})")
        return {"message": "Blog post created successfully", "post": new_post}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating blog post: {e}")
        raise HTTPException(status_code=500, detail="Failed to create blog post")

@api_router.put("/admin/blog/{post_id}")
async def update_blog_post(post_id: str, post: BlogPostRequest, admin_verified: bool = Depends(verify_admin_token)):
    """Update blog post (Admin only)"""
    try:
        content = await content_manager.get_content()
        blog_section = content.get("blog", {})
        blog_posts = blog_section.get("posts", []) if isinstance(blog_section, dict) else []
        
        # Find post by ID
        post_index = next((i for i, p in enumerate(blog_posts) if p.get("id") == post_id), None)
        
        if post_index is None:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        # Check for duplicate slug (excluding current post)
        if any(p.get("slug") == post.slug and p.get("id") != post_id for p in blog_posts):
            raise HTTPException(status_code=400, detail="Blog post with this slug already exists")
        
        # Update post
        existing_post = blog_posts[post_index]
        updated_post = {
            **existing_post,
            "slug": post.slug,
            "title": post.title,
            "body": post.content,
            "content": post.content,
            "summary": post.excerpt or post.content[:200] + "...",
            "excerpt": post.excerpt or post.content[:200] + "...",
            "coverImage": post.featured_image or "",
            "featured_image": post.featured_image,
            "category": post.category,
            "tags": post.tags,
            "author": post.author,
            "published": post.published,
            "updatedAt": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "meta_title": post.meta_title or post.title,
            "meta_description": post.meta_description or (post.excerpt or post.content[:160]),
            "meta_keywords": post.meta_keywords or ", ".join(post.tags)
        }
        
        blog_posts[post_index] = updated_post
        content["blog"]["posts"] = blog_posts
        
        # Save content
        await content_manager.save_content(content, user="admin", is_draft=False)
        
        logging.info(f"✅ Blog post updated: {post.title} ({post.slug})")
        return {"message": "Blog post updated successfully", "post": updated_post}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating blog post: {e}")
        raise HTTPException(status_code=500, detail="Failed to update blog post")

@api_router.delete("/admin/blog/{post_id}")
async def delete_blog_post(post_id: str, admin_verified: bool = Depends(verify_admin_token)):
    """Delete blog post (Admin only)"""
    try:
        content = await content_manager.get_content()
        blog_section = content.get("blog", {})
        blog_posts = blog_section.get("posts", []) if isinstance(blog_section, dict) else []
        
        # Find and remove post
        initial_count = len(blog_posts)
        blog_posts = [p for p in blog_posts if p.get("id") != post_id]
        
        if len(blog_posts) == initial_count:
            raise HTTPException(status_code=404, detail="Blog post not found")
        
        content["blog"]["posts"] = blog_posts
        
        # Save content
        await content_manager.save_content(content, user="admin", is_draft=False)
        
        logging.info(f"✅ Blog post deleted: {post_id}")
        return {"message": "Blog post deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting blog post: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete blog post")

# Newsletter Subscription Routes
@api_router.post("/newsletter/subscribe")
async def subscribe_to_newsletter(request: dict):
    """Subscribe to newsletter"""
    try:
        email = request.get("email", "").strip().lower()
        
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Basic email validation
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        content = await content_manager.get_content()
        
        # Initialize newsletter subscribers if not exists
        if "newsletter" not in content:
            content["newsletter"] = {
                "subscribers": [],
                "settings": {
                    "enabled": True,
                    "send_welcome_email": True
                }
            }
        
        subscribers = content["newsletter"].get("subscribers", [])
        
        # Check if already subscribed
        existing_subscriber = next((s for s in subscribers if s.get("email") == email), None)
        if existing_subscriber:
            if existing_subscriber.get("status") == "active":
                return {"message": "You are already subscribed to our newsletter"}
            else:
                # Reactivate subscription
                existing_subscriber["status"] = "active"
                existing_subscriber["resubscribed_at"] = datetime.utcnow().isoformat()
        else:
            # Add new subscriber
            new_subscriber = {
                "id": str(uuid.uuid4()),
                "email": email,
                "status": "active",
                "source": request.get("source", "blog_page"),
                "subscribed_at": request.get("subscribed_at", datetime.utcnow().isoformat()),
                "preferences": {
                    "tech_updates": True,
                    "career_guidance": True,
                    "course_updates": True
                }
            }
            subscribers.append(new_subscriber)
        
        content["newsletter"]["subscribers"] = subscribers
        
        # Save updated content
        await content_manager.save_content(content, user="system", is_draft=False)
        
        logging.info(f"✅ Newsletter subscription: {email}")
        return {"message": "Successfully subscribed to our newsletter!"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error subscribing to newsletter: {e}")
        raise HTTPException(status_code=500, detail="Failed to subscribe to newsletter")

@api_router.get("/admin/newsletter/subscribers")
async def get_newsletter_subscribers(admin_verified: bool = Depends(verify_admin_token)):
    """Get all newsletter subscribers (Admin only)"""
    try:
        content = await content_manager.get_content()
        newsletter_data = content.get("newsletter", {})
        subscribers = newsletter_data.get("subscribers", [])
        
        # Return stats and recent subscribers
        active_subscribers = [s for s in subscribers if s.get("status") == "active"]
        
        return {
            "total_subscribers": len(subscribers),
            "active_subscribers": len(active_subscribers),
            "subscribers": active_subscribers[-50:],  # Last 50 subscribers
            "stats": {
                "today": len([s for s in active_subscribers if s.get("subscribed_at", "").startswith(datetime.utcnow().strftime("%Y-%m-%d"))]),
                "this_month": len([s for s in active_subscribers if s.get("subscribed_at", "").startswith(datetime.utcnow().strftime("%Y-%m"))])
            }
        }
        
    except Exception as e:
        logging.error(f"Error fetching newsletter subscribers: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch newsletter subscribers")

@api_router.get("/admin/blog")
async def get_all_blog_posts_admin(admin_verified: bool = Depends(verify_admin_token)):
    """Get all blog posts including drafts (Admin only)"""
    try:
        content = await content_manager.get_content()
        blog_section = content.get("blog", {})
        blog_posts = blog_section.get("posts", []) if isinstance(blog_section, dict) else []
        
        # Sort by updated date (newest first)
        blog_posts.sort(key=lambda x: x.get("updatedAt", x.get("updated_at", x.get("createdAt", x.get("created_at", "")))), reverse=True)
        
        return {
            "posts": blog_posts,
            "total": len(blog_posts)
        }
    except Exception as e:
        logging.error(f"Error fetching admin blog posts: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog posts")

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
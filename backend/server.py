from fastapi import FastAPI, APIRouter, HTTPException, Form, Depends, Response, Request, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import json
import aiofiles
import secrets
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.units import inch
import asyncio
import tempfile
from urllib.parse import urlparse
import hashlib
import jwt
from content_manager import ContentManager
import mimetypes
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with Railway support
mongo_url = os.environ.get('DATABASE_URL') or os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'grras_database')]

# Initialize Content Manager
content_storage_type = os.environ.get('CONTENT_STORAGE', 'json')
content_manager = ContentManager(
    storage_type=content_storage_type,
    mongo_client=client if content_storage_type == 'mongo' else None,
    db_name=os.environ.get('DB_NAME', 'grras_database')
)

# Create directories
os.makedirs('/app/backend/storage', exist_ok=True)
os.makedirs('/app/backend/temp', exist_ok=True)
os.makedirs('/app/backend/data/media', exist_ok=True)
os.makedirs('/app/backend/data/versions', exist_ok=True) 
os.makedirs('/app/backend/data/backups', exist_ok=True)

# Tools configuration
TOOLS_CONFIG = {
    "devops-training": [
        "Linux (RHCSA)", "Linux Server Administration", "Ansible",
        "AWS", "Terraform", "Docker", "Kubernetes",
        "Jenkins", "GitHub"
    ],
    "bca-degree": [
        "Programming in C", "Java", "DBMS", "Web Technologies", 
        "Cloud & DevOps Basics", "AI/ML Basics"
    ],
    "redhat-certifications": [
        "RHCSA", "RHCE", "DO188 (OpenShift Dev)", 
        "DO280 (OpenShift Admin)", "OpenShift with AI"
    ],
    "data-science-machine-learning": [
        "Python", "Statistics", "Pandas & NumPy", 
        "Scikit-learn", "TensorFlow/Keras"
    ],
    "java-salesforce": [
        "Core Java", "Advanced Java", "Salesforce Admin", "Salesforce Developer"
    ],
    "python": [
        "Python Core", "OOP in Python", "NumPy", 
        "Pandas", "Flask/Django Basics"
    ],
    "c-cpp-dsa": [
        "C", "C++ (OOP)", "Data Structures", "Algorithms", "Problem Solving"
    ]
}

# Course names mapping
COURSE_NAMES = {
    "devops-training": "DevOps Training",
    "bca-degree": "BCA Degree Program", 
    "redhat-certifications": "Red Hat Certifications",
    "data-science-machine-learning": "Data Science & Machine Learning",
    "java-salesforce": "Java & Salesforce",
    "python": "Python",
    "c-cpp-dsa": "C/C++ & DSA"
}

# Create the main app
app = FastAPI(title="GRRAS Solutions Training Institute API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBasic()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'grras-admin')
JWT_SECRET = os.environ.get('JWT_SECRET', 'grras-jwt-secret-key-change-in-production')

def verify_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_password = secrets.compare_digest(credentials.password, ADMIN_PASSWORD)
    if not correct_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return credentials

def create_admin_token(username: str = "admin") -> str:
    """Create JWT token for admin session"""
    payload = {
        "username": username,
        "exp": datetime.now(timezone.utc).timestamp() + 86400  # 24 hours
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_admin_token(request: Request):
    """Verify admin JWT token from cookie or Authorization header"""
    token = None
    
    # Check Authorization header first (Bearer token)
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    
    # Fallback to cookie
    if not token:
        token = request.cookies.get("admin_token")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        if payload.get("exp", 0) < datetime.now(timezone.utc).timestamp():
            raise HTTPException(status_code=401, detail="Token expired")
        return payload["username"]
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Storage abstraction
class StorageService:
    def __init__(self):
        self.storage_type = os.environ.get('CONTACT_STORAGE', 'json')
        self.json_file = '/app/backend/storage/leads.json'
    
    async def save_lead(self, lead_data: dict):
        if self.storage_type == 'mongo':
            return await self._save_to_mongo(lead_data)
        else:
            return await self._save_to_json(lead_data)
    
    async def get_leads(self):
        if self.storage_type == 'mongo':
            return await self._get_from_mongo()
        else:
            return await self._get_from_json()
    
    async def _save_to_json(self, lead_data: dict):
        try:
            if os.path.exists(self.json_file):
                async with aiofiles.open(self.json_file, 'r') as f:
                    leads = json.loads(await f.read())
            else:
                leads = []
            
            leads.append(lead_data)
            
            async with aiofiles.open(self.json_file, 'w') as f:
                await f.write(json.dumps(leads, indent=2, default=str))
            
            return lead_data
        except Exception as e:
            logging.error(f"Error saving to JSON: {e}")
            raise HTTPException(status_code=500, detail="Failed to save lead")
    
    async def _get_from_json(self):
        try:
            if not os.path.exists(self.json_file):
                return []
            
            async with aiofiles.open(self.json_file, 'r') as f:
                leads = json.loads(await f.read())
            return leads
        except Exception as e:
            logging.error(f"Error reading from JSON: {e}")
            return []
    
    async def _save_to_mongo(self, lead_data: dict):
        try:
            result = await db.leads.insert_one(lead_data)
            lead_data['_id'] = str(result.inserted_id)
            return lead_data
        except Exception as e:
            logging.error(f"Error saving to MongoDB: {e}")
            raise HTTPException(status_code=500, detail="Failed to save lead")
    
    async def _get_from_mongo(self):
        try:
            cursor = db.leads.find().sort('timestamp', -1)
            leads = await cursor.to_list(length=None)
            for lead in leads:
                lead['_id'] = str(lead['_id'])
            return leads
        except Exception as e:
            logging.error(f"Error reading from MongoDB: {e}")
            return []

storage = StorageService()

# Models
class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    course_slug: Optional[str] = None
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    consent: bool = True

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    course_slug: Optional[str] = None
    message: Optional[str] = None
    consent: bool = True

class SyllabusRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    course_slug: str
    consent: bool = True

class ContentUpdate(BaseModel):
    content: Dict[str, Any]
    isDraft: Optional[bool] = False

class AdminLogin(BaseModel):
    password: str

class VersionRestore(BaseModel):
    versionId: str

class BackupRestore(BaseModel):
    filename: str

class MediaUpload(BaseModel):
    filename: str
    fileData: bytes

# PDF Generation
async def generate_syllabus_pdf(course_slug: str, student_name: str) -> str:
    """Generate a professional syllabus PDF using dynamic content"""
    try:
        # Get current content
        content = await content_manager.get_content()
        courses = content.get("courses", [])
        institute = content.get("institute", {})
        
        # Find the course
        course = next((c for c in courses if c["slug"] == course_slug), None)
        if not course:
            logging.error(f"Course not found: {course_slug}")
            raise HTTPException(status_code=404, detail=f"Course '{course_slug}' not found in CMS")
        
        # Ensure required fields exist
        course_name = course.get("title", "Course")
        tools = course.get("tools", [])
        duration = course.get("duration", "Contact for details")
        fees = course.get("fees", "Contact for details")
        
        # Validate student name
        if not student_name or not student_name.strip():
            student_name = "Student"
        
        # Create temporary file
        temp_file = f"/app/backend/temp/syllabus_{course_slug}_{uuid.uuid4().hex[:8]}.pdf"
        
        # Ensure temp directory exists
        os.makedirs('/app/backend/temp', exist_ok=True)
        
        logging.info(f"Generating PDF for course: {course_name}, student: {student_name}")
        
        # Create PDF
        doc = SimpleDocTemplate(temp_file, pagesize=A4, topMargin=1*inch)
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=24,
            textColor=colors.HexColor('#DC2626'),
            spaceAfter=30,
            alignment=1  # Center
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#DC2626'),
            spaceAfter=12,
            spaceBefore=20
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            leading=14
        )
        
        # Content
        content_elements = []
        
        # Try to add logo if available
        branding = content.get("branding", {})
        logo_url = branding.get("logoUrl", "")
        
        if logo_url:
            try:
                # For now, add institute name with enhanced styling (logo implementation would require image handling)
                enhanced_title_style = ParagraphStyle(
                    'EnhancedTitle',
                    parent=styles['Title'],
                    fontSize=28,
                    textColor=colors.HexColor('#DC2626'),
                    spaceAfter=30,
                    alignment=1,  # Center
                    leading=32
                )
                institute_name = institute.get("name", "GRRAS Solutions Training Institute")
                content_elements.append(Paragraph(f"<b>{institute_name}</b>", enhanced_title_style))
                content_elements.append(Paragraph("📚 Professional IT Training Institute", normal_style))
                content_elements.append(Spacer(1, 20))
            except:
                # Fallback to standard header
                institute_name = institute.get("name", "GRRAS Solutions Training Institute")
                content_elements.append(Paragraph(institute_name, title_style))
                content_elements.append(Spacer(1, 20))
        else:
            # Standard header without logo
            institute_name = institute.get("name", "GRRAS Solutions Training Institute")
            content_elements.append(Paragraph(institute_name, title_style))
            content_elements.append(Spacer(1, 20))
        
        # Course title
        content_elements.append(Paragraph(f"{course_name} - Detailed Syllabus", heading_style))
        content_elements.append(Spacer(1, 10))
        
        # Student name
        content_elements.append(Paragraph(f"Prepared for: {student_name}", normal_style))
        content_elements.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", normal_style))
        content_elements.append(Paragraph(f"Document ID: SYL-{course_slug.upper()}-{datetime.now().strftime('%Y%m%d')}", normal_style))
        content_elements.append(Spacer(1, 30))
        
        # Course Details
        content_elements.append(Paragraph("Course Information", heading_style))
        content_elements.append(Paragraph(f"<b>Duration:</b> {duration}", normal_style))
        content_elements.append(Paragraph(f"<b>Fees:</b> {fees}", normal_style))
        content_elements.append(Spacer(1, 20))
        
        # Tools/Technologies section
        if tools:
            content_elements.append(Paragraph("Tools & Technologies Covered", heading_style))
            for tool in tools:
                content_elements.append(Paragraph(f"• {tool}", normal_style))
            content_elements.append(Spacer(1, 20))
        
        # Curriculum outline
        content_elements.append(Paragraph("Curriculum Outline", heading_style))
        content_elements.append(Paragraph("Detailed curriculum will be shared during counseling session. Our comprehensive program covers:", normal_style))
        content_elements.append(Paragraph("• Fundamentals and core concepts", normal_style))
        content_elements.append(Paragraph("• Hands-on practical sessions", normal_style))
        content_elements.append(Paragraph("• Industry best practices", normal_style))
        content_elements.append(Paragraph("• Real-world projects", normal_style))
        content_elements.append(Paragraph("• Certification preparation", normal_style))
        content_elements.append(Spacer(1, 20))
        
        # Learning outcomes
        content_elements.append(Paragraph("Learning Outcomes", heading_style))
        content_elements.append(Paragraph("Upon successful completion of this program, students will:", normal_style))
        content_elements.append(Paragraph("• Master industry-relevant skills and technologies", normal_style))
        content_elements.append(Paragraph("• Gain practical experience through projects", normal_style))
        content_elements.append(Paragraph("• Be prepared for industry certifications", normal_style))
        content_elements.append(Paragraph("• Develop problem-solving capabilities", normal_style))
        content_elements.append(Spacer(1, 20))
        
        # Schedule and fees
        content_elements.append(Paragraph("Schedule & Fees", heading_style))
        content_elements.append(Paragraph("For detailed schedule, duration, and fee structure, please contact our admissions team.", normal_style))
        content_elements.append(Spacer(1, 30))
        
        # Footer with institute info
        content_elements.append(Paragraph("Contact Information", heading_style))
        content_elements.append(Paragraph(institute_name, normal_style))
        
        address = institute.get("address", "A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012")
        content_elements.append(Paragraph(address, normal_style))
        
        phone = institute.get("phone", "090019 91227")
        content_elements.append(Paragraph(f"Phone: {phone}", normal_style))
        
        # Build PDF
        doc.build(content_elements)
        return temp_file
        
    except Exception as e:
        logging.error(f"Error generating PDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate PDF")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "GRRAS Solutions Training Institute API", "status": "active"}

@api_router.get("/courses")
async def get_courses():
    """Get all available courses from content"""
    try:
        content = await content_manager.get_content()
        courses = content.get("courses", [])
        
        # Filter visible courses and sort by order
        visible_courses = [
            course for course in courses 
            if course.get("visible", True)
        ]
        visible_courses.sort(key=lambda x: x.get("order", 999))
        
        return {"courses": visible_courses}
    except Exception as e:
        logging.error(f"Error getting courses: {e}")
        raise HTTPException(status_code=500, detail="Failed to get courses")

@api_router.get("/courses/{course_slug}")
async def get_course(course_slug: str):
    """Get specific course details from content"""
    try:
        content = await content_manager.get_content()
        courses = content.get("courses", [])
        
        course = next((c for c in courses if c["slug"] == course_slug), None)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        if not course.get("visible", True):
            raise HTTPException(status_code=404, detail="Course not found")
        
        return course
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error getting course {course_slug}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get course")

@api_router.post("/leads")
async def create_lead(lead: LeadCreate):
    """Create a new lead"""
    lead_data = lead.dict()
    lead_data['id'] = str(uuid.uuid4())
    lead_data['timestamp'] = datetime.now(timezone.utc)
    
    # Validate phone number (Indian format)
    if not lead_data['phone'].isdigit() or len(lead_data['phone']) != 10:
        raise HTTPException(status_code=400, detail="Phone number must be 10 digits")
    
    saved_lead = await storage.save_lead(lead_data)
    return {"success": True, "lead_id": saved_lead['id']}

@api_router.get("/leads")
async def get_leads(credentials: HTTPBasicCredentials = Depends(verify_admin)):
    """Get all leads (admin only)"""
    leads = await storage.get_leads()
    return {"leads": leads}

@api_router.post("/syllabus")
async def generate_syllabus(request: SyllabusRequest):
    """Generate and download syllabus PDF"""
    # Get current content to validate course
    content = await content_manager.get_content()
    courses = content.get("courses", [])
    
    # Validate course exists and is visible
    course = next((c for c in courses if c["slug"] == request.course_slug), None)
    if not course or not course.get("visible", True):
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Validate phone
    if not request.phone.isdigit() or len(request.phone) != 10:
        raise HTTPException(status_code=400, detail="Phone number must be 10 digits")
    
    # Save lead
    lead_data = request.dict()
    lead_data['id'] = str(uuid.uuid4())
    lead_data['timestamp'] = datetime.now(timezone.utc)
    await storage.save_lead(lead_data)
    
    # Generate PDF
    pdf_path = await generate_syllabus_pdf(request.course_slug, request.name)
    
    # Return PDF file
    course_name = course.get("title", "Course")
    filename = f"GRRAS_{course_name.replace(' ', '_')}_Syllabus.pdf"
    
    return FileResponse(
        pdf_path, 
        media_type='application/pdf',
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@api_router.get("/content")
async def get_content():
    """Get current site content"""
    content = await content_manager.get_content()
    return {"content": content}

@api_router.post("/content")
async def update_content(
    content_update: ContentUpdate,
    username: str = Depends(verify_admin_token)
):
    """Update site content (admin only)"""
    try:
        updated_content = await content_manager.save_content(
            content_update.content, 
            user=username,
            is_draft=content_update.isDraft
        )
        return {"success": True, "content": updated_content, "isDraft": content_update.isDraft}
    except Exception as e:
        logging.error(f"Error updating content: {e}")
        raise HTTPException(status_code=500, detail="Failed to update content")

@api_router.post("/content/publish")
async def publish_content(username: str = Depends(verify_admin_token)):
    """Publish draft content"""
    try:
        published_content = await content_manager.publish_content(user=username)
        return {"success": True, "content": published_content}
    except Exception as e:
        logging.error(f"Error publishing content: {e}")
        raise HTTPException(status_code=500, detail="Failed to publish content")

@api_router.get("/content/versions")
async def get_content_versions(
    limit: int = 20,
    username: str = Depends(verify_admin_token)
):
    """Get content version history"""
    try:
        versions = await content_manager.get_version_history(limit)
        return {"versions": versions}
    except Exception as e:
        logging.error(f"Error getting versions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get versions")

@api_router.post("/content/restore")
async def restore_content_version(
    restore_data: VersionRestore,
    username: str = Depends(verify_admin_token)
):
    """Restore content from version"""
    try:
        restored_content = await content_manager.restore_version(restore_data.versionId, username)
        return {"success": True, "content": restored_content}
    except Exception as e:
        logging.error(f"Error restoring version: {e}")
        raise HTTPException(status_code=500, detail="Failed to restore version")

@api_router.get("/content/backups")
async def get_backups(username: str = Depends(verify_admin_token)):
    """Get available backups"""
    try:
        backups = await content_manager.get_backups()
        return {"backups": backups}
    except Exception as e:
        logging.error(f"Error getting backups: {e}")
        raise HTTPException(status_code=500, detail="Failed to get backups")

@api_router.post("/content/backup")
async def create_backup(username: str = Depends(verify_admin_token)):
    """Create manual backup"""
    try:
        backup_filename = await content_manager.create_backup(username)
        return {"success": True, "filename": backup_filename}
    except Exception as e:
        logging.error(f"Error creating backup: {e}")
        raise HTTPException(status_code=500, detail="Failed to create backup")

@api_router.post("/content/backup/restore")
async def restore_backup(
    restore_data: BackupRestore,
    username: str = Depends(verify_admin_token)
):
    """Restore content from backup"""
    try:
        restored_content = await content_manager.restore_backup(restore_data.filename, username)
        return {"success": True, "content": restored_content}
    except Exception as e:
        logging.error(f"Error restoring backup: {e}")
        raise HTTPException(status_code=500, detail="Failed to restore backup")

@api_router.get("/media")
async def get_media_files(username: str = Depends(verify_admin_token)):
    """Get media files"""
    try:
        media_files = await content_manager.get_media_files()
        return {"media": media_files}
    except Exception as e:
        logging.error(f"Error getting media files: {e}")
        raise HTTPException(status_code=500, detail="Failed to get media files")

@api_router.post("/media/upload")
async def upload_media_file(
    file: UploadFile = File(...),
    username: str = Depends(verify_admin_token)
):
    """Upload media file"""
    try:
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="File type not allowed")
        
        # Read file content
        file_content = await file.read()
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        
        # Save file
        file_url = await content_manager.save_media_file(filename, file_content)
        
        return {
            "success": True,
            "filename": filename,
            "url": file_url,
            "size": len(file_content),
            "type": file.content_type
        }
    except Exception as e:
        logging.error(f"Error uploading media file: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file")

@api_router.delete("/media/{filename}")
async def delete_media_file(
    filename: str,
    username: str = Depends(verify_admin_token)
):
    """Delete media file"""
    try:
        success = await content_manager.delete_media_file(filename)
        if success:
            return {"success": True, "message": "File deleted"}
        else:
            raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        logging.error(f"Error deleting media file: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")

@api_router.get("/content/audit")
async def get_content_audit(
    limit: int = 50,
    username: str = Depends(verify_admin_token)
):
    """Get content audit logs (admin only)"""
    try:
        audit_logs = await content_manager.get_audit_logs(limit)
        return {"audit_logs": audit_logs}
    except Exception as e:
        logging.error(f"Error getting audit logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audit logs")

@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin, response: Response):
    """Admin login endpoint"""
    if not secrets.compare_digest(login_data.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Create JWT token
    token = create_admin_token()
    
    # Set httpOnly cookie (secure=True for Railway HTTPS, but allow cross-site)
    response.set_cookie(
        key="admin_token",
        value=token,
        httponly=True,
        max_age=86400,  # 24 hours
        secure=True,  # HTTPS required for Railway
        samesite="none"  # Allow cross-site cookies for Railway domains
    )
    
    return {"success": True, "message": "Login successful", "token": token}

@api_router.post("/admin/logout") 
async def admin_logout(response: Response):
    """Admin logout endpoint"""
    response.delete_cookie("admin_token")
    return {"success": True, "message": "Logout successful"}

@api_router.get("/admin/verify")
async def verify_admin_session(username: str = Depends(verify_admin_token)):
    """Verify admin session"""
    return {"authenticated": True, "username": username}

# Include router
app.include_router(api_router)

# Mount static files for media
app.mount("/media", StaticFiles(directory="/app/backend/data/media"), name="media")

# CORS with Railway support
railway_cors_origins = [
    "http://localhost:3000",  # Local development
    "https://*.railway.app",  # Railway frontend domains
    "https://*.up.railway.app",  # Railway preview domains
    "https://frontend-service-production-9b9d.up.railway.app",  # Your specific frontend URL
]

# Add custom domain if specified
custom_domain = os.environ.get('FRONTEND_URL')
if custom_domain:
    railway_cors_origins.append(custom_domain)

# Add existing CORS_ORIGINS for backward compatibility
existing_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
railway_cors_origins.extend(existing_origins)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Temporarily allow all for debugging
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Health check endpoint for Railway
@app.get("/health")
async def health_check():
    """Health check endpoint for Railway"""
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Railway-specific startup
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get('PORT', 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
from fastapi import FastAPI, APIRouter, HTTPException, Form, Depends, Response, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
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
    """Verify admin JWT token from cookie"""
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

class AdminLogin(BaseModel):
    password: str

# PDF Generation
async def generate_syllabus_pdf(course_slug: str, student_name: str) -> str:
    """Generate a professional syllabus PDF"""
    try:
        course_name = COURSE_NAMES.get(course_slug, "Course")
        tools = TOOLS_CONFIG.get(course_slug, [])
        
        # Create temporary file
        temp_file = f"/app/backend/temp/syllabus_{course_slug}_{uuid.uuid4().hex[:8]}.pdf"
        
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
        content = []
        
        # Header with logo placeholder
        content.append(Paragraph("GRRAS Solutions Training Institute", title_style))
        content.append(Spacer(1, 20))
        
        # Course title
        content.append(Paragraph(f"{course_name} - Detailed Syllabus", heading_style))
        content.append(Spacer(1, 10))
        
        # Student name
        content.append(Paragraph(f"Prepared for: {student_name}", normal_style))
        content.append(Paragraph(f"Date: {datetime.now().strftime('%B %d, %Y')}", normal_style))
        content.append(Paragraph(f"Document ID: SYL-{course_slug.upper()}-{datetime.now().strftime('%Y%m%d')}", normal_style))
        content.append(Spacer(1, 30))
        
        # Tools/Technologies section
        content.append(Paragraph("Tools & Technologies Covered", heading_style))
        for tool in tools:
            content.append(Paragraph(f"• {tool}", normal_style))
        content.append(Spacer(1, 20))
        
        # Curriculum outline
        content.append(Paragraph("Curriculum Outline", heading_style))
        content.append(Paragraph("Detailed curriculum will be shared during counseling session. Our comprehensive program covers:", normal_style))
        content.append(Paragraph("• Fundamentals and core concepts", normal_style))
        content.append(Paragraph("• Hands-on practical sessions", normal_style))
        content.append(Paragraph("• Industry best practices", normal_style))
        content.append(Paragraph("• Real-world projects", normal_style))
        content.append(Paragraph("• Certification preparation", normal_style))
        content.append(Spacer(1, 20))
        
        # Learning outcomes
        content.append(Paragraph("Learning Outcomes", heading_style))
        content.append(Paragraph("Upon successful completion of this program, students will:", normal_style))
        content.append(Paragraph("• Master industry-relevant skills and technologies", normal_style))
        content.append(Paragraph("• Gain practical experience through projects", normal_style))
        content.append(Paragraph("• Be prepared for industry certifications", normal_style))
        content.append(Paragraph("• Develop problem-solving capabilities", normal_style))
        content.append(Spacer(1, 20))
        
        # Schedule and fees
        content.append(Paragraph("Schedule & Fees", heading_style))
        content.append(Paragraph("For detailed schedule, duration, and fee structure, please contact our admissions team.", normal_style))
        content.append(Spacer(1, 30))
        
        # Footer
        content.append(Paragraph("Contact Information", heading_style))
        content.append(Paragraph("GRRAS Solutions Training Institute", normal_style))
        content.append(Paragraph("A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital", normal_style))
        content.append(Paragraph("Jaipur, Rajasthan 302012", normal_style))
        content.append(Paragraph("Phone: 090019 91227", normal_style))
        
        # Build PDF
        doc.build(content)
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
    """Get all available courses"""
    return {
        "courses": [
            {"slug": slug, "name": name, "tools": TOOLS_CONFIG.get(slug, [])}
            for slug, name in COURSE_NAMES.items()
        ]
    }

@api_router.get("/courses/{course_slug}")
async def get_course(course_slug: str):
    """Get specific course details"""
    if course_slug not in COURSE_NAMES:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {
        "slug": course_slug,
        "name": COURSE_NAMES[course_slug],
        "tools": TOOLS_CONFIG.get(course_slug, [])
    }

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
    # Validate course
    if request.course_slug not in COURSE_NAMES:
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
    course_name = COURSE_NAMES[request.course_slug]
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
            user=username
        )
        return {"success": True, "content": updated_content}
    except Exception as e:
        logging.error(f"Error updating content: {e}")
        raise HTTPException(status_code=500, detail="Failed to update content")

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
    
    # Set httpOnly cookie
    response.set_cookie(
        key="admin_token",
        value=token,
        httponly=True,
        max_age=86400,  # 24 hours
        secure=False,  # Set to True in production with HTTPS
        samesite="lax"
    )
    
    return {"success": True, "message": "Login successful"}

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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
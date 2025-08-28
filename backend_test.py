#!/usr/bin/env python3
"""
GRRAS Solutions Backend API Test Suite
Tests all backend endpoints with comprehensive scenarios
"""

import requests
import json
import os
import sys
from datetime import datetime
import base64
from pathlib import Path

# Get backend URL from frontend .env file
def get_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_BASE = f"{BASE_URL}/api"

# Test data
VALID_LEAD = {
    "name": "Test Student",
    "email": "test@example.com", 
    "phone": "9876543210",
    "message": "Interested in courses"
}

VALID_SYLLABUS_REQUEST = {
    "name": "Test User",
    "email": "user@test.com",
    "phone": "9988776655", 
    "course_slug": "devops-training",
    "consent": True
}

COURSE_SLUGS = [
    "bca-degree",
    "devops-training", 
    "redhat-certifications",
    "data-science-machine-learning",
    "java-salesforce",
    "python",
    "c-cpp-dsa"
]

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "grras-admin"

class TestResults:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def add_result(self, test_name, status, message="", details=""):
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        if status == "PASS":
            self.passed += 1
        else:
            self.failed += 1
        
        # Print result immediately
        status_symbol = "✅" if status == "PASS" else "❌"
        print(f"{status_symbol} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
    
    def print_summary(self):
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/(self.passed + self.failed)*100):.1f}%")
        
        if self.failed > 0:
            print(f"\nFAILED TESTS:")
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"❌ {result['test']}: {result['message']}")

def test_health_check(results):
    """Test GET /api/ - Basic health check"""
    try:
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "status" in data:
                results.add_result("Health Check", "PASS", "API is active and responding")
            else:
                results.add_result("Health Check", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Health Check", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Health Check", "FAIL", "Connection failed", str(e))

def test_get_courses(results):
    """Test GET /api/courses - Get all available courses"""
    try:
        response = requests.get(f"{API_BASE}/courses", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "courses" in data and isinstance(data["courses"], list):
                if len(data["courses"]) == 7:  # Should have 7 courses
                    results.add_result("Get All Courses", "PASS", f"Retrieved {len(data['courses'])} courses")
                else:
                    results.add_result("Get All Courses", "FAIL", f"Expected 7 courses, got {len(data['courses'])}")
            else:
                results.add_result("Get All Courses", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Get All Courses", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Get All Courses", "FAIL", "Request failed", str(e))

def test_get_course_details(results):
    """Test GET /api/courses/{slug} - Get specific course details"""
    for slug in COURSE_SLUGS:
        try:
            response = requests.get(f"{API_BASE}/courses/{slug}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "slug" in data and "title" in data and "tools" in data:  # Changed from "name" to "title"
                    if data["slug"] == slug:
                        results.add_result(f"Get Course Details - {slug}", "PASS", f"Retrieved details for {data['title']}")
                    else:
                        results.add_result(f"Get Course Details - {slug}", "FAIL", "Slug mismatch in response")
                else:
                    results.add_result(f"Get Course Details - {slug}", "FAIL", "Invalid response format", str(data))
            else:
                results.add_result(f"Get Course Details - {slug}", "FAIL", f"HTTP {response.status_code}", response.text)
        except Exception as e:
            results.add_result(f"Get Course Details - {slug}", "FAIL", "Request failed", str(e))

def test_invalid_course_slug(results):
    """Test GET /api/courses/{invalid_slug} - Should return 404"""
    try:
        response = requests.get(f"{API_BASE}/courses/invalid-course", timeout=10)
        if response.status_code == 404:
            results.add_result("Invalid Course Slug", "PASS", "Correctly returned 404 for invalid course")
        else:
            results.add_result("Invalid Course Slug", "FAIL", f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.add_result("Invalid Course Slug", "FAIL", "Request failed", str(e))

def test_create_lead_valid(results):
    """Test POST /api/leads - Create new lead with valid data"""
    try:
        response = requests.post(f"{API_BASE}/leads", json=VALID_LEAD, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "success" in data and "lead_id" in data and data["success"]:
                results.add_result("Create Valid Lead", "PASS", f"Lead created with ID: {data['lead_id']}")
            else:
                results.add_result("Create Valid Lead", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Create Valid Lead", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Create Valid Lead", "FAIL", "Request failed", str(e))

def test_create_lead_invalid_phone(results):
    """Test POST /api/leads - Invalid phone number validation"""
    invalid_lead = VALID_LEAD.copy()
    invalid_lead["phone"] = "123"  # Invalid phone
    
    try:
        response = requests.post(f"{API_BASE}/leads", json=invalid_lead, timeout=10)
        if response.status_code == 400:
            results.add_result("Invalid Phone Validation", "PASS", "Correctly rejected invalid phone number")
        else:
            results.add_result("Invalid Phone Validation", "FAIL", f"Expected 400, got {response.status_code}")
    except Exception as e:
        results.add_result("Invalid Phone Validation", "FAIL", "Request failed", str(e))

def test_create_lead_invalid_email(results):
    """Test POST /api/leads - Invalid email validation"""
    invalid_lead = VALID_LEAD.copy()
    invalid_lead["email"] = "invalid-email"  # Invalid email
    
    try:
        response = requests.post(f"{API_BASE}/leads", json=invalid_lead, timeout=10)
        if response.status_code == 422:  # Pydantic validation error
            results.add_result("Invalid Email Validation", "PASS", "Correctly rejected invalid email")
        else:
            results.add_result("Invalid Email Validation", "FAIL", f"Expected 422, got {response.status_code}")
    except Exception as e:
        results.add_result("Invalid Email Validation", "FAIL", "Request failed", str(e))

def test_syllabus_generation(results):
    """Test POST /api/syllabus - Generate and download syllabus PDF"""
    try:
        response = requests.post(f"{API_BASE}/syllabus", json=VALID_SYLLABUS_REQUEST, timeout=30)
        if response.status_code == 200:
            # Check if response is PDF
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' in content_type:
                # Check if PDF content is valid (starts with PDF header)
                if response.content.startswith(b'%PDF'):
                    results.add_result("Syllabus PDF Generation", "PASS", f"PDF generated successfully ({len(response.content)} bytes)")
                else:
                    results.add_result("Syllabus PDF Generation", "FAIL", "Response is not a valid PDF")
            else:
                results.add_result("Syllabus PDF Generation", "FAIL", f"Wrong content type: {content_type}")
        else:
            results.add_result("Syllabus PDF Generation", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Syllabus PDF Generation", "FAIL", "Request failed", str(e))

def test_syllabus_invalid_course(results):
    """Test POST /api/syllabus - Invalid course slug"""
    invalid_request = VALID_SYLLABUS_REQUEST.copy()
    invalid_request["course_slug"] = "invalid-course"
    
    try:
        response = requests.post(f"{API_BASE}/syllabus", json=invalid_request, timeout=10)
        if response.status_code == 404:
            results.add_result("Syllabus Invalid Course", "PASS", "Correctly rejected invalid course slug")
        else:
            results.add_result("Syllabus Invalid Course", "FAIL", f"Expected 404, got {response.status_code}")
    except Exception as e:
        results.add_result("Syllabus Invalid Course", "FAIL", "Request failed", str(e))

def test_admin_auth_valid(results):
    """Test GET /api/admin/auth - Valid admin authentication"""
    try:
        auth_string = base64.b64encode(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}".encode()).decode()
        headers = {"Authorization": f"Basic {auth_string}"}
        
        response = requests.get(f"{API_BASE}/admin/auth", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "authenticated" in data and data["authenticated"]:
                results.add_result("Admin Auth Valid", "PASS", "Admin authentication successful")
            else:
                results.add_result("Admin Auth Valid", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Admin Auth Valid", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Admin Auth Valid", "FAIL", "Request failed", str(e))

def test_admin_auth_invalid(results):
    """Test GET /api/admin/auth - Invalid admin authentication"""
    try:
        auth_string = base64.b64encode(f"{ADMIN_USERNAME}:wrong-password".encode()).decode()
        headers = {"Authorization": f"Basic {auth_string}"}
        
        response = requests.get(f"{API_BASE}/admin/auth", headers=headers, timeout=10)
        if response.status_code == 401:
            results.add_result("Admin Auth Invalid", "PASS", "Correctly rejected invalid credentials")
        else:
            results.add_result("Admin Auth Invalid", "FAIL", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_result("Admin Auth Invalid", "FAIL", "Request failed", str(e))

def test_get_leads_admin(results):
    """Test GET /api/leads - Admin endpoint to get all leads"""
    try:
        auth_string = base64.b64encode(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}".encode()).decode()
        headers = {"Authorization": f"Basic {auth_string}"}
        
        response = requests.get(f"{API_BASE}/leads", headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "leads" in data and isinstance(data["leads"], list):
                results.add_result("Get Leads Admin", "PASS", f"Retrieved {len(data['leads'])} leads")
            else:
                results.add_result("Get Leads Admin", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Get Leads Admin", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Get Leads Admin", "FAIL", "Request failed", str(e))

def test_get_leads_unauthorized(results):
    """Test GET /api/leads - Should require authentication"""
    try:
        response = requests.get(f"{API_BASE}/leads", timeout=10)
        if response.status_code == 401:
            results.add_result("Get Leads Unauthorized", "PASS", "Correctly requires authentication")
        else:
            results.add_result("Get Leads Unauthorized", "FAIL", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_result("Get Leads Unauthorized", "FAIL", "Request failed", str(e))

# ============================================================================
# NEW CMS CONTENT MANAGEMENT TESTS
# ============================================================================

def test_get_content_public(results):
    """Test GET /api/content - Get current site content (public endpoint)"""
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "content" in data:
                content = data["content"]
                # Verify required content structure
                required_sections = ["branding", "institute", "home", "about", "courses", "faqs", "testimonials", "settings"]
                missing_sections = [section for section in required_sections if section not in content]
                
                if not missing_sections:
                    # Verify courses structure
                    courses = content.get("courses", [])
                    if isinstance(courses, list) and len(courses) > 0:
                        # Check first course has required fields
                        first_course = courses[0]
                        required_course_fields = ["slug", "title", "oneLiner", "duration", "fees", "tools", "visible"]
                        missing_course_fields = [field for field in required_course_fields if field not in first_course]
                        
                        if not missing_course_fields:
                            results.add_result("Get Content Public", "PASS", f"Retrieved content with {len(courses)} courses and all required sections")
                        else:
                            results.add_result("Get Content Public", "FAIL", f"Course missing fields: {missing_course_fields}")
                    else:
                        results.add_result("Get Content Public", "FAIL", "No courses found in content")
                else:
                    results.add_result("Get Content Public", "FAIL", f"Missing content sections: {missing_sections}")
            else:
                results.add_result("Get Content Public", "FAIL", "Response missing 'content' field", str(data))
        else:
            results.add_result("Get Content Public", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Get Content Public", "FAIL", "Request failed", str(e))

def test_admin_login_valid(results):
    """Test POST /api/admin/login - Valid admin login"""
    try:
        login_data = {"password": ADMIN_PASSWORD}
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                # Check if cookie is set
                cookies = response.cookies
                if "admin_token" in cookies:
                    results.add_result("Admin Login Valid", "PASS", "Login successful with cookie set")
                    return cookies  # Return cookies for subsequent tests
                else:
                    results.add_result("Admin Login Valid", "FAIL", "Login successful but no cookie set")
            else:
                results.add_result("Admin Login Valid", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Admin Login Valid", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Admin Login Valid", "FAIL", "Request failed", str(e))
    return None

def test_admin_login_invalid(results):
    """Test POST /api/admin/login - Invalid admin login"""
    try:
        login_data = {"password": "wrong-password"}
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
        
        if response.status_code == 401:
            results.add_result("Admin Login Invalid", "PASS", "Correctly rejected invalid password")
        else:
            results.add_result("Admin Login Invalid", "FAIL", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_result("Admin Login Invalid", "FAIL", "Request failed", str(e))

def test_admin_verify_without_auth(results):
    """Test GET /api/admin/verify - Should require authentication"""
    try:
        response = requests.get(f"{API_BASE}/admin/verify", timeout=10)
        if response.status_code == 401:
            results.add_result("Admin Verify No Auth", "PASS", "Correctly requires authentication")
        else:
            results.add_result("Admin Verify No Auth", "FAIL", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_result("Admin Verify No Auth", "FAIL", "Request failed", str(e))

def test_admin_verify_with_auth(results, admin_cookies):
    """Test GET /api/admin/verify - With valid authentication"""
    if not admin_cookies:
        results.add_result("Admin Verify With Auth", "FAIL", "No admin cookies available")
        return
    
    try:
        response = requests.get(f"{API_BASE}/admin/verify", cookies=admin_cookies, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "authenticated" in data and data["authenticated"]:
                results.add_result("Admin Verify With Auth", "PASS", f"Authentication verified for user: {data.get('username', 'unknown')}")
            else:
                results.add_result("Admin Verify With Auth", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Admin Verify With Auth", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Admin Verify With Auth", "FAIL", "Request failed", str(e))

def test_update_content_without_auth(results):
    """Test POST /api/content - Should require authentication"""
    try:
        test_content = {
            "content": {
                "home": {
                    "heroHeadline": "Test Update Without Auth"
                }
            }
        }
        response = requests.post(f"{API_BASE}/content", json=test_content, timeout=10)
        if response.status_code == 401:
            results.add_result("Update Content No Auth", "PASS", "Correctly requires authentication")
        else:
            results.add_result("Update Content No Auth", "FAIL", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_result("Update Content No Auth", "FAIL", "Request failed", str(e))

def test_update_content_with_auth(results, admin_cookies):
    """Test POST /api/content - Update content with authentication"""
    if not admin_cookies:
        results.add_result("Update Content With Auth", "FAIL", "No admin cookies available")
        return
    
    try:
        # Test content update
        test_content = {
            "content": {
                "home": {
                    "heroHeadline": "Test Updated Headline",
                    "heroSubtext": "Test Updated Subtext",
                    "ctaPrimaryLabel": "Explore Courses",
                    "ctaPrimaryHref": "/courses",
                    "ctaSecondaryLabel": "Apply Now", 
                    "ctaSecondaryHref": "/admissions"
                },
                "courses": [
                    {
                        "slug": "test-course",
                        "title": "Test Course",
                        "oneLiner": "Test description",
                        "duration": "3 months",
                        "fees": "Test fees",
                        "tools": ["Tool1", "Tool2"],
                        "visible": True,
                        "order": 1,
                        "thumbnailUrl": "",
                        "category": "test",
                        "level": "Beginner"
                    }
                ],
                "branding": {
                    "logoUrl": "https://example.com/logo.png",
                    "colors": {
                        "primary": "#DC2626",
                        "secondary": "#EA580C"
                    }
                },
                "institute": {
                    "name": "Test Institute",
                    "address": "Test Address",
                    "phone": "1234567890",
                    "email": "test@example.com"
                },
                "about": {
                    "headline": "Test About",
                    "mission": "Test Mission",
                    "vision": "Test Vision",
                    "body": "Test Body"
                },
                "faqs": [],
                "testimonials": [],
                "settings": {
                    "seoTitle": "Test Title",
                    "seoDescription": "Test Description",
                    "seoKeywords": "test, keywords"
                }
            }
        }
        
        response = requests.post(f"{API_BASE}/content", json=test_content, cookies=admin_cookies, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                # Verify the content was actually updated
                verify_response = requests.get(f"{API_BASE}/content", timeout=10)
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    updated_content = verify_data.get("content", {})
                    if updated_content.get("home", {}).get("heroHeadline") == "Test Updated Headline":
                        results.add_result("Update Content With Auth", "PASS", "Content updated successfully and verified")
                    else:
                        results.add_result("Update Content With Auth", "FAIL", "Content update not reflected in GET request")
                else:
                    results.add_result("Update Content With Auth", "FAIL", "Could not verify content update")
            else:
                results.add_result("Update Content With Auth", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Update Content With Auth", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Update Content With Auth", "FAIL", "Request failed", str(e))

def test_content_audit_without_auth(results):
    """Test GET /api/content/audit - Should require authentication"""
    try:
        response = requests.get(f"{API_BASE}/content/audit", timeout=10)
        if response.status_code == 401:
            results.add_result("Content Audit No Auth", "PASS", "Correctly requires authentication")
        else:
            results.add_result("Content Audit No Auth", "FAIL", f"Expected 401, got {response.status_code}")
    except Exception as e:
        results.add_result("Content Audit No Auth", "FAIL", "Request failed", str(e))

def test_content_audit_with_auth(results, admin_cookies):
    """Test GET /api/content/audit - Get audit logs with authentication"""
    if not admin_cookies:
        results.add_result("Content Audit With Auth", "FAIL", "No admin cookies available")
        return
    
    try:
        response = requests.get(f"{API_BASE}/content/audit", cookies=admin_cookies, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "audit_logs" in data:
                audit_logs = data["audit_logs"]
                if isinstance(audit_logs, list):
                    # Check if we have audit logs (should have at least one from the content update test)
                    if len(audit_logs) > 0:
                        # Verify audit log structure
                        first_log = audit_logs[0]
                        required_fields = ["user", "timestamp", "changedKeys", "diffSummary"]
                        missing_fields = [field for field in required_fields if field not in first_log]
                        
                        if not missing_fields:
                            results.add_result("Content Audit With Auth", "PASS", f"Retrieved {len(audit_logs)} audit logs with proper structure")
                        else:
                            results.add_result("Content Audit With Auth", "FAIL", f"Audit log missing fields: {missing_fields}")
                    else:
                        results.add_result("Content Audit With Auth", "PASS", "Retrieved empty audit logs (no changes yet)")
                else:
                    results.add_result("Content Audit With Auth", "FAIL", "audit_logs is not a list")
            else:
                results.add_result("Content Audit With Auth", "FAIL", "Response missing 'audit_logs' field", str(data))
        else:
            results.add_result("Content Audit With Auth", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Content Audit With Auth", "FAIL", "Request failed", str(e))

def test_admin_logout(results, admin_cookies):
    """Test POST /api/admin/logout - Admin logout"""
    if not admin_cookies:
        results.add_result("Admin Logout", "FAIL", "No admin cookies available")
        return
    
    try:
        response = requests.post(f"{API_BASE}/admin/logout", cookies=admin_cookies, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                # Create a new session to test if logout worked
                session = requests.Session()
                session.cookies.update(admin_cookies)
                
                # Try to access protected endpoint with old cookies
                verify_response = session.get(f"{API_BASE}/admin/verify", timeout=10)
                if verify_response.status_code == 401:
                    results.add_result("Admin Logout", "PASS", "Logout successful and session invalidated")
                else:
                    # The logout might work but the cookie is still in our local session
                    # Let's try a fresh request without the session
                    fresh_verify = requests.get(f"{API_BASE}/admin/verify", cookies=admin_cookies, timeout=10)
                    if fresh_verify.status_code == 401:
                        results.add_result("Admin Logout", "PASS", "Logout successful and session invalidated")
                    else:
                        results.add_result("Admin Logout", "FAIL", "Logout successful but session still valid")
            else:
                results.add_result("Admin Logout", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Admin Logout", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Admin Logout", "FAIL", "Request failed", str(e))

def test_courses_api_integration(results):
    """Test GET /api/courses - Verify it uses dynamic content from CMS"""
    try:
        # First get content to see what courses should be available
        content_response = requests.get(f"{API_BASE}/content", timeout=10)
        if content_response.status_code != 200:
            results.add_result("Courses API Integration", "FAIL", "Could not get content for comparison")
            return
        
        content_data = content_response.json()
        content_courses = content_data.get("content", {}).get("courses", [])
        visible_courses = [c for c in content_courses if c.get("visible", True)]
        
        # Now get courses from API
        courses_response = requests.get(f"{API_BASE}/courses", timeout=10)
        if courses_response.status_code == 200:
            courses_data = courses_response.json()
            api_courses = courses_data.get("courses", [])
            
            # Compare counts
            if len(api_courses) == len(visible_courses):
                # Check if course slugs match
                content_slugs = set(c["slug"] for c in visible_courses)
                api_slugs = set(c["slug"] for c in api_courses)
                
                if content_slugs == api_slugs:
                    results.add_result("Courses API Integration", "PASS", f"Courses API correctly uses dynamic content ({len(api_courses)} courses)")
                else:
                    results.add_result("Courses API Integration", "FAIL", f"Course slugs don't match. Content: {content_slugs}, API: {api_slugs}")
            else:
                results.add_result("Courses API Integration", "FAIL", f"Course count mismatch. Content: {len(visible_courses)}, API: {len(api_courses)}")
        else:
            results.add_result("Courses API Integration", "FAIL", f"Courses API failed: HTTP {courses_response.status_code}")
    except Exception as e:
        results.add_result("Courses API Integration", "FAIL", "Request failed", str(e))

def test_syllabus_dynamic_content(results):
    """Test POST /api/syllabus - Verify PDF generation uses dynamic course content"""
    try:
        # Get current content to find a valid course
        content_response = requests.get(f"{API_BASE}/content", timeout=10)
        if content_response.status_code != 200:
            results.add_result("Syllabus Dynamic Content", "FAIL", "Could not get content for test")
            return
        
        content_data = content_response.json()
        courses = content_data.get("content", {}).get("courses", [])
        visible_courses = [c for c in courses if c.get("visible", True)]
        
        if not visible_courses:
            results.add_result("Syllabus Dynamic Content", "FAIL", "No visible courses found in content")
            return
        
        # Use first visible course
        test_course = visible_courses[0]
        syllabus_request = {
            "name": "Test Student",
            "email": "test@example.com",
            "phone": "9876543210",
            "course_slug": test_course["slug"],
            "consent": True
        }
        
        response = requests.post(f"{API_BASE}/syllabus", json=syllabus_request, timeout=30)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' in content_type and response.content.startswith(b'%PDF'):
                results.add_result("Syllabus Dynamic Content", "PASS", f"PDF generated successfully for dynamic course: {test_course['title']}")
            else:
                results.add_result("Syllabus Dynamic Content", "FAIL", "Response is not a valid PDF")
        else:
            results.add_result("Syllabus Dynamic Content", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Syllabus Dynamic Content", "FAIL", "Request failed", str(e))

def main():
    print("GRRAS Solutions Backend API Test Suite")
    print("="*60)
    print(f"Testing API at: {API_BASE}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("="*60)
    
    results = TestResults()
    
    # Run all tests
    print("\n🔍 Testing API Health...")
    test_health_check(results)
    
    print("\n📚 Testing Courses API...")
    test_get_courses(results)
    test_get_course_details(results)
    test_invalid_course_slug(results)
    
    print("\n👥 Testing Leads API...")
    test_create_lead_valid(results)
    test_create_lead_invalid_phone(results)
    test_create_lead_invalid_email(results)
    
    print("\n📄 Testing Syllabus Generation...")
    test_syllabus_generation(results)
    test_syllabus_invalid_course(results)
    
    print("\n🔐 Testing Admin Leads Access...")
    test_get_leads_admin(results)
    test_get_leads_unauthorized(results)
    
    print("\n🎨 Testing CMS Content Management...")
    test_get_content_public(results)
    
    print("\n🔑 Testing New Admin Authentication & Session Management...")
    test_admin_login_invalid(results)
    test_admin_verify_without_auth(results)
    
    # Get admin cookies for authenticated tests
    admin_cookies = test_admin_login_valid(results)
    
    if admin_cookies:
        print("\n🔒 Testing Authenticated CMS Operations...")
        test_admin_verify_with_auth(results, admin_cookies)
        test_update_content_without_auth(results)
        test_update_content_with_auth(results, admin_cookies)
        test_content_audit_without_auth(results)
        test_content_audit_with_auth(results, admin_cookies)
        
        print("\n🔗 Testing CMS Integration...")
        test_courses_api_integration(results)
        test_syllabus_dynamic_content(results)
        
        print("\n🚪 Testing Admin Logout...")
        test_admin_logout(results, admin_cookies)
    else:
        print("\n❌ Skipping authenticated tests - admin login failed")
        results.add_result("Authenticated Tests", "FAIL", "Could not obtain admin session")
    
    # Print summary
    results.print_summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
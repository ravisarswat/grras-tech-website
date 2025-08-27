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
                if "slug" in data and "name" in data and "tools" in data:
                    if data["slug"] == slug:
                        results.add_result(f"Get Course Details - {slug}", "PASS", f"Retrieved details for {data['name']}")
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
    
    print("\n🔐 Testing Admin Authentication...")
    test_admin_auth_valid(results)
    test_admin_auth_invalid(results)
    test_get_leads_admin(results)
    test_get_leads_unauthorized(results)
    
    # Print summary
    results.print_summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
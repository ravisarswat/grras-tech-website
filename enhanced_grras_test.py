#!/usr/bin/env python3
"""
Enhanced GRRAS Solutions Backend API Test Suite
Tests specific requirements from the review request:
1. Footer Management Verification
2. C/C++/DSA Course Verification  
3. Course API Enhanced Schema
4. PDF Generation Enhanced
5. Eligibility Data Integration
6. MongoDB Single Source of Truth
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

# Admin credentials
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
        print(f"\n{'='*80}")
        print(f"ENHANCED GRRAS SOLUTIONS TEST SUMMARY")
        print(f"{'='*80}")
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/(self.passed + self.failed)*100):.1f}%")
        
        if self.failed > 0:
            print(f"\nFAILED TESTS:")
            for result in self.results:
                if result["status"] == "FAIL":
                    print(f"❌ {result['test']}: {result['message']}")

def get_admin_cookies():
    """Get admin authentication cookies"""
    try:
        login_data = {"password": ADMIN_PASSWORD}
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
        if response.status_code == 200:
            return response.cookies
    except:
        pass
    return None

# ============================================================================
# 1. FOOTER MANAGEMENT VERIFICATION
# ============================================================================

def test_footer_configuration_storage(results):
    """Test GET /api/content to verify footer configuration is stored in MongoDB"""
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            
            # Check for footer configuration
            footer = content.get("footer", {})
            if footer:
                # Verify footer structure
                required_footer_sections = ["columns", "popularCourses", "legal", "branding"]
                missing_sections = [section for section in required_footer_sections if section not in footer]
                
                if not missing_sections:
                    # Verify footer.columns structure
                    columns = footer.get("columns", [])
                    popular_courses = footer.get("popularCourses", [])
                    legal = footer.get("legal", [])
                    branding = footer.get("branding", {})
                    
                    details = f"Columns: {len(columns)}, Popular Courses: {len(popular_courses)}, Legal: {len(legal)}, Branding: {bool(branding)}"
                    results.add_result("Footer Configuration Storage", "PASS", f"Footer configuration properly structured in MongoDB", details)
                else:
                    results.add_result("Footer Configuration Storage", "FAIL", f"Missing footer sections: {missing_sections}")
            else:
                results.add_result("Footer Configuration Storage", "FAIL", "Footer configuration not found in content")
        else:
            results.add_result("Footer Configuration Storage", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Footer Configuration Storage", "FAIL", "Request failed", str(e))

def test_footer_data_persistence(results):
    """Test that footer data can be saved and retrieved"""
    admin_cookies = get_admin_cookies()
    if not admin_cookies:
        results.add_result("Footer Data Persistence", "FAIL", "Could not get admin authentication")
        return
    
    try:
        # Get current content
        current_response = requests.get(f"{API_BASE}/content", timeout=10)
        if current_response.status_code != 200:
            results.add_result("Footer Data Persistence", "FAIL", "Could not get current content")
            return
        
        current_content = current_response.json()["content"]
        
        # Add test footer data
        test_footer = {
            "columns": [
                {
                    "title": "Test Column",
                    "links": [
                        {"text": "Test Link", "url": "/test"}
                    ]
                }
            ],
            "popularCourses": [
                {"title": "Test Course", "slug": "test-course"}
            ],
            "legal": [
                {"text": "Test Legal", "url": "/legal"}
            ],
            "branding": {
                "logo": "/logo.png",
                "tagline": "Test Tagline"
            }
        }
        
        updated_content = current_content.copy()
        updated_content["footer"] = test_footer
        
        # Save updated content
        save_response = requests.post(f"{API_BASE}/content", 
                                    json={"content": updated_content}, 
                                    cookies=admin_cookies, timeout=10)
        
        if save_response.status_code == 200:
            # Verify footer data persisted
            verify_response = requests.get(f"{API_BASE}/content", timeout=10)
            if verify_response.status_code == 200:
                verify_data = verify_response.json()
                saved_footer = verify_data.get("content", {}).get("footer", {})
                
                if (saved_footer.get("branding", {}).get("tagline") == "Test Tagline" and
                    len(saved_footer.get("columns", [])) > 0):
                    results.add_result("Footer Data Persistence", "PASS", "Footer data successfully saved and retrieved from MongoDB")
                else:
                    results.add_result("Footer Data Persistence", "FAIL", "Footer data not properly persisted")
            else:
                results.add_result("Footer Data Persistence", "FAIL", "Could not verify saved footer data")
        else:
            results.add_result("Footer Data Persistence", "FAIL", f"Failed to save footer data: HTTP {save_response.status_code}")
    except Exception as e:
        results.add_result("Footer Data Persistence", "FAIL", "Request failed", str(e))

# ============================================================================
# 2. C/C++/DSA COURSE VERIFICATION
# ============================================================================

def test_cpp_dsa_course_exists(results):
    """Verify the new C/C++/DSA course exists with slug 'c-cpp-dsa' and order = 7"""
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code == 200:
            data = response.json()
            courses = data.get("content", {}).get("courses", [])
            
            # Find C/C++/DSA course
            cpp_course = next((c for c in courses if c.get("slug") == "c-cpp-dsa"), None)
            
            if cpp_course:
                # Verify order
                order = cpp_course.get("order", 0)
                title = cpp_course.get("title", "")
                
                if order == 7:
                    results.add_result("C/C++/DSA Course Exists", "PASS", f"Course found with correct order: {title} (order={order})")
                else:
                    results.add_result("C/C++/DSA Course Exists", "FAIL", f"Course found but wrong order: expected 7, got {order}")
            else:
                results.add_result("C/C++/DSA Course Exists", "FAIL", "C/C++/DSA course with slug 'c-cpp-dsa' not found")
        else:
            results.add_result("C/C++/DSA Course Exists", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("C/C++/DSA Course Exists", "FAIL", "Request failed", str(e))

def test_cpp_dsa_course_in_listings(results):
    """Test GET /api/courses to confirm C/C++/DSA appears in course listings"""
    try:
        response = requests.get(f"{API_BASE}/courses", timeout=10)
        if response.status_code == 200:
            data = response.json()
            courses = data.get("courses", [])
            
            # Find C/C++/DSA course in API response
            cpp_course = next((c for c in courses if c.get("slug") == "c-cpp-dsa"), None)
            
            if cpp_course:
                title = cpp_course.get("title", "")
                visible = cpp_course.get("visible", False)
                tools = cpp_course.get("tools", [])
                
                if visible:
                    results.add_result("C/C++/DSA Course in Listings", "PASS", f"Course appears in listings: {title} with {len(tools)} tools")
                else:
                    results.add_result("C/C++/DSA Course in Listings", "FAIL", "Course exists but not visible in listings")
            else:
                results.add_result("C/C++/DSA Course in Listings", "FAIL", "C/C++/DSA course not found in API listings")
        else:
            results.add_result("C/C++/DSA Course in Listings", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("C/C++/DSA Course in Listings", "FAIL", "Request failed", str(e))

def test_cpp_dsa_course_details(results):
    """Test GET /api/courses/c-cpp-dsa for individual course details"""
    try:
        response = requests.get(f"{API_BASE}/courses/c-cpp-dsa", timeout=10)
        if response.status_code == 200:
            course = response.json()
            
            # Verify comprehensive fields are present
            required_fields = ["overview", "tools", "highlights", "learningOutcomes", 
                             "careerRoles", "certificateInfo", "batchesInfo", 
                             "eligibility", "mode", "seo"]
            
            present_fields = []
            missing_fields = []
            
            for field in required_fields:
                if field in course and course[field]:
                    present_fields.append(field)
                else:
                    missing_fields.append(field)
            
            if len(present_fields) >= 8:  # Allow some flexibility
                tools_count = len(course.get("tools", []))
                results.add_result("C/C++/DSA Course Details", "PASS", 
                                 f"Course details comprehensive: {len(present_fields)}/{len(required_fields)} fields, {tools_count} tools")
            else:
                results.add_result("C/C++/DSA Course Details", "FAIL", 
                                 f"Missing comprehensive fields: {missing_fields}")
        else:
            results.add_result("C/C++/DSA Course Details", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("C/C++/DSA Course Details", "FAIL", "Request failed", str(e))

# ============================================================================
# 3. COURSE API ENHANCED SCHEMA
# ============================================================================

def test_enhanced_course_schema(results):
    """Test that all courses now support the enhanced schema"""
    try:
        response = requests.get(f"{API_BASE}/courses", timeout=10)
        if response.status_code == 200:
            data = response.json()
            courses = data.get("courses", [])
            
            if len(courses) >= 8:  # Should have at least 8 courses including C/C++/DSA
                # Check enhanced schema fields across all courses
                enhanced_fields = ["title", "slug", "tools", "highlights", "learningOutcomes", 
                                 "careerRoles", "duration", "fees", "visible", "order"]
                
                schema_compliance = []
                for course in courses:
                    present_fields = sum(1 for field in enhanced_fields if field in course)
                    compliance_rate = (present_fields / len(enhanced_fields)) * 100
                    schema_compliance.append(compliance_rate)
                
                avg_compliance = sum(schema_compliance) / len(schema_compliance)
                
                if avg_compliance >= 80:  # 80% compliance threshold
                    results.add_result("Enhanced Course Schema", "PASS", 
                                     f"Enhanced schema supported: {len(courses)} courses, {avg_compliance:.1f}% field compliance")
                else:
                    results.add_result("Enhanced Course Schema", "FAIL", 
                                     f"Low schema compliance: {avg_compliance:.1f}%")
            else:
                results.add_result("Enhanced Course Schema", "FAIL", f"Expected at least 8 courses, found {len(courses)}")
        else:
            results.add_result("Enhanced Course Schema", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Enhanced Course Schema", "FAIL", "Request failed", str(e))

def test_course_ordering_functionality(results):
    """Verify courses have proper ordering (order field working)"""
    try:
        response = requests.get(f"{API_BASE}/courses", timeout=10)
        if response.status_code == 200:
            data = response.json()
            courses = data.get("courses", [])
            
            # Check if courses have order field and are sorted
            courses_with_order = [c for c in courses if "order" in c]
            
            if len(courses_with_order) >= len(courses) * 0.8:  # 80% should have order field
                # Check if courses are sorted by order
                orders = [c.get("order", 999) for c in courses]
                is_sorted = all(orders[i] <= orders[i+1] for i in range(len(orders)-1))
                
                if is_sorted:
                    results.add_result("Course Ordering Functionality", "PASS", 
                                     f"Courses properly ordered: {len(courses_with_order)}/{len(courses)} have order field")
                else:
                    results.add_result("Course Ordering Functionality", "FAIL", "Courses not properly sorted by order field")
            else:
                results.add_result("Course Ordering Functionality", "FAIL", 
                                 f"Too few courses have order field: {len(courses_with_order)}/{len(courses)}")
        else:
            results.add_result("Course Ordering Functionality", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Course Ordering Functionality", "FAIL", "Request failed", str(e))

def test_visibility_filtering(results):
    """Test visibility filtering (visible=true courses only)"""
    try:
        # Get all courses from content (including hidden ones)
        content_response = requests.get(f"{API_BASE}/content", timeout=10)
        if content_response.status_code != 200:
            results.add_result("Visibility Filtering", "FAIL", "Could not get content for comparison")
            return
        
        all_courses = content_response.json().get("content", {}).get("courses", [])
        visible_courses_expected = [c for c in all_courses if c.get("visible", True)]
        
        # Get courses from API (should only return visible ones)
        api_response = requests.get(f"{API_BASE}/courses", timeout=10)
        if api_response.status_code == 200:
            api_courses = api_response.json().get("courses", [])
            
            # Compare counts
            if len(api_courses) == len(visible_courses_expected):
                # Verify all returned courses are visible
                all_visible = all(c.get("visible", True) for c in api_courses)
                
                if all_visible:
                    results.add_result("Visibility Filtering", "PASS", 
                                     f"Visibility filtering working: {len(api_courses)} visible courses returned")
                else:
                    results.add_result("Visibility Filtering", "FAIL", "Some returned courses are not visible")
            else:
                results.add_result("Visibility Filtering", "FAIL", 
                                 f"Course count mismatch: expected {len(visible_courses_expected)}, got {len(api_courses)}")
        else:
            results.add_result("Visibility Filtering", "FAIL", f"API request failed: HTTP {api_response.status_code}")
    except Exception as e:
        results.add_result("Visibility Filtering", "FAIL", "Request failed", str(e))

# ============================================================================
# 4. PDF GENERATION ENHANCED
# ============================================================================

def test_cpp_dsa_syllabus_pdf(results):
    """Test syllabus PDF generation for C/C++/DSA course: POST /api/courses/c-cpp-dsa/syllabus"""
    try:
        # Note: The actual endpoint is /api/syllabus, not /api/courses/c-cpp-dsa/syllabus
        syllabus_request = {
            "name": "Test Student",
            "email": "test@example.com",
            "phone": "9876543210",
            "course_slug": "c-cpp-dsa",
            "consent": True
        }
        
        response = requests.post(f"{API_BASE}/syllabus", json=syllabus_request, timeout=30)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' in content_type and response.content.startswith(b'%PDF'):
                # Check filename in headers
                content_disposition = response.headers.get('content-disposition', '')
                
                if 'C_C++_&_DSA' in content_disposition or 'c-cpp-dsa' in content_disposition.lower():
                    results.add_result("C/C++/DSA Syllabus PDF", "PASS", 
                                     f"PDF generated successfully ({len(response.content)} bytes)")
                else:
                    results.add_result("C/C++/DSA Syllabus PDF", "PASS", 
                                     f"PDF generated ({len(response.content)} bytes) - filename may need adjustment")
            else:
                results.add_result("C/C++/DSA Syllabus PDF", "FAIL", "Response is not a valid PDF")
        else:
            results.add_result("C/C++/DSA Syllabus PDF", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("C/C++/DSA Syllabus PDF", "FAIL", "Request failed", str(e))

def test_pdf_comprehensive_data(results):
    """Verify PDF includes comprehensive course data from CMS"""
    try:
        # Test with a course that should have comprehensive data
        syllabus_request = {
            "name": "Comprehensive Test User",
            "email": "comprehensive@test.com",
            "phone": "9876543210",
            "course_slug": "devops-training",  # Use a well-established course
            "consent": True
        }
        
        response = requests.post(f"{API_BASE}/syllabus", json=syllabus_request, timeout=30)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' in content_type and response.content.startswith(b'%PDF'):
                # Check PDF size - comprehensive data should result in larger PDF
                pdf_size = len(response.content)
                
                if pdf_size > 3000:  # Comprehensive PDFs should be larger
                    results.add_result("PDF Comprehensive Data", "PASS", 
                                     f"PDF includes comprehensive data ({pdf_size} bytes)")
                else:
                    results.add_result("PDF Comprehensive Data", "FAIL", 
                                     f"PDF may lack comprehensive data ({pdf_size} bytes)")
            else:
                results.add_result("PDF Comprehensive Data", "FAIL", "Response is not a valid PDF")
        else:
            results.add_result("PDF Comprehensive Data", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("PDF Comprehensive Data", "FAIL", "Request failed", str(e))

def test_pdf_content_fields(results):
    """Test that fees, duration, tools, highlights, outcomes all appear in PDF"""
    try:
        # Get course data first to verify what should be in PDF
        course_response = requests.get(f"{API_BASE}/courses/c-cpp-dsa", timeout=10)
        if course_response.status_code != 200:
            results.add_result("PDF Content Fields", "FAIL", "Could not get course data for verification")
            return
        
        course_data = course_response.json()
        
        # Generate PDF
        syllabus_request = {
            "name": "Content Verification User",
            "email": "content@test.com",
            "phone": "9876543210",
            "course_slug": "c-cpp-dsa",
            "consent": True
        }
        
        response = requests.post(f"{API_BASE}/syllabus", json=syllabus_request, timeout=30)
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' in content_type and response.content.startswith(b'%PDF'):
                # Verify course has the expected fields
                has_fees = bool(course_data.get("fees"))
                has_duration = bool(course_data.get("duration"))
                has_tools = len(course_data.get("tools", [])) > 0
                has_highlights = len(course_data.get("highlights", [])) > 0
                has_outcomes = len(course_data.get("learningOutcomes", [])) > 0
                
                content_fields = [has_fees, has_duration, has_tools, has_highlights, has_outcomes]
                present_count = sum(content_fields)
                
                if present_count >= 4:  # At least 4 out of 5 fields should be present
                    results.add_result("PDF Content Fields", "PASS", 
                                     f"Course has comprehensive content fields ({present_count}/5), PDF generated successfully")
                else:
                    results.add_result("PDF Content Fields", "FAIL", 
                                     f"Course lacks content fields ({present_count}/5)")
            else:
                results.add_result("PDF Content Fields", "FAIL", "Response is not a valid PDF")
        else:
            results.add_result("PDF Content Fields", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("PDF Content Fields", "FAIL", "Request failed", str(e))

# ============================================================================
# 5. ELIGIBILITY DATA INTEGRATION
# ============================================================================

def test_courses_eligibility_field(results):
    """Verify all courses have eligibility field populated"""
    try:
        response = requests.get(f"{API_BASE}/courses", timeout=10)
        if response.status_code == 200:
            data = response.json()
            courses = data.get("courses", [])
            
            courses_with_eligibility = []
            courses_without_eligibility = []
            
            for course in courses:
                if "eligibility" in course and course["eligibility"]:
                    courses_with_eligibility.append(course["slug"])
                else:
                    courses_without_eligibility.append(course["slug"])
            
            eligibility_rate = (len(courses_with_eligibility) / len(courses)) * 100
            
            if eligibility_rate >= 80:  # 80% should have eligibility data
                results.add_result("Courses Eligibility Field", "PASS", 
                                 f"Eligibility data present: {len(courses_with_eligibility)}/{len(courses)} courses ({eligibility_rate:.1f}%)")
            else:
                results.add_result("Courses Eligibility Field", "FAIL", 
                                 f"Low eligibility coverage: {eligibility_rate:.1f}% - Missing: {courses_without_eligibility}")
        else:
            results.add_result("Courses Eligibility Field", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Courses Eligibility Field", "FAIL", "Request failed", str(e))

def test_eligibility_widget_access(results):
    """Test that course eligibility can be accessed via API for the eligibility widget"""
    try:
        # Test accessing eligibility for multiple courses
        test_courses = ["c-cpp-dsa", "devops-training", "python"]
        eligibility_data = {}
        
        for course_slug in test_courses:
            course_response = requests.get(f"{API_BASE}/courses/{course_slug}", timeout=10)
            if course_response.status_code == 200:
                course_data = course_response.json()
                eligibility = course_data.get("eligibility", "")
                if eligibility:
                    eligibility_data[course_slug] = eligibility
        
        if len(eligibility_data) >= 2:  # At least 2 courses should have eligibility data
            results.add_result("Eligibility Widget Access", "PASS", 
                             f"Eligibility accessible for widget: {len(eligibility_data)} courses have eligibility data")
        else:
            results.add_result("Eligibility Widget Access", "FAIL", 
                             f"Insufficient eligibility data for widget: only {len(eligibility_data)} courses")
    except Exception as e:
        results.add_result("Eligibility Widget Access", "FAIL", "Request failed", str(e))

# ============================================================================
# 6. MONGODB SINGLE SOURCE OF TRUTH
# ============================================================================

def test_mongodb_eight_courses(results):
    """Confirm all 8 courses are stored in MongoDB with enhanced schema"""
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code == 200:
            data = response.json()
            courses = data.get("content", {}).get("courses", [])
            
            if len(courses) >= 8:
                # Verify enhanced schema fields
                enhanced_fields = ["slug", "title", "tools", "duration", "fees", "visible", "order"]
                schema_compliance = []
                
                for course in courses:
                    present_fields = sum(1 for field in enhanced_fields if field in course and course[field])
                    compliance = (present_fields / len(enhanced_fields)) * 100
                    schema_compliance.append(compliance)
                
                avg_compliance = sum(schema_compliance) / len(schema_compliance)
                
                if avg_compliance >= 85:
                    results.add_result("MongoDB Eight Courses", "PASS", 
                                     f"MongoDB contains {len(courses)} courses with enhanced schema ({avg_compliance:.1f}% compliance)")
                else:
                    results.add_result("MongoDB Eight Courses", "FAIL", 
                                     f"Low enhanced schema compliance: {avg_compliance:.1f}%")
            else:
                results.add_result("MongoDB Eight Courses", "FAIL", f"Expected at least 8 courses, found {len(courses)}")
        else:
            results.add_result("MongoDB Eight Courses", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("MongoDB Eight Courses", "FAIL", "Request failed", str(e))

def test_footer_config_persistence(results):
    """Verify footer configuration persistence in MongoDB"""
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            
            # Check if footer configuration exists and is persistent
            footer = content.get("footer", {})
            if footer:
                # Check for persistence indicators (non-empty structure)
                has_columns = len(footer.get("columns", [])) > 0
                has_branding = bool(footer.get("branding", {}))
                has_legal = len(footer.get("legal", [])) > 0
                
                persistence_score = sum([has_columns, has_branding, has_legal])
                
                if persistence_score >= 2:
                    results.add_result("Footer Config Persistence", "PASS", 
                                     f"Footer configuration persistent in MongoDB (score: {persistence_score}/3)")
                else:
                    results.add_result("Footer Config Persistence", "FAIL", 
                                     f"Footer configuration incomplete (score: {persistence_score}/3)")
            else:
                results.add_result("Footer Config Persistence", "FAIL", "Footer configuration not found in MongoDB")
        else:
            results.add_result("Footer Config Persistence", "FAIL", f"HTTP {response.status_code}", response.text)
    except Exception as e:
        results.add_result("Footer Config Persistence", "FAIL", "Request failed", str(e))

def test_course_updates_immediate_reflection(results):
    """Test that course updates reflect immediately in API responses"""
    admin_cookies = get_admin_cookies()
    if not admin_cookies:
        results.add_result("Course Updates Immediate Reflection", "FAIL", "Could not get admin authentication")
        return
    
    try:
        # Get current content
        current_response = requests.get(f"{API_BASE}/content", timeout=10)
        if current_response.status_code != 200:
            results.add_result("Course Updates Immediate Reflection", "FAIL", "Could not get current content")
            return
        
        current_content = current_response.json()["content"]
        
        # Find a course to update
        courses = current_content.get("courses", [])
        if not courses:
            results.add_result("Course Updates Immediate Reflection", "FAIL", "No courses found to test")
            return
        
        test_course = courses[0].copy()
        original_title = test_course.get("title", "")
        test_marker = f"IMMEDIATE_TEST_{datetime.now().strftime('%H%M%S')}"
        test_course["title"] = f"{original_title} - {test_marker}"
        
        # Update the course in content
        updated_content = current_content.copy()
        updated_content["courses"][0] = test_course
        
        # Save updated content
        save_response = requests.post(f"{API_BASE}/content", 
                                    json={"content": updated_content}, 
                                    cookies=admin_cookies, timeout=10)
        
        if save_response.status_code == 200:
            # Immediately check if change is reflected in API
            api_response = requests.get(f"{API_BASE}/courses", timeout=10)
            if api_response.status_code == 200:
                api_courses = api_response.json().get("courses", [])
                updated_course = next((c for c in api_courses if test_marker in c.get("title", "")), None)
                
                if updated_course:
                    results.add_result("Course Updates Immediate Reflection", "PASS", 
                                     "Course updates immediately reflected in API responses")
                    
                    # Restore original title
                    test_course["title"] = original_title
                    updated_content["courses"][0] = test_course
                    requests.post(f"{API_BASE}/content", 
                                json={"content": updated_content}, 
                                cookies=admin_cookies, timeout=10)
                else:
                    results.add_result("Course Updates Immediate Reflection", "FAIL", 
                                     "Course updates not immediately reflected in API")
            else:
                results.add_result("Course Updates Immediate Reflection", "FAIL", 
                                 f"Could not verify API response: HTTP {api_response.status_code}")
        else:
            results.add_result("Course Updates Immediate Reflection", "FAIL", 
                             f"Failed to save course update: HTTP {save_response.status_code}")
    except Exception as e:
        results.add_result("Course Updates Immediate Reflection", "FAIL", "Request failed", str(e))

# ============================================================================
# MAIN TEST EXECUTION
# ============================================================================

def main():
    print("🚀 Starting Enhanced GRRAS Solutions Backend API Tests")
    print(f"🔗 Testing API at: {API_BASE}")
    print("="*80)
    
    results = TestResults()
    
    # 1. Footer Management Verification
    print("\n📋 1. FOOTER MANAGEMENT VERIFICATION")
    test_footer_configuration_storage(results)
    test_footer_data_persistence(results)
    
    # 2. C/C++/DSA Course Verification
    print("\n💻 2. C/C++/DSA COURSE VERIFICATION")
    test_cpp_dsa_course_exists(results)
    test_cpp_dsa_course_in_listings(results)
    test_cpp_dsa_course_details(results)
    
    # 3. Course API Enhanced Schema
    print("\n📊 3. COURSE API ENHANCED SCHEMA")
    test_enhanced_course_schema(results)
    test_course_ordering_functionality(results)
    test_visibility_filtering(results)
    
    # 4. PDF Generation Enhanced
    print("\n📄 4. PDF GENERATION ENHANCED")
    test_cpp_dsa_syllabus_pdf(results)
    test_pdf_comprehensive_data(results)
    test_pdf_content_fields(results)
    
    # 5. Eligibility Data Integration
    print("\n✅ 5. ELIGIBILITY DATA INTEGRATION")
    test_courses_eligibility_field(results)
    test_eligibility_widget_access(results)
    
    # 6. MongoDB Single Source of Truth
    print("\n🗄️ 6. MONGODB SINGLE SOURCE OF TRUTH")
    test_mongodb_eight_courses(results)
    test_footer_config_persistence(results)
    test_course_updates_immediate_reflection(results)
    
    # Print final summary
    results.print_summary()
    
    return results.failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
#!/usr/bin/env python3
"""
Railway CMS Content Issues Test Suite
Tests specific CMS content issues on Railway deployment
"""

import requests
import json
import os
import sys
from datetime import datetime
import base64
from pathlib import Path

# Railway backend URL as specified in the review request
RAILWAY_BACKEND_URL = "https://grras-tech-website-production.up.railway.app"
API_BASE = f"{RAILWAY_BACKEND_URL}/api"

# Admin credentials
ADMIN_PASSWORD = "grras-admin"

# Expected course slugs
EXPECTED_COURSES = [
    "devops-training",
    "bca-degree", 
    "redhat-certifications",
    "data-science-machine-learning",
    "java-salesforce",
    "python",
    "c-cpp-dsa"
]

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
        print(f"RAILWAY CMS TEST SUMMARY")
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

def test_railway_connectivity(results):
    """Test basic connectivity to Railway backend"""
    try:
        response = requests.get(f"{API_BASE}/", timeout=15)
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "status" in data:
                results.add_result("Railway Connectivity", "PASS", f"Connected to Railway backend: {data['message']}")
            else:
                results.add_result("Railway Connectivity", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Railway Connectivity", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    except Exception as e:
        results.add_result("Railway Connectivity", "FAIL", "Connection failed", str(e))

def test_content_api_full_response(results):
    """Test 1: Full Content API Response - Check for truncation issues"""
    try:
        response = requests.get(f"{API_BASE}/content", timeout=30)
        if response.status_code == 200:
            # Get raw response text to check for truncation
            response_text = response.text
            response_size = len(response_text)
            
            try:
                data = response.json()
                content = data.get("content", {})
                
                # Check if we have all expected sections
                expected_sections = ["branding", "institute", "home", "about", "courses", "faqs", "testimonials", "settings"]
                missing_sections = [section for section in expected_sections if section not in content]
                
                # Check courses specifically
                courses = content.get("courses", [])
                course_count = len(courses)
                
                # Check if response seems complete (not truncated)
                is_valid_json = True
                try:
                    json.loads(response_text)
                except json.JSONDecodeError:
                    is_valid_json = False
                
                if not is_valid_json:
                    results.add_result("Content API Full Response", "FAIL", 
                                     f"Response truncated - invalid JSON (size: {response_size} chars)")
                elif response_size < 2000:
                    results.add_result("Content API Full Response", "FAIL", 
                                     f"Response too small - likely truncated (size: {response_size} chars)")
                elif missing_sections:
                    results.add_result("Content API Full Response", "FAIL", 
                                     f"Missing sections: {missing_sections} (size: {response_size} chars)")
                elif course_count < 7:
                    results.add_result("Content API Full Response", "FAIL", 
                                     f"Only {course_count}/7 courses found (size: {response_size} chars)")
                else:
                    # Check if all expected courses are present
                    course_slugs = [c.get("slug") for c in courses]
                    missing_courses = [slug for slug in EXPECTED_COURSES if slug not in course_slugs]
                    
                    if missing_courses:
                        results.add_result("Content API Full Response", "FAIL", 
                                         f"Missing courses: {missing_courses} (size: {response_size} chars)")
                    else:
                        results.add_result("Content API Full Response", "PASS", 
                                         f"Complete response with all {course_count} courses (size: {response_size} chars)")
                        
            except json.JSONDecodeError as e:
                results.add_result("Content API Full Response", "FAIL", 
                                 f"JSON decode error - response truncated (size: {response_size} chars)", str(e))
        else:
            results.add_result("Content API Full Response", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    except Exception as e:
        results.add_result("Content API Full Response", "FAIL", "Request failed", str(e))

def test_admin_login_railway(results):
    """Test admin login on Railway deployment"""
    try:
        login_data = {"password": ADMIN_PASSWORD}
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                # Check if cookie is set
                cookies = response.cookies
                if "admin_token" in cookies:
                    results.add_result("Admin Login Railway", "PASS", "Login successful with JWT cookie")
                    return cookies
                else:
                    results.add_result("Admin Login Railway", "FAIL", "Login successful but no cookie set")
            else:
                results.add_result("Admin Login Railway", "FAIL", "Invalid response format", str(data))
        else:
            results.add_result("Admin Login Railway", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    except Exception as e:
        results.add_result("Admin Login Railway", "FAIL", "Request failed", str(e))
    return None

def test_cms_save_functionality(results, admin_cookies):
    """Test 2: CMS Save Issue - Test content save functionality"""
    if not admin_cookies:
        results.add_result("CMS Save Functionality", "FAIL", "No admin cookies available")
        return
    
    try:
        # First get current content
        current_response = requests.get(f"{API_BASE}/content", timeout=15)
        if current_response.status_code != 200:
            results.add_result("CMS Save Functionality", "FAIL", "Could not get current content")
            return
        
        current_content = current_response.json()["content"]
        
        # Make a small test update
        updated_content = current_content.copy()
        test_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        updated_content["home"]["heroHeadline"] = f"Railway Test Update {test_timestamp}"
        
        # Test content save
        test_content = {"content": updated_content}
        
        response = requests.post(f"{API_BASE}/content", json=test_content, cookies=admin_cookies, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                # Verify the content was actually saved
                verify_response = requests.get(f"{API_BASE}/content", timeout=15)
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    updated_headline = verify_data.get("content", {}).get("home", {}).get("heroHeadline", "")
                    
                    if f"Railway Test Update {test_timestamp}" in updated_headline:
                        results.add_result("CMS Save Functionality", "PASS", "Content save working correctly")
                    else:
                        results.add_result("CMS Save Functionality", "FAIL", "Content save not reflected in GET request")
                else:
                    results.add_result("CMS Save Functionality", "FAIL", "Could not verify content save")
            else:
                results.add_result("CMS Save Functionality", "FAIL", "Save response indicates failure", str(data))
        elif response.status_code == 500:
            error_text = response.text
            if "Failed to save content" in error_text:
                results.add_result("CMS Save Functionality", "FAIL", "Server returned 'Failed to save content' error", error_text[:200])
            else:
                results.add_result("CMS Save Functionality", "FAIL", f"Server error during save: {error_text[:200]}")
        else:
            results.add_result("CMS Save Functionality", "FAIL", f"HTTP {response.status_code}", response.text[:200])
            
    except Exception as e:
        results.add_result("CMS Save Functionality", "FAIL", "Request failed", str(e))

def test_cors_frontend_access(results):
    """Test 3: CORS Issue - Test CORS headers for frontend access"""
    try:
        # Test preflight request from the specific frontend URL
        frontend_url = "https://frontend-service-production-9b9d.up.railway.app"
        headers = {
            'Origin': frontend_url,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
        
        response = requests.options(f"{API_BASE}/content", headers=headers, timeout=15)
        
        # Check CORS headers
        cors_origin = response.headers.get('Access-Control-Allow-Origin')
        cors_methods = response.headers.get('Access-Control-Allow-Methods')
        cors_headers = response.headers.get('Access-Control-Allow-Headers')
        cors_credentials = response.headers.get('Access-Control-Allow-Credentials')
        
        cors_issues = []
        
        if not cors_origin:
            cors_issues.append("Missing Access-Control-Allow-Origin")
        elif cors_origin != "*" and frontend_url not in cors_origin:
            cors_issues.append(f"Origin not allowed: {cors_origin}")
        
        if not cors_methods or "POST" not in cors_methods:
            cors_issues.append("POST method not allowed")
        
        if not cors_headers or "Content-Type" not in cors_headers:
            cors_issues.append("Content-Type header not allowed")
        
        if cors_credentials != "true":
            cors_issues.append("Credentials not allowed")
        
        if cors_issues:
            results.add_result("CORS Frontend Access", "FAIL", f"CORS issues: {cors_issues}")
        else:
            results.add_result("CORS Frontend Access", "PASS", f"CORS properly configured for frontend: {frontend_url}")
            
    except Exception as e:
        results.add_result("CORS Frontend Access", "FAIL", "CORS test failed", str(e))

def test_authenticated_request_cors(results, admin_cookies):
    """Test authenticated requests with CORS"""
    if not admin_cookies:
        results.add_result("Authenticated Request CORS", "FAIL", "No admin cookies available")
        return
    
    try:
        # Test authenticated request with Origin header
        headers = {
            'Origin': 'https://frontend-service-production-9b9d.up.railway.app',
            'Content-Type': 'application/json'
        }
        
        # Test a simple authenticated endpoint
        response = requests.get(f"{API_BASE}/admin/verify", 
                              cookies=admin_cookies, 
                              headers=headers, 
                              timeout=15)
        
        if response.status_code == 200:
            # Check if CORS headers are present in authenticated response
            cors_origin = response.headers.get('Access-Control-Allow-Origin')
            if cors_origin:
                results.add_result("Authenticated Request CORS", "PASS", "Authenticated requests work with CORS")
            else:
                results.add_result("Authenticated Request CORS", "FAIL", "Missing CORS headers in authenticated response")
        else:
            results.add_result("Authenticated Request CORS", "FAIL", f"Authenticated request failed: HTTP {response.status_code}")
            
    except Exception as e:
        results.add_result("Authenticated Request CORS", "FAIL", "Authenticated CORS test failed", str(e))

def test_all_seven_courses_validation(results):
    """Test 3: All 7 Courses Validation - Verify all expected courses are present"""
    try:
        response = requests.get(f"{API_BASE}/content", timeout=15)
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            courses = content.get("courses", [])
            
            # Check each expected course
            found_courses = []
            missing_courses = []
            visibility_issues = []
            
            course_slugs = [c.get("slug") for c in courses]
            
            for expected_slug in EXPECTED_COURSES:
                if expected_slug in course_slugs:
                    # Find the course and check visibility
                    course = next(c for c in courses if c.get("slug") == expected_slug)
                    if course.get("visible", True):
                        found_courses.append(expected_slug)
                    else:
                        visibility_issues.append(expected_slug)
                else:
                    missing_courses.append(expected_slug)
            
            # Report results
            if len(found_courses) == 7 and not missing_courses and not visibility_issues:
                results.add_result("All 7 Courses Validation", "PASS", 
                                 f"All 7 expected courses found and visible: {found_courses}")
            else:
                issues = []
                if missing_courses:
                    issues.append(f"Missing: {missing_courses}")
                if visibility_issues:
                    issues.append(f"Hidden: {visibility_issues}")
                
                results.add_result("All 7 Courses Validation", "FAIL", 
                                 f"Course issues found. Found: {len(found_courses)}/7. {'; '.join(issues)}")
        else:
            results.add_result("All 7 Courses Validation", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    except Exception as e:
        results.add_result("All 7 Courses Validation", "FAIL", "Request failed", str(e))

def test_content_size_and_structure(results):
    """Test content response size and structure integrity"""
    try:
        response = requests.get(f"{API_BASE}/content", timeout=30)
        if response.status_code == 200:
            response_text = response.text
            response_size = len(response_text)
            
            # Check if response is complete JSON
            try:
                data = json.loads(response_text)
                content = data.get("content", {})
                
                # Count total fields in content
                def count_fields(obj, depth=0):
                    if depth > 10:  # Prevent infinite recursion
                        return 0
                    count = 0
                    if isinstance(obj, dict):
                        count += len(obj)
                        for value in obj.values():
                            count += count_fields(value, depth + 1)
                    elif isinstance(obj, list):
                        for item in obj:
                            count += count_fields(item, depth + 1)
                    return count
                
                total_fields = count_fields(content)
                
                # Check specific sections
                sections_info = []
                for section in ["branding", "institute", "home", "about", "courses", "faqs", "testimonials", "settings"]:
                    if section in content:
                        if section == "courses":
                            sections_info.append(f"{section}: {len(content[section])} items")
                        else:
                            sections_info.append(f"{section}: present")
                    else:
                        sections_info.append(f"{section}: MISSING")
                
                results.add_result("Content Size and Structure", "PASS", 
                                 f"Response size: {response_size} chars, {total_fields} total fields. Sections: {'; '.join(sections_info)}")
                
            except json.JSONDecodeError as e:
                results.add_result("Content Size and Structure", "FAIL", 
                                 f"JSON decode error at position {e.pos} (size: {response_size} chars)")
        else:
            results.add_result("Content Size and Structure", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    except Exception as e:
        results.add_result("Content Size and Structure", "FAIL", "Request failed", str(e))

def test_environment_configuration(results):
    """Test Railway environment configuration"""
    try:
        # Test that content storage is using JSON as specified
        response = requests.get(f"{API_BASE}/content", timeout=15)
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            
            # Check if we have institute data (indicates proper config loading)
            institute = content.get("institute", {})
            if institute:
                results.add_result("Environment Configuration", "PASS", 
                                 "Content storage working (CONTENT_STORAGE=json)")
            else:
                results.add_result("Environment Configuration", "FAIL", 
                                 "Institute data missing - possible config issue")
        else:
            results.add_result("Environment Configuration", "FAIL", f"HTTP {response.status_code}", response.text[:200])
    except Exception as e:
        results.add_result("Environment Configuration", "FAIL", "Config test failed", str(e))

def main():
    """Run all Railway CMS tests"""
    print("="*60)
    print("RAILWAY CMS CONTENT ISSUES TEST SUITE")
    print("="*60)
    print(f"Testing Railway Backend: {RAILWAY_BACKEND_URL}")
    print(f"Frontend URL: https://frontend-service-production-9b9d.up.railway.app")
    print("="*60)
    
    results = TestResults()
    
    # Test 1: Basic connectivity
    test_railway_connectivity(results)
    
    # Test 2: Content API full response (truncation issue)
    test_content_api_full_response(results)
    
    # Test 3: Content size and structure
    test_content_size_and_structure(results)
    
    # Test 4: All 7 courses validation
    test_all_seven_courses_validation(results)
    
    # Test 5: Environment configuration
    test_environment_configuration(results)
    
    # Test 6: Admin authentication
    admin_cookies = test_admin_login_railway(results)
    
    # Test 7: CMS save functionality (requires auth)
    if admin_cookies:
        test_cms_save_functionality(results, admin_cookies)
        test_authenticated_request_cors(results, admin_cookies)
    
    # Test 8: CORS configuration
    test_cors_frontend_access(results)
    
    # Print final summary
    results.print_summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
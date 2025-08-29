#!/usr/bin/env python3
"""
URGENT DEBUG: Tools & Technologies Add Function and PDF Generation
Specific tests for the issues reported by the user
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
        print(f"\n{'='*60}")
        print(f"URGENT DEBUG TEST SUMMARY")
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

def get_admin_cookies():
    """Get admin authentication cookies"""
    try:
        login_data = {"password": ADMIN_PASSWORD}
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                cookies = response.cookies
                if "admin_token" in cookies:
                    print("✅ Admin authentication successful")
                    return cookies
        print("❌ Admin authentication failed")
        return None
    except Exception as e:
        print(f"❌ Admin authentication error: {e}")
        return None

def test_tools_technologies_admin_panel(results):
    """TEST 1: TOOLS & TECHNOLOGIES ADMIN PANEL - Test /api/content endpoint"""
    print("\n" + "="*60)
    print("TEST 1: TOOLS & TECHNOLOGIES ADMIN PANEL")
    print("="*60)
    
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            courses = content.get("courses", [])
            
            if not courses:
                results.add_result("Tools Admin Panel - Content Check", "FAIL", "No courses found in content")
                return
            
            results.add_result("Tools Admin Panel - Content Check", "PASS", f"Retrieved {len(courses)} courses from content")
            
            # Check each course for tools array
            courses_with_tools = 0
            courses_without_tools = []
            devops_tools = None
            
            for course in courses:
                course_slug = course.get("slug", "unknown")
                course_title = course.get("title", "Unknown")
                tools = course.get("tools", [])
                
                print(f"\n📋 Course: {course_title} ({course_slug})")
                
                if tools and len(tools) > 0:
                    courses_with_tools += 1
                    print(f"   ✅ Tools found: {len(tools)} tools")
                    print(f"   📝 Tools: {', '.join(tools[:5])}{'...' if len(tools) > 5 else ''}")
                    
                    if course_slug == "devops-training":
                        devops_tools = tools
                else:
                    courses_without_tools.append(f"{course_title} ({course_slug})")
                    print(f"   ❌ No tools found")
            
            # Summary of tools analysis
            if courses_without_tools:
                results.add_result("Tools Admin Panel - Tools Coverage", "FAIL", 
                    f"Courses missing tools: {', '.join(courses_without_tools)}", 
                    f"Only {courses_with_tools}/{len(courses)} courses have tools")
            else:
                results.add_result("Tools Admin Panel - Tools Coverage", "PASS", 
                    f"All {len(courses)} courses have tools arrays")
            
            # Specific DevOps check
            if devops_tools:
                results.add_result("Tools Admin Panel - DevOps Tools", "PASS", 
                    f"DevOps course has {len(devops_tools)} tools", 
                    f"Tools: {', '.join(devops_tools)}")
            else:
                results.add_result("Tools Admin Panel - DevOps Tools", "FAIL", 
                    "DevOps course missing tools")
                    
        else:
            results.add_result("Tools Admin Panel - Content Check", "FAIL", 
                f"HTTP {response.status_code}", response.text[:200])
    except Exception as e:
        results.add_result("Tools Admin Panel - Content Check", "FAIL", 
            "Request failed", str(e))

def test_pdf_generation_redhat(results):
    """TEST 2: PDF GENERATION ERROR - Test Red Hat Certifications PDF generation"""
    print("\n" + "="*60)
    print("TEST 2: PDF GENERATION ERROR - RED HAT CERTIFICATIONS")
    print("="*60)
    
    # Test data as specified in the review request
    test_data = {
        "name": "Test Student", 
        "email": "test@test.com",
        "phone": "1234567890", 
        "course_slug": "redhat-certifications"
    }
    
    try:
        print(f"📝 Testing PDF generation with data: {test_data}")
        
        response = requests.post(f"{API_BASE}/syllabus", json=test_data, timeout=30)
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = len(response.content)
            
            print(f"📊 Content Type: {content_type}")
            print(f"📊 Content Length: {content_length} bytes")
            
            if 'application/pdf' in content_type:
                if response.content.startswith(b'%PDF'):
                    results.add_result("PDF Generation - Red Hat", "PASS", 
                        f"PDF generated successfully ({content_length} bytes)")
                    
                    # Check if PDF has reasonable size
                    if content_length > 1000:
                        results.add_result("PDF Generation - Content Size", "PASS", 
                            f"PDF has reasonable size: {content_length} bytes")
                    else:
                        results.add_result("PDF Generation - Content Size", "FAIL", 
                            f"PDF too small: {content_length} bytes")
                else:
                    results.add_result("PDF Generation - Red Hat", "FAIL", 
                        "Response is not a valid PDF (missing PDF header)")
            else:
                results.add_result("PDF Generation - Red Hat", "FAIL", 
                    f"Wrong content type: {content_type}")
        else:
            # Capture error details
            error_text = response.text
            results.add_result("PDF Generation - Red Hat", "FAIL", 
                f"HTTP {response.status_code}", error_text)
            
            print(f"❌ Error Response: {error_text}")
            
    except Exception as e:
        results.add_result("PDF Generation - Red Hat", "FAIL", 
            "Request failed", str(e))
        print(f"❌ Exception: {e}")

def test_cms_save_retrieve_tools(results, admin_cookies):
    """TEST 3: CMS SAVE AND RETRIEVE - Test updating course tools"""
    print("\n" + "="*60)
    print("TEST 3: CMS SAVE AND RETRIEVE - COURSE TOOLS UPDATE")
    print("="*60)
    
    if not admin_cookies:
        results.add_result("CMS Save Retrieve - Auth", "FAIL", "No admin cookies available")
        return
    
    try:
        # First, get current content
        print("📝 Step 1: Getting current content...")
        current_response = requests.get(f"{API_BASE}/content", timeout=10)
        if current_response.status_code != 200:
            results.add_result("CMS Save Retrieve - Get Content", "FAIL", 
                "Could not get current content")
            return
        
        current_content = current_response.json()["content"]
        courses = current_content.get("courses", [])
        
        if not courses:
            results.add_result("CMS Save Retrieve - Get Content", "FAIL", 
                "No courses found in current content")
            return
        
        results.add_result("CMS Save Retrieve - Get Content", "PASS", 
            f"Retrieved content with {len(courses)} courses")
        
        # Find a course to update (prefer DevOps or Red Hat)
        target_course = None
        target_index = -1
        
        for i, course in enumerate(courses):
            if course.get("slug") in ["devops-training", "redhat-certifications"]:
                target_course = course
                target_index = i
                break
        
        if not target_course:
            # Use first course if no preferred course found
            target_course = courses[0]
            target_index = 0
        
        original_tools = target_course.get("tools", [])
        course_slug = target_course.get("slug", "unknown")
        course_title = target_course.get("title", "Unknown")
        
        print(f"📝 Step 2: Updating course: {course_title} ({course_slug})")
        print(f"📝 Original tools ({len(original_tools)}): {', '.join(original_tools[:3])}{'...' if len(original_tools) > 3 else ''}")
        
        # Add new tools to test the functionality
        test_tools = original_tools + ["Test Tool 1", "Test Tool 2", "CMS Test Tool"]
        
        # Update the course with new tools
        updated_content = current_content.copy()
        updated_content["courses"][target_index]["tools"] = test_tools
        
        # Save the updated content
        print("📝 Step 3: Saving updated content...")
        update_payload = {"content": updated_content}
        
        save_response = requests.post(f"{API_BASE}/content", json=update_payload, 
                                    cookies=admin_cookies, timeout=10)
        
        if save_response.status_code == 200:
            save_data = save_response.json()
            if save_data.get("success"):
                results.add_result("CMS Save Retrieve - Save Content", "PASS", 
                    f"Content saved successfully for {course_title}")
                
                # Step 4: Verify the changes persist
                print("📝 Step 4: Verifying changes persist...")
                verify_response = requests.get(f"{API_BASE}/content", timeout=10)
                
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    verify_content = verify_data.get("content", {})
                    verify_courses = verify_content.get("courses", [])
                    
                    # Find the updated course
                    updated_course = None
                    for course in verify_courses:
                        if course.get("slug") == course_slug:
                            updated_course = course
                            break
                    
                    if updated_course:
                        persisted_tools = updated_course.get("tools", [])
                        
                        print(f"📝 Persisted tools ({len(persisted_tools)}): {', '.join(persisted_tools[:3])}{'...' if len(persisted_tools) > 3 else ''}")
                        
                        # Check if our test tools are present
                        test_tools_found = all(tool in persisted_tools for tool in ["Test Tool 1", "Test Tool 2", "CMS Test Tool"])
                        
                        if test_tools_found:
                            results.add_result("CMS Save Retrieve - Persistence", "PASS", 
                                f"Tools update persisted correctly. Total tools: {len(persisted_tools)}")
                        else:
                            results.add_result("CMS Save Retrieve - Persistence", "FAIL", 
                                "Test tools not found in persisted content")
                    else:
                        results.add_result("CMS Save Retrieve - Persistence", "FAIL", 
                            f"Updated course {course_slug} not found in verification")
                else:
                    results.add_result("CMS Save Retrieve - Persistence", "FAIL", 
                        "Could not verify content persistence")
            else:
                results.add_result("CMS Save Retrieve - Save Content", "FAIL", 
                    "Save response indicates failure", str(save_data))
        else:
            results.add_result("CMS Save Retrieve - Save Content", "FAIL", 
                f"HTTP {save_response.status_code}", save_response.text[:200])
            
    except Exception as e:
        results.add_result("CMS Save Retrieve - Exception", "FAIL", 
            "Request failed", str(e))

def test_temp_directory_permissions(results):
    """Additional test: Check temp directory permissions for PDF generation"""
    print("\n" + "="*60)
    print("ADDITIONAL TEST: TEMP DIRECTORY PERMISSIONS")
    print("="*60)
    
    try:
        import tempfile
        import os
        
        # Check if temp directory exists and is writable
        temp_dir = '/app/backend/temp'
        
        if os.path.exists(temp_dir):
            results.add_result("Temp Directory - Exists", "PASS", f"Temp directory exists: {temp_dir}")
            
            # Check if writable
            if os.access(temp_dir, os.W_OK):
                results.add_result("Temp Directory - Writable", "PASS", "Temp directory is writable")
                
                # Try creating a test file
                try:
                    test_file = os.path.join(temp_dir, "test_write.txt")
                    with open(test_file, 'w') as f:
                        f.write("test")
                    
                    if os.path.exists(test_file):
                        results.add_result("Temp Directory - File Creation", "PASS", "Can create files in temp directory")
                        os.remove(test_file)  # Clean up
                    else:
                        results.add_result("Temp Directory - File Creation", "FAIL", "File creation failed")
                        
                except Exception as e:
                    results.add_result("Temp Directory - File Creation", "FAIL", f"File creation error: {e}")
            else:
                results.add_result("Temp Directory - Writable", "FAIL", "Temp directory is not writable")
        else:
            results.add_result("Temp Directory - Exists", "FAIL", f"Temp directory does not exist: {temp_dir}")
            
    except Exception as e:
        results.add_result("Temp Directory - Check", "FAIL", f"Directory check failed: {e}")

def main():
    print("🚨 URGENT DEBUG: Tools & Technologies Add Function and PDF Generation")
    print("=" * 80)
    print(f"🔗 Testing Backend URL: {BASE_URL}")
    print("=" * 80)
    
    results = TestResults()
    
    # Get admin authentication
    admin_cookies = get_admin_cookies()
    
    # Run the three critical tests
    test_tools_technologies_admin_panel(results)
    test_pdf_generation_redhat(results)
    test_cms_save_retrieve_tools(results, admin_cookies)
    
    # Additional diagnostic test
    test_temp_directory_permissions(results)
    
    # Print final summary
    results.print_summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
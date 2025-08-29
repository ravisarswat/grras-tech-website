#!/usr/bin/env python3
"""
COMPREHENSIVE DEBUG: Additional tests for edge cases and specific scenarios
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
        print(f"COMPREHENSIVE DEBUG TEST SUMMARY")
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
                    return cookies
        return None
    except Exception as e:
        return None

def test_all_courses_tools_detailed(results):
    """Detailed analysis of tools for all courses"""
    print("\n" + "="*60)
    print("DETAILED TOOLS ANALYSIS FOR ALL COURSES")
    print("="*60)
    
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            courses = content.get("courses", [])
            
            tools_analysis = {}
            
            for course in courses:
                course_slug = course.get("slug", "unknown")
                course_title = course.get("title", "Unknown")
                tools = course.get("tools", [])
                visible = course.get("visible", True)
                
                tools_analysis[course_slug] = {
                    "title": course_title,
                    "tools_count": len(tools),
                    "tools": tools,
                    "visible": visible
                }
                
                print(f"\n📚 {course_title} ({course_slug})")
                print(f"   🔧 Tools Count: {len(tools)}")
                print(f"   👁️ Visible: {visible}")
                if tools:
                    print(f"   📝 Tools: {', '.join(tools)}")
                else:
                    print(f"   ❌ No tools defined")
            
            # Check if DevOps has more tools than others (as mentioned in the issue)
            devops_tools = tools_analysis.get("devops-training", {}).get("tools_count", 0)
            other_courses_tools = [info["tools_count"] for slug, info in tools_analysis.items() if slug != "devops-training"]
            
            if devops_tools > 0 and all(count > 0 for count in other_courses_tools):
                results.add_result("Tools Analysis - All Courses Have Tools", "PASS", 
                    f"All courses have tools. DevOps: {devops_tools}, Others: {other_courses_tools}")
            elif devops_tools > 0 and any(count == 0 for count in other_courses_tools):
                zero_tools_courses = [slug for slug, info in tools_analysis.items() 
                                    if info["tools_count"] == 0 and slug != "devops-training"]
                results.add_result("Tools Analysis - Missing Tools Issue", "FAIL", 
                    f"Some courses missing tools: {zero_tools_courses}")
            else:
                results.add_result("Tools Analysis - DevOps Tools", "FAIL", 
                    f"DevOps course has {devops_tools} tools")
                    
        else:
            results.add_result("Tools Analysis - Content Fetch", "FAIL", 
                f"HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Tools Analysis - Exception", "FAIL", str(e))

def test_pdf_generation_all_courses(results):
    """Test PDF generation for all visible courses"""
    print("\n" + "="*60)
    print("PDF GENERATION TEST FOR ALL COURSES")
    print("="*60)
    
    try:
        # Get all courses first
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code != 200:
            results.add_result("PDF All Courses - Content Fetch", "FAIL", 
                f"Could not fetch courses: HTTP {response.status_code}")
            return
        
        content = response.json().get("content", {})
        courses = content.get("courses", [])
        visible_courses = [c for c in courses if c.get("visible", True)]
        
        pdf_results = {}
        
        for course in visible_courses:
            course_slug = course.get("slug")
            course_title = course.get("title", "Unknown")
            
            print(f"\n📄 Testing PDF for: {course_title} ({course_slug})")
            
            test_data = {
                "name": "Test Student", 
                "email": "test@test.com",
                "phone": "1234567890", 
                "course_slug": course_slug
            }
            
            try:
                pdf_response = requests.post(f"{API_BASE}/syllabus", json=test_data, timeout=30)
                
                if pdf_response.status_code == 200:
                    content_type = pdf_response.headers.get('content-type', '')
                    content_length = len(pdf_response.content)
                    
                    if 'application/pdf' in content_type and pdf_response.content.startswith(b'%PDF'):
                        pdf_results[course_slug] = {"status": "SUCCESS", "size": content_length}
                        print(f"   ✅ PDF generated: {content_length} bytes")
                    else:
                        pdf_results[course_slug] = {"status": "INVALID_PDF", "size": content_length}
                        print(f"   ❌ Invalid PDF response")
                else:
                    pdf_results[course_slug] = {"status": f"HTTP_{pdf_response.status_code}", "error": pdf_response.text[:100]}
                    print(f"   ❌ HTTP {pdf_response.status_code}: {pdf_response.text[:50]}...")
                    
            except Exception as e:
                pdf_results[course_slug] = {"status": "EXCEPTION", "error": str(e)}
                print(f"   ❌ Exception: {e}")
        
        # Summary
        successful_pdfs = [slug for slug, result in pdf_results.items() if result["status"] == "SUCCESS"]
        failed_pdfs = [slug for slug, result in pdf_results.items() if result["status"] != "SUCCESS"]
        
        if len(successful_pdfs) == len(visible_courses):
            results.add_result("PDF All Courses - Generation", "PASS", 
                f"PDF generation successful for all {len(visible_courses)} courses")
        else:
            results.add_result("PDF All Courses - Generation", "FAIL", 
                f"PDF generation failed for: {failed_pdfs}")
            
        # Specific Red Hat test
        redhat_result = pdf_results.get("redhat-certifications")
        if redhat_result and redhat_result["status"] == "SUCCESS":
            results.add_result("PDF Red Hat Specific", "PASS", 
                f"Red Hat PDF generation working: {redhat_result['size']} bytes")
        else:
            results.add_result("PDF Red Hat Specific", "FAIL", 
                f"Red Hat PDF issue: {redhat_result}")
                
    except Exception as e:
        results.add_result("PDF All Courses - Exception", "FAIL", str(e))

def test_cms_tools_modification_scenarios(results, admin_cookies):
    """Test various CMS tools modification scenarios"""
    print("\n" + "="*60)
    print("CMS TOOLS MODIFICATION SCENARIOS")
    print("="*60)
    
    if not admin_cookies:
        results.add_result("CMS Tools Scenarios - Auth", "FAIL", "No admin cookies")
        return
    
    try:
        # Get current content
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code != 200:
            results.add_result("CMS Tools Scenarios - Get Content", "FAIL", "Could not get content")
            return
        
        original_content = response.json()["content"]
        courses = original_content.get("courses", [])
        
        # Test 1: Add tools to a course that might have fewer tools
        test_scenarios = []
        
        # Find course with least tools (excluding DevOps)
        non_devops_courses = [c for c in courses if c.get("slug") != "devops-training"]
        if non_devops_courses:
            min_tools_course = min(non_devops_courses, key=lambda x: len(x.get("tools", [])))
            
            print(f"\n🔧 Scenario 1: Adding tools to {min_tools_course.get('title')} ({min_tools_course.get('slug')})")
            print(f"   Current tools: {len(min_tools_course.get('tools', []))}")
            
            # Add new tools
            updated_content = original_content.copy()
            for i, course in enumerate(updated_content["courses"]):
                if course["slug"] == min_tools_course["slug"]:
                    original_tools = course.get("tools", [])
                    new_tools = original_tools + ["CMS Test Tool A", "CMS Test Tool B"]
                    updated_content["courses"][i]["tools"] = new_tools
                    break
            
            # Save and verify
            save_response = requests.post(f"{API_BASE}/content", 
                                        json={"content": updated_content}, 
                                        cookies=admin_cookies, timeout=10)
            
            if save_response.status_code == 200 and save_response.json().get("success"):
                # Verify persistence
                verify_response = requests.get(f"{API_BASE}/content", timeout=10)
                if verify_response.status_code == 200:
                    verify_content = verify_response.json()["content"]
                    verify_courses = verify_content.get("courses", [])
                    
                    updated_course = next((c for c in verify_courses if c["slug"] == min_tools_course["slug"]), None)
                    if updated_course:
                        new_tools_count = len(updated_course.get("tools", []))
                        original_tools_count = len(min_tools_course.get("tools", []))
                        
                        if new_tools_count > original_tools_count:
                            results.add_result("CMS Tools Scenarios - Add Tools", "PASS", 
                                f"Successfully added tools to {min_tools_course.get('title')}: {original_tools_count} → {new_tools_count}")
                        else:
                            results.add_result("CMS Tools Scenarios - Add Tools", "FAIL", 
                                f"Tools not added properly: {original_tools_count} → {new_tools_count}")
                    else:
                        results.add_result("CMS Tools Scenarios - Add Tools", "FAIL", 
                            "Updated course not found in verification")
                else:
                    results.add_result("CMS Tools Scenarios - Add Tools", "FAIL", 
                        "Could not verify content after update")
            else:
                results.add_result("CMS Tools Scenarios - Add Tools", "FAIL", 
                    f"Save failed: {save_response.status_code}")
        
        # Test 2: Verify DevOps tools can still be modified
        devops_course = next((c for c in courses if c.get("slug") == "devops-training"), None)
        if devops_course:
            print(f"\n🔧 Scenario 2: Modifying DevOps tools")
            print(f"   Current DevOps tools: {len(devops_course.get('tools', []))}")
            
            updated_content = original_content.copy()
            for i, course in enumerate(updated_content["courses"]):
                if course["slug"] == "devops-training":
                    original_tools = course.get("tools", [])
                    new_tools = original_tools + ["DevOps CMS Test Tool"]
                    updated_content["courses"][i]["tools"] = new_tools
                    break
            
            save_response = requests.post(f"{API_BASE}/content", 
                                        json={"content": updated_content}, 
                                        cookies=admin_cookies, timeout=10)
            
            if save_response.status_code == 200 and save_response.json().get("success"):
                results.add_result("CMS Tools Scenarios - DevOps Modify", "PASS", 
                    "DevOps tools can be modified via CMS")
            else:
                results.add_result("CMS Tools Scenarios - DevOps Modify", "FAIL", 
                    f"DevOps tools modification failed: {save_response.status_code}")
        
    except Exception as e:
        results.add_result("CMS Tools Scenarios - Exception", "FAIL", str(e))

def test_runtime_storage_system(results):
    """Test the runtime storage system behavior"""
    print("\n" + "="*60)
    print("RUNTIME STORAGE SYSTEM TEST")
    print("="*60)
    
    try:
        # Test multiple rapid requests to see if data is consistent
        responses = []
        for i in range(3):
            response = requests.get(f"{API_BASE}/content", timeout=10)
            if response.status_code == 200:
                content = response.json().get("content", {})
                courses_count = len(content.get("courses", []))
                responses.append(courses_count)
            else:
                responses.append(None)
        
        if all(r == responses[0] for r in responses if r is not None):
            results.add_result("Runtime Storage - Consistency", "PASS", 
                f"Consistent responses across {len(responses)} requests: {responses[0]} courses")
        else:
            results.add_result("Runtime Storage - Consistency", "FAIL", 
                f"Inconsistent responses: {responses}")
        
        # Test if content persists after a delay
        import time
        time.sleep(2)
        
        delayed_response = requests.get(f"{API_BASE}/content", timeout=10)
        if delayed_response.status_code == 200:
            delayed_content = delayed_response.json().get("content", {})
            delayed_courses_count = len(delayed_content.get("courses", []))
            
            if delayed_courses_count == responses[0]:
                results.add_result("Runtime Storage - Persistence", "PASS", 
                    "Content persists after delay")
            else:
                results.add_result("Runtime Storage - Persistence", "FAIL", 
                    f"Content changed after delay: {responses[0]} → {delayed_courses_count}")
        else:
            results.add_result("Runtime Storage - Persistence", "FAIL", 
                f"Could not fetch content after delay: HTTP {delayed_response.status_code}")
                
    except Exception as e:
        results.add_result("Runtime Storage - Exception", "FAIL", str(e))

def main():
    print("🔍 COMPREHENSIVE DEBUG: Additional Edge Case Testing")
    print("=" * 80)
    print(f"🔗 Testing Backend URL: {BASE_URL}")
    print("=" * 80)
    
    results = TestResults()
    
    # Get admin authentication
    admin_cookies = get_admin_cookies()
    
    # Run comprehensive tests
    test_all_courses_tools_detailed(results)
    test_pdf_generation_all_courses(results)
    test_cms_tools_modification_scenarios(results, admin_cookies)
    test_runtime_storage_system(results)
    
    # Print final summary
    results.print_summary()
    
    # Return exit code based on results
    return 0 if results.failed == 0 else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
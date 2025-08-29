#!/usr/bin/env python3
"""
CRITICAL PDF GENERATION DEBUG TEST
Tests the exact PDF generation scenarios from the user review request
"""

import requests
import json
import os
import sys
from datetime import datetime
from pathlib import Path
import subprocess

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

class PDFTestResults:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def add_result(self, test_name, status, message="", details="", response_data=None):
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "response_data": response_data,
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
        if response_data:
            print(f"   Response Data: {response_data}")
    
    def print_summary(self):
        print(f"\n{'='*80}")
        print(f"PDF GENERATION DEBUG TEST SUMMARY")
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
                    if result["details"]:
                        print(f"   Details: {result['details']}")

def capture_backend_logs():
    """Capture backend logs during PDF generation"""
    try:
        result = subprocess.run(
            ["tail", "-n", "50", "/var/log/supervisor/backend.*.log"],
            capture_output=True,
            text=True,
            shell=True
        )
        return result.stdout
    except Exception as e:
        return f"Error capturing logs: {e}"

def check_temp_directory():
    """Check if temp directory exists and has proper permissions"""
    temp_paths = ["/app/backend/temp", "/tmp/grras_cms_data"]
    results = {}
    
    for path in temp_paths:
        try:
            if os.path.exists(path):
                # Check if writable
                test_file = os.path.join(path, "test_write.tmp")
                with open(test_file, 'w') as f:
                    f.write("test")
                os.remove(test_file)
                results[path] = "EXISTS_WRITABLE"
            else:
                results[path] = "NOT_EXISTS"
        except Exception as e:
            results[path] = f"ERROR: {e}"
    
    return results

def test_red_hat_certifications_pdf(results):
    """Test Red Hat Certifications PDF generation with exact data from review request"""
    print("\n🔍 TESTING RED HAT CERTIFICATIONS PDF GENERATION...")
    
    # Exact data from review request
    test_data = {
        "name": "John Doe",
        "email": "john@test.com",
        "phone": "1234567890",
        "course_slug": "redhat-certifications",
        "consent": True
    }
    
    try:
        print(f"📤 Sending request to: {API_BASE}/syllabus")
        print(f"📋 Request data: {json.dumps(test_data, indent=2)}")
        
        # Capture logs before request
        logs_before = capture_backend_logs()
        
        response = requests.post(f"{API_BASE}/syllabus", json=test_data, timeout=30)
        
        # Capture logs after request
        logs_after = capture_backend_logs()
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = len(response.content)
            
            print(f"📄 Content Type: {content_type}")
            print(f"📏 Content Length: {content_length} bytes")
            
            if 'application/pdf' in content_type:
                if response.content.startswith(b'%PDF'):
                    results.add_result(
                        "Red Hat Certifications PDF", 
                        "PASS", 
                        f"PDF generated successfully ({content_length} bytes)",
                        f"Content-Type: {content_type}",
                        {"status_code": response.status_code, "content_length": content_length}
                    )
                else:
                    results.add_result(
                        "Red Hat Certifications PDF", 
                        "FAIL", 
                        "Response claims to be PDF but content is invalid",
                        f"First 100 bytes: {response.content[:100]}",
                        {"status_code": response.status_code, "content_preview": response.content[:100].hex()}
                    )
            else:
                results.add_result(
                    "Red Hat Certifications PDF", 
                    "FAIL", 
                    f"Wrong content type: {content_type}",
                    f"Response text: {response.text[:500]}",
                    {"status_code": response.status_code, "response_text": response.text[:500]}
                )
        else:
            error_text = response.text
            results.add_result(
                "Red Hat Certifications PDF", 
                "FAIL", 
                f"HTTP {response.status_code}",
                f"Error response: {error_text}",
                {"status_code": response.status_code, "error_text": error_text}
            )
        
        # Print log differences
        print(f"\n📝 Backend Logs During Request:")
        print("=" * 60)
        print(logs_after)
        print("=" * 60)
        
    except Exception as e:
        results.add_result(
            "Red Hat Certifications PDF", 
            "FAIL", 
            "Request failed with exception",
            str(e),
            {"exception": str(e)}
        )

def test_devops_pdf(results):
    """Test DevOps PDF generation with exact data from review request"""
    print("\n🔍 TESTING DEVOPS PDF GENERATION...")
    
    # Exact data from review request
    test_data = {
        "name": "Jane Smith",
        "email": "jane@test.com",
        "phone": "9876543210",
        "course_slug": "devops-training",
        "consent": True
    }
    
    try:
        print(f"📤 Sending request to: {API_BASE}/syllabus")
        print(f"📋 Request data: {json.dumps(test_data, indent=2)}")
        
        # Capture logs before request
        logs_before = capture_backend_logs()
        
        response = requests.post(f"{API_BASE}/syllabus", json=test_data, timeout=30)
        
        # Capture logs after request
        logs_after = capture_backend_logs()
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = len(response.content)
            
            print(f"📄 Content Type: {content_type}")
            print(f"📏 Content Length: {content_length} bytes")
            
            if 'application/pdf' in content_type:
                if response.content.startswith(b'%PDF'):
                    results.add_result(
                        "DevOps PDF", 
                        "PASS", 
                        f"PDF generated successfully ({content_length} bytes)",
                        f"Content-Type: {content_type}",
                        {"status_code": response.status_code, "content_length": content_length}
                    )
                else:
                    results.add_result(
                        "DevOps PDF", 
                        "FAIL", 
                        "Response claims to be PDF but content is invalid",
                        f"First 100 bytes: {response.content[:100]}",
                        {"status_code": response.status_code, "content_preview": response.content[:100].hex()}
                    )
            else:
                results.add_result(
                    "DevOps PDF", 
                    "FAIL", 
                    f"Wrong content type: {content_type}",
                    f"Response text: {response.text[:500]}",
                    {"status_code": response.status_code, "response_text": response.text[:500]}
                )
        else:
            error_text = response.text
            results.add_result(
                "DevOps PDF", 
                "FAIL", 
                f"HTTP {response.status_code}",
                f"Error response: {error_text}",
                {"status_code": response.status_code, "error_text": error_text}
            )
        
        # Print log differences
        print(f"\n📝 Backend Logs During Request:")
        print("=" * 60)
        print(logs_after)
        print("=" * 60)
        
    except Exception as e:
        results.add_result(
            "DevOps PDF", 
            "FAIL", 
            "Request failed with exception",
            str(e),
            {"exception": str(e)}
        )

def test_cyber_security_pdf(results):
    """Test Cyber Security PDF generation with exact data from review request"""
    print("\n🔍 TESTING CYBER SECURITY PDF GENERATION...")
    
    # Exact data from review request
    test_data = {
        "name": "Test User",
        "email": "test@test.com",
        "phone": "5555555555",
        "course_slug": "cyber-security",
        "consent": True
    }
    
    try:
        print(f"📤 Sending request to: {API_BASE}/syllabus")
        print(f"📋 Request data: {json.dumps(test_data, indent=2)}")
        
        # Capture logs before request
        logs_before = capture_backend_logs()
        
        response = requests.post(f"{API_BASE}/syllabus", json=test_data, timeout=30)
        
        # Capture logs after request
        logs_after = capture_backend_logs()
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            content_length = len(response.content)
            
            print(f"📄 Content Type: {content_type}")
            print(f"📏 Content Length: {content_length} bytes")
            
            if 'application/pdf' in content_type:
                if response.content.startswith(b'%PDF'):
                    results.add_result(
                        "Cyber Security PDF", 
                        "PASS", 
                        f"PDF generated successfully ({content_length} bytes)",
                        f"Content-Type: {content_type}",
                        {"status_code": response.status_code, "content_length": content_length}
                    )
                else:
                    results.add_result(
                        "Cyber Security PDF", 
                        "FAIL", 
                        "Response claims to be PDF but content is invalid",
                        f"First 100 bytes: {response.content[:100]}",
                        {"status_code": response.status_code, "content_preview": response.content[:100].hex()}
                    )
            else:
                results.add_result(
                    "Cyber Security PDF", 
                    "FAIL", 
                    f"Wrong content type: {content_type}",
                    f"Response text: {response.text[:500]}",
                    {"status_code": response.status_code, "response_text": response.text[:500]}
                )
        else:
            error_text = response.text
            results.add_result(
                "Cyber Security PDF", 
                "FAIL", 
                f"HTTP {response.status_code}",
                f"Error response: {error_text}",
                {"status_code": response.status_code, "error_text": error_text}
            )
        
        # Print log differences
        print(f"\n📝 Backend Logs During Request:")
        print("=" * 60)
        print(logs_after)
        print("=" * 60)
        
    except Exception as e:
        results.add_result(
            "Cyber Security PDF", 
            "FAIL", 
            "Request failed with exception",
            str(e),
            {"exception": str(e)}
        )

def test_content_persistence(results):
    """Test content persistence by making changes via POST /api/content"""
    print("\n🔍 TESTING CONTENT PERSISTENCE...")
    
    try:
        # First, login to get admin cookies
        login_data = {"password": "grras-admin"}
        login_response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
        
        if login_response.status_code != 200:
            results.add_result(
                "Content Persistence", 
                "FAIL", 
                "Could not login to admin",
                f"Login failed with status {login_response.status_code}",
                {"login_status": login_response.status_code}
            )
            return
        
        admin_cookies = login_response.cookies
        
        # Get current content
        current_response = requests.get(f"{API_BASE}/content", timeout=10)
        if current_response.status_code != 200:
            results.add_result(
                "Content Persistence", 
                "FAIL", 
                "Could not get current content",
                f"GET /api/content failed with status {current_response.status_code}",
                {"get_content_status": current_response.status_code}
            )
            return
        
        current_content = current_response.json()["content"]
        
        # Add a test tool to any course
        updated_content = current_content.copy()
        if "courses" in updated_content and len(updated_content["courses"]) > 0:
            # Add test tool to first course
            first_course = updated_content["courses"][0]
            if "tools" not in first_course:
                first_course["tools"] = []
            
            test_tool = f"TEST_TOOL_{datetime.now().strftime('%H%M%S')}"
            first_course["tools"].append(test_tool)
            
            # Update content
            update_data = {"content": updated_content}
            update_response = requests.post(f"{API_BASE}/content", json=update_data, cookies=admin_cookies, timeout=10)
            
            if update_response.status_code == 200:
                # Verify persistence by getting content again
                verify_response = requests.get(f"{API_BASE}/content", timeout=10)
                if verify_response.status_code == 200:
                    verify_content = verify_response.json()["content"]
                    verify_course = verify_content["courses"][0]
                    
                    if test_tool in verify_course.get("tools", []):
                        results.add_result(
                            "Content Persistence", 
                            "PASS", 
                            f"Content change persisted successfully",
                            f"Added tool '{test_tool}' to course '{verify_course.get('title', 'Unknown')}'",
                            {"test_tool": test_tool, "course_title": verify_course.get('title')}
                        )
                    else:
                        results.add_result(
                            "Content Persistence", 
                            "FAIL", 
                            "Content change not persisted",
                            f"Test tool '{test_tool}' not found in course tools after update",
                            {"test_tool": test_tool, "course_tools": verify_course.get("tools", [])}
                        )
                else:
                    results.add_result(
                        "Content Persistence", 
                        "FAIL", 
                        "Could not verify content persistence",
                        f"Verification GET request failed with status {verify_response.status_code}",
                        {"verify_status": verify_response.status_code}
                    )
            else:
                results.add_result(
                    "Content Persistence", 
                    "FAIL", 
                    "Content update failed",
                    f"POST /api/content failed with status {update_response.status_code}: {update_response.text[:200]}",
                    {"update_status": update_response.status_code, "error_text": update_response.text[:200]}
                )
        else:
            results.add_result(
                "Content Persistence", 
                "FAIL", 
                "No courses found in content",
                "Cannot test content persistence without courses",
                {"courses_count": len(updated_content.get("courses", []))}
            )
            
    except Exception as e:
        results.add_result(
            "Content Persistence", 
            "FAIL", 
            "Content persistence test failed with exception",
            str(e),
            {"exception": str(e)}
        )

def test_runtime_storage_path(results):
    """Test if runtime storage path exists and has content"""
    print("\n🔍 TESTING RUNTIME STORAGE PATH...")
    
    storage_paths = [
        "/tmp/grras_cms_data/",
        "/app/backend/data/",
        "/app/backend/storage/",
        "/app/backend/temp/"
    ]
    
    path_results = {}
    
    for path in storage_paths:
        try:
            if os.path.exists(path):
                # List contents
                contents = os.listdir(path)
                path_results[path] = {
                    "exists": True,
                    "contents": contents,
                    "count": len(contents)
                }
            else:
                path_results[path] = {
                    "exists": False,
                    "contents": [],
                    "count": 0
                }
        except Exception as e:
            path_results[path] = {
                "exists": False,
                "error": str(e),
                "contents": [],
                "count": 0
            }
    
    # Check if any storage path has content
    has_content = any(result.get("count", 0) > 0 for result in path_results.values())
    
    if has_content:
        results.add_result(
            "Runtime Storage Path", 
            "PASS", 
            "Runtime storage paths exist and have content",
            f"Storage analysis: {json.dumps(path_results, indent=2)}",
            path_results
        )
    else:
        results.add_result(
            "Runtime Storage Path", 
            "FAIL", 
            "No runtime storage paths found with content",
            f"Storage analysis: {json.dumps(path_results, indent=2)}",
            path_results
        )

def main():
    print("🚨 CRITICAL PDF GENERATION DEBUG TEST")
    print("=" * 80)
    print(f"🌐 Backend URL: {BASE_URL}")
    print(f"🔗 API Base: {API_BASE}")
    print("=" * 80)
    
    results = PDFTestResults()
    
    # Check temp directory permissions first
    print("\n🔍 CHECKING TEMP DIRECTORY PERMISSIONS...")
    temp_results = check_temp_directory()
    print(f"📁 Temp Directory Status: {json.dumps(temp_results, indent=2)}")
    
    # Test the exact scenarios from review request
    test_red_hat_certifications_pdf(results)
    test_devops_pdf(results)
    test_cyber_security_pdf(results)
    
    # Test content persistence
    test_content_persistence(results)
    
    # Test runtime storage
    test_runtime_storage_path(results)
    
    # Print final summary
    results.print_summary()
    
    print(f"\n🎯 EXACT ERROR DETAILS FOR USER:")
    print("=" * 80)
    for result in results.results:
        if result["status"] == "FAIL":
            print(f"❌ {result['test']}:")
            print(f"   Error: {result['message']}")
            print(f"   Details: {result['details']}")
            if result.get("response_data"):
                print(f"   Response Data: {json.dumps(result['response_data'], indent=4)}")
            print()
    
    return results.failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
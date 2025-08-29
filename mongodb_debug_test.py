#!/usr/bin/env python3
"""
URGENT DEBUG: Admin Panel Save Issues & MongoDB Problems
Comprehensive testing for the exact save workflow issues reported by user
"""

import requests
import json
import time
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

# MongoDB connection string from review request
MONGODB_CONNECTION_STRING = "mongodb+srv://ravisarswat_db_user:3JWrtglmEggUYedj@cluster0.bsofcav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Admin credentials
ADMIN_PASSWORD = "grras-admin"

class DebugResults:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def add_result(self, test_name, status, message="", details="", response_time=None):
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat()
        }
        self.results.append(result)
        if status == "PASS":
            self.passed += 1
        else:
            self.failed += 1
        
        # Print result immediately with response time
        status_symbol = "✅" if status == "PASS" else "❌"
        time_info = f" ({response_time:.2f}s)" if response_time else ""
        print(f"{status_symbol} {test_name}: {message}{time_info}")
        if details:
            print(f"   Details: {details}")
    
    def print_summary(self):
        print(f"\n{'='*80}")
        print(f"MONGODB DEBUG TEST SUMMARY")
        print(f"{'='*80}")
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/(self.passed + self.failed)*100):.1f}%")
        
        if self.failed > 0:
            print(f"\n🚨 FAILED TESTS:")
            for result in self.results:
                if result["status"] == "FAIL":
                    time_info = f" ({result['response_time']:.2f}s)" if result['response_time'] else ""
                    print(f"❌ {result['test']}: {result['message']}{time_info}")
                    if result['details']:
                        print(f"   Details: {result['details']}")

def capture_backend_logs():
    """Capture backend logs for debugging"""
    try:
        result = subprocess.run(['tail', '-n', '50', '/var/log/supervisor/backend.*.log'], 
                              capture_output=True, text=True, shell=True)
        return result.stdout
    except Exception as e:
        return f"Error capturing logs: {e}"

def test_admin_authentication_session(results):
    """TEST 1: ADMIN AUTHENTICATION & SESSION - Test POST /api/admin/login with password 'grras-admin'"""
    print(f"\n🔐 TEST 1: ADMIN AUTHENTICATION & SESSION")
    print(f"Testing admin login with password: {ADMIN_PASSWORD}")
    
    try:
        start_time = time.time()
        login_data = {"password": ADMIN_PASSWORD}
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=30)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"] and "token" in data:
                # Check if cookie is set
                cookies = response.cookies
                if "admin_token" in cookies:
                    results.add_result("Admin Login Authentication", "PASS", 
                                     f"Login successful with JWT token and cookie", 
                                     f"Token length: {len(data['token'])}, Cookie: {cookies['admin_token'][:20]}...",
                                     response_time)
                    return cookies, data["token"]
                else:
                    results.add_result("Admin Login Authentication", "FAIL", 
                                     "Login successful but no cookie set", 
                                     str(data), response_time)
            else:
                results.add_result("Admin Login Authentication", "FAIL", 
                                 "Invalid response format", 
                                 str(data), response_time)
        else:
            results.add_result("Admin Login Authentication", "FAIL", 
                             f"HTTP {response.status_code}", 
                             response.text[:500], response_time)
    except Exception as e:
        results.add_result("Admin Login Authentication", "FAIL", 
                         "Request failed", str(e))
    return None, None

def test_admin_session_verification(results, admin_cookies):
    """Test GET /api/admin/verify to confirm authentication works"""
    if not admin_cookies:
        results.add_result("Admin Session Verification", "FAIL", "No admin cookies available")
        return False
    
    try:
        start_time = time.time()
        response = requests.get(f"{API_BASE}/admin/verify", cookies=admin_cookies, timeout=30)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if "authenticated" in data and data["authenticated"]:
                results.add_result("Admin Session Verification", "PASS", 
                                 f"Authentication verified for user: {data.get('username', 'unknown')}", 
                                 str(data), response_time)
                return True
            else:
                results.add_result("Admin Session Verification", "FAIL", 
                                 "Invalid response format", 
                                 str(data), response_time)
        else:
            results.add_result("Admin Session Verification", "FAIL", 
                             f"HTTP {response.status_code}", 
                             response.text[:500], response_time)
    except Exception as e:
        results.add_result("Admin Session Verification", "FAIL", 
                         "Request failed", str(e))
    return False

def test_admin_save_workflow_simulation(results, admin_cookies):
    """TEST 2: ADMIN SAVE WORKFLOW SIMULATION - Simulate exact user workflow"""
    print(f"\n💾 TEST 2: ADMIN SAVE WORKFLOW SIMULATION")
    print(f"Simulating exact admin panel save workflow...")
    
    if not admin_cookies:
        results.add_result("Admin Save Workflow", "FAIL", "No admin cookies available")
        return
    
    # Step 1: GET current content
    try:
        print("Step 1: Getting current content...")
        start_time = time.time()
        current_response = requests.get(f"{API_BASE}/content", timeout=30)
        get_time = time.time() - start_time
        
        if current_response.status_code != 200:
            results.add_result("Get Current Content", "FAIL", 
                             f"Could not get current content: HTTP {current_response.status_code}", 
                             current_response.text[:500], get_time)
            return
        
        current_content = current_response.json()["content"]
        results.add_result("Get Current Content", "PASS", 
                         f"Retrieved current content successfully", 
                         f"Content size: {len(str(current_content))} chars", get_time)
        
    except Exception as e:
        results.add_result("Get Current Content", "FAIL", "Request failed", str(e))
        return
    
    # Step 2: Make a small change (add one tool to any course)
    try:
        print("Step 2: Making small change - adding tool to course...")
        updated_content = current_content.copy()
        
        # Find first course and add a test tool
        courses = updated_content.get("courses", [])
        if courses:
            test_tool = f"DEBUG_TOOL_{int(time.time())}"
            courses[0]["tools"].append(test_tool)
            print(f"Added tool '{test_tool}' to course '{courses[0].get('title', 'Unknown')}'")
        else:
            results.add_result("Content Modification", "FAIL", "No courses found in content")
            return
        
        results.add_result("Content Modification", "PASS", 
                         f"Successfully modified content - added tool: {test_tool}")
        
    except Exception as e:
        results.add_result("Content Modification", "FAIL", "Content modification failed", str(e))
        return
    
    # Step 3: POST modified content with authentication headers
    try:
        print("Step 3: Saving modified content with authentication...")
        test_content = {"content": updated_content}
        
        start_time = time.time()
        response = requests.post(f"{API_BASE}/content", 
                               json=test_content, 
                               cookies=admin_cookies, 
                               timeout=60)  # Increased timeout for save operation
        save_time = time.time() - start_time
        
        print(f"Save operation took {save_time:.2f} seconds")
        
        if save_time > 5:
            results.add_result("Save Response Time", "FAIL", 
                             f"Save took too long: {save_time:.2f}s (should be under 5s)", 
                             "Possible MongoDB timeout issue", save_time)
        else:
            results.add_result("Save Response Time", "PASS", 
                             f"Save completed in acceptable time: {save_time:.2f}s", 
                             "", save_time)
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                results.add_result("Content Save Operation", "PASS", 
                                 "Content saved successfully", 
                                 str(data), save_time)
                
                # Step 4: Verify the change was persisted
                print("Step 4: Verifying changes were persisted...")
                verify_start = time.time()
                verify_response = requests.get(f"{API_BASE}/content", timeout=30)
                verify_time = time.time() - verify_start
                
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    verify_content = verify_data.get("content", {})
                    verify_courses = verify_content.get("courses", [])
                    
                    if verify_courses and test_tool in verify_courses[0].get("tools", []):
                        results.add_result("Content Persistence Verification", "PASS", 
                                         f"Changes persisted correctly - tool '{test_tool}' found", 
                                         "", verify_time)
                    else:
                        results.add_result("Content Persistence Verification", "FAIL", 
                                         f"Changes not persisted - tool '{test_tool}' not found", 
                                         f"Available tools: {verify_courses[0].get('tools', []) if verify_courses else 'No courses'}", 
                                         verify_time)
                else:
                    results.add_result("Content Persistence Verification", "FAIL", 
                                     f"Could not verify persistence: HTTP {verify_response.status_code}", 
                                     verify_response.text[:500], verify_time)
            else:
                results.add_result("Content Save Operation", "FAIL", 
                                 "Save failed - invalid response format", 
                                 str(data), save_time)
        else:
            results.add_result("Content Save Operation", "FAIL", 
                             f"Save failed: HTTP {response.status_code}", 
                             response.text[:500], save_time)
            
            # Check for specific error messages
            if "Failed to save content" in response.text:
                results.add_result("Error Message Analysis", "FAIL", 
                                 "Found exact error message: 'Failed to save content. Please try again.'", 
                                 response.text[:1000])
            
    except requests.exceptions.Timeout:
        results.add_result("Content Save Operation", "FAIL", 
                         "Save operation timed out (>60s)", 
                         "Possible MongoDB connection timeout")
    except Exception as e:
        results.add_result("Content Save Operation", "FAIL", 
                         "Save request failed", str(e))

def test_mongodb_save_operation_debugging(results):
    """TEST 3: MONGODB SAVE OPERATION DEBUGGING - Test MongoDB operations directly"""
    print(f"\n🗄️ TEST 3: MONGODB SAVE OPERATION DEBUGGING")
    print(f"Testing MongoDB Atlas connection: {MONGODB_CONNECTION_STRING[:50]}...")
    
    # Test 1: Check if MongoDB connection string is accessible
    try:
        # Test basic connectivity by trying to get content (which uses MongoDB)
        start_time = time.time()
        response = requests.get(f"{API_BASE}/content", timeout=30)
        mongo_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            courses = content.get("courses", [])
            
            results.add_result("MongoDB Connection Test", "PASS", 
                             f"MongoDB accessible via API - retrieved {len(courses)} courses", 
                             f"Response size: {len(str(content))} chars", mongo_time)
            
            # Test content size - large content might cause timeouts
            content_size_mb = len(str(content)) / (1024 * 1024)
            if content_size_mb > 1:
                results.add_result("Content Size Analysis", "FAIL", 
                                 f"Content is very large: {content_size_mb:.2f}MB", 
                                 "Large content may cause MongoDB timeout issues")
            else:
                results.add_result("Content Size Analysis", "PASS", 
                                 f"Content size is reasonable: {content_size_mb:.3f}MB")
                
        else:
            results.add_result("MongoDB Connection Test", "FAIL", 
                             f"MongoDB connection failed: HTTP {response.status_code}", 
                             response.text[:500], mongo_time)
    except requests.exceptions.Timeout:
        results.add_result("MongoDB Connection Test", "FAIL", 
                         "MongoDB connection timed out", 
                         "MongoDB Atlas may be experiencing connectivity issues")
    except Exception as e:
        results.add_result("MongoDB Connection Test", "FAIL", 
                         "MongoDB connection error", str(e))
    
    # Test 2: Check MongoDB write operations with leads (simpler than content)
    try:
        print("Testing MongoDB write operations with lead creation...")
        lead_data = {
            "name": "MongoDB Test User",
            "email": "mongodb.test@example.com",
            "phone": "9876543210",
            "message": "Testing MongoDB save operations"
        }
        
        start_time = time.time()
        response = requests.post(f"{API_BASE}/leads", json=lead_data, timeout=30)
        lead_save_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                results.add_result("MongoDB Write Test (Leads)", "PASS", 
                                 f"MongoDB write successful - lead created", 
                                 f"Lead ID: {data.get('lead_id', 'Unknown')}", lead_save_time)
            else:
                results.add_result("MongoDB Write Test (Leads)", "FAIL", 
                                 "Lead creation failed - invalid response", 
                                 str(data), lead_save_time)
        else:
            results.add_result("MongoDB Write Test (Leads)", "FAIL", 
                             f"Lead creation failed: HTTP {response.status_code}", 
                             response.text[:500], lead_save_time)
            
    except requests.exceptions.Timeout:
        results.add_result("MongoDB Write Test (Leads)", "FAIL", 
                         "MongoDB write operation timed out", 
                         "MongoDB Atlas write operations may be slow")
    except Exception as e:
        results.add_result("MongoDB Write Test (Leads)", "FAIL", 
                         "MongoDB write operation failed", str(e))

def test_backend_error_log_analysis(results):
    """TEST 4: BACKEND ERROR LOG ANALYSIS - Capture and analyze backend logs"""
    print(f"\n📋 TEST 4: BACKEND ERROR LOG ANALYSIS")
    print(f"Capturing backend logs for error analysis...")
    
    try:
        # Capture current backend logs
        logs = capture_backend_logs()
        
        if logs:
            results.add_result("Backend Log Capture", "PASS", 
                             f"Successfully captured {len(logs)} characters of logs")
            
            # Analyze logs for specific error patterns
            error_patterns = [
                "MongoDB connection",
                "timeout",
                "Failed to save content",
                "authentication",
                "Atlas",
                "ERROR",
                "Exception",
                "Traceback"
            ]
            
            found_errors = []
            for pattern in error_patterns:
                if pattern.lower() in logs.lower():
                    found_errors.append(pattern)
            
            if found_errors:
                results.add_result("Error Pattern Analysis", "FAIL", 
                                 f"Found error patterns: {found_errors}", 
                                 logs[-1000:])  # Last 1000 chars of logs
            else:
                results.add_result("Error Pattern Analysis", "PASS", 
                                 "No critical error patterns found in recent logs", 
                                 "Backend appears to be running without major errors")
                
            # Check for MongoDB specific messages
            if "mongodb" in logs.lower() or "mongo" in logs.lower():
                results.add_result("MongoDB Log Analysis", "PASS", 
                                 "MongoDB-related log entries found", 
                                 "Backend is interacting with MongoDB")
            else:
                results.add_result("MongoDB Log Analysis", "FAIL", 
                                 "No MongoDB-related log entries found", 
                                 "Backend may not be connecting to MongoDB properly")
                
        else:
            results.add_result("Backend Log Capture", "FAIL", 
                             "Could not capture backend logs", 
                             "Log files may not be accessible")
            
    except Exception as e:
        results.add_result("Backend Log Capture", "FAIL", 
                         "Log capture failed", str(e))

def test_specific_mongodb_atlas_connection(results):
    """Test the specific MongoDB Atlas connection string provided"""
    print(f"\n🌐 TESTING SPECIFIC MONGODB ATLAS CONNECTION")
    print(f"Connection string: {MONGODB_CONNECTION_STRING[:80]}...")
    
    try:
        # Test if the backend is using the correct connection string
        # We can infer this by testing if the API works and checking environment
        
        # Check if DATABASE_URL environment variable is set (Railway deployment)
        backend_env_path = Path("/app/backend/.env")
        if backend_env_path.exists():
            with open(backend_env_path, 'r') as f:
                env_content = f.read()
                
            if "DATABASE_URL" in env_content:
                results.add_result("MongoDB Atlas Environment", "PASS", 
                                 "DATABASE_URL environment variable found in backend .env")
            elif "MONGO_URL" in env_content:
                results.add_result("MongoDB Atlas Environment", "PASS", 
                                 "MONGO_URL environment variable found in backend .env")
            else:
                results.add_result("MongoDB Atlas Environment", "FAIL", 
                                 "No MongoDB connection string found in environment")
        
        # Test if the connection is working by performing multiple operations
        operations = [
            ("GET /api/content", lambda: requests.get(f"{API_BASE}/content", timeout=30)),
            ("GET /api/courses", lambda: requests.get(f"{API_BASE}/courses", timeout=30)),
        ]
        
        for op_name, op_func in operations:
            try:
                start_time = time.time()
                response = op_func()
                op_time = time.time() - start_time
                
                if response.status_code == 200:
                    results.add_result(f"MongoDB Atlas Operation - {op_name}", "PASS", 
                                     f"Operation successful", 
                                     f"Response time: {op_time:.2f}s", op_time)
                else:
                    results.add_result(f"MongoDB Atlas Operation - {op_name}", "FAIL", 
                                     f"Operation failed: HTTP {response.status_code}", 
                                     response.text[:300], op_time)
            except requests.exceptions.Timeout:
                results.add_result(f"MongoDB Atlas Operation - {op_name}", "FAIL", 
                                 "Operation timed out", 
                                 "MongoDB Atlas connection may be slow or timing out")
            except Exception as e:
                results.add_result(f"MongoDB Atlas Operation - {op_name}", "FAIL", 
                                 "Operation failed", str(e))
                
    except Exception as e:
        results.add_result("MongoDB Atlas Connection Test", "FAIL", 
                         "Connection test failed", str(e))

def main():
    print("🚨 URGENT DEBUG: Admin Panel Save Issues & MongoDB Problems")
    print("=" * 80)
    print(f"Backend URL: {BASE_URL}")
    print(f"Testing MongoDB Atlas connection and admin save workflow...")
    print("=" * 80)
    
    results = DebugResults()
    
    # TEST 1: ADMIN AUTHENTICATION & SESSION
    admin_cookies, jwt_token = test_admin_authentication_session(results)
    
    if admin_cookies:
        # Verify session works
        session_valid = test_admin_session_verification(results, admin_cookies)
        
        if session_valid:
            # TEST 2: ADMIN SAVE WORKFLOW SIMULATION
            test_admin_save_workflow_simulation(results, admin_cookies)
    
    # TEST 3: MONGODB SAVE OPERATION DEBUGGING
    test_mongodb_save_operation_debugging(results)
    
    # TEST 4: BACKEND ERROR LOG ANALYSIS
    test_backend_error_log_analysis(results)
    
    # Additional MongoDB Atlas specific tests
    test_specific_mongodb_atlas_connection(results)
    
    # Print final summary
    results.print_summary()
    
    # Print critical questions answers
    print(f"\n🔍 CRITICAL QUESTIONS ANALYSIS:")
    print("=" * 80)
    
    # Analyze results to answer critical questions
    save_time_issues = [r for r in results.results if "Save Response Time" in r["test"] and r["status"] == "FAIL"]
    mongodb_issues = [r for r in results.results if "MongoDB" in r["test"] and r["status"] == "FAIL"]
    auth_issues = [r for r in results.results if "Auth" in r["test"] and r["status"] == "FAIL"]
    
    print(f"1. Is the MongoDB Atlas connection timing out during saves?")
    if save_time_issues:
        print(f"   ❌ YES - Save operations are taking too long (>5s)")
        for issue in save_time_issues:
            print(f"      - {issue['message']}")
    else:
        print(f"   ✅ NO - Save operations are completing in acceptable time")
    
    print(f"\n2. Are there authentication issues with the MongoDB user?")
    if mongodb_issues:
        print(f"   ❌ YES - MongoDB connection issues detected")
        for issue in mongodb_issues:
            print(f"      - {issue['message']}")
    else:
        print(f"   ✅ NO - MongoDB authentication appears to be working")
    
    print(f"\n3. Is the content payload too large?")
    large_content_issues = [r for r in results.results if "Content Size" in r["test"] and r["status"] == "FAIL"]
    if large_content_issues:
        print(f"   ❌ YES - Content payload is too large")
        for issue in large_content_issues:
            print(f"      - {issue['message']}")
    else:
        print(f"   ✅ NO - Content payload size appears reasonable")
    
    print(f"\n4. Are there network connectivity issues?")
    timeout_issues = [r for r in results.results if "timeout" in r["message"].lower()]
    if timeout_issues:
        print(f"   ❌ YES - Network timeout issues detected")
        for issue in timeout_issues:
            print(f"      - {issue['message']}")
    else:
        print(f"   ✅ NO - No network connectivity issues detected")
    
    return results.failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
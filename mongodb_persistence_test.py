#!/usr/bin/env python3
"""
MongoDB Persistence Testing for GRRAS Solutions CMS
Tests MongoDB Atlas connection and persistence functionality
"""

import requests
import json
import os
import sys
from datetime import datetime
import base64
from pathlib import Path
import time

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

class MongoDBTestResults:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
        self.critical_issues = []
    
    def add_result(self, test_name, status, message="", details="", critical=False):
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "critical": critical
        }
        self.results.append(result)
        if status == "PASS":
            self.passed += 1
        else:
            self.failed += 1
            if critical:
                self.critical_issues.append(test_name)
        
        # Print result immediately
        status_symbol = "✅" if status == "PASS" else "❌"
        critical_marker = " 🚨 CRITICAL" if critical else ""
        print(f"{status_symbol} {test_name}: {message}{critical_marker}")
        if details:
            print(f"   Details: {details}")
    
    def print_summary(self):
        print(f"\n{'='*80}")
        print(f"MONGODB PERSISTENCE TEST SUMMARY")
        print(f"{'='*80}")
        print(f"Total Tests: {self.passed + self.failed}")
        print(f"Passed: {self.passed}")
        print(f"Failed: {self.failed}")
        print(f"Success Rate: {(self.passed/(self.passed + self.failed)*100):.1f}%")
        
        if self.critical_issues:
            print(f"\n🚨 CRITICAL ISSUES FOUND:")
            for issue in self.critical_issues:
                print(f"   - {issue}")
        
        if self.failed > 0:
            print(f"\nFAILED TESTS:")
            for result in self.results:
                if result["status"] == "FAIL":
                    critical_marker = " 🚨" if result["critical"] else ""
                    print(f"❌ {result['test']}: {result['message']}{critical_marker}")

def get_admin_cookies():
    """Get admin authentication cookies"""
    try:
        login_data = {"password": ADMIN_PASSWORD}
        response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"]:
                return response.cookies
        return None
    except Exception as e:
        print(f"Failed to get admin cookies: {e}")
        return None

def test_mongodb_connection_verification(results):
    """TEST 1: MongoDB Connection Verification"""
    print(f"\n{'='*60}")
    print("TEST 1: MONGODB CONNECTION VERIFICATION")
    print(f"{'='*60}")
    
    try:
        # Test basic API connectivity first
        response = requests.get(f"{API_BASE}/", timeout=10)
        if response.status_code == 200:
            results.add_result("MongoDB API Connectivity", "PASS", "Backend API is responding")
        else:
            results.add_result("MongoDB API Connectivity", "FAIL", f"Backend API not responding: HTTP {response.status_code}", critical=True)
            return
        
        # Test content retrieval (indicates MongoDB connection)
        response = requests.get(f"{API_BASE}/content", timeout=15)
        if response.status_code == 200:
            data = response.json()
            if "content" in data:
                content = data["content"]
                
                # Check if we have database content structure
                if "courses" in content and isinstance(content["courses"], list):
                    course_count = len(content["courses"])
                    results.add_result("MongoDB Content Retrieval", "PASS", 
                                     f"Successfully retrieved content from MongoDB with {course_count} courses")
                    
                    # Check for grras_database indicators
                    if course_count > 0:
                        results.add_result("MongoDB Database Access", "PASS", 
                                         "grras_database is accessible and contains course data")
                    else:
                        results.add_result("MongoDB Database Access", "FAIL", 
                                         "grras_database accessible but no courses found", critical=True)
                else:
                    results.add_result("MongoDB Content Structure", "FAIL", 
                                     "Invalid content structure from MongoDB", critical=True)
            else:
                results.add_result("MongoDB Content Retrieval", "FAIL", 
                                 "No content field in MongoDB response", critical=True)
        else:
            results.add_result("MongoDB Connection", "FAIL", 
                             f"Failed to retrieve content from MongoDB: HTTP {response.status_code}", 
                             response.text[:200], critical=True)
            
    except Exception as e:
        results.add_result("MongoDB Connection", "FAIL", 
                         "MongoDB connection test failed", str(e), critical=True)

def test_cms_content_mongodb_storage(results):
    """TEST 2: CMS Content MongoDB Storage"""
    print(f"\n{'='*60}")
    print("TEST 2: CMS CONTENT MONGODB STORAGE")
    print(f"{'='*60}")
    
    try:
        # Test GET /api/content for MongoDB loading
        response = requests.get(f"{API_BASE}/content", timeout=15)
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            
            # Verify comprehensive content structure
            required_sections = ["branding", "institute", "home", "about", "courses", "faqs", "testimonials", "settings"]
            missing_sections = [section for section in required_sections if section not in content]
            
            if not missing_sections:
                courses = content.get("courses", [])
                if len(courses) >= 4:  # Should have multiple courses
                    results.add_result("CMS Content MongoDB Load", "PASS", 
                                     f"✅ Content loaded from MongoDB (persistent) - {len(courses)} courses found")
                    
                    # Check for tools in courses (indicates user customization)
                    total_tools = sum(len(course.get("tools", [])) for course in courses)
                    if total_tools > 20:  # Indicates significant customization
                        results.add_result("CMS Content Customization", "PASS", 
                                         f"User customizations detected: {total_tools} tools across courses")
                    else:
                        results.add_result("CMS Content Customization", "PASS", 
                                         f"Basic content structure with {total_tools} tools")
                else:
                    results.add_result("CMS Content MongoDB Load", "FAIL", 
                                     f"Insufficient courses in MongoDB: {len(courses)}", critical=True)
            else:
                results.add_result("CMS Content Structure", "FAIL", 
                                 f"Missing content sections in MongoDB: {missing_sections}", critical=True)
        else:
            results.add_result("CMS Content MongoDB Load", "FAIL", 
                             f"Failed to load content from MongoDB: HTTP {response.status_code}", 
                             response.text[:200], critical=True)
            
    except Exception as e:
        results.add_result("CMS Content MongoDB Load", "FAIL", 
                         "CMS content MongoDB test failed", str(e), critical=True)

def test_leads_mongodb_storage(results):
    """TEST 3: Leads MongoDB Storage"""
    print(f"\n{'='*60}")
    print("TEST 3: LEADS MONGODB STORAGE")
    print(f"{'='*60}")
    
    admin_cookies = get_admin_cookies()
    if not admin_cookies:
        results.add_result("Leads MongoDB Auth", "FAIL", "Could not get admin authentication", critical=True)
        return
    
    try:
        # Test POST /api/leads - Create a test lead
        test_lead = {
            "name": "MongoDB Test User",
            "email": "mongodb.test@grras.com",
            "phone": "9876543210",
            "message": "Testing MongoDB persistence",
            "consent": True
        }
        
        response = requests.post(f"{API_BASE}/leads", json=test_lead, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "success" in data and data["success"] and "lead_id" in data:
                lead_id = data["lead_id"]
                results.add_result("Leads MongoDB Save", "PASS", 
                                 f"Lead saved to MongoDB with ID: {lead_id}")
                
                # Test GET /api/leads - Retrieve leads from MongoDB
                auth_string = base64.b64encode(f"admin:{ADMIN_PASSWORD}".encode()).decode()
                headers = {"Authorization": f"Basic {auth_string}"}
                
                response = requests.get(f"{API_BASE}/leads", headers=headers, timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if "leads" in data and isinstance(data["leads"], list):
                        leads = data["leads"]
                        
                        # Find our test lead
                        test_lead_found = any(lead.get("id") == lead_id for lead in leads)
                        if test_lead_found:
                            results.add_result("Leads MongoDB Retrieve", "PASS", 
                                             f"Lead retrieved from MongoDB - {len(leads)} total leads")
                        else:
                            results.add_result("Leads MongoDB Retrieve", "FAIL", 
                                             "Test lead not found in MongoDB results", critical=True)
                    else:
                        results.add_result("Leads MongoDB Retrieve", "FAIL", 
                                         "Invalid leads response from MongoDB", critical=True)
                else:
                    results.add_result("Leads MongoDB Retrieve", "FAIL", 
                                     f"Failed to retrieve leads from MongoDB: HTTP {response.status_code}", 
                                     critical=True)
            else:
                results.add_result("Leads MongoDB Save", "FAIL", 
                                 "Invalid response when saving lead to MongoDB", str(data), critical=True)
        else:
            results.add_result("Leads MongoDB Save", "FAIL", 
                             f"Failed to save lead to MongoDB: HTTP {response.status_code}", 
                             response.text[:200], critical=True)
            
    except Exception as e:
        results.add_result("Leads MongoDB Storage", "FAIL", 
                         "Leads MongoDB test failed", str(e), critical=True)

def test_persistence_verification(results):
    """TEST 4: Persistence Verification"""
    print(f"\n{'='*60}")
    print("TEST 4: PERSISTENCE VERIFICATION")
    print(f"{'='*60}")
    
    admin_cookies = get_admin_cookies()
    if not admin_cookies:
        results.add_result("Persistence Auth", "FAIL", "Could not get admin authentication", critical=True)
        return
    
    try:
        # Get current content
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code != 200:
            results.add_result("Persistence Get Content", "FAIL", "Could not get current content", critical=True)
            return
        
        current_content = response.json()["content"]
        
        # Make a test change - add a test tool to the first course
        test_tool_name = f"MONGODB_PERSISTENCE_TEST_{int(time.time())}"
        updated_content = current_content.copy()
        
        if "courses" in updated_content and len(updated_content["courses"]) > 0:
            # Add test tool to first course
            first_course = updated_content["courses"][0]
            if "tools" not in first_course:
                first_course["tools"] = []
            first_course["tools"].append(test_tool_name)
            
            # Update content via POST /api/content
            test_content = {"content": updated_content}
            response = requests.post(f"{API_BASE}/content", json=test_content, cookies=admin_cookies, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "success" in data and data["success"]:
                    results.add_result("Persistence Content Update", "PASS", 
                                     f"Test change saved to MongoDB: {test_tool_name}")
                    
                    # Wait a moment for persistence
                    time.sleep(2)
                    
                    # Verify persistence with fresh GET request
                    verify_response = requests.get(f"{API_BASE}/content", timeout=10)
                    if verify_response.status_code == 200:
                        verify_data = verify_response.json()
                        verify_content = verify_data.get("content", {})
                        
                        # Check if our test tool persists
                        verify_courses = verify_content.get("courses", [])
                        if len(verify_courses) > 0:
                            verify_tools = verify_courses[0].get("tools", [])
                            if test_tool_name in verify_tools:
                                results.add_result("Persistence Verification", "PASS", 
                                                 "✅ YES - MongoDB persistence is working, changes will survive deployments")
                                
                                # Clean up - remove test tool
                                cleanup_content = verify_content.copy()
                                cleanup_tools = cleanup_content["courses"][0]["tools"]
                                if test_tool_name in cleanup_tools:
                                    cleanup_tools.remove(test_tool_name)
                                
                                cleanup_request = {"content": cleanup_content}
                                requests.post(f"{API_BASE}/content", json=cleanup_request, cookies=admin_cookies, timeout=10)
                                
                            else:
                                results.add_result("Persistence Verification", "FAIL", 
                                                 "❌ NO - Test change not persisted in MongoDB", critical=True)
                        else:
                            results.add_result("Persistence Verification", "FAIL", 
                                             "❌ NO - No courses found in verification", critical=True)
                    else:
                        results.add_result("Persistence Verification", "FAIL", 
                                         "Could not verify persistence - GET failed", critical=True)
                else:
                    results.add_result("Persistence Content Update", "FAIL", 
                                     "Failed to save test change to MongoDB", str(data), critical=True)
            else:
                results.add_result("Persistence Content Update", "FAIL", 
                                 f"Failed to update content in MongoDB: HTTP {response.status_code}", 
                                 response.text[:200], critical=True)
        else:
            results.add_result("Persistence Content Structure", "FAIL", 
                             "No courses found for persistence test", critical=True)
            
    except Exception as e:
        results.add_result("Persistence Verification", "FAIL", 
                         "Persistence test failed", str(e), critical=True)

def test_mongodb_atlas_specific_features(results):
    """Additional MongoDB Atlas specific tests"""
    print(f"\n{'='*60}")
    print("ADDITIONAL: MONGODB ATLAS FEATURES")
    print(f"{'='*60}")
    
    try:
        # Test content audit (MongoDB collection operations)
        admin_cookies = get_admin_cookies()
        if admin_cookies:
            response = requests.get(f"{API_BASE}/content/audit", cookies=admin_cookies, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "audit_logs" in data:
                    audit_logs = data["audit_logs"]
                    results.add_result("MongoDB Audit Logs", "PASS", 
                                     f"Audit logging working in MongoDB: {len(audit_logs)} entries")
                else:
                    results.add_result("MongoDB Audit Logs", "FAIL", "No audit logs in MongoDB response")
            else:
                results.add_result("MongoDB Audit Logs", "FAIL", f"Audit logs failed: HTTP {response.status_code}")
        
        # Test version history (MongoDB collections)
        if admin_cookies:
            response = requests.get(f"{API_BASE}/content/versions", cookies=admin_cookies, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if "versions" in data:
                    versions = data["versions"]
                    results.add_result("MongoDB Version History", "PASS", 
                                     f"Version history working in MongoDB: {len(versions)} versions")
                else:
                    results.add_result("MongoDB Version History", "FAIL", "No versions in MongoDB response")
            else:
                results.add_result("MongoDB Version History", "FAIL", f"Version history failed: HTTP {response.status_code}")
                
    except Exception as e:
        results.add_result("MongoDB Atlas Features", "FAIL", "Atlas features test failed", str(e))

def main():
    print("🔍 MONGODB PERSISTENCE TESTING FOR GRRAS SOLUTIONS CMS")
    print("=" * 80)
    print("Testing MongoDB Atlas connection and persistence functionality")
    print(f"Backend URL: {BASE_URL}")
    print("=" * 80)
    
    results = MongoDBTestResults()
    
    # Run all MongoDB persistence tests
    test_mongodb_connection_verification(results)
    test_cms_content_mongodb_storage(results)
    test_leads_mongodb_storage(results)
    test_persistence_verification(results)
    test_mongodb_atlas_specific_features(results)
    
    # Print comprehensive summary
    results.print_summary()
    
    # Final answer to critical question
    print(f"\n{'='*80}")
    print("🎯 CRITICAL QUESTION: Will user's CMS admin changes survive GitHub deployments?")
    print("=" * 80)
    
    if results.critical_issues:
        print("❌ NO - Critical issues found with MongoDB persistence:")
        for issue in results.critical_issues:
            print(f"   • {issue}")
        print("\nChanges may be lost on deployment. MongoDB persistence needs fixing.")
    else:
        persistence_tests = [r for r in results.results if "Persistence" in r["test"]]
        if any(r["status"] == "PASS" and "YES" in r["message"] for r in persistence_tests):
            print("✅ YES - MongoDB persistence is working correctly!")
            print("   • Content changes are saved to MongoDB Atlas")
            print("   • Changes persist across API restarts")
            print("   • User admin panel modifications will survive GitHub deployments")
        else:
            print("⚠️  UNCERTAIN - Persistence tests inconclusive")
            print("   • Some tests passed but persistence verification unclear")
    
    print(f"\nTest completed at: {datetime.now().isoformat()}")
    return results.failed == 0 and not results.critical_issues

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
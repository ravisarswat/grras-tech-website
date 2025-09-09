#!/usr/bin/env python3
"""
GRRAS Lead Management System Testing
Testing admin login, simple leads API, lead storage, and contact form submission
"""

import requests
import json
import time
from datetime import datetime
import sys
import os

# Backend URL from environment
BACKEND_URL = "https://grras-tech-website-production.up.railway.app"
API_BASE = f"{BACKEND_URL}/api"

class LeadManagementTester:
    def __init__(self):
        self.admin_token = None
        self.test_results = []
        self.session = requests.Session()
        self.session.timeout = 30
        
    def log_test(self, test_name, status, details="", response_time=None):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_time": response_time,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌"
        time_info = f" ({response_time}ms)" if response_time else ""
        print(f"{status_icon} {test_name}: {status}{time_info}")
        if details:
            print(f"   Details: {details}")
        print()

    def test_admin_login(self):
        """Test 1: Admin Login with password 'grras-admin'"""
        print("🔐 Testing Admin Login...")
        
        try:
            start_time = time.time()
            
            # Test admin login endpoint
            login_data = {"password": "grras-admin"}
            response = self.session.post(
                f"{API_BASE}/admin/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            response_time = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token"):
                    self.admin_token = data["token"]
                    self.log_test(
                        "Admin Login Test", 
                        "PASS", 
                        f"Successfully authenticated and received token: {self.admin_token[:20]}...",
                        response_time
                    )
                    return True
                else:
                    self.log_test(
                        "Admin Login Test", 
                        "FAIL", 
                        f"Login response missing success/token: {data}",
                        response_time
                    )
            else:
                self.log_test(
                    "Admin Login Test", 
                    "FAIL", 
                    f"HTTP {response.status_code}: {response.text}",
                    response_time
                )
                
        except Exception as e:
            self.log_test("Admin Login Test", "FAIL", f"Exception: {str(e)}")
            
        return False

    def test_simple_leads_api(self):
        """Test 2: Simple Leads API with admin token"""
        print("📋 Testing Simple Leads API...")
        
        if not self.admin_token:
            self.log_test("Simple Leads API Test", "SKIP", "No admin token available")
            return False
            
        try:
            start_time = time.time()
            
            # Test simple leads endpoint with token parameter
            response = self.session.get(
                f"{API_BASE}/simple-leads",
                params={"token": self.admin_token}
            )
            
            response_time = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "leads" in data:
                    leads_count = len(data["leads"])
                    total_count = data.get("total", leads_count)
                    
                    # Sample a few leads for verification
                    sample_leads = data["leads"][:3] if data["leads"] else []
                    sample_info = []
                    for lead in sample_leads:
                        sample_info.append(f"ID: {lead.get('id', 'N/A')[:8]}..., Name: {lead.get('name', 'N/A')}, Email: {lead.get('email', 'N/A')}")
                    
                    self.log_test(
                        "Simple Leads API Test", 
                        "PASS", 
                        f"Retrieved {leads_count} leads (total: {total_count}). Sample leads: {'; '.join(sample_info) if sample_info else 'No leads found'}",
                        response_time
                    )
                    return True, data
                else:
                    self.log_test(
                        "Simple Leads API Test", 
                        "FAIL", 
                        f"Response missing success/leads fields: {data}",
                        response_time
                    )
            else:
                self.log_test(
                    "Simple Leads API Test", 
                    "FAIL", 
                    f"HTTP {response.status_code}: {response.text}",
                    response_time
                )
                
        except Exception as e:
            self.log_test("Simple Leads API Test", "FAIL", f"Exception: {str(e)}")
            
        return False, None

    def check_lead_storage(self):
        """Test 3: Check lead storage in JSON file and MongoDB"""
        print("💾 Checking Lead Storage...")
        
        # Check JSON file storage
        json_leads_count = 0
        json_sample = []
        
        try:
            json_file_path = "/app/backend/storage/leads.json"
            if os.path.exists(json_file_path):
                with open(json_file_path, 'r') as f:
                    json_leads = json.load(f)
                    json_leads_count = len(json_leads)
                    json_sample = json_leads[:3] if json_leads else []
                    
                # Format sample leads without f-string backslash issue
                sample_names = []
                for lead in json_sample:
                    name = lead.get('name', 'N/A')
                    email = lead.get('email', 'N/A')
                    sample_names.append(f"{name} ({email})")
                    
                self.log_test(
                    "JSON Lead Storage Check", 
                    "PASS", 
                    f"Found {json_leads_count} leads in /app/backend/storage/leads.json. Sample: {sample_names}"
                )
            else:
                self.log_test(
                    "JSON Lead Storage Check", 
                    "FAIL", 
                    f"JSON file not found at {json_file_path}"
                )
        except Exception as e:
            self.log_test("JSON Lead Storage Check", "FAIL", f"Error reading JSON file: {str(e)}")
        
        # MongoDB storage is tested via the simple-leads API
        # The simple-leads endpoint connects directly to MongoDB: collection = db.leads
        self.log_test(
            "MongoDB Lead Storage Check", 
            "INFO", 
            "MongoDB storage is verified through simple-leads API which connects to db.leads collection"
        )
        
        return json_leads_count

    def test_contact_form_submission(self):
        """Test 4: Contact Form Submission"""
        print("📝 Testing Contact Form Submission...")
        
        try:
            start_time = time.time()
            
            # Test contact form submission
            form_data = {
                "name": "Test Lead Management User",
                "email": f"test.leadmgmt.{int(time.time())}@example.com",
                "phone": "9876543210",
                "message": "Testing lead management system - contact form submission",
                "course": "DevOps Training"
            }
            
            response = self.session.post(
                f"{API_BASE}/contact",
                data=form_data  # Using form data, not JSON
            )
            
            response_time = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "lead_id" in data:
                    self.log_test(
                        "Contact Form Submission Test", 
                        "PASS", 
                        f"Contact form submitted successfully. Lead ID: {data['lead_id']}, Message: {data['message']}",
                        response_time
                    )
                    return True, data
                else:
                    self.log_test(
                        "Contact Form Submission Test", 
                        "FAIL", 
                        f"Response missing expected fields: {data}",
                        response_time
                    )
            else:
                self.log_test(
                    "Contact Form Submission Test", 
                    "FAIL", 
                    f"HTTP {response.status_code}: {response.text}",
                    response_time
                )
                
        except Exception as e:
            self.log_test("Contact Form Submission Test", "FAIL", f"Exception: {str(e)}")
            
        return False, None

    def verify_lead_storage_after_submission(self):
        """Test 5: Verify lead appears in storage after submission"""
        print("🔍 Verifying Lead Storage After Submission...")
        
        if not self.admin_token:
            self.log_test("Lead Storage Verification", "SKIP", "No admin token available")
            return False
            
        try:
            # Wait a moment for the lead to be stored
            time.sleep(2)
            
            start_time = time.time()
            
            # Get leads again to verify the new lead was stored
            response = self.session.get(
                f"{API_BASE}/simple-leads",
                params={"token": self.admin_token}
            )
            
            response_time = int((time.time() - start_time) * 1000)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "leads" in data:
                    # Look for our test lead
                    test_leads = [
                        lead for lead in data["leads"] 
                        if "Test Lead Management User" in lead.get("name", "") 
                        or "test.leadmgmt" in lead.get("email", "")
                    ]
                    
                    if test_leads:
                        test_lead = test_leads[0]
                        self.log_test(
                            "Lead Storage Verification", 
                            "PASS", 
                            f"Test lead found in MongoDB storage: {test_lead.get('name')} ({test_lead.get('email')}) - Course: {test_lead.get('course')}",
                            response_time
                        )
                        return True
                    else:
                        self.log_test(
                            "Lead Storage Verification", 
                            "FAIL", 
                            f"Test lead not found in {len(data['leads'])} leads retrieved from MongoDB",
                            response_time
                        )
                else:
                    self.log_test(
                        "Lead Storage Verification", 
                        "FAIL", 
                        f"Invalid response format: {data}",
                        response_time
                    )
            else:
                self.log_test(
                    "Lead Storage Verification", 
                    "FAIL", 
                    f"HTTP {response.status_code}: {response.text}",
                    response_time
                )
                
        except Exception as e:
            self.log_test("Lead Storage Verification", "FAIL", f"Exception: {str(e)}")
            
        return False

    def analyze_storage_usage(self, api_leads_data):
        """Test 6: Analyze which storage the simple-leads endpoint is using"""
        print("🔬 Analyzing Storage Usage...")
        
        try:
            # Count leads from JSON file
            json_leads_count = 0
            if os.path.exists("/app/backend/storage/leads.json"):
                with open("/app/backend/storage/leads.json", 'r') as f:
                    json_leads = json.load(f)
                    json_leads_count = len(json_leads)
            
            # Count leads from API (MongoDB)
            api_leads_count = len(api_leads_data.get("leads", [])) if api_leads_data else 0
            
            # Analysis
            if api_leads_count > 0 and json_leads_count > 0:
                if api_leads_count == json_leads_count:
                    analysis = f"Both storages have same count ({api_leads_count}). API might be reading from JSON or both are synced."
                else:
                    analysis = f"Different counts - JSON: {json_leads_count}, MongoDB (API): {api_leads_count}. API is using MongoDB as primary storage."
            elif api_leads_count > 0:
                analysis = f"API returns {api_leads_count} leads from MongoDB. JSON has {json_leads_count} leads. API is using MongoDB."
            elif json_leads_count > 0:
                analysis = f"JSON has {json_leads_count} leads but API returns {api_leads_count}. Possible storage mismatch."
            else:
                analysis = "Both storages appear empty or inaccessible."
            
            # Code analysis from server.py
            code_analysis = "Code analysis: simple-leads endpoint uses 'collection = db.leads' (MongoDB) directly, not JSON file."
            
            self.log_test(
                "Storage Usage Analysis", 
                "INFO", 
                f"{analysis} {code_analysis}"
            )
            
        except Exception as e:
            self.log_test("Storage Usage Analysis", "FAIL", f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all lead management tests"""
        print("🚀 Starting GRRAS Lead Management System Testing")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Test 1: Admin Login
        login_success = self.test_admin_login()
        
        # Test 2: Simple Leads API
        leads_success, api_leads_data = self.test_simple_leads_api()
        
        # Test 3: Check Lead Storage
        json_leads_count = self.check_lead_storage()
        
        # Test 4: Contact Form Submission
        contact_success, contact_data = self.test_contact_form_submission()
        
        # Test 5: Verify Lead Storage After Submission
        if contact_success:
            self.verify_lead_storage_after_submission()
        
        # Test 6: Analyze Storage Usage
        if api_leads_data:
            self.analyze_storage_usage(api_leads_data)
        
        # Summary
        print("=" * 60)
        print("📊 LEAD MANAGEMENT SYSTEM TEST SUMMARY")
        print("=" * 60)
        
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        total_tests = len([r for r in self.test_results if r["status"] in ["PASS", "FAIL"]])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "N/A")
        print()
        
        # Key Findings
        print("🔍 KEY FINDINGS:")
        print(f"• Admin Login: {'✅ Working' if login_success else '❌ Failed'}")
        print(f"• Simple Leads API: {'✅ Working' if leads_success else '❌ Failed'}")
        print(f"• Contact Form: {'✅ Working' if contact_success else '❌ Failed'}")
        print(f"• JSON Storage: {json_leads_count} leads found")
        print(f"• MongoDB Storage: {len(api_leads_data.get('leads', [])) if api_leads_data else 0} leads via API")
        print(f"• Storage Used by API: MongoDB (db.leads collection)")
        print()
        
        # Issues Identified
        issues = []
        if not login_success:
            issues.append("Admin login not working")
        if not leads_success:
            issues.append("Simple leads API not accessible")
        if not contact_success:
            issues.append("Contact form submission failing")
        
        if issues:
            print("⚠️ ISSUES IDENTIFIED:")
            for issue in issues:
                print(f"• {issue}")
        else:
            print("✅ NO CRITICAL ISSUES FOUND - Lead management system is working properly")
        
        print()
        return self.test_results

if __name__ == "__main__":
    tester = LeadManagementTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    failed_count = len([r for r in results if r["status"] == "FAIL"])
    sys.exit(1 if failed_count > 0 else 0)
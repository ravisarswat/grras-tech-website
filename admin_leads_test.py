#!/usr/bin/env python3
"""
Admin Leads Functionality Testing Suite for GRRAS Solutions Training Institute
Tests admin authentication, leads retrieval, and contact form functionality
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List
import logging
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AdminLeadsTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results
        self.test_results = {
            "api_health": False,
            "admin_login_simple": False,
            "admin_login_main": False,
            "simple_leads_retrieval": False,
            "contact_form_submission": False,
            "leads_storage_verification": False,
            "mongodb_connection": False
        }
        
        self.errors = []
        self.leads_count_before = 0
        self.leads_count_after = 0
        
    def _get_backend_url(self) -> str:
        """Get backend URL from frontend .env file"""
        try:
            with open(self.frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        url = line.split('=', 1)[1].strip()
                        logger.info(f"✅ Found backend URL: {url}")
                        return url
            
            # Fallback
            logger.warning("⚠️ REACT_APP_BACKEND_URL not found, using fallback")
            return "http://localhost:8001"
        except Exception as e:
            logger.error(f"❌ Error reading frontend .env: {e}")
            return "http://localhost:8001"
    
    async def setup_session(self):
        """Setup HTTP session"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout
        )
        logger.info("✅ HTTP session initialized")
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            logger.info("✅ HTTP session closed")
    
    async def test_api_health(self) -> bool:
        """Test 1: API health check endpoint /api/health"""
        logger.info("🔍 Testing API health check endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ API health check passed: {data}")
                    
                    # Check if database is connected
                    if data.get("database") == "connected":
                        self.test_results["mongodb_connection"] = True
                        logger.info("✅ MongoDB connection confirmed")
                    else:
                        logger.warning("⚠️ MongoDB connection issue detected")
                    
                    self.test_results["api_health"] = True
                    return True
                else:
                    self.errors.append(f"Health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"API health check failed: {str(e)}")
            logger.error(f"❌ API health check failed: {e}")
            return False
    
    async def test_admin_login_simple(self) -> bool:
        """Test 2: Admin login endpoint /api/simple-login with password 'grras-admin'"""
        logger.info("🔍 Testing admin login via /api/simple-login...")
        try:
            login_data = {"password": "grras-admin"}
            
            async with self.session.post(f"{self.api_base}/simple-login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Simple admin login response: {data}")
                    
                    if data.get("success") and data.get("token"):
                        self.admin_token = data.get("token")
                        logger.info("✅ Simple admin login successful with token")
                        self.test_results["admin_login_simple"] = True
                        return True
                    elif data.get("success"):
                        logger.info("✅ Simple admin login successful (no token required)")
                        self.test_results["admin_login_simple"] = True
                        return True
                    else:
                        self.errors.append(f"Simple admin login failed: {data.get('message', 'Unknown error')}")
                        return False
                else:
                    response_text = await response.text()
                    self.errors.append(f"Simple admin login failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Simple admin login failed: {str(e)}")
            logger.error(f"❌ Simple admin login failed: {e}")
            return False
    
    async def test_admin_login_main(self) -> bool:
        """Test 3: Main admin login endpoint /api/admin/login"""
        logger.info("🔍 Testing main admin login via /api/admin/login...")
        try:
            login_data = {"password": "grras-admin"}
            
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Main admin login response: {data}")
                    
                    if data.get("success") and data.get("token"):
                        # Store token if we don't have one from simple login
                        if not self.admin_token:
                            self.admin_token = data.get("token")
                        logger.info("✅ Main admin login successful with token")
                        self.test_results["admin_login_main"] = True
                        return True
                    else:
                        self.errors.append(f"Main admin login failed: {data}")
                        return False
                else:
                    response_text = await response.text()
                    self.errors.append(f"Main admin login failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Main admin login failed: {str(e)}")
            logger.error(f"❌ Main admin login failed: {e}")
            return False
    
    async def test_simple_leads_retrieval(self) -> bool:
        """Test 4: Leads retrieval endpoint /api/simple-leads"""
        logger.info("🔍 Testing leads retrieval via /api/simple-leads...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, trying without authentication first")
            # Try without token first as review mentions it should work without authentication
            try:
                async with self.session.get(f"{self.api_base}/simple-leads") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            leads = data.get("leads", [])
                            self.leads_count_before = len(leads)
                            logger.info(f"✅ Simple leads retrieval successful without token - Found {self.leads_count_before} leads")
                            self.test_results["simple_leads_retrieval"] = True
                            return True
                    # If it fails without token, try with token parameter
            except Exception:
                pass
        
        # Try with token parameter (as per backend code)
        if self.admin_token:
            try:
                # The /api/simple-leads endpoint expects token as query parameter
                async with self.session.get(f"{self.api_base}/simple-leads?token={self.admin_token}") as response:
                    if response.status == 200:
                        data = await response.json()
                        if data.get("success"):
                            leads = data.get("leads", [])
                            self.leads_count_before = len(leads)
                            logger.info(f"✅ Simple leads retrieval successful with token - Found {self.leads_count_before} leads")
                            self.test_results["simple_leads_retrieval"] = True
                            return True
                        else:
                            self.errors.append(f"Simple leads retrieval failed: {data.get('message', 'Unknown error')}")
                            return False
                    else:
                        response_text = await response.text()
                        self.errors.append(f"Simple leads retrieval failed with status {response.status}: {response_text}")
                        return False
            except Exception as e:
                self.errors.append(f"Simple leads retrieval failed: {str(e)}")
                logger.error(f"❌ Simple leads retrieval failed: {e}")
                return False
        else:
            self.errors.append("No admin token available for leads retrieval")
            return False
    
    async def test_contact_form_submission(self) -> bool:
        """Test 5: Contact form submission to store leads in database"""
        logger.info("🔍 Testing contact form submission...")
        try:
            # Use FormData as per backend endpoint
            form_data = aiohttp.FormData()
            form_data.add_field('name', 'Arjun Patel')
            form_data.add_field('email', 'arjun.patel@example.com')
            form_data.add_field('phone', '9876543210')
            form_data.add_field('course', 'DevOps Training')
            form_data.add_field('message', 'I am interested in your DevOps training program. Please provide more details about the course structure and placement assistance.')
            
            async with self.session.post(f"{self.api_base}/contact", data=form_data) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Contact form submission successful: {data}")
                    self.test_results["contact_form_submission"] = True
                    return True
                else:
                    response_text = await response.text()
                    self.errors.append(f"Contact form submission failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Contact form submission failed: {str(e)}")
            logger.error(f"❌ Contact form submission failed: {e}")
            return False
    
    async def test_leads_storage_verification(self) -> bool:
        """Test 6: Verify leads are being stored in database from contact form submissions"""
        logger.info("🔍 Verifying leads storage in database...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available for leads verification")
            return False
        
        try:
            # Get leads count after contact form submission
            async with self.session.get(f"{self.api_base}/simple-leads?token={self.admin_token}") as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success"):
                        leads = data.get("leads", [])
                        self.leads_count_after = len(leads)
                        
                        logger.info(f"📊 Leads count before: {self.leads_count_before}")
                        logger.info(f"📊 Leads count after: {self.leads_count_after}")
                        
                        if self.leads_count_after > self.leads_count_before:
                            logger.info("✅ Leads storage verification successful - New lead found in database")
                            self.test_results["leads_storage_verification"] = True
                            
                            # Check if our test lead is in the database
                            test_lead_found = False
                            for lead in leads:
                                if (lead.get("email") == "arjun.patel@example.com" and 
                                    lead.get("name") == "Arjun Patel"):
                                    test_lead_found = True
                                    logger.info(f"✅ Test lead found in database: {lead}")
                                    break
                            
                            if test_lead_found:
                                logger.info("✅ Contact form submission successfully stored in database")
                            else:
                                logger.warning("⚠️ Test lead not found, but lead count increased")
                            
                            return True
                        elif self.leads_count_after == self.leads_count_before:
                            # Check if our test lead exists (might have been there already)
                            test_lead_found = False
                            for lead in leads:
                                if (lead.get("email") == "arjun.patel@example.com" and 
                                    lead.get("name") == "Arjun Patel"):
                                    test_lead_found = True
                                    logger.info(f"✅ Test lead found in database: {lead}")
                                    break
                            
                            if test_lead_found:
                                logger.info("✅ Lead storage working - Test lead exists in database")
                                self.test_results["leads_storage_verification"] = True
                                return True
                            else:
                                self.errors.append("Lead count unchanged and test lead not found")
                                return False
                        else:
                            self.errors.append(f"Lead count decreased unexpectedly: {self.leads_count_before} -> {self.leads_count_after}")
                            return False
                    else:
                        self.errors.append(f"Leads verification failed: {data.get('message', 'Unknown error')}")
                        return False
                else:
                    response_text = await response.text()
                    self.errors.append(f"Leads verification failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Leads storage verification failed: {str(e)}")
            logger.error(f"❌ Leads storage verification failed: {e}")
            return False
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all admin leads tests"""
        logger.info("🚀 Starting admin leads functionality testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("API Health Check", self.test_api_health),
                ("Admin Login (Simple)", self.test_admin_login_simple),
                ("Admin Login (Main)", self.test_admin_login_main),
                ("Simple Leads Retrieval", self.test_simple_leads_retrieval),
                ("Contact Form Submission", self.test_contact_form_submission),
                ("Leads Storage Verification", self.test_leads_storage_verification),
            ]
            
            passed_tests = 0
            total_tests = len(tests)
            
            for test_name, test_func in tests:
                logger.info(f"\n{'='*50}")
                logger.info(f"Running: {test_name}")
                logger.info(f"{'='*50}")
                
                try:
                    result = await test_func()
                    if result:
                        passed_tests += 1
                        logger.info(f"✅ {test_name}: PASSED")
                    else:
                        logger.error(f"❌ {test_name}: FAILED")
                except Exception as e:
                    logger.error(f"❌ {test_name}: ERROR - {e}")
                    self.errors.append(f"{test_name}: {str(e)}")
            
            # Generate summary
            success_rate = (passed_tests / total_tests) * 100
            
            summary = {
                "timestamp": datetime.now().isoformat(),
                "backend_url": self.backend_url,
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{success_rate:.1f}%",
                "test_results": self.test_results,
                "errors": self.errors,
                "critical_issues": self._identify_critical_issues(),
                "leads_count_before": self.leads_count_before,
                "leads_count_after": self.leads_count_after,
                "admin_token_obtained": bool(self.admin_token)
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _identify_critical_issues(self) -> List[str]:
        """Identify critical issues that block functionality"""
        critical_issues = []
        
        if not self.test_results["api_health"]:
            critical_issues.append("API health check failed - Backend server not responding")
        
        if not self.test_results["mongodb_connection"]:
            critical_issues.append("MongoDB connection failed")
        
        if not self.test_results["admin_login_simple"] and not self.test_results["admin_login_main"]:
            critical_issues.append("Admin authentication completely failed")
        
        if not self.test_results["simple_leads_retrieval"]:
            critical_issues.append("Leads retrieval endpoint not working")
        
        if not self.test_results["contact_form_submission"]:
            critical_issues.append("Contact form submission not working")
        
        if not self.test_results["leads_storage_verification"]:
            critical_issues.append("Leads not being stored in database properly")
        
        return critical_issues
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*60}")
        print("🎯 ADMIN LEADS FUNCTIONALITY TESTING SUMMARY")
        print(f"{'='*60}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        print(f"\n📈 LEADS STATISTICS:")
        print(f"  Leads count before test: {summary['leads_count_before']}")
        print(f"  Leads count after test: {summary['leads_count_after']}")
        print(f"  Admin token obtained: {summary['admin_token_obtained']}")
        
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES:")
            for issue in summary['critical_issues']:
                print(f"  • {issue}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n🎯 ADMIN LEADS FUNCTIONALITY STATUS:")
        if summary['success_rate'] == "100.0%":
            print("  ✅ All admin leads functionality working perfectly")
        elif float(summary['success_rate'].rstrip('%')) >= 80:
            print("  ⚠️ Admin leads functionality mostly working with minor issues")
        else:
            print("  ❌ Admin leads functionality has significant issues")
        
        print(f"\n{'='*60}")

async def main():
    """Main test execution"""
    tester = AdminLeadsTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/admin_leads_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        # Exit with appropriate code
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES DETECTED - Admin leads functionality needs attention!")
            sys.exit(1)
        elif summary['success_rate'] == "100.0%":
            print(f"\n🎉 ALL TESTS PASSED - Admin leads functionality is fully working!")
            sys.exit(0)
        else:
            print(f"\n⚠️ SOME TESTS FAILED - Admin leads functionality has minor issues")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
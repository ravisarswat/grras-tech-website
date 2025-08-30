#!/usr/bin/env python3
"""
Backend API Testing Suite for GRRAS Solutions Training Institute
Tests all backend functionality including FastAPI server, MongoDB, and CMS content
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BackendTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results
        self.test_results = {
            "server_health": False,
            "mongodb_connection": False,
            "cms_content_available": False,
            "courses_endpoint": False,
            "course_data_structure": False,
            "eligibility_widget_data": False,
            "admin_authentication": False,
            "contact_form": False,
            "syllabus_generation": False,
            "leads_management": False
        }
        
        self.errors = []
        
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
    
    async def test_server_health(self) -> bool:
        """Test 1: FastAPI server health check"""
        logger.info("🔍 Testing FastAPI server health...")
        try:
            async with self.session.get(f"{self.api_base}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Server health check passed: {data}")
                    
                    # Check if database is connected
                    if data.get("database") == "connected":
                        self.test_results["mongodb_connection"] = True
                        logger.info("✅ MongoDB connection confirmed")
                    else:
                        logger.warning("⚠️ MongoDB connection issue detected")
                    
                    self.test_results["server_health"] = True
                    return True
                else:
                    self.errors.append(f"Health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Server health check failed: {str(e)}")
            logger.error(f"❌ Server health check failed: {e}")
            return False
    
    async def test_cms_content_endpoint(self) -> bool:
        """Test 2: CMS content endpoint"""
        logger.info("🔍 Testing CMS content endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    # Verify essential CMS structure
                    required_sections = ["courses", "institute", "branding", "pages"]
                    missing_sections = [section for section in required_sections if section not in content]
                    
                    if missing_sections:
                        self.errors.append(f"Missing CMS sections: {missing_sections}")
                        return False
                    
                    logger.info("✅ CMS content endpoint working with all required sections")
                    self.test_results["cms_content_available"] = True
                    return True
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"CMS content endpoint failed: {str(e)}")
            logger.error(f"❌ CMS content endpoint failed: {e}")
            return False
    
    async def test_courses_endpoint(self) -> bool:
        """Test 3: Courses endpoint and data structure"""
        logger.info("🔍 Testing courses endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    if not courses:
                        self.errors.append("No courses found in API response")
                        return False
                    
                    logger.info(f"✅ Found {len(courses)} courses")
                    self.test_results["courses_endpoint"] = True
                    
                    # Test course data structure for EligibilityWidget
                    return await self._validate_course_structure(courses)
                else:
                    self.errors.append(f"Courses endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Courses endpoint failed: {str(e)}")
            logger.error(f"❌ Courses endpoint failed: {e}")
            return False
    
    async def _validate_course_structure(self, courses: List[Dict]) -> bool:
        """Validate course data structure for EligibilityWidget"""
        logger.info("🔍 Validating course data structure for EligibilityWidget...")
        
        required_fields = ["title", "slug", "eligibility", "duration", "fees"]
        eligibility_widget_ready = True
        
        for course in courses:
            missing_fields = [field for field in required_fields if not course.get(field)]
            if missing_fields:
                logger.warning(f"⚠️ Course '{course.get('title', 'Unknown')}' missing fields: {missing_fields}")
                eligibility_widget_ready = False
            else:
                logger.info(f"✅ Course '{course['title']}' has all required fields for EligibilityWidget")
        
        if eligibility_widget_ready:
            self.test_results["course_data_structure"] = True
            self.test_results["eligibility_widget_data"] = True
            logger.info("✅ All courses have required fields for EligibilityWidget")
        else:
            self.errors.append("Some courses missing required fields for EligibilityWidget")
        
        return eligibility_widget_ready
    
    async def test_individual_course_endpoint(self) -> bool:
        """Test 4: Individual course endpoint"""
        logger.info("🔍 Testing individual course endpoint...")
        try:
            # First get list of courses to test with
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status != 200:
                    self.errors.append("Cannot get courses list for individual course test")
                    return False
                
                data = await response.json()
                courses = data.get("courses", [])
                
                if not courses:
                    self.errors.append("No courses available to test individual endpoint")
                    return False
                
                # Test first course
                test_course = courses[0]
                slug = test_course.get("slug")
                
                if not slug:
                    self.errors.append("First course has no slug for testing")
                    return False
                
                # Test individual course endpoint
                async with self.session.get(f"{self.api_base}/courses/{slug}") as course_response:
                    if course_response.status == 200:
                        course_data = await course_response.json()
                        logger.info(f"✅ Individual course endpoint working for '{course_data.get('title')}'")
                        return True
                    else:
                        self.errors.append(f"Individual course endpoint failed with status {course_response.status}")
                        return False
        except Exception as e:
            self.errors.append(f"Individual course endpoint test failed: {str(e)}")
            logger.error(f"❌ Individual course endpoint test failed: {e}")
            return False
    
    async def test_admin_authentication(self) -> bool:
        """Test 5: Admin authentication"""
        logger.info("🔍 Testing admin authentication...")
        try:
            # Test login with default password
            login_data = {"password": "grras@admin2024"}
            
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("token")
                    
                    if self.admin_token:
                        logger.info("✅ Admin authentication successful")
                        self.test_results["admin_authentication"] = True
                        return True
                    else:
                        self.errors.append("Admin login successful but no token received")
                        return False
                else:
                    self.errors.append(f"Admin login failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Admin authentication failed: {str(e)}")
            logger.error(f"❌ Admin authentication failed: {e}")
            return False
    
    async def test_contact_form_submission(self) -> bool:
        """Test 6: Contact form submission"""
        logger.info("🔍 Testing contact form submission...")
        try:
            contact_data = {
                "name": "Rajesh Kumar",
                "email": "rajesh.kumar@example.com",
                "phone": "9876543210",
                "course": "DevOps Training",
                "message": "I am interested in DevOps training program. Please provide more details."
            }
            
            async with self.session.post(f"{self.api_base}/contact", json=contact_data) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Contact form submission successful: {data}")
                    self.test_results["contact_form"] = True
                    return True
                else:
                    self.errors.append(f"Contact form submission failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Contact form submission failed: {str(e)}")
            logger.error(f"❌ Contact form submission failed: {e}")
            return False
    
    async def test_syllabus_generation(self) -> bool:
        """Test 7: Syllabus PDF generation"""
        logger.info("🔍 Testing syllabus PDF generation...")
        try:
            # Get first course for testing
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status != 200:
                    self.errors.append("Cannot get courses for syllabus test")
                    return False
                
                data = await response.json()
                courses = data.get("courses", [])
                
                if not courses:
                    self.errors.append("No courses available for syllabus test")
                    return False
                
                test_course = courses[0]
                slug = test_course.get("slug")
                
                # Test syllabus generation with proper form data
                form_data = aiohttp.FormData()
                form_data.add_field('name', 'Priya Sharma')
                form_data.add_field('email', 'priya.sharma@example.com')
                form_data.add_field('phone', '9876543210')
                
                # Remove Content-Type header for form data
                headers = {}
                
                async with self.session.post(f"{self.api_base}/courses/{slug}/syllabus", data=form_data, headers=headers) as response:
                    if response.status == 200:
                        # Check if response is PDF
                        content_type = response.headers.get('content-type', '')
                        if 'application/pdf' in content_type:
                            logger.info("✅ Syllabus PDF generation successful")
                            self.test_results["syllabus_generation"] = True
                            return True
                        else:
                            self.errors.append(f"Syllabus endpoint returned non-PDF content: {content_type}")
                            return False
                    else:
                        response_text = await response.text()
                        self.errors.append(f"Syllabus generation failed with status {response.status}: {response_text}")
                        return False
        except Exception as e:
            self.errors.append(f"Syllabus generation test failed: {str(e)}")
            logger.error(f"❌ Syllabus generation test failed: {e}")
            return False
    
    async def test_leads_management(self) -> bool:
        """Test 8: Leads management (Admin only)"""
        logger.info("🔍 Testing leads management...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, skipping leads test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            async with self.session.get(f"{self.api_base}/leads", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    leads = data.get("leads", [])
                    logger.info(f"✅ Leads management working - Found {len(leads)} leads")
                    self.test_results["leads_management"] = True
                    return True
                else:
                    self.errors.append(f"Leads endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Leads management test failed: {str(e)}")
            logger.error(f"❌ Leads management test failed: {e}")
            return False
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests"""
        logger.info("🚀 Starting comprehensive backend testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("Server Health Check", self.test_server_health),
                ("CMS Content Endpoint", self.test_cms_content_endpoint),
                ("Courses Endpoint", self.test_courses_endpoint),
                ("Individual Course Endpoint", self.test_individual_course_endpoint),
                ("Admin Authentication", self.test_admin_authentication),
                ("Contact Form Submission", self.test_contact_form_submission),
                ("Syllabus PDF Generation", self.test_syllabus_generation),
                ("Leads Management", self.test_leads_management),
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
                "eligibility_widget_ready": self.test_results["eligibility_widget_data"]
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _identify_critical_issues(self) -> List[str]:
        """Identify critical issues that block functionality"""
        critical_issues = []
        
        if not self.test_results["server_health"]:
            critical_issues.append("FastAPI server is not responding")
        
        if not self.test_results["mongodb_connection"]:
            critical_issues.append("MongoDB connection failed")
        
        if not self.test_results["cms_content_available"]:
            critical_issues.append("CMS content is not available")
        
        if not self.test_results["courses_endpoint"]:
            critical_issues.append("Courses API endpoint is not working")
        
        if not self.test_results["eligibility_widget_data"]:
            critical_issues.append("Course data missing required fields for EligibilityWidget")
        
        return critical_issues
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*60}")
        print("🎯 BACKEND TESTING SUMMARY")
        print(f"{'='*60}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES:")
            for issue in summary['critical_issues']:
                print(f"  • {issue}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n🎯 ELIGIBILITY WIDGET STATUS:")
        if summary['eligibility_widget_ready']:
            print("  ✅ EligibilityWidget data requirements: SATISFIED")
            print("  ✅ All courses have required fields (title, slug, eligibility, etc.)")
        else:
            print("  ❌ EligibilityWidget data requirements: NOT SATISFIED")
            print("  ❌ Some courses missing required fields")
        
        print(f"\n{'='*60}")

async def main():
    """Main test execution"""
    tester = BackendTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: /app/backend_test_results.json")
        
        # Exit with appropriate code
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES DETECTED - Backend needs attention!")
            sys.exit(1)
        elif summary['success_rate'] == "100.0%":
            print(f"\n🎉 ALL TESTS PASSED - Backend is fully functional!")
            sys.exit(0)
        else:
            print(f"\n⚠️ SOME TESTS FAILED - Backend has minor issues")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
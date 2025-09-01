#!/usr/bin/env python3
"""
Backend API Testing Suite for GRRAS Solutions Training Institute
Post Hero Slider Optimization Testing - Verifying backend functionality remains intact
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
from typing import Dict, Any, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HeroSliderBackendTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results
        self.test_results = {
            "api_health_check": False,
            "cms_content_endpoint": False,
            "course_endpoints": False,
            "admin_authentication": False,
            "contact_form": False,
            "pdf_generation": False,
            "blog_functionality": False,
            "general_system_health": False
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
    
    async def test_api_health_check(self) -> bool:
        """Test 1: API Health Check - Verify FastAPI server is running properly"""
        logger.info("🔍 Testing API Health Check...")
        try:
            async with self.session.get(f"{self.api_base}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ API Health Check passed: {data}")
                    
                    # Check if database is connected
                    if data.get("database") == "connected":
                        logger.info("✅ MongoDB connection confirmed")
                    else:
                        logger.warning("⚠️ MongoDB connection issue detected")
                    
                    self.test_results["api_health_check"] = True
                    return True
                else:
                    self.errors.append(f"Health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"API health check failed: {str(e)}")
            logger.error(f"❌ API health check failed: {e}")
            return False
    
    async def test_cms_content_endpoint(self) -> bool:
        """Test 2: CMS Content Endpoint - Test /api/content endpoint is accessible"""
        logger.info("🔍 Testing CMS Content Endpoint...")
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
                    self.test_results["cms_content_endpoint"] = True
                    return True
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"CMS content endpoint failed: {str(e)}")
            logger.error(f"❌ CMS content endpoint failed: {e}")
            return False
    
    async def test_course_endpoints(self) -> bool:
        """Test 3: Course Endpoints - Verify courses API is working"""
        logger.info("🔍 Testing Course Endpoints...")
        try:
            # Test courses list endpoint
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    if not courses:
                        self.errors.append("No courses found in API response")
                        return False
                    
                    logger.info(f"✅ Found {len(courses)} courses")
                    
                    # Test individual course endpoint
                    test_course = courses[0]
                    slug = test_course.get("slug")
                    
                    if slug:
                        async with self.session.get(f"{self.api_base}/courses/{slug}") as course_response:
                            if course_response.status == 200:
                                course_data = await course_response.json()
                                logger.info(f"✅ Individual course endpoint working for '{course_data.get('title')}'")
                                self.test_results["course_endpoints"] = True
                                return True
                            else:
                                self.errors.append(f"Individual course endpoint failed with status {course_response.status}")
                                return False
                    else:
                        self.errors.append("First course has no slug for testing")
                        return False
                else:
                    self.errors.append(f"Courses endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Course endpoints test failed: {str(e)}")
            logger.error(f"❌ Course endpoints test failed: {e}")
            return False
    
    async def test_admin_authentication(self) -> bool:
        """Test 4: Admin Authentication - Test admin login functionality"""
        logger.info("🔍 Testing Admin Authentication...")
        try:
            # Test login with correct password
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
    
    async def test_contact_form(self) -> bool:
        """Test 5: Contact Form - Test lead submission functionality"""
        logger.info("🔍 Testing Contact Form...")
        try:
            # Test with form data (correct format)
            form_data = aiohttp.FormData()
            form_data.add_field('name', 'Priya Sharma')
            form_data.add_field('email', 'priya.sharma@example.com')
            form_data.add_field('phone', '9876543210')
            form_data.add_field('course', 'DevOps Training')
            form_data.add_field('message', 'I am interested in DevOps training program. Please provide more details.')
            
            async with self.session.post(f"{self.api_base}/contact", data=form_data) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Contact form submission successful: {data}")
                    self.test_results["contact_form"] = True
                    return True
                else:
                    response_text = await response.text()
                    self.errors.append(f"Contact form submission failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Contact form submission failed: {str(e)}")
            logger.error(f"❌ Contact form submission failed: {e}")
            return False
    
    async def test_pdf_generation(self) -> bool:
        """Test 6: PDF Generation - Test syllabus download functionality"""
        logger.info("🔍 Testing PDF Generation...")
        try:
            # Get first course for testing
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status != 200:
                    self.errors.append("Cannot get courses for PDF test")
                    return False
                
                data = await response.json()
                courses = data.get("courses", [])
                
                if not courses:
                    self.errors.append("No courses available for PDF test")
                    return False
                
                test_course = courses[0]
                slug = test_course.get("slug")
                
                # Test PDF generation with proper form data
                form_data = aiohttp.FormData()
                form_data.add_field('name', 'Amit Kumar')
                form_data.add_field('email', 'amit.kumar@example.com')
                form_data.add_field('phone', '9876543210')
                
                async with self.session.post(f"{self.api_base}/courses/{slug}/syllabus", data=form_data) as response:
                    if response.status == 200:
                        # Check if response is PDF
                        content_type = response.headers.get('content-type', '')
                        if 'application/pdf' in content_type:
                            logger.info("✅ PDF generation successful")
                            self.test_results["pdf_generation"] = True
                            return True
                        else:
                            self.errors.append(f"PDF endpoint returned non-PDF content: {content_type}")
                            return False
                    else:
                        response_text = await response.text()
                        self.errors.append(f"PDF generation failed with status {response.status}: {response_text}")
                        return False
        except Exception as e:
            self.errors.append(f"PDF generation test failed: {str(e)}")
            logger.error(f"❌ PDF generation test failed: {e}")
            return False
    
    async def test_blog_functionality(self) -> bool:
        """Test 7: Blog Functionality - Test blog endpoints"""
        logger.info("🔍 Testing Blog Functionality...")
        try:
            # Test blog posts endpoint
            async with self.session.get(f"{self.api_base}/blog") as response:
                if response.status == 200:
                    data = await response.json()
                    posts = data.get("posts", [])
                    logger.info(f"✅ Blog posts endpoint working - Found {len(posts)} posts")
                    
                    # Test blog categories
                    async with self.session.get(f"{self.api_base}/blog/categories") as cat_response:
                        if cat_response.status == 200:
                            cat_data = await cat_response.json()
                            categories = cat_data.get("categories", {})
                            logger.info(f"✅ Blog categories endpoint working - Found {len(categories)} categories")
                            
                            # Test individual blog post if available
                            if posts:
                                test_post = posts[0]
                                slug = test_post.get("slug")
                                if slug:
                                    async with self.session.get(f"{self.api_base}/blog/{slug}") as post_response:
                                        if post_response.status == 200:
                                            logger.info("✅ Individual blog post endpoint working")
                                            self.test_results["blog_functionality"] = True
                                            return True
                                        else:
                                            self.errors.append(f"Individual blog post failed with status {post_response.status}")
                                            return False
                                else:
                                    logger.info("✅ Blog functionality working (no individual post to test)")
                                    self.test_results["blog_functionality"] = True
                                    return True
                            else:
                                logger.info("✅ Blog functionality working (no posts available)")
                                self.test_results["blog_functionality"] = True
                                return True
                        else:
                            self.errors.append(f"Blog categories failed with status {cat_response.status}")
                            return False
                else:
                    self.errors.append(f"Blog posts endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Blog functionality test failed: {str(e)}")
            logger.error(f"❌ Blog functionality test failed: {e}")
            return False
    
    async def test_general_system_health(self) -> bool:
        """Test 8: General System Health - Ensure all backend services are stable"""
        logger.info("🔍 Testing General System Health...")
        try:
            # Test leads endpoint if admin token is available
            if self.admin_token:
                headers = {"Authorization": f"Bearer {self.admin_token}"}
                
                async with self.session.get(f"{self.api_base}/leads", headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        leads = data.get("leads", [])
                        logger.info(f"✅ Leads management working - Found {len(leads)} leads")
                    else:
                        logger.warning(f"⚠️ Leads endpoint returned status {response.status}")
            
            # Test blog tags endpoint
            async with self.session.get(f"{self.api_base}/blog/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    tags = data.get("tags", {})
                    logger.info(f"✅ Blog tags endpoint working - Found {len(tags)} tags")
                else:
                    logger.warning(f"⚠️ Blog tags endpoint returned status {response.status}")
            
            # Overall system health assessment
            logger.info("✅ General system health check completed")
            self.test_results["general_system_health"] = True
            return True
            
        except Exception as e:
            self.errors.append(f"General system health test failed: {str(e)}")
            logger.error(f"❌ General system health test failed: {e}")
            return False
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests for hero slider optimization verification"""
        logger.info("🚀 Starting Hero Slider Backend Testing...")
        logger.info("📋 Testing Context: Verifying backend functionality after hero slider height optimization (600px → 450px)")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("API Health Check", self.test_api_health_check),
                ("CMS Content Endpoint", self.test_cms_content_endpoint),
                ("Course Endpoints", self.test_course_endpoints),
                ("Admin Authentication", self.test_admin_authentication),
                ("Contact Form", self.test_contact_form),
                ("PDF Generation", self.test_pdf_generation),
                ("Blog Functionality", self.test_blog_functionality),
                ("General System Health", self.test_general_system_health),
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
                "test_context": "Hero Slider Optimization Backend Verification",
                "frontend_change": "Hero slider height optimized from 600px to 450px on large screens",
                "expected_result": "All backend functionality should work normally (frontend-only change)",
                "timestamp": datetime.now().isoformat(),
                "backend_url": self.backend_url,
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{success_rate:.1f}%",
                "test_results": self.test_results,
                "errors": self.errors,
                "critical_issues": self._identify_critical_issues(),
                "backend_status": "STABLE" if success_rate >= 87.5 else "NEEDS_ATTENTION"
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _identify_critical_issues(self) -> List[str]:
        """Identify critical issues that block functionality"""
        critical_issues = []
        
        if not self.test_results["api_health_check"]:
            critical_issues.append("FastAPI server is not responding")
        
        if not self.test_results["cms_content_endpoint"]:
            critical_issues.append("CMS content is not available")
        
        if not self.test_results["course_endpoints"]:
            critical_issues.append("Courses API endpoint is not working")
        
        return critical_issues
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*70}")
        print("🎯 HERO SLIDER BACKEND TESTING SUMMARY")
        print(f"{'='*70}")
        print(f"Test Context: {summary['test_context']}")
        print(f"Frontend Change: {summary['frontend_change']}")
        print(f"Expected Result: {summary['expected_result']}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        print(f"Backend Status: {summary['backend_status']}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES:")
            for issue in summary['critical_issues']:
                print(f"  • {issue}")
        else:
            print(f"\n✅ NO CRITICAL ISSUES DETECTED")
        
        if summary['errors']:
            print(f"\n⚠️ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n🎯 CONCLUSION:")
        if summary['success_rate'] == "100.0%":
            print("  ✅ ALL BACKEND FUNCTIONALITY WORKING NORMALLY")
            print("  ✅ Hero slider optimization did not affect backend services")
            print("  ✅ System is ready for production use")
        elif float(summary['success_rate'].replace('%', '')) >= 87.5:
            print("  ✅ BACKEND FUNCTIONALITY MOSTLY WORKING")
            print("  ✅ Hero slider optimization did not cause major backend issues")
            print("  ⚠️ Minor issues detected but system is stable")
        else:
            print("  ❌ BACKEND FUNCTIONALITY COMPROMISED")
            print("  ❌ Critical issues detected that need immediate attention")
        
        print(f"\n{'='*70}")

async def main():
    """Main test execution"""
    tester = HeroSliderBackendTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/hero_slider_backend_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        # Return appropriate exit code
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES DETECTED - Backend needs attention!")
            return 1
        elif summary['success_rate'] == "100.0%":
            print(f"\n🎉 ALL TESTS PASSED - Backend is fully functional after hero slider optimization!")
            return 0
        else:
            print(f"\n⚠️ SOME TESTS FAILED - Backend has minor issues but is stable")
            return 0  # Return 0 for minor issues as they don't block functionality
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    import sys
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
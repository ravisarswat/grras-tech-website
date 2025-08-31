#!/usr/bin/env python3
"""
Focused Backend Testing for CertificationCoursesPage
Tests core functionality needed for the frontend to display courses properly
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CertificationCoursesPageTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        
        # Test results for core functionality
        self.test_results = {
            "health_check": False,
            "cms_content_accessible": False,
            "courses_endpoint_working": False,
            "courses_data_complete": False,
            "course_categories_available": False,
            "learning_paths_available": False,
            "individual_course_access": False,
            "no_backend_errors": False
        }
        
        self.errors = []
        self.courses_data = []
        
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
    
    async def test_health_check(self) -> bool:
        """Test 1: Health check endpoint"""
        logger.info("🔍 Testing health check endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Health check passed: {data}")
                    
                    # Check if database is connected
                    if data.get("database") == "connected":
                        logger.info("✅ MongoDB connection confirmed")
                    else:
                        logger.warning("⚠️ MongoDB connection issue detected")
                        self.errors.append("MongoDB connection issue")
                    
                    self.test_results["health_check"] = True
                    return True
                else:
                    self.errors.append(f"Health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Health check failed: {str(e)}")
            logger.error(f"❌ Health check failed: {e}")
            return False
    
    async def test_cms_content_endpoint(self) -> bool:
        """Test 2: /api/content endpoint - verify all CMS content is accessible"""
        logger.info("🔍 Testing /api/content endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    # Verify essential CMS structure for CertificationCoursesPage
                    required_sections = ["courses", "institute", "branding", "pages"]
                    missing_sections = [section for section in required_sections if section not in content]
                    
                    if missing_sections:
                        self.errors.append(f"Missing CMS sections: {missing_sections}")
                        return False
                    
                    # Check for course categories (needed for tabbed interface)
                    if "courseCategories" in content:
                        categories = content["courseCategories"]
                        logger.info(f"✅ Found {len(categories)} course categories")
                        self.test_results["course_categories_available"] = True
                    else:
                        logger.warning("⚠️ Course categories not found in CMS content")
                    
                    # Check for learning paths
                    if "learningPaths" in content:
                        learning_paths = content["learningPaths"]
                        logger.info(f"✅ Found {len(learning_paths)} learning paths")
                        self.test_results["learning_paths_available"] = True
                    else:
                        logger.warning("⚠️ Learning paths not found in CMS content")
                    
                    logger.info("✅ CMS content endpoint working with all required sections")
                    self.test_results["cms_content_accessible"] = True
                    return True
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"CMS content endpoint failed: {str(e)}")
            logger.error(f"❌ CMS content endpoint failed: {e}")
            return False
    
    async def test_courses_endpoint(self) -> bool:
        """Test 3: /api/courses endpoint - check that all courses are being returned properly"""
        logger.info("🔍 Testing /api/courses endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    if not courses:
                        self.errors.append("No courses found in API response")
                        return False
                    
                    self.courses_data = courses
                    logger.info(f"✅ Found {len(courses)} courses")
                    
                    # Analyze course categories for tabbed interface
                    categories = {}
                    for course in courses:
                        category = course.get("category", "other")
                        if category not in categories:
                            categories[category] = []
                        categories[category].append(course.get("title", "Unknown"))
                    
                    logger.info("📊 Course distribution by category:")
                    for category, course_list in categories.items():
                        logger.info(f"  {category}: {len(course_list)} courses")
                    
                    # Check for certification courses specifically
                    cert_keywords = ["aws", "kubernetes", "red hat", "certification", "cka", "cks", "rhcsa", "rhce"]
                    cert_courses = []
                    for course in courses:
                        title_lower = course.get("title", "").lower()
                        if any(keyword in title_lower for keyword in cert_keywords):
                            cert_courses.append(course.get("title"))
                    
                    logger.info(f"✅ Found {len(cert_courses)} certification courses")
                    if cert_courses:
                        logger.info("📋 Certification courses:")
                        for cert_course in cert_courses[:5]:  # Show first 5
                            logger.info(f"  • {cert_course}")
                    
                    self.test_results["courses_endpoint_working"] = True
                    return await self._validate_course_data_completeness(courses)
                else:
                    self.errors.append(f"Courses endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Courses endpoint failed: {str(e)}")
            logger.error(f"❌ Courses endpoint failed: {e}")
            return False
    
    async def _validate_course_data_completeness(self, courses: List[Dict]) -> bool:
        """Validate course data completeness for frontend display"""
        logger.info("🔍 Validating course data completeness...")
        
        # Essential fields for CertificationCoursesPage display
        essential_fields = ["title", "slug", "duration", "fees"]
        # Optional but important fields
        important_fields = ["eligibility", "category", "level", "description", "overview"]
        
        complete_courses = 0
        incomplete_courses = []
        
        for course in courses:
            missing_essential = [field for field in essential_fields if not course.get(field)]
            missing_important = [field for field in important_fields if not course.get(field)]
            
            if not missing_essential:
                complete_courses += 1
                if missing_important:
                    logger.info(f"✅ Course '{course.get('title')}' has all essential fields (missing optional: {missing_important})")
                else:
                    logger.info(f"✅ Course '{course.get('title')}' has complete data structure")
            else:
                incomplete_courses.append({
                    "title": course.get("title", "Unknown"),
                    "missing_essential": missing_essential,
                    "missing_important": missing_important
                })
                logger.warning(f"⚠️ Course '{course.get('title')}' missing essential fields: {missing_essential}")
        
        completion_rate = (complete_courses / len(courses)) * 100
        logger.info(f"📊 Course data completeness: {complete_courses}/{len(courses)} ({completion_rate:.1f}%)")
        
        if completion_rate >= 90:  # Allow for some test courses to be incomplete
            logger.info("✅ Course data completeness is acceptable for frontend display")
            self.test_results["courses_data_complete"] = True
            return True
        else:
            self.errors.append(f"Course data completeness too low: {completion_rate:.1f}%")
            return False
    
    async def test_individual_course_access(self) -> bool:
        """Test 4: Individual course endpoint access"""
        logger.info("🔍 Testing individual course access...")
        
        if not self.courses_data:
            self.errors.append("No courses data available for individual access test")
            return False
        
        try:
            # Test access to first few courses
            test_courses = self.courses_data[:3]  # Test first 3 courses
            successful_access = 0
            
            for course in test_courses:
                slug = course.get("slug")
                if not slug:
                    logger.warning(f"⚠️ Course '{course.get('title')}' has no slug")
                    continue
                
                async with self.session.get(f"{self.api_base}/courses/{slug}") as response:
                    if response.status == 200:
                        course_data = await response.json()
                        logger.info(f"✅ Individual access working for '{course_data.get('title')}'")
                        successful_access += 1
                    else:
                        logger.error(f"❌ Individual access failed for '{course.get('title')}' (status: {response.status})")
            
            if successful_access > 0:
                logger.info(f"✅ Individual course access working ({successful_access}/{len(test_courses)} tested)")
                self.test_results["individual_course_access"] = True
                return True
            else:
                self.errors.append("No individual course endpoints accessible")
                return False
                
        except Exception as e:
            self.errors.append(f"Individual course access test failed: {str(e)}")
            logger.error(f"❌ Individual course access test failed: {e}")
            return False
    
    async def test_no_backend_errors(self) -> bool:
        """Test 5: Ensure no backend errors that would prevent frontend loading"""
        logger.info("🔍 Testing for backend errors that could block frontend...")
        
        # This is a summary test based on previous results
        critical_endpoints = [
            self.test_results["health_check"],
            self.test_results["cms_content_accessible"],
            self.test_results["courses_endpoint_working"]
        ]
        
        if all(critical_endpoints):
            logger.info("✅ No critical backend errors detected")
            self.test_results["no_backend_errors"] = True
            return True
        else:
            failed_endpoints = []
            if not self.test_results["health_check"]:
                failed_endpoints.append("health_check")
            if not self.test_results["cms_content_accessible"]:
                failed_endpoints.append("cms_content")
            if not self.test_results["courses_endpoint_working"]:
                failed_endpoints.append("courses_endpoint")
            
            self.errors.append(f"Critical backend endpoints failing: {failed_endpoints}")
            return False
    
    async def run_certification_courses_tests(self) -> Dict[str, Any]:
        """Run all tests for CertificationCoursesPage functionality"""
        logger.info("🚀 Starting CertificationCoursesPage backend testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence for CertificationCoursesPage
            tests = [
                ("Health Check Endpoint", self.test_health_check),
                ("CMS Content Endpoint", self.test_cms_content_endpoint),
                ("Courses Endpoint", self.test_courses_endpoint),
                ("Individual Course Access", self.test_individual_course_access),
                ("No Backend Errors", self.test_no_backend_errors),
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
                "test_focus": "CertificationCoursesPage functionality",
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{success_rate:.1f}%",
                "test_results": self.test_results,
                "errors": self.errors,
                "courses_found": len(self.courses_data),
                "frontend_ready": self._assess_frontend_readiness()
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _assess_frontend_readiness(self) -> Dict[str, Any]:
        """Assess if backend is ready for CertificationCoursesPage"""
        critical_tests = [
            "health_check",
            "cms_content_accessible", 
            "courses_endpoint_working",
            "no_backend_errors"
        ]
        
        critical_passed = all(self.test_results[test] for test in critical_tests)
        
        return {
            "ready": critical_passed,
            "critical_functionality": "working" if critical_passed else "failing",
            "course_categories": "available" if self.test_results["course_categories_available"] else "missing",
            "learning_paths": "available" if self.test_results["learning_paths_available"] else "missing",
            "course_data_quality": "good" if self.test_results["courses_data_complete"] else "needs_improvement",
            "individual_access": "working" if self.test_results["individual_course_access"] else "failing"
        }
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*70}")
        print("🎯 CERTIFICATION COURSES PAGE - BACKEND TESTING SUMMARY")
        print(f"{'='*70}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Focus: {summary['test_focus']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        print(f"Courses Found: {summary['courses_found']}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        print(f"\n🎯 FRONTEND READINESS ASSESSMENT:")
        frontend_ready = summary['frontend_ready']
        print(f"  Overall Ready: {'✅ YES' if frontend_ready['ready'] else '❌ NO'}")
        print(f"  Critical Functionality: {frontend_ready['critical_functionality']}")
        print(f"  Course Categories: {frontend_ready['course_categories']}")
        print(f"  Learning Paths: {frontend_ready['learning_paths']}")
        print(f"  Course Data Quality: {frontend_ready['course_data_quality']}")
        print(f"  Individual Access: {frontend_ready['individual_access']}")
        
        if summary['errors']:
            print(f"\n❌ ISSUES FOUND:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n🎯 CERTIFICATION COURSES PAGE STATUS:")
        if frontend_ready['ready']:
            print("  ✅ Backend is READY for CertificationCoursesPage")
            print("  ✅ All core functionality working properly")
            print("  ✅ Frontend should be able to load and display courses")
        else:
            print("  ❌ Backend has ISSUES that may prevent frontend loading")
            print("  ❌ Critical functionality needs attention")
        
        print(f"\n{'='*70}")

async def main():
    """Main test execution"""
    tester = CertificationCoursesPageTester()
    
    try:
        summary = await tester.run_certification_courses_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/certification_courses_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        # Exit with appropriate code
        if summary['frontend_ready']['ready']:
            print(f"\n🎉 BACKEND READY - CertificationCoursesPage should work properly!")
            return 0
        else:
            print(f"\n🚨 BACKEND ISSUES - CertificationCoursesPage may have problems!")
            return 1
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
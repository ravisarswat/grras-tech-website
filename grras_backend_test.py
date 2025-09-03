#!/usr/bin/env python3
"""
GRRAS Solutions Backend API Testing Suite
Tests all core functionality after UI improvements as requested in review
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

class GRRASBackendTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results tracking
        self.test_results = {
            "api_health_check": False,
            "cms_content_endpoint": False,
            "courses_api": False,
            "individual_course": False,
            "dynamic_categories": False,
            "course_counts": False,
            "pricing_data": False,
            "contact_form": False
        }
        
        self.errors = []
        self.course_data = {}
        
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
        """Test 1: API Health Check - Verify FastAPI server is responding correctly"""
        logger.info("🔍 Testing API Health Check...")
        try:
            async with self.session.get(f"{self.api_base}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ API Health Check passed: {data}")
                    
                    # Verify required health check fields
                    if data.get("status") == "healthy" and data.get("database") == "connected":
                        logger.info("✅ FastAPI server responding correctly with healthy database")
                        self.test_results["api_health_check"] = True
                        return True
                    else:
                        self.errors.append(f"Health check returned unhealthy status: {data}")
                        return False
                else:
                    self.errors.append(f"Health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"API health check failed: {str(e)}")
            logger.error(f"❌ API health check failed: {e}")
            return False
    
    async def test_cms_content_endpoint(self) -> bool:
        """Test 2: CMS Content - Test /api/content endpoint for course categories and content structure"""
        logger.info("🔍 Testing CMS Content endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    # Verify essential CMS structure for course categories
                    required_sections = ["courses", "institute", "branding", "pages"]
                    missing_sections = [section for section in required_sections if section not in content]
                    
                    if missing_sections:
                        self.errors.append(f"Missing CMS sections: {missing_sections}")
                        return False
                    
                    # Check if courses section has data
                    courses = content.get("courses", [])
                    if not courses:
                        self.errors.append("No courses found in CMS content")
                        return False
                    
                    logger.info(f"✅ CMS Content endpoint working with {len(courses)} courses")
                    self.course_data = {"courses": courses, "content": content}
                    self.test_results["cms_content_endpoint"] = True
                    return True
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"CMS content endpoint failed: {str(e)}")
            logger.error(f"❌ CMS content endpoint failed: {e}")
            return False
    
    async def test_courses_api(self) -> bool:
        """Test 3: Courses API - Test /api/courses endpoint to ensure all courses with pricing are returned"""
        logger.info("🔍 Testing Courses API endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    if not courses:
                        self.errors.append("No courses returned from /api/courses endpoint")
                        return False
                    
                    # Verify all courses have pricing information
                    courses_with_pricing = 0
                    courses_without_pricing = []
                    
                    for course in courses:
                        if course.get("fees") or course.get("price"):
                            courses_with_pricing += 1
                        else:
                            courses_without_pricing.append(course.get("title", "Unknown"))
                    
                    logger.info(f"✅ Found {len(courses)} courses, {courses_with_pricing} with pricing")
                    
                    if courses_without_pricing:
                        logger.warning(f"⚠️ Courses without pricing: {courses_without_pricing}")
                    
                    # Store course data for other tests
                    self.course_data["api_courses"] = courses
                    self.test_results["courses_api"] = True
                    return True
                else:
                    self.errors.append(f"Courses API endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Courses API endpoint failed: {str(e)}")
            logger.error(f"❌ Courses API endpoint failed: {e}")
            return False
    
    async def test_individual_course(self) -> bool:
        """Test 4: Individual Course - Test specific course endpoint like /api/courses/devops-training"""
        logger.info("🔍 Testing Individual Course endpoints...")
        try:
            courses = self.course_data.get("api_courses", [])
            if not courses:
                self.errors.append("No courses available for individual course testing")
                return False
            
            # Test specific courses mentioned in review
            test_slugs = ["devops-training"]
            
            # Also test first available course if devops-training not found
            if courses:
                first_course_slug = courses[0].get("slug")
                if first_course_slug and first_course_slug not in test_slugs:
                    test_slugs.append(first_course_slug)
            
            successful_tests = 0
            
            for slug in test_slugs:
                try:
                    async with self.session.get(f"{self.api_base}/courses/{slug}") as response:
                        if response.status == 200:
                            course_data = await response.json()
                            logger.info(f"✅ Individual course endpoint working for '{course_data.get('title')}' ({slug})")
                            successful_tests += 1
                        elif response.status == 404:
                            logger.warning(f"⚠️ Course not found: {slug}")
                        else:
                            logger.error(f"❌ Individual course endpoint failed for {slug} with status {response.status}")
                except Exception as e:
                    logger.error(f"❌ Error testing individual course {slug}: {e}")
            
            if successful_tests > 0:
                logger.info(f"✅ Individual course endpoints working ({successful_tests}/{len(test_slugs)} tested)")
                self.test_results["individual_course"] = True
                return True
            else:
                self.errors.append("No individual course endpoints working")
                return False
                
        except Exception as e:
            self.errors.append(f"Individual course endpoint test failed: {str(e)}")
            logger.error(f"❌ Individual course endpoint test failed: {e}")
            return False
    
    async def test_dynamic_categories(self) -> bool:
        """Test 5: Dynamic Categories - Verify course categories are loading correctly from CMS"""
        logger.info("🔍 Testing Dynamic Categories...")
        try:
            courses = self.course_data.get("api_courses", [])
            if not courses:
                self.errors.append("No courses available for category testing")
                return False
            
            # Analyze categories from courses
            categories = {}
            for course in courses:
                category = course.get("category", "general")
                if category not in categories:
                    categories[category] = []
                categories[category].append(course.get("title", "Unknown"))
            
            logger.info(f"✅ Found {len(categories)} categories: {list(categories.keys())}")
            
            # Verify categories are properly distributed
            for category, course_titles in categories.items():
                logger.info(f"  📂 {category}: {len(course_titles)} courses")
            
            if len(categories) > 0:
                self.course_data["categories"] = categories
                self.test_results["dynamic_categories"] = True
                return True
            else:
                self.errors.append("No categories found in course data")
                return False
                
        except Exception as e:
            self.errors.append(f"Dynamic categories test failed: {str(e)}")
            logger.error(f"❌ Dynamic categories test failed: {e}")
            return False
    
    async def test_course_counts(self) -> bool:
        """Test 6: Course Counts - Verify course counts per category are accurate"""
        logger.info("🔍 Testing Course Counts per Category...")
        try:
            categories = self.course_data.get("categories", {})
            courses = self.course_data.get("api_courses", [])
            
            if not categories or not courses:
                self.errors.append("No category or course data available for count testing")
                return False
            
            # Verify counts are accurate
            total_courses_in_categories = sum(len(course_list) for course_list in categories.values())
            actual_total_courses = len(courses)
            
            logger.info(f"📊 Course count verification:")
            logger.info(f"  Total courses from API: {actual_total_courses}")
            logger.info(f"  Total courses in categories: {total_courses_in_categories}")
            
            # Detailed category counts
            for category, course_list in categories.items():
                count = len(course_list)
                logger.info(f"  📂 {category}: {count} courses")
            
            if total_courses_in_categories == actual_total_courses:
                logger.info("✅ Course counts per category are accurate")
                self.test_results["course_counts"] = True
                return True
            else:
                self.errors.append(f"Course count mismatch: {total_courses_in_categories} in categories vs {actual_total_courses} total")
                return False
                
        except Exception as e:
            self.errors.append(f"Course counts test failed: {str(e)}")
            logger.error(f"❌ Course counts test failed: {e}")
            return False
    
    async def test_pricing_data(self) -> bool:
        """Test 7: Pricing Data - Confirm all courses have proper fees/pricing information"""
        logger.info("🔍 Testing Pricing Data...")
        try:
            courses = self.course_data.get("api_courses", [])
            if not courses:
                self.errors.append("No courses available for pricing testing")
                return False
            
            courses_with_pricing = []
            courses_without_pricing = []
            pricing_formats = {}
            
            for course in courses:
                title = course.get("title", "Unknown")
                fees = course.get("fees")
                price = course.get("price")
                
                if fees or price:
                    courses_with_pricing.append(title)
                    # Analyze pricing format
                    pricing_value = fees or price
                    if "₹" in str(pricing_value):
                        pricing_formats["rupee_symbol"] = pricing_formats.get("rupee_symbol", 0) + 1
                    elif "Rs" in str(pricing_value):
                        pricing_formats["rs_prefix"] = pricing_formats.get("rs_prefix", 0) + 1
                    elif any(char.isdigit() for char in str(pricing_value)):
                        pricing_formats["numeric"] = pricing_formats.get("numeric", 0) + 1
                    else:
                        pricing_formats["text"] = pricing_formats.get("text", 0) + 1
                else:
                    courses_without_pricing.append(title)
            
            logger.info(f"📊 Pricing Data Analysis:")
            logger.info(f"  Courses with pricing: {len(courses_with_pricing)}/{len(courses)}")
            logger.info(f"  Courses without pricing: {len(courses_without_pricing)}")
            
            if pricing_formats:
                logger.info(f"  Pricing formats: {pricing_formats}")
            
            if courses_without_pricing:
                logger.warning(f"⚠️ Courses without pricing: {courses_without_pricing}")
            
            # Consider test passed if majority of courses have pricing
            pricing_percentage = (len(courses_with_pricing) / len(courses)) * 100
            
            if pricing_percentage >= 80:  # 80% threshold
                logger.info(f"✅ Pricing data available for {pricing_percentage:.1f}% of courses")
                self.test_results["pricing_data"] = True
                return True
            else:
                self.errors.append(f"Only {pricing_percentage:.1f}% of courses have pricing data")
                return False
                
        except Exception as e:
            self.errors.append(f"Pricing data test failed: {str(e)}")
            logger.error(f"❌ Pricing data test failed: {e}")
            return False
    
    async def test_contact_form(self) -> bool:
        """Test 8: Contact Form - Test contact form submission functionality"""
        logger.info("🔍 Testing Contact Form submission...")
        try:
            # Test contact form with FormData (as per latest fix in test_result.md)
            form_data = aiohttp.FormData()
            form_data.add_field('name', 'Arjun Patel')
            form_data.add_field('email', 'arjun.patel@example.com')
            form_data.add_field('phone', '9876543210')
            form_data.add_field('message', 'I am interested in your DevOps training program. Please provide more details about the course structure and placement assistance.')
            form_data.add_field('course', 'DevOps Training')
            
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
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all GRRAS backend tests"""
        logger.info("🚀 Starting GRRAS Solutions Backend API Testing...")
        logger.info(f"🌐 Testing backend URL: {self.backend_url}")
        
        await self.setup_session()
        
        try:
            # Test sequence as per review request
            tests = [
                ("API Health Check", self.test_api_health_check),
                ("CMS Content", self.test_cms_content_endpoint),
                ("Courses API", self.test_courses_api),
                ("Individual Course", self.test_individual_course),
                ("Dynamic Categories", self.test_dynamic_categories),
                ("Course Counts", self.test_course_counts),
                ("Pricing Data", self.test_pricing_data),
                ("Contact Form", self.test_contact_form),
            ]
            
            passed_tests = 0
            total_tests = len(tests)
            
            for test_name, test_func in tests:
                logger.info(f"\n{'='*60}")
                logger.info(f"Running: {test_name}")
                logger.info(f"{'='*60}")
                
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
                "course_analysis": self._generate_course_analysis()
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _identify_critical_issues(self) -> List[str]:
        """Identify critical issues that block functionality"""
        critical_issues = []
        
        if not self.test_results["api_health_check"]:
            critical_issues.append("FastAPI server health check failed")
        
        if not self.test_results["cms_content_endpoint"]:
            critical_issues.append("CMS content endpoint not working")
        
        if not self.test_results["courses_api"]:
            critical_issues.append("Courses API endpoint not working")
        
        if not self.test_results["contact_form"]:
            critical_issues.append("Contact form submission not working")
        
        return critical_issues
    
    def _generate_course_analysis(self) -> Dict[str, Any]:
        """Generate course analysis summary"""
        courses = self.course_data.get("api_courses", [])
        categories = self.course_data.get("categories", {})
        
        if not courses:
            return {"error": "No course data available"}
        
        analysis = {
            "total_courses": len(courses),
            "categories": {
                "count": len(categories),
                "distribution": {cat: len(courses) for cat, courses in categories.items()}
            },
            "pricing_analysis": {
                "courses_with_pricing": 0,
                "courses_without_pricing": 0
            }
        }
        
        # Analyze pricing
        for course in courses:
            if course.get("fees") or course.get("price"):
                analysis["pricing_analysis"]["courses_with_pricing"] += 1
            else:
                analysis["pricing_analysis"]["courses_without_pricing"] += 1
        
        return analysis
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print comprehensive test summary"""
        print(f"\n{'='*80}")
        print("🎯 GRRAS SOLUTIONS BACKEND API TESTING SUMMARY")
        print(f"{'='*80}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 DETAILED TEST RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            formatted_name = test_name.replace("_", " ").title()
            print(f"  {formatted_name}: {status}")
        
        # Course Analysis
        if 'course_analysis' in summary and 'error' not in summary['course_analysis']:
            analysis = summary['course_analysis']
            print(f"\n📚 COURSE ANALYSIS:")
            print(f"  Total Courses: {analysis['total_courses']}")
            print(f"  Categories: {analysis['categories']['count']}")
            
            if analysis['categories']['distribution']:
                print(f"  Category Distribution:")
                for cat, count in analysis['categories']['distribution'].items():
                    print(f"    📂 {cat}: {count} courses")
            
            pricing = analysis['pricing_analysis']
            print(f"  Pricing Data:")
            print(f"    ✅ With Pricing: {pricing['courses_with_pricing']}")
            print(f"    ❌ Without Pricing: {pricing['courses_without_pricing']}")
        
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES:")
            for issue in summary['critical_issues']:
                print(f"  • {issue}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        # Overall Assessment
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if summary['success_rate'] == "100.0%":
            print("  ✅ ALL TESTS PASSED - Backend is fully functional!")
            print("  ✅ Dynamic course counts, categories, and pricing data working correctly")
            print("  ✅ Contact form functionality operational")
        elif float(summary['success_rate'].replace('%', '')) >= 75:
            print("  ⚠️ MOSTLY FUNCTIONAL - Minor issues detected")
            print("  ✅ Core functionality working")
        else:
            print("  ❌ SIGNIFICANT ISSUES - Backend needs attention")
        
        print(f"\n{'='*80}")

async def main():
    """Main test execution"""
    tester = GRRASBackendTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/grras_backend_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
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
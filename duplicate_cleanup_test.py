#!/usr/bin/env python3
"""
GRRAS Solutions Backend Test - Post Duplicate Course Cleanup Verification
Tests backend after duplicate course cleanup to verify exactly 14 production courses remain
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Set
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DuplicateCleanupTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results tracking
        self.test_results = {
            "server_health": False,
            "mongodb_connection": False,
            "course_count_verification": False,
            "duplicate_removal_verification": False,
            "production_courses_integrity": False,
            "required_fields_verification": False,
            "cms_content_structure": False,
            "admin_functions": False,
            "quality_verification": False
        }
        
        self.errors = []
        self.course_analysis = {}
        
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
    
    async def test_core_api_health(self) -> bool:
        """Test 1: Core API Health - FastAPI server, MongoDB connectivity, main endpoints"""
        logger.info("🔍 Testing Core API Health...")
        try:
            # FastAPI server health check
            async with self.session.get(f"{self.api_base}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ FastAPI server healthy: {data}")
                    
                    # Check MongoDB connectivity
                    if data.get("database") == "connected":
                        self.test_results["mongodb_connection"] = True
                        logger.info("✅ MongoDB connectivity confirmed")
                    else:
                        self.errors.append("MongoDB connection issue detected")
                        return False
                    
                    self.test_results["server_health"] = True
                    
                    # Test main API endpoints
                    endpoints_to_test = ["/content", "/courses"]
                    for endpoint in endpoints_to_test:
                        async with self.session.get(f"{self.api_base}{endpoint}") as ep_response:
                            if ep_response.status != 200:
                                self.errors.append(f"Main endpoint {endpoint} failed with status {ep_response.status}")
                                return False
                    
                    logger.info("✅ All main API endpoints working")
                    return True
                else:
                    self.errors.append(f"Health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Core API health check failed: {str(e)}")
            logger.error(f"❌ Core API health check failed: {e}")
            return False
    
    async def test_course_data_integrity(self) -> bool:
        """Test 2: Course Data Integrity - Verify 14 courses, no duplicates, required fields"""
        logger.info("🔍 Testing Course Data Integrity...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status != 200:
                    self.errors.append(f"Courses endpoint failed with status {response.status}")
                    return False
                
                data = await response.json()
                courses = data.get("courses", [])
                
                # Verify exactly 14 courses (no test courses)
                course_count = len(courses)
                logger.info(f"📊 Found {course_count} courses")
                
                if course_count != 14:
                    self.errors.append(f"Expected exactly 14 courses, found {course_count}")
                    # Continue testing but mark as failed
                    self.test_results["course_count_verification"] = False
                else:
                    self.test_results["course_count_verification"] = True
                    logger.info("✅ Course count verification: 14 courses present")
                
                # Check for duplicate removal
                test_course_titles = ["Test CMS Course", "Test Comprehensive Course"]
                found_test_courses = []
                
                for course in courses:
                    title = course.get("title", "")
                    if any(test_title in title for test_title in test_course_titles):
                        found_test_courses.append(title)
                
                if found_test_courses:
                    self.errors.append(f"Test courses still present: {found_test_courses}")
                    self.test_results["duplicate_removal_verification"] = False
                else:
                    self.test_results["duplicate_removal_verification"] = True
                    logger.info("✅ Duplicate test courses successfully removed")
                
                # Check for duplicate course entries
                slugs = [course.get("slug") for course in courses if course.get("slug")]
                titles = [course.get("title") for course in courses if course.get("title")]
                
                duplicate_slugs = len(slugs) - len(set(slugs))
                duplicate_titles = len(titles) - len(set(titles))
                
                if duplicate_slugs > 0 or duplicate_titles > 0:
                    self.errors.append(f"Found {duplicate_slugs} duplicate slugs and {duplicate_titles} duplicate titles")
                    logger.warning(f"⚠️ Duplicates found: {duplicate_slugs} slugs, {duplicate_titles} titles")
                
                # Verify required fields for all courses
                required_fields = ["title", "slug", "description", "duration", "fees", "eligibility"]
                missing_fields_courses = []
                
                for course in courses:
                    missing_fields = [field for field in required_fields if not course.get(field)]
                    if missing_fields:
                        missing_fields_courses.append({
                            "title": course.get("title", "Unknown"),
                            "missing": missing_fields
                        })
                
                if missing_fields_courses:
                    logger.warning(f"⚠️ {len(missing_fields_courses)} courses missing required fields")
                    for course_info in missing_fields_courses[:5]:  # Show first 5
                        logger.warning(f"  - {course_info['title']}: missing {course_info['missing']}")
                else:
                    self.test_results["required_fields_verification"] = True
                    logger.info("✅ All courses have required fields")
                
                # Check for added missing fields (oneLiner, learningOutcomes, careerRoles)
                enhanced_fields = ["oneLiner", "learningOutcomes", "careerRoles"]
                enhanced_courses = 0
                
                for course in courses:
                    if all(course.get(field) for field in enhanced_fields):
                        enhanced_courses += 1
                
                logger.info(f"📊 {enhanced_courses}/{course_count} courses have enhanced fields (oneLiner, learningOutcomes, careerRoles)")
                
                # Store course analysis
                self.course_analysis = {
                    "total_courses": course_count,
                    "expected_courses": 14,
                    "test_courses_removed": len(found_test_courses) == 0,
                    "duplicate_slugs": duplicate_slugs,
                    "duplicate_titles": duplicate_titles,
                    "courses_with_required_fields": course_count - len(missing_fields_courses),
                    "courses_with_enhanced_fields": enhanced_courses,
                    "missing_fields_courses": missing_fields_courses
                }
                
                # Overall integrity check
                integrity_passed = (
                    self.test_results["course_count_verification"] and
                    self.test_results["duplicate_removal_verification"] and
                    duplicate_slugs == 0 and duplicate_titles == 0
                )
                
                self.test_results["production_courses_integrity"] = integrity_passed
                
                if integrity_passed:
                    logger.info("✅ Course data integrity verification passed")
                else:
                    logger.warning("⚠️ Course data integrity issues detected")
                
                return True
                
        except Exception as e:
            self.errors.append(f"Course data integrity test failed: {str(e)}")
            logger.error(f"❌ Course data integrity test failed: {e}")
            return False
    
    async def test_cms_content_structure(self) -> bool:
        """Test 3: CMS Content Structure - Content API, course categories, learning paths"""
        logger.info("🔍 Testing CMS Content Structure...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status != 200:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
                
                data = await response.json()
                content = data.get("content", {})
                
                # Check required CMS sections
                required_sections = ["courses", "institute", "branding", "pages", "courseCategories", "learningPaths"]
                missing_sections = [section for section in required_sections if section not in content]
                
                if missing_sections:
                    self.errors.append(f"Missing CMS sections: {missing_sections}")
                    return False
                
                logger.info("✅ All required CMS sections present")
                
                # Verify course categories
                course_categories = content.get("courseCategories", {})
                if not course_categories:
                    self.errors.append("Course categories not found or empty")
                else:
                    logger.info(f"✅ Found {len(course_categories)} course categories")
                
                # Verify learning paths
                learning_paths = content.get("learningPaths", {})
                if not learning_paths:
                    self.errors.append("Learning paths not found or empty")
                else:
                    logger.info(f"✅ Found {len(learning_paths)} learning paths")
                
                # Test individual course endpoints
                courses = content.get("courses", [])
                if courses:
                    test_course = courses[0]
                    slug = test_course.get("slug")
                    if slug:
                        async with self.session.get(f"{self.api_base}/courses/{slug}") as course_response:
                            if course_response.status == 200:
                                logger.info("✅ Individual course endpoints working")
                            else:
                                self.errors.append(f"Individual course endpoint failed for {slug}")
                                return False
                
                self.test_results["cms_content_structure"] = True
                return True
                
        except Exception as e:
            self.errors.append(f"CMS content structure test failed: {str(e)}")
            logger.error(f"❌ CMS content structure test failed: {e}")
            return False
    
    async def test_admin_functions(self) -> bool:
        """Test 4: Admin Functions - Authentication, content updates, lead management"""
        logger.info("🔍 Testing Admin Functions...")
        try:
            # Test admin authentication
            login_data = {"password": "grras@admin2024"}  # Updated password from review
            
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("token")
                    
                    if self.admin_token:
                        logger.info("✅ Admin authentication successful")
                    else:
                        self.errors.append("Admin login successful but no token received")
                        return False
                else:
                    # Try fallback password
                    login_data = {"password": "grras-admin"}
                    async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as fallback_response:
                        if fallback_response.status == 200:
                            data = await fallback_response.json()
                            self.admin_token = data.get("token")
                            logger.info("✅ Admin authentication successful (fallback password)")
                        else:
                            self.errors.append(f"Admin authentication failed with both passwords")
                            return False
            
            # Test lead management (admin only)
            if self.admin_token:
                headers = {"Authorization": f"Bearer {self.admin_token}"}
                
                async with self.session.get(f"{self.api_base}/leads", headers=headers) as leads_response:
                    if leads_response.status == 200:
                        leads_data = await leads_response.json()
                        leads_count = len(leads_data.get("leads", []))
                        logger.info(f"✅ Lead management working - {leads_count} leads found")
                    else:
                        self.errors.append(f"Lead management failed with status {leads_response.status}")
                        return False
            
            self.test_results["admin_functions"] = True
            return True
            
        except Exception as e:
            self.errors.append(f"Admin functions test failed: {str(e)}")
            logger.error(f"❌ Admin functions test failed: {e}")
            return False
    
    async def test_quality_verification(self) -> bool:
        """Test 5: Quality Verification - No broken data, proper categorization, pricing, SEO"""
        logger.info("🔍 Testing Quality Verification...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status != 200:
                    self.errors.append("Cannot get courses for quality verification")
                    return False
                
                data = await response.json()
                courses = data.get("courses", [])
                
                quality_issues = []
                
                for course in courses:
                    course_title = course.get("title", "Unknown")
                    
                    # Check for broken course data
                    if not course.get("slug"):
                        quality_issues.append(f"{course_title}: Missing slug")
                    
                    # Check proper categorization
                    category = course.get("category")
                    if not category:
                        quality_issues.append(f"{course_title}: Missing category")
                    
                    # Check pricing format
                    fees = course.get("fees")
                    if fees:
                        fees_str = str(fees)
                        if not any(symbol in fees_str for symbol in ['₹', 'Rs', 'INR']) and any(char.isdigit() for char in fees_str):
                            quality_issues.append(f"{course_title}: Pricing format needs currency symbol")
                    
                    # Check duration format
                    duration = course.get("duration")
                    if not duration:
                        quality_issues.append(f"{course_title}: Missing duration")
                    
                    # Check SEO fields (title should be present, description/overview)
                    if not course.get("description") and not course.get("overview"):
                        quality_issues.append(f"{course_title}: Missing description/overview for SEO")
                
                if quality_issues:
                    logger.warning(f"⚠️ Found {len(quality_issues)} quality issues:")
                    for issue in quality_issues[:10]:  # Show first 10
                        logger.warning(f"  - {issue}")
                    
                    # Only fail if there are critical quality issues
                    critical_issues = [issue for issue in quality_issues if "Missing slug" in issue or "Missing category" in issue]
                    if critical_issues:
                        self.errors.extend(critical_issues)
                        return False
                
                logger.info("✅ Quality verification passed (no critical issues)")
                self.test_results["quality_verification"] = True
                return True
                
        except Exception as e:
            self.errors.append(f"Quality verification test failed: {str(e)}")
            logger.error(f"❌ Quality verification test failed: {e}")
            return False
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all duplicate cleanup verification tests"""
        logger.info("🚀 Starting GRRAS Solutions Backend Test - Post Duplicate Course Cleanup Verification...")
        
        await self.setup_session()
        
        try:
            # Test sequence based on review requirements
            tests = [
                ("Core API Health", self.test_core_api_health),
                ("Course Data Integrity", self.test_course_data_integrity),
                ("CMS Content Structure", self.test_cms_content_structure),
                ("Admin Functions", self.test_admin_functions),
                ("Quality Verification", self.test_quality_verification),
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
                "test_focus": "Post Duplicate Course Cleanup Verification",
                "backend_url": self.backend_url,
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{success_rate:.1f}%",
                "test_results": self.test_results,
                "course_analysis": self.course_analysis,
                "errors": self.errors,
                "critical_issues": self._identify_critical_issues(),
                "review_requirements_met": self._check_review_requirements()
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
        
        if not self.test_results["course_count_verification"]:
            critical_issues.append("Course count is not 14 as expected after cleanup")
        
        if not self.test_results["duplicate_removal_verification"]:
            critical_issues.append("Test courses were not properly removed")
        
        if not self.test_results["production_courses_integrity"]:
            critical_issues.append("Production course data integrity issues detected")
        
        return critical_issues
    
    def _check_review_requirements(self) -> Dict[str, bool]:
        """Check if all review requirements are met"""
        return {
            "core_api_health": self.test_results["server_health"] and self.test_results["mongodb_connection"],
            "course_data_integrity": (
                self.test_results["course_count_verification"] and 
                self.test_results["duplicate_removal_verification"] and
                self.test_results["production_courses_integrity"]
            ),
            "cms_content_structure": self.test_results["cms_content_structure"],
            "admin_functions": self.test_results["admin_functions"],
            "quality_verification": self.test_results["quality_verification"]
        }
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print comprehensive test summary"""
        print(f"\n{'='*70}")
        print("🎯 GRRAS SOLUTIONS BACKEND TEST - DUPLICATE CLEANUP VERIFICATION")
        print(f"{'='*70}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 REVIEW REQUIREMENTS STATUS:")
        requirements = summary['review_requirements_met']
        for req_name, status in requirements.items():
            status_icon = "✅" if status else "❌"
            print(f"  {req_name}: {status_icon}")
        
        print(f"\n📊 COURSE ANALYSIS:")
        if summary['course_analysis']:
            analysis = summary['course_analysis']
            print(f"  Total Courses: {analysis['total_courses']} (Expected: {analysis['expected_courses']})")
            print(f"  Test Courses Removed: {'✅' if analysis['test_courses_removed'] else '❌'}")
            print(f"  Duplicate Slugs: {analysis['duplicate_slugs']}")
            print(f"  Duplicate Titles: {analysis['duplicate_titles']}")
            print(f"  Courses with Required Fields: {analysis['courses_with_required_fields']}/{analysis['total_courses']}")
            print(f"  Courses with Enhanced Fields: {analysis['courses_with_enhanced_fields']}/{analysis['total_courses']}")
        
        print(f"\n📊 DETAILED TEST RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES:")
            for issue in summary['critical_issues']:
                print(f"  • {issue}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors'][:10]:  # Show first 10 errors
                print(f"  • {error}")
            if len(summary['errors']) > 10:
                print(f"  ... and {len(summary['errors']) - 10} more errors")
        
        # Overall assessment
        all_requirements_met = all(summary['review_requirements_met'].values())
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if all_requirements_met and not summary['critical_issues']:
            print("  ✅ EXCELLENT - All review requirements met, backend ready for production")
        elif summary['critical_issues']:
            print("  ❌ CRITICAL ISSUES - Backend needs immediate attention")
        else:
            print("  ⚠️ MINOR ISSUES - Backend functional but needs improvements")
        
        print(f"\n{'='*70}")

async def main():
    """Main test execution"""
    tester = DuplicateCleanupTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/duplicate_cleanup_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        return summary
        
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return None

if __name__ == "__main__":
    asyncio.run(main())
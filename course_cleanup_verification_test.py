#!/usr/bin/env python3
"""
Course Cleanup Verification Test for GRRAS Solutions Training Institute
Verifies that production course cleanup has been completed successfully
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

class CourseCleanupVerificationTester:
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
            "courses_cleanup_verified": False,
            "cms_content_courses_empty": False,
            "admin_authentication": False,
            "categories_structure_intact": False,
            "database_integrity": False,
            "system_ready_for_fresh_start": False
        }
        
        self.errors = []
        self.courses_found = []
        self.categories_data = {}
        
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
    
    async def test_courses_cleanup_verification(self) -> bool:
        """Test 2: Verify courses have been cleaned up (should return empty array)"""
        logger.info("🔍 Testing courses cleanup verification...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    logger.info(f"📊 Found {len(courses)} courses in /api/courses endpoint")
                    
                    if len(courses) == 0:
                        logger.info("✅ COURSES CLEANUP VERIFIED: No courses found - cleanup successful!")
                        self.test_results["courses_cleanup_verified"] = True
                        return True
                    else:
                        logger.error(f"❌ COURSES CLEANUP NOT PERFORMED: {len(courses)} courses still present")
                        self.courses_found = courses
                        
                        # Log details of courses still present
                        for i, course in enumerate(courses[:10], 1):  # Show first 10
                            title = course.get("title", "Unknown")
                            slug = course.get("slug", "unknown")
                            logger.error(f"   {i}. {title} - {slug}")
                        
                        if len(courses) > 10:
                            logger.error(f"   ... and {len(courses) - 10} more courses")
                        
                        self.errors.append(f"Course cleanup was not performed - {len(courses)} courses still present")
                        return False
                else:
                    self.errors.append(f"Courses endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Courses cleanup verification failed: {str(e)}")
            logger.error(f"❌ Courses cleanup verification failed: {e}")
            return False
    
    async def test_cms_content_courses_empty(self) -> bool:
        """Test 3: Verify CMS content shows courses array is empty"""
        logger.info("🔍 Testing CMS content courses array...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    courses = content.get("courses", [])
                    
                    logger.info(f"📊 Found {len(courses)} courses in CMS content")
                    
                    if len(courses) == 0:
                        logger.info("✅ CMS CONTENT VERIFIED: Courses array is empty in CMS")
                        self.test_results["cms_content_courses_empty"] = True
                        return True
                    else:
                        logger.error(f"❌ CMS CONTENT NOT CLEANED: {len(courses)} courses still in CMS")
                        self.errors.append(f"CMS content still has {len(courses)} courses")
                        return False
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"CMS content verification failed: {str(e)}")
            logger.error(f"❌ CMS content verification failed: {e}")
            return False
    
    async def test_admin_authentication(self) -> bool:
        """Test 4: Verify admin can still login for adding new courses"""
        logger.info("🔍 Testing admin authentication...")
        try:
            # Test login with password from backend .env
            login_data = {"password": "grras-admin"}
            
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("token")
                    
                    if self.admin_token:
                        logger.info("✅ ADMIN AUTHENTICATION VERIFIED: Admin can login for course management")
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
    
    async def test_categories_structure_intact(self) -> bool:
        """Test 5: Verify courseCategories are intact but have empty courses arrays"""
        logger.info("🔍 Testing courseCategories structure...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    course_categories = content.get("courseCategories", {})
                    
                    if not course_categories:
                        logger.warning("⚠️ No courseCategories found in CMS content")
                        self.errors.append("courseCategories structure not found")
                        return False
                    
                    logger.info(f"📊 Found {len(course_categories)} course categories")
                    self.categories_data = course_categories
                    
                    # Check each category has empty courses array
                    all_categories_empty = True
                    for category_key, category_data in course_categories.items():
                        if isinstance(category_data, dict):
                            courses_in_category = category_data.get("courses", [])
                            logger.info(f"   Category '{category_key}': {len(courses_in_category)} courses")
                            
                            if len(courses_in_category) > 0:
                                all_categories_empty = False
                                logger.error(f"   ❌ Category '{category_key}' still has {len(courses_in_category)} courses")
                        else:
                            logger.warning(f"   ⚠️ Category '{category_key}' has invalid structure")
                    
                    if all_categories_empty:
                        logger.info("✅ CATEGORIES STRUCTURE VERIFIED: All categories have empty courses arrays")
                        self.test_results["categories_structure_intact"] = True
                        return True
                    else:
                        self.errors.append("Some categories still have courses")
                        return False
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Categories structure verification failed: {str(e)}")
            logger.error(f"❌ Categories structure verification failed: {e}")
            return False
    
    async def test_database_integrity(self) -> bool:
        """Test 6: Verify other content (institute, courseCategories, etc.) is still intact"""
        logger.info("🔍 Testing database integrity...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    # Check essential sections are still present
                    required_sections = ["institute", "courseCategories", "learningPaths"]
                    intact_sections = []
                    missing_sections = []
                    
                    for section in required_sections:
                        if section in content and content[section]:
                            intact_sections.append(section)
                            logger.info(f"   ✅ {section}: Present and intact")
                        else:
                            missing_sections.append(section)
                            logger.error(f"   ❌ {section}: Missing or empty")
                    
                    # Check institute data specifically
                    institute = content.get("institute", {})
                    if institute and institute.get("name"):
                        logger.info(f"   ✅ Institute name: {institute.get('name')}")
                        logger.info(f"   ✅ Institute contact: {institute.get('contact', {}).get('email', 'N/A')}")
                    
                    # Check courseCategories data
                    course_categories = content.get("courseCategories", {})
                    if course_categories:
                        logger.info(f"   ✅ Course categories: {len(course_categories)} categories found")
                    
                    # Check learningPaths structure
                    learning_paths = content.get("learningPaths", {})
                    if learning_paths is not None:  # Can be empty dict
                        logger.info(f"   ✅ Learning paths structure: {len(learning_paths)} paths found")
                    
                    if not missing_sections:
                        logger.info("✅ DATABASE INTEGRITY VERIFIED: All core content intact")
                        self.test_results["database_integrity"] = True
                        return True
                    else:
                        self.errors.append(f"Missing essential sections: {missing_sections}")
                        return False
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Database integrity verification failed: {str(e)}")
            logger.error(f"❌ Database integrity verification failed: {e}")
            return False
    
    async def test_system_ready_for_fresh_start(self) -> bool:
        """Test 7: Verify system is ready for user to add courses via admin panel"""
        logger.info("🔍 Testing system readiness for fresh start...")
        
        # This test passes if all previous tests passed
        if (self.test_results["courses_cleanup_verified"] and 
            self.test_results["cms_content_courses_empty"] and
            self.test_results["admin_authentication"] and
            self.test_results["categories_structure_intact"] and
            self.test_results["database_integrity"]):
            
            logger.info("✅ SYSTEM READY FOR FRESH START: All cleanup verification passed")
            self.test_results["system_ready_for_fresh_start"] = True
            return True
        else:
            logger.error("❌ SYSTEM NOT READY: Some cleanup verification failed")
            self.errors.append("System not ready for fresh start - cleanup incomplete")
            return False
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all course cleanup verification tests"""
        logger.info("🚀 Starting course cleanup verification testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("Server Health Check", self.test_server_health),
                ("Courses Cleanup Verification", self.test_courses_cleanup_verification),
                ("CMS Content Courses Empty", self.test_cms_content_courses_empty),
                ("Admin Authentication", self.test_admin_authentication),
                ("Categories Structure Intact", self.test_categories_structure_intact),
                ("Database Integrity", self.test_database_integrity),
                ("System Ready for Fresh Start", self.test_system_ready_for_fresh_start),
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
                "courses_found": len(self.courses_found),
                "courses_details": self.courses_found[:10] if self.courses_found else [],
                "categories_count": len(self.categories_data),
                "cleanup_status": "COMPLETED" if self.test_results["courses_cleanup_verified"] else "NOT PERFORMED",
                "critical_issues": self._identify_critical_issues()
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _identify_critical_issues(self) -> List[str]:
        """Identify critical issues that block functionality"""
        critical_issues = []
        
        if not self.test_results["server_health"]:
            critical_issues.append("FastAPI server is not responding")
        
        if not self.test_results["courses_cleanup_verified"]:
            critical_issues.append("Course cleanup was not performed - courses still present")
        
        if not self.test_results["admin_authentication"]:
            critical_issues.append("Admin authentication failed - cannot manage courses")
        
        if not self.test_results["database_integrity"]:
            critical_issues.append("Database integrity compromised - core content missing")
        
        return critical_issues
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*70}")
        print("🎯 COURSE CLEANUP VERIFICATION SUMMARY")
        print(f"{'='*70}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 CLEANUP STATUS: {summary['cleanup_status']}")
        if summary['cleanup_status'] == "NOT PERFORMED":
            print(f"   ❌ {summary['courses_found']} courses still present in system")
            if summary['courses_details']:
                print(f"   📋 Courses still present:")
                for course in summary['courses_details']:
                    title = course.get('title', 'Unknown')
                    slug = course.get('slug', 'unknown')
                    print(f"      • {title} ({slug})")
        else:
            print(f"   ✅ Course cleanup completed successfully")
        
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
        
        print(f"\n🎯 SYSTEM STATUS:")
        if summary['test_results']['system_ready_for_fresh_start']:
            print("  ✅ System is ready for users to add fresh courses")
            print("  ✅ Admin panel is functional for course management")
            print("  ✅ Database integrity maintained")
        else:
            print("  ❌ System is NOT ready for fresh start")
            print("  ❌ Course cleanup needs to be completed")
        
        print(f"\n{'='*70}")

async def main():
    """Main test execution"""
    tester = CourseCleanupVerificationTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/course_cleanup_verification_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        # Exit with appropriate code
        if summary['cleanup_status'] == "NOT PERFORMED":
            print(f"\n🚨 COURSE CLEANUP NOT PERFORMED - Action required!")
            sys.exit(1)
        elif summary['success_rate'] == "100.0%":
            print(f"\n🎉 COURSE CLEANUP VERIFIED - System ready for fresh start!")
            sys.exit(0)
        else:
            print(f"\n⚠️ SOME TESTS FAILED - System has issues")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
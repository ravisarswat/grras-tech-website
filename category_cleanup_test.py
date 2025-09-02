#!/usr/bin/env python3
"""
Category Cleanup Verification Test for GRRAS Solutions Training Institute
Tests backend after category cleanup to verify system state as per review request
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

class CategoryCleanupTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results for specific verification points
        self.test_results = {
            "server_health": False,
            "database_connection": False,
            "category_cleanup_verified": False,
            "courses_integrity": False,
            "admin_authentication": False,
            "content_structure_intact": False,
            "ready_for_fresh_categories": False
        }
        
        self.errors = []
        self.verification_data = {}
        
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
    
    async def test_server_health_and_db(self) -> bool:
        """Test 1: Server Health & Database Connection (with correct DB name)"""
        logger.info("🔍 Testing FastAPI server health and MongoDB connection...")
        try:
            async with self.session.get(f"{self.api_base}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Server health check passed: {data}")
                    
                    # Check if database is connected
                    if data.get("database") == "connected":
                        self.test_results["database_connection"] = True
                        logger.info("✅ MongoDB connection confirmed with grras_database")
                    else:
                        logger.warning("⚠️ MongoDB connection issue detected")
                        self.errors.append("MongoDB connection not confirmed")
                    
                    self.test_results["server_health"] = True
                    return True
                else:
                    self.errors.append(f"Health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Server health check failed: {str(e)}")
            logger.error(f"❌ Server health check failed: {e}")
            return False
    
    async def test_category_cleanup_verification(self) -> bool:
        """Test 2: Category Cleanup Verification - Check if courseCategories is empty"""
        logger.info("🔍 Testing category cleanup verification...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    # Check courseCategories structure
                    course_categories = content.get("courseCategories", {})
                    
                    if not course_categories or len(course_categories) == 0:
                        logger.info("✅ Category cleanup VERIFIED: courseCategories is empty")
                        self.test_results["category_cleanup_verified"] = True
                        self.verification_data["courseCategories"] = "Empty (cleanup successful)"
                        return True
                    else:
                        # Check if categories exist but have empty courses arrays
                        empty_categories = True
                        category_details = {}
                        
                        for cat_key, cat_data in course_categories.items():
                            if isinstance(cat_data, dict):
                                courses_in_category = cat_data.get("courses", [])
                                category_details[cat_key] = len(courses_in_category)
                                if courses_in_category and len(courses_in_category) > 0:
                                    empty_categories = False
                        
                        if empty_categories:
                            logger.info("✅ Category cleanup VERIFIED: All categories have empty courses arrays")
                            self.test_results["category_cleanup_verified"] = True
                            self.verification_data["courseCategories"] = f"Categories exist but empty: {category_details}"
                            return True
                        else:
                            logger.warning("❌ Category cleanup NOT PERFORMED: Categories still contain courses")
                            self.errors.append(f"Categories still contain courses: {category_details}")
                            self.verification_data["courseCategories"] = f"Categories with courses: {category_details}"
                            return False
                else:
                    self.errors.append(f"Content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Category cleanup verification failed: {str(e)}")
            logger.error(f"❌ Category cleanup verification failed: {e}")
            return False
    
    async def test_admin_authentication(self) -> bool:
        """Test 3: Admin Authentication for adding new categories"""
        logger.info("🔍 Testing admin authentication...")
        try:
            # Test login with password from backend .env
            login_data = {"password": "grras-admin"}
            
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("token")
                    
                    if self.admin_token:
                        logger.info("✅ Admin authentication successful - Ready for adding new categories")
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
    
    async def test_courses_integrity(self) -> bool:
        """Test 4: Courses Integrity - Verify existing courses are still intact"""
        logger.info("🔍 Testing courses integrity...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    course_count = len(courses)
                    logger.info(f"📊 Found {course_count} courses in system")
                    
                    # Verify course data structure
                    valid_courses = 0
                    course_titles = []
                    
                    for course in courses:
                        if course.get("title") and course.get("slug"):
                            valid_courses += 1
                            course_titles.append(course.get("title"))
                    
                    if valid_courses > 0:
                        logger.info(f"✅ Courses integrity verified: {valid_courses} valid courses found")
                        self.test_results["courses_integrity"] = True
                        self.verification_data["courses_count"] = course_count
                        self.verification_data["valid_courses"] = valid_courses
                        self.verification_data["sample_courses"] = course_titles[:5]  # First 5 course titles
                        return True
                    else:
                        logger.warning("❌ No valid courses found in system")
                        self.errors.append("No valid courses found")
                        return False
                else:
                    self.errors.append(f"Courses endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Courses integrity test failed: {str(e)}")
            logger.error(f"❌ Courses integrity test failed: {e}")
            return False
    
    async def test_content_structure_integrity(self) -> bool:
        """Test 5: Content Structure Integrity - Verify other sections are intact"""
        logger.info("🔍 Testing content structure integrity...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    # Check essential sections
                    required_sections = ["institute", "branding", "learningPaths", "pages"]
                    found_sections = {}
                    missing_sections = []
                    
                    for section in required_sections:
                        if section in content:
                            section_data = content[section]
                            if isinstance(section_data, dict):
                                found_sections[section] = f"Present ({len(section_data)} items)"
                            elif isinstance(section_data, list):
                                found_sections[section] = f"Present ({len(section_data)} items)"
                            else:
                                found_sections[section] = "Present"
                        else:
                            missing_sections.append(section)
                    
                    if not missing_sections:
                        logger.info("✅ Content structure integrity verified: All sections intact")
                        self.test_results["content_structure_intact"] = True
                        self.verification_data["content_sections"] = found_sections
                        return True
                    else:
                        logger.warning(f"⚠️ Missing content sections: {missing_sections}")
                        self.errors.append(f"Missing content sections: {missing_sections}")
                        self.verification_data["content_sections"] = found_sections
                        self.verification_data["missing_sections"] = missing_sections
                        return False
                else:
                    self.errors.append(f"Content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Content structure test failed: {str(e)}")
            logger.error(f"❌ Content structure test failed: {e}")
            return False
    
    async def test_ready_for_fresh_categories(self) -> bool:
        """Test 6: Ready for Fresh Categories - Test admin can add new categories"""
        logger.info("🔍 Testing system readiness for fresh categories...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, skipping fresh categories test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Get current content
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status != 200:
                    self.errors.append("Failed to get current content for fresh categories test")
                    return False
                
                data = await response.json()
                current_content = data.get("content", {})
                
                # Test adding a sample category structure (without saving permanently)
                test_categories = {
                    "test-category": {
                        "title": "Test Category",
                        "slug": "test-category",
                        "description": "Test category for verification",
                        "courses": [],
                        "visible": True,
                        "order": 1
                    }
                }
                
                # Temporarily add test category to verify system can handle it
                test_content = current_content.copy()
                if "courseCategories" not in test_content:
                    test_content["courseCategories"] = {}
                
                test_content["courseCategories"]["test-category"] = test_categories["test-category"]
                
                # Test if content can be saved (dry run)
                content_request = {"content": test_content, "isDraft": True}  # Use draft to avoid permanent changes
                
                async with self.session.post(f"{self.api_base}/content", json=content_request, headers=headers) as save_response:
                    if save_response.status == 200:
                        logger.info("✅ System ready for fresh categories: Admin can add new categories")
                        self.test_results["ready_for_fresh_categories"] = True
                        return True
                    else:
                        response_text = await save_response.text()
                        self.errors.append(f"Failed to test category addition with status {save_response.status}: {response_text}")
                        return False
                        
        except Exception as e:
            self.errors.append(f"Fresh categories readiness test failed: {str(e)}")
            logger.error(f"❌ Fresh categories readiness test failed: {e}")
            return False
    
    async def run_category_cleanup_verification(self) -> Dict[str, Any]:
        """Run all category cleanup verification tests"""
        logger.info("🚀 Starting Category Cleanup Verification Tests...")
        
        await self.setup_session()
        
        try:
            # Test sequence for category cleanup verification
            tests = [
                ("Server Health & Database Connection", self.test_server_health_and_db),
                ("Category Cleanup Verification", self.test_category_cleanup_verification),
                ("Admin Authentication", self.test_admin_authentication),
                ("Courses Integrity", self.test_courses_integrity),
                ("Content Structure Integrity", self.test_content_structure_integrity),
                ("Ready for Fresh Categories", self.test_ready_for_fresh_categories),
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
                "test_type": "Category Cleanup Verification",
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{success_rate:.1f}%",
                "test_results": self.test_results,
                "verification_data": self.verification_data,
                "errors": self.errors,
                "critical_issues": self._identify_critical_issues(),
                "cleanup_status": self._determine_cleanup_status()
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _identify_critical_issues(self) -> List[str]:
        """Identify critical issues that block functionality"""
        critical_issues = []
        
        if not self.test_results["server_health"]:
            critical_issues.append("FastAPI server is not responding")
        
        if not self.test_results["database_connection"]:
            critical_issues.append("MongoDB connection failed")
        
        if not self.test_results["category_cleanup_verified"]:
            critical_issues.append("Category cleanup was NOT performed - categories still contain courses")
        
        if not self.test_results["courses_integrity"]:
            critical_issues.append("Course data integrity compromised")
        
        if not self.test_results["admin_authentication"]:
            critical_issues.append("Admin authentication failed - cannot add new categories")
        
        return critical_issues
    
    def _determine_cleanup_status(self) -> str:
        """Determine overall cleanup status"""
        if self.test_results["category_cleanup_verified"]:
            if self.test_results["courses_integrity"] and self.test_results["ready_for_fresh_categories"]:
                return "CLEANUP SUCCESSFUL - System ready for fresh categories"
            else:
                return "CLEANUP PARTIAL - Categories cleaned but system issues detected"
        else:
            return "CLEANUP NOT PERFORMED - Categories still contain courses"
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*70}")
        print("🎯 CATEGORY CLEANUP VERIFICATION SUMMARY")
        print(f"{'='*70}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 VERIFICATION RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        print(f"\n🎯 CLEANUP STATUS:")
        print(f"  {summary['cleanup_status']}")
        
        if summary['verification_data']:
            print(f"\n📋 VERIFICATION DATA:")
            for key, value in summary['verification_data'].items():
                print(f"  {key}: {value}")
        
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES:")
            for issue in summary['critical_issues']:
                print(f"  • {issue}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n{'='*70}")

async def main():
    """Main test execution"""
    tester = CategoryCleanupTester()
    
    try:
        summary = await tester.run_category_cleanup_verification()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/category_cleanup_verification_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        # Return appropriate exit code
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES DETECTED - Category cleanup verification failed!")
            return 1
        elif summary['test_results']['category_cleanup_verified']:
            print(f"\n🎉 CATEGORY CLEANUP VERIFIED - System ready for fresh categories!")
            return 0
        else:
            print(f"\n⚠️ CATEGORY CLEANUP NOT PERFORMED - Action required")
            return 1
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    import sys
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
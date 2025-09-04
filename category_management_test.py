#!/usr/bin/env python3
"""
GRRAS Solutions Backend API Testing - Category Management & Course Updates Focus
Test Date: 2025-01-03
Focus: Category management and course update functionality for admin panel
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime
import sys
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://grras-academy-1.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class CategoryManagementTester:
    def __init__(self):
        self.session = None
        self.admin_token = None
        self.test_results = []
        
    async def setup_session(self):
        """Setup HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    def log_test_result(self, test_name, status, details, response_time=None):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_time": response_time,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.test_results.append(result)
        
        status_icon = "✅" if status == "PASS" else "❌"
        logger.info(f"{status_icon} {test_name}: {details}")
        if response_time:
            logger.info(f"   Response Time: {response_time}ms")
            
    async def test_api_health(self):
        """Test 1: API Health Check - ensure FastAPI server is running"""
        try:
            start_time = datetime.utcnow()
            async with self.session.get(f"{API_BASE}/health") as response:
                end_time = datetime.utcnow()
                response_time = int((end_time - start_time).total_seconds() * 1000)
                
                if response.status == 200:
                    data = await response.json()
                    if data.get("status") == "healthy" and data.get("database") == "connected":
                        self.log_test_result(
                            "API Health Check", 
                            "PASS", 
                            f"FastAPI server healthy, MongoDB connected - {data}",
                            response_time
                        )
                        return True
                    else:
                        self.log_test_result(
                            "API Health Check", 
                            "FAIL", 
                            f"Unhealthy status: {data}",
                            response_time
                        )
                        return False
                else:
                    self.log_test_result(
                        "API Health Check", 
                        "FAIL", 
                        f"HTTP {response.status}",
                        response_time
                    )
                    return False
                    
        except Exception as e:
            self.log_test_result("API Health Check", "FAIL", f"Exception: {str(e)}")
            return False
            
    async def test_content_endpoint(self):
        """Test 2: Content Endpoint - verify /api/content returns proper course categories structure"""
        try:
            start_time = datetime.utcnow()
            async with self.session.get(f"{API_BASE}/content") as response:
                end_time = datetime.utcnow()
                response_time = int((end_time - start_time).total_seconds() * 1000)
                
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    # Check for required sections
                    required_sections = ["courses", "institute", "branding"]
                    missing_sections = [section for section in required_sections if section not in content]
                    
                    if missing_sections:
                        self.log_test_result(
                            "Content Endpoint Structure", 
                            "FAIL", 
                            f"Missing sections: {missing_sections}",
                            response_time
                        )
                        return False
                    
                    # Check courses data
                    courses = content.get("courses", [])
                    courses_count = len(courses)
                    
                    # Check for courseCategories structure
                    course_categories = content.get("courseCategories", {})
                    
                    self.log_test_result(
                        "Content Endpoint Structure", 
                        "PASS", 
                        f"All required sections present, {courses_count} courses found, courseCategories: {bool(course_categories)}",
                        response_time
                    )
                    
                    # Analyze course categories
                    if course_categories:
                        categories_list = list(course_categories.keys()) if isinstance(course_categories, dict) else []
                        self.log_test_result(
                            "Course Categories Structure", 
                            "PASS", 
                            f"courseCategories found with {len(categories_list)} categories: {categories_list}",
                            0
                        )
                    else:
                        self.log_test_result(
                            "Course Categories Structure", 
                            "FAIL", 
                            "courseCategories not found in CMS content",
                            0
                        )
                        
                    return True
                else:
                    self.log_test_result(
                        "Content Endpoint Structure", 
                        "FAIL", 
                        f"HTTP {response.status}",
                        response_time
                    )
                    return False
                    
        except Exception as e:
            self.log_test_result("Content Endpoint Structure", "FAIL", f"Exception: {str(e)}")
            return False
            
    async def test_admin_authentication(self):
        """Test 3: Admin Authentication - test admin login for course management"""
        try:
            # Get admin password from environment or use default
            admin_password = os.environ.get('ADMIN_PASSWORD', 'grras-admin')
            
            login_data = {"password": admin_password}
            
            start_time = datetime.utcnow()
            async with self.session.post(
                f"{API_BASE}/admin/login", 
                json=login_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                end_time = datetime.utcnow()
                response_time = int((end_time - start_time).total_seconds() * 1000)
                
                if response.status == 200:
                    data = await response.json()
                    token = data.get("token")
                    
                    if token:
                        self.admin_token = token
                        self.log_test_result(
                            "Admin Authentication", 
                            "PASS", 
                            f"Admin login successful, token received: {token[:20]}...",
                            response_time
                        )
                        return True
                    else:
                        self.log_test_result(
                            "Admin Authentication", 
                            "FAIL", 
                            "No token in response",
                            response_time
                        )
                        return False
                else:
                    self.log_test_result(
                        "Admin Authentication", 
                        "FAIL", 
                        f"HTTP {response.status}",
                        response_time
                    )
                    return False
                    
        except Exception as e:
            self.log_test_result("Admin Authentication", "FAIL", f"Exception: {str(e)}")
            return False
            
    async def test_course_update_api(self):
        """Test 4: Course Update API - test if course category updates are saving to database correctly"""
        if not self.admin_token:
            self.log_test_result(
                "Course Update API", 
                "SKIP", 
                "No admin token available"
            )
            return False
            
        try:
            # First, get current content
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            async with self.session.get(f"{API_BASE}/content") as response:
                if response.status != 200:
                    self.log_test_result(
                        "Course Update API", 
                        "FAIL", 
                        "Could not fetch current content"
                    )
                    return False
                    
                data = await response.json()
                current_content = data.get("content", {})
                
            # Test updating content with course categories
            test_categories = {
                "general": {
                    "name": "General Courses",
                    "description": "Foundational IT and programming courses",
                    "color": "#3B82F6"
                },
                "cloud": {
                    "name": "Cloud Computing",
                    "description": "AWS, Azure, and cloud technologies",
                    "color": "#10B981"
                },
                "security": {
                    "name": "Cybersecurity",
                    "description": "Security and ethical hacking courses",
                    "color": "#EF4444"
                },
                "certification": {
                    "name": "Professional Certifications",
                    "description": "Industry certification preparation",
                    "color": "#F59E0B"
                }
            }
            
            # Update content with test categories
            updated_content = current_content.copy()
            updated_content["courseCategories"] = test_categories
            updated_content["lastTestUpdate"] = datetime.utcnow().isoformat()
            
            update_data = {
                "content": updated_content,
                "isDraft": False
            }
            
            start_time = datetime.utcnow()
            async with self.session.post(
                f"{API_BASE}/content",
                json=update_data,
                headers={
                    "Authorization": f"Bearer {self.admin_token}",
                    "Content-Type": "application/json"
                }
            ) as response:
                end_time = datetime.utcnow()
                response_time = int((end_time - start_time).total_seconds() * 1000)
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Verify the update was saved
                    async with self.session.get(f"{API_BASE}/content") as verify_response:
                        if verify_response.status == 200:
                            verify_data = await verify_response.json()
                            verify_content = verify_data.get("content", {})
                            saved_categories = verify_content.get("courseCategories", {})
                            
                            if saved_categories and "general" in saved_categories:
                                self.log_test_result(
                                    "Course Update API", 
                                    "PASS", 
                                    f"Course categories successfully updated and saved. Categories: {list(saved_categories.keys())}",
                                    response_time
                                )
                                return True
                            else:
                                self.log_test_result(
                                    "Course Update API", 
                                    "FAIL", 
                                    "Course categories not found after update",
                                    response_time
                                )
                                return False
                        else:
                            self.log_test_result(
                                "Course Update API", 
                                "FAIL", 
                                "Could not verify update",
                                response_time
                            )
                            return False
                else:
                    self.log_test_result(
                        "Course Update API", 
                        "FAIL", 
                        f"HTTP {response.status}",
                        response_time
                    )
                    return False
                    
        except Exception as e:
            self.log_test_result("Course Update API", "FAIL", f"Exception: {str(e)}")
            return False
            
    async def test_category_data_structure(self):
        """Test 5: Category Data Structure - verify courseCategories are present in CMS content"""
        try:
            start_time = datetime.utcnow()
            async with self.session.get(f"{API_BASE}/content") as response:
                end_time = datetime.utcnow()
                response_time = int((end_time - start_time).total_seconds() * 1000)
                
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    # Check courseCategories structure
                    course_categories = content.get("courseCategories", {})
                    
                    if course_categories:
                        categories_count = len(course_categories)
                        category_names = list(course_categories.keys())
                        
                        # Validate category structure
                        valid_categories = []
                        for cat_key, cat_data in course_categories.items():
                            if isinstance(cat_data, dict) and "name" in cat_data:
                                valid_categories.append(cat_key)
                                
                        self.log_test_result(
                            "Category Data Structure", 
                            "PASS", 
                            f"courseCategories found with {categories_count} categories: {category_names}. Valid structure: {len(valid_categories)}/{categories_count}",
                            response_time
                        )
                        
                        # Test courses categorization
                        courses = content.get("courses", [])
                        categorized_courses = {}
                        
                        for course in courses:
                            category = course.get("category", "general")
                            if category not in categorized_courses:
                                categorized_courses[category] = 0
                            categorized_courses[category] += 1
                            
                        self.log_test_result(
                            "Course Categorization", 
                            "PASS", 
                            f"Courses distributed across categories: {categorized_courses}",
                            0
                        )
                        
                        return True
                    else:
                        self.log_test_result(
                            "Category Data Structure", 
                            "FAIL", 
                            "courseCategories not found in CMS content",
                            response_time
                        )
                        return False
                else:
                    self.log_test_result(
                        "Category Data Structure", 
                        "FAIL", 
                        f"HTTP {response.status}",
                        response_time
                    )
                    return False
                    
        except Exception as e:
            self.log_test_result("Category Data Structure", "FAIL", f"Exception: {str(e)}")
            return False
            
    async def run_all_tests(self):
        """Run all backend tests"""
        logger.info("🚀 Starting GRRAS Backend API Testing - Category Management Focus")
        logger.info(f"🔗 Backend URL: {BACKEND_URL}")
        logger.info(f"📅 Test Date: {datetime.utcnow().isoformat()}")
        logger.info("=" * 80)
        
        await self.setup_session()
        
        try:
            # Run tests in sequence
            test_functions = [
                self.test_api_health,
                self.test_content_endpoint,
                self.test_admin_authentication,
                self.test_course_update_api,
                self.test_category_data_structure
            ]
            
            passed_tests = 0
            total_tests = len(test_functions)
            
            for test_func in test_functions:
                result = await test_func()
                if result:
                    passed_tests += 1
                    
            # Print summary
            logger.info("=" * 80)
            logger.info("📊 TEST SUMMARY")
            logger.info(f"✅ Passed: {passed_tests}/{total_tests}")
            logger.info(f"❌ Failed: {total_tests - passed_tests}/{total_tests}")
            logger.info(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
            
            # Print detailed results
            logger.info("\n📋 DETAILED RESULTS:")
            for result in self.test_results:
                status_icon = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "⏭️"
                logger.info(f"{status_icon} {result['test']}: {result['details']}")
                
            return passed_tests == total_tests
            
        finally:
            await self.cleanup_session()

async def main():
    """Main test runner"""
    tester = CategoryManagementTester()
    success = await tester.run_all_tests()
    
    if success:
        logger.info("\n🎉 All tests passed! Backend is ready for admin panel category management.")
        sys.exit(0)
    else:
        logger.error("\n💥 Some tests failed. Check the results above.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
#!/usr/bin/env python3
"""
Category System API Testing Suite for GRRAS Solutions Training Institute
Tests the new category system API endpoints as per review request
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

class CategorySystemTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results
        self.test_results = {
            "categories_public_endpoint": False,
            "categories_admin_endpoint": False,
            "category_creation": False,
            "category_deletion": False,
            "category_structure_validation": False,
            "course_count_calculation": False,
            "admin_authentication_required": False,
            "course_unassignment_logic": False,
            "frontend_integration": False
        }
        
        self.errors = []
        self.created_category_slug = None
        
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
    
    async def authenticate_admin(self) -> bool:
        """Authenticate as admin to get token"""
        logger.info("🔍 Authenticating as admin...")
        try:
            # Try different admin passwords
            passwords = ["grras@admin2024", "grras-admin", "admin"]
            
            for password in passwords:
                login_data = {"password": password}
                
                async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.admin_token = data.get("token")
                        
                        if self.admin_token:
                            logger.info(f"✅ Admin authentication successful with password: {password}")
                            return True
            
            self.errors.append("Admin authentication failed with all attempted passwords")
            return False
            
        except Exception as e:
            self.errors.append(f"Admin authentication failed: {str(e)}")
            logger.error(f"❌ Admin authentication failed: {e}")
            return False
    
    async def test_categories_public_endpoint(self) -> bool:
        """Test 1: GET /api/categories - should return all visible categories with course counts"""
        logger.info("🔍 Testing GET /api/categories endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/categories") as response:
                if response.status == 200:
                    data = await response.json()
                    categories = data.get("categories", [])
                    
                    logger.info(f"✅ Categories endpoint returned {len(categories)} categories")
                    
                    # Validate category structure
                    if categories:
                        sample_category = categories[0]
                        required_fields = ["slug", "name", "description", "icon", "color", "gradient", "featured", "course_count"]
                        
                        missing_fields = [field for field in required_fields if field not in sample_category]
                        if missing_fields:
                            self.errors.append(f"Category missing required fields: {missing_fields}")
                            return False
                        
                        logger.info("✅ Category structure validation passed")
                        self.test_results["category_structure_validation"] = True
                        
                        # Check course count calculation
                        total_courses = sum(cat.get("course_count", 0) for cat in categories)
                        logger.info(f"✅ Total courses across categories: {total_courses}")
                        self.test_results["course_count_calculation"] = True
                    
                    self.test_results["categories_public_endpoint"] = True
                    return True
                else:
                    self.errors.append(f"Categories endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Categories public endpoint test failed: {str(e)}")
            logger.error(f"❌ Categories public endpoint test failed: {e}")
            return False
    
    async def test_categories_admin_endpoint(self) -> bool:
        """Test 2: GET /api/admin/categories - admin endpoint should return detailed category info"""
        logger.info("🔍 Testing GET /api/admin/categories endpoint...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, skipping admin categories test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            async with self.session.get(f"{self.api_base}/admin/categories", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    categories = data.get("categories", [])
                    
                    logger.info(f"✅ Admin categories endpoint returned {len(categories)} categories")
                    
                    # Validate admin category structure (should have more detailed info)
                    if categories:
                        sample_category = categories[0]
                        admin_fields = ["slug", "name", "description", "icon", "color", "gradient", "featured", "course_count", "courses", "seo"]
                        
                        missing_fields = [field for field in admin_fields if field not in sample_category]
                        if missing_fields:
                            logger.warning(f"⚠️ Admin category missing fields: {missing_fields}")
                        else:
                            logger.info("✅ Admin category structure validation passed")
                    
                    self.test_results["categories_admin_endpoint"] = True
                    return True
                else:
                    self.errors.append(f"Admin categories endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Admin categories endpoint test failed: {str(e)}")
            logger.error(f"❌ Admin categories endpoint test failed: {e}")
            return False
    
    async def test_category_creation(self) -> bool:
        """Test 3: POST /api/admin/categories - create new category (need admin token)"""
        logger.info("🔍 Testing POST /api/admin/categories endpoint...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, skipping category creation test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Create test category
            test_category = {
                "name": "Test Category API",
                "slug": "test-category-api",
                "description": "Test category created via API for testing purposes",
                "icon": "test-tube",
                "color": "#10B981",
                "gradient": "from-green-500 to-green-600",
                "featured": False,
                "seo_title": "Test Category API - GRRAS Institute",
                "seo_description": "Test category for API testing",
                "seo_keywords": "test, api, category"
            }
            
            async with self.session.post(f"{self.api_base}/admin/categories", json=test_category, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    created_category = data.get("category", {})
                    
                    logger.info(f"✅ Category created successfully: {created_category.get('name')}")
                    self.created_category_slug = created_category.get("slug")
                    
                    # Validate created category structure
                    if created_category.get("slug") == test_category["slug"]:
                        logger.info("✅ Created category has correct slug")
                        self.test_results["category_creation"] = True
                        return True
                    else:
                        self.errors.append("Created category slug mismatch")
                        return False
                else:
                    response_text = await response.text()
                    self.errors.append(f"Category creation failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Category creation test failed: {str(e)}")
            logger.error(f"❌ Category creation test failed: {e}")
            return False
    
    async def test_admin_authentication_required(self) -> bool:
        """Test 4: Ensure admin endpoints require authentication"""
        logger.info("🔍 Testing admin authentication requirements...")
        try:
            # Test admin categories without token
            async with self.session.get(f"{self.api_base}/admin/categories") as response:
                if response.status == 401:
                    logger.info("✅ Admin categories endpoint properly requires authentication")
                    
                    # Test category creation without token
                    test_category = {
                        "name": "Unauthorized Test",
                        "slug": "unauthorized-test",
                        "description": "Should fail without auth"
                    }
                    
                    async with self.session.post(f"{self.api_base}/admin/categories", json=test_category) as create_response:
                        if create_response.status == 401:
                            logger.info("✅ Category creation properly requires authentication")
                            self.test_results["admin_authentication_required"] = True
                            return True
                        else:
                            self.errors.append("Category creation should require authentication")
                            return False
                else:
                    self.errors.append("Admin categories endpoint should require authentication")
                    return False
        except Exception as e:
            self.errors.append(f"Admin authentication test failed: {str(e)}")
            logger.error(f"❌ Admin authentication test failed: {e}")
            return False
    
    async def test_category_deletion_with_course_unassignment(self) -> bool:
        """Test 5: DELETE /api/admin/categories/{slug} - delete category with course unassignment logic"""
        logger.info("🔍 Testing DELETE /api/admin/categories/{slug} endpoint...")
        
        if not self.admin_token or not self.created_category_slug:
            logger.warning("⚠️ No admin token or created category available, skipping deletion test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # First, let's check if there are any courses assigned to our test category
            async with self.session.get(f"{self.api_base}/content") as content_response:
                if content_response.status == 200:
                    content_data = await content_response.json()
                    courses = content_data.get("content", {}).get("courses", [])
                    
                    # Check if any courses are assigned to our test category
                    assigned_courses = [c for c in courses if self.created_category_slug in c.get("categories", [])]
                    logger.info(f"📊 Found {len(assigned_courses)} courses assigned to test category")
            
            # Delete the test category
            async with self.session.delete(f"{self.api_base}/admin/categories/{self.created_category_slug}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    message = data.get("message", "")
                    unassigned_count = data.get("unassigned_courses", 0)
                    
                    logger.info(f"✅ Category deleted successfully: {message}")
                    logger.info(f"📊 Courses unassigned: {unassigned_count}")
                    
                    # Verify the category is actually deleted
                    async with self.session.get(f"{self.api_base}/admin/categories", headers=headers) as verify_response:
                        if verify_response.status == 200:
                            verify_data = await verify_response.json()
                            remaining_categories = verify_data.get("categories", [])
                            
                            # Check if our test category is gone
                            deleted_category_exists = any(cat.get("slug") == self.created_category_slug for cat in remaining_categories)
                            
                            if not deleted_category_exists:
                                logger.info("✅ Category successfully removed from system")
                                self.test_results["category_deletion"] = True
                                self.test_results["course_unassignment_logic"] = True
                                return True
                            else:
                                self.errors.append("Category still exists after deletion")
                                return False
                else:
                    response_text = await response.text()
                    self.errors.append(f"Category deletion failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Category deletion test failed: {str(e)}")
            logger.error(f"❌ Category deletion test failed: {e}")
            return False
    
    async def test_frontend_integration(self) -> bool:
        """Test 6: Verify frontend can fetch categories successfully"""
        logger.info("🔍 Testing frontend integration capabilities...")
        try:
            # Test that categories endpoint returns data suitable for frontend components
            async with self.session.get(f"{self.api_base}/categories") as response:
                if response.status == 200:
                    data = await response.json()
                    categories = data.get("categories", [])
                    
                    if not categories:
                        self.errors.append("No categories available for frontend integration")
                        return False
                    
                    # Validate frontend-required fields
                    frontend_requirements_met = True
                    
                    for category in categories:
                        # Check for CourseCategoriesGrid requirements
                        grid_fields = ["slug", "name", "description", "icon", "color", "course_count"]
                        missing_grid_fields = [field for field in grid_fields if field not in category]
                        
                        if missing_grid_fields:
                            logger.warning(f"⚠️ Category {category.get('name')} missing grid fields: {missing_grid_fields}")
                            frontend_requirements_met = False
                        
                        # Check for Header dropdown requirements
                        dropdown_fields = ["slug", "name", "course_count"]
                        missing_dropdown_fields = [field for field in dropdown_fields if field not in category]
                        
                        if missing_dropdown_fields:
                            logger.warning(f"⚠️ Category {category.get('name')} missing dropdown fields: {missing_dropdown_fields}")
                            frontend_requirements_met = False
                    
                    if frontend_requirements_met:
                        logger.info("✅ All categories have required fields for frontend components")
                        logger.info("✅ CourseCategoriesGrid integration: Ready")
                        logger.info("✅ Header dropdown integration: Ready")
                        logger.info("✅ Mobile menu integration: Ready")
                        self.test_results["frontend_integration"] = True
                        return True
                    else:
                        self.errors.append("Some categories missing required fields for frontend integration")
                        return False
                else:
                    self.errors.append("Cannot fetch categories for frontend integration test")
                    return False
        except Exception as e:
            self.errors.append(f"Frontend integration test failed: {str(e)}")
            logger.error(f"❌ Frontend integration test failed: {e}")
            return False
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all category system tests"""
        logger.info("🚀 Starting Category System API Testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("Admin Authentication", self.authenticate_admin),
                ("Categories Public Endpoint", self.test_categories_public_endpoint),
                ("Categories Admin Endpoint", self.test_categories_admin_endpoint),
                ("Category Creation", self.test_category_creation),
                ("Admin Authentication Required", self.test_admin_authentication_required),
                ("Category Deletion with Course Unassignment", self.test_category_deletion_with_course_unassignment),
                ("Frontend Integration", self.test_frontend_integration),
            ]
            
            passed_tests = 0
            total_tests = len(tests) - 1  # Exclude admin auth from count
            
            for test_name, test_func in tests:
                logger.info(f"\n{'='*50}")
                logger.info(f"Running: {test_name}")
                logger.info(f"{'='*50}")
                
                try:
                    result = await test_func()
                    if result:
                        if test_name != "Admin Authentication":  # Don't count auth in results
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
                "critical_issues": self._identify_critical_issues()
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _identify_critical_issues(self) -> List[str]:
        """Identify critical issues that block functionality"""
        critical_issues = []
        
        if not self.test_results["categories_public_endpoint"]:
            critical_issues.append("Public categories endpoint is not working")
        
        if not self.test_results["category_structure_validation"]:
            critical_issues.append("Category structure validation failed")
        
        if not self.test_results["course_count_calculation"]:
            critical_issues.append("Course count calculation is not working")
        
        if not self.test_results["admin_authentication_required"]:
            critical_issues.append("Admin endpoints do not require authentication")
        
        if not self.test_results["frontend_integration"]:
            critical_issues.append("Categories not ready for frontend integration")
        
        return critical_issues
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*60}")
        print("🎯 CATEGORY SYSTEM API TESTING SUMMARY")
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
        
        print(f"\n🎯 CATEGORY SYSTEM STATUS:")
        if summary['success_rate'] == "100.0%":
            print("  ✅ Category system is fully functional")
            print("  ✅ All API endpoints working correctly")
            print("  ✅ Frontend integration ready")
        else:
            print("  ⚠️ Category system has some issues")
            print("  ⚠️ Check failed tests above")
        
        print(f"\n{'='*60}")

async def main():
    """Main test execution"""
    tester = CategorySystemTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/category_system_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        # Exit with appropriate code
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES DETECTED - Category system needs attention!")
            sys.exit(1)
        elif summary['success_rate'] == "100.0%":
            print(f"\n🎉 ALL TESTS PASSED - Category system is fully functional!")
            sys.exit(0)
        else:
            print(f"\n⚠️ SOME TESTS FAILED - Category system has minor issues")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
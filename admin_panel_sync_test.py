#!/usr/bin/env python3
"""
Admin Panel Sync Workflow Testing Suite
Tests the complete admin panel save workflow to verify sync verification fix
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

class AdminPanelSyncTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results
        self.test_results = {
            "admin_authentication": False,
            "create_hidden_course": False,
            "verify_course_counts": False,
            "admin_save_workflow": False,
            "sync_verification_with_hidden": False
        }
        
        self.errors = []
        self.test_course_id = None
        
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
    
    async def test_admin_authentication(self) -> bool:
        """Test 1: Admin authentication"""
        logger.info("🔍 Testing admin authentication...")
        try:
            login_data = {"password": "grras-admin"}
            
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
    
    async def test_create_hidden_course(self) -> bool:
        """Test 2: Create a hidden course to test the sync verification fix"""
        logger.info("🔍 Creating a hidden test course...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, skipping hidden course creation")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Get current CMS content
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status != 200:
                    self.errors.append("Failed to get current CMS content")
                    return False
                
                data = await response.json()
                current_content = data.get("content", {})
                courses = current_content.get("courses", [])
                
                # Create a hidden test course
                test_course = {
                    "title": "Hidden Test Course - Sync Verification",
                    "slug": "hidden-test-course-sync-verification",
                    "duration": "Test Duration",
                    "fees": "₹0",
                    "level": "Test Level",
                    "category": "general",
                    "description": "This is a hidden test course to verify sync verification fix",
                    "overview": "Hidden test course for sync verification testing",
                    "tools": ["Test Tool"],
                    "highlights": ["Test highlight"],
                    "eligibility": "Test eligibility",
                    "visible": False,  # This is the key - making it hidden
                    "order": len(courses) + 1,
                    "learningOutcomes": ["Test outcome"],
                    "careerRoles": ["Test role"]
                }
                
                # Check if test course already exists
                existing_course = next((c for c in courses if c.get("slug") == test_course["slug"]), None)
                if existing_course:
                    logger.info("✅ Hidden test course already exists")
                    self.test_course_id = existing_course.get("slug")
                    self.test_results["create_hidden_course"] = True
                    return True
                
                # Add the hidden course
                courses.append(test_course)
                current_content["courses"] = courses
                self.test_course_id = test_course["slug"]
                
                # Save updated content
                content_request = {"content": current_content, "isDraft": False}
                
                async with self.session.post(f"{self.api_base}/content", json=content_request, headers=headers) as save_response:
                    if save_response.status == 200:
                        logger.info("✅ Hidden test course created successfully")
                        self.test_results["create_hidden_course"] = True
                        return True
                    else:
                        response_text = await save_response.text()
                        self.errors.append(f"Failed to create hidden course with status {save_response.status}: {response_text}")
                        return False
                        
        except Exception as e:
            self.errors.append(f"Hidden course creation test failed: {str(e)}")
            logger.error(f"❌ Hidden course creation test failed: {e}")
            return False
    
    async def test_verify_course_counts(self) -> bool:
        """Test 3: Verify course counts with hidden course present"""
        logger.info("🔍 Verifying course counts with hidden course...")
        
        try:
            # Get courses from API (should exclude hidden)
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status != 200:
                    self.errors.append("Failed to get courses from API")
                    return False
                
                api_data = await response.json()
                api_courses = api_data.get("courses", [])
                
                # Get all courses from CMS content
                async with self.session.get(f"{self.api_base}/content") as content_response:
                    if content_response.status != 200:
                        self.errors.append("Failed to get CMS content")
                        return False
                    
                    content_data = await content_response.json()
                    all_courses = content_data.get("content", {}).get("courses", [])
                    
                    # Count visible and hidden courses
                    visible_courses = [c for c in all_courses if c.get("visible", True)]
                    hidden_courses = [c for c in all_courses if not c.get("visible", True)]
                    
                    logger.info(f"📊 Total courses in CMS: {len(all_courses)}")
                    logger.info(f"📊 Visible courses in CMS: {len(visible_courses)}")
                    logger.info(f"📊 Hidden courses in CMS: {len(hidden_courses)}")
                    logger.info(f"📊 Courses from API: {len(api_courses)}")
                    
                    # Verify that API returns only visible courses
                    if len(api_courses) == len(visible_courses):
                        logger.info("✅ API correctly returns only visible courses")
                        
                        # Verify our test hidden course is not in API response
                        hidden_course_in_api = any(c.get("slug") == self.test_course_id for c in api_courses)
                        if not hidden_course_in_api:
                            logger.info("✅ Hidden test course correctly excluded from API")
                            self.test_results["verify_course_counts"] = True
                            return True
                        else:
                            self.errors.append("Hidden test course found in API response")
                            return False
                    else:
                        self.errors.append(f"Course count mismatch: API={len(api_courses)}, Visible={len(visible_courses)}")
                        return False
                        
        except Exception as e:
            self.errors.append(f"Course count verification test failed: {str(e)}")
            logger.error(f"❌ Course count verification test failed: {e}")
            return False
    
    async def test_admin_save_workflow(self) -> bool:
        """Test 4: Simulate admin panel save workflow"""
        logger.info("🔍 Testing admin panel save workflow...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, skipping admin save workflow test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Get current content (simulating admin panel loading)
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status != 200:
                    self.errors.append("Failed to get content for admin workflow")
                    return False
                
                data = await response.json()
                current_content = data.get("content", {})
                
                # Make a small change (simulating admin panel edit)
                current_content["lastAdminEdit"] = datetime.now().isoformat()
                
                # Save content (this should trigger the sync verification logic)
                content_request = {"content": current_content, "isDraft": False}
                
                async with self.session.post(f"{self.api_base}/content", json=content_request, headers=headers) as save_response:
                    if save_response.status == 200:
                        save_data = await save_response.json()
                        courses_count = save_data.get("coursesCount", 0)
                        
                        logger.info(f"✅ Admin save workflow successful")
                        logger.info(f"📊 Courses count in save response: {courses_count}")
                        
                        # Verify the count matches visible courses only
                        async with self.session.get(f"{self.api_base}/courses") as api_response:
                            if api_response.status == 200:
                                api_data = await api_response.json()
                                api_courses_count = len(api_data.get("courses", []))
                                
                                if courses_count == api_courses_count:
                                    logger.info("✅ Save response count matches API visible courses count")
                                    self.test_results["admin_save_workflow"] = True
                                    return True
                                else:
                                    self.errors.append(f"Count mismatch: Save response={courses_count}, API={api_courses_count}")
                                    return False
                            else:
                                self.errors.append("Failed to verify API courses count")
                                return False
                    else:
                        response_text = await save_response.text()
                        self.errors.append(f"Admin save failed with status {save_response.status}: {response_text}")
                        return False
                        
        except Exception as e:
            self.errors.append(f"Admin save workflow test failed: {str(e)}")
            logger.error(f"❌ Admin save workflow test failed: {e}")
            return False
    
    async def test_sync_verification_with_hidden(self) -> bool:
        """Test 5: Test sync verification with hidden courses present"""
        logger.info("🔍 Testing sync verification with hidden courses...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, skipping sync verification test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Test force sync (simulates admin panel sync verification)
            async with self.session.post(f"{self.api_base}/admin/force-sync", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    sync_courses_count = data.get("coursesCount", 0)
                    
                    logger.info(f"✅ Sync verification successful")
                    logger.info(f"📊 Courses count from sync: {sync_courses_count}")
                    
                    # Verify sync count matches API visible courses
                    async with self.session.get(f"{self.api_base}/courses") as api_response:
                        if api_response.status == 200:
                            api_data = await api_response.json()
                            api_courses_count = len(api_data.get("courses", []))
                            
                            if sync_courses_count == api_courses_count:
                                logger.info("✅ Sync verification count matches API visible courses")
                                logger.info("✅ Sync verification fix working correctly with hidden courses")
                                self.test_results["sync_verification_with_hidden"] = True
                                return True
                            else:
                                self.errors.append(f"Sync count mismatch: Sync={sync_courses_count}, API={api_courses_count}")
                                return False
                        else:
                            self.errors.append("Failed to get API courses for sync verification")
                            return False
                else:
                    response_text = await response.text()
                    self.errors.append(f"Sync verification failed with status {response.status}: {response_text}")
                    return False
                    
        except Exception as e:
            self.errors.append(f"Sync verification test failed: {str(e)}")
            logger.error(f"❌ Sync verification test failed: {e}")
            return False
    
    async def cleanup_test_course(self):
        """Cleanup: Remove the test hidden course"""
        if not self.admin_token or not self.test_course_id:
            return
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Get current content
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    current_content = data.get("content", {})
                    courses = current_content.get("courses", [])
                    
                    # Remove test course
                    updated_courses = [c for c in courses if c.get("slug") != self.test_course_id]
                    
                    if len(updated_courses) < len(courses):
                        current_content["courses"] = updated_courses
                        
                        # Save updated content
                        content_request = {"content": current_content, "isDraft": False}
                        
                        async with self.session.post(f"{self.api_base}/content", json=content_request, headers=headers) as save_response:
                            if save_response.status == 200:
                                logger.info("✅ Test hidden course cleaned up successfully")
                            else:
                                logger.warning("⚠️ Failed to cleanup test course")
                    else:
                        logger.info("ℹ️ Test course not found for cleanup")
                        
        except Exception as e:
            logger.warning(f"⚠️ Cleanup failed: {e}")
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all admin panel sync tests"""
        logger.info("🚀 Starting admin panel sync workflow testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("Admin Authentication", self.test_admin_authentication),
                ("Create Hidden Course", self.test_create_hidden_course),
                ("Verify Course Counts", self.test_verify_course_counts),
                ("Admin Save Workflow", self.test_admin_save_workflow),
                ("Sync Verification with Hidden", self.test_sync_verification_with_hidden),
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
            
            # Cleanup test course
            await self.cleanup_test_course()
            
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
                "admin_panel_sync_status": self._get_admin_panel_sync_status()
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _get_admin_panel_sync_status(self) -> str:
        """Get overall admin panel sync status"""
        if all(self.test_results.values()):
            return "WORKING - Admin panel sync verification fix is successful"
        elif self.test_results.get("sync_verification_with_hidden", False):
            return "MOSTLY WORKING - Sync verification works but some setup issues"
        else:
            return "NOT WORKING - Admin panel sync verification has issues"
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*60}")
        print("🎯 ADMIN PANEL SYNC WORKFLOW TESTING SUMMARY")
        print(f"{'='*60}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        print(f"\n🎯 ADMIN PANEL SYNC STATUS:")
        print(f"  {summary['admin_panel_sync_status']}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n{'='*60}")

async def main():
    """Main test execution"""
    tester = AdminPanelSyncTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/admin_panel_sync_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        # Exit with appropriate code
        if summary['admin_panel_sync_status'].startswith("WORKING"):
            print(f"\n🎉 ADMIN PANEL SYNC VERIFICATION FIX SUCCESSFUL!")
            return 0
        else:
            print(f"\n🚨 ADMIN PANEL SYNC VERIFICATION HAS ISSUES!")
            return 1
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
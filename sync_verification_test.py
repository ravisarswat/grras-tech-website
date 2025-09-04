#!/usr/bin/env python3
"""
Sync Verification Fix Testing Suite for GRRAS Admin Panel
Tests the specific fix for "sync verification failed" error due to course count mismatch
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

class SyncVerificationTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results
        self.test_results = {
            "courses_endpoint_visible_only": False,
            "admin_authentication": False,
            "content_save_operation": False,
            "sync_verification_fix": False,
            "course_count_comparison": False
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
    
    async def test_courses_endpoint_visible_only(self) -> bool:
        """Test 1: Verify /api/courses endpoint returns only visible courses"""
        logger.info("🔍 Testing /api/courses endpoint for visible courses only...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    if not courses:
                        self.errors.append("No courses found in API response")
                        return False
                    
                    # Check that all returned courses are visible
                    visible_courses = []
                    hidden_courses = []
                    
                    for course in courses:
                        if course.get("visible", True):  # Default to True if not specified
                            visible_courses.append(course)
                        else:
                            hidden_courses.append(course)
                    
                    logger.info(f"📊 Found {len(courses)} total courses from /api/courses")
                    logger.info(f"📊 Visible courses: {len(visible_courses)}")
                    logger.info(f"📊 Hidden courses in response: {len(hidden_courses)}")
                    
                    # Store course data for later comparison
                    self.course_data["api_courses"] = courses
                    self.course_data["visible_count"] = len(visible_courses)
                    self.course_data["hidden_in_response"] = len(hidden_courses)
                    
                    if len(hidden_courses) == 0:
                        logger.info("✅ /api/courses endpoint returns only visible courses")
                        self.test_results["courses_endpoint_visible_only"] = True
                        return True
                    else:
                        self.errors.append(f"Found {len(hidden_courses)} hidden courses in /api/courses response")
                        return False
                else:
                    self.errors.append(f"Courses endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Courses endpoint test failed: {str(e)}")
            logger.error(f"❌ Courses endpoint test failed: {e}")
            return False
    
    async def test_admin_authentication(self) -> bool:
        """Test 2: Admin authentication for content management"""
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
    
    async def test_content_save_operation(self) -> bool:
        """Test 3: Admin content management save operation"""
        logger.info("🔍 Testing admin content management save operation...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, skipping content save test")
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
                all_courses = current_content.get("courses", [])
                
                logger.info(f"📊 Total courses in CMS content: {len(all_courses)}")
                
                # Count visible and hidden courses in CMS content
                visible_courses_cms = [c for c in all_courses if c.get("visible", True)]
                hidden_courses_cms = [c for c in all_courses if not c.get("visible", True)]
                
                logger.info(f"📊 Visible courses in CMS: {len(visible_courses_cms)}")
                logger.info(f"📊 Hidden courses in CMS: {len(hidden_courses_cms)}")
                
                # Store CMS course data for comparison
                self.course_data["cms_total"] = len(all_courses)
                self.course_data["cms_visible"] = len(visible_courses_cms)
                self.course_data["cms_hidden"] = len(hidden_courses_cms)
                
                # Test save operation with current content (no changes)
                content_request = {"content": current_content, "isDraft": False}
                
                async with self.session.post(f"{self.api_base}/content", json=content_request, headers=headers) as save_response:
                    if save_response.status == 200:
                        save_data = await save_response.json()
                        courses_count = save_data.get("coursesCount", 0)
                        
                        logger.info(f"✅ Content save operation successful")
                        logger.info(f"📊 Courses count returned by save: {courses_count}")
                        
                        # Store save response data
                        self.course_data["save_response_count"] = courses_count
                        
                        self.test_results["content_save_operation"] = True
                        return True
                    else:
                        response_text = await save_response.text()
                        self.errors.append(f"Content save failed with status {save_response.status}: {response_text}")
                        return False
                        
        except Exception as e:
            self.errors.append(f"Content save operation test failed: {str(e)}")
            logger.error(f"❌ Content save operation test failed: {e}")
            return False
    
    async def test_sync_verification_fix(self) -> bool:
        """Test 4: Verify sync verification no longer fails"""
        logger.info("🔍 Testing sync verification fix...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available, skipping sync verification test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Test force sync endpoint (simulates admin panel sync verification)
            async with self.session.post(f"{self.api_base}/admin/force-sync", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    sync_courses_count = data.get("coursesCount", 0)
                    
                    logger.info(f"✅ Force sync operation successful")
                    logger.info(f"📊 Courses count from sync: {sync_courses_count}")
                    
                    # Store sync response data
                    self.course_data["sync_response_count"] = sync_courses_count
                    
                    self.test_results["sync_verification_fix"] = True
                    return True
                else:
                    response_text = await response.text()
                    self.errors.append(f"Force sync failed with status {response.status}: {response_text}")
                    return False
                    
        except Exception as e:
            self.errors.append(f"Sync verification test failed: {str(e)}")
            logger.error(f"❌ Sync verification test failed: {e}")
            return False
    
    async def test_course_count_comparison(self) -> bool:
        """Test 5: Verify course count comparison works correctly"""
        logger.info("🔍 Testing course count comparison logic...")
        
        try:
            # Compare counts from different sources
            api_visible_count = self.course_data.get("visible_count", 0)
            cms_visible_count = self.course_data.get("cms_visible", 0)
            save_response_count = self.course_data.get("save_response_count", 0)
            sync_response_count = self.course_data.get("sync_response_count", 0)
            
            logger.info(f"📊 Course count comparison:")
            logger.info(f"   API visible courses: {api_visible_count}")
            logger.info(f"   CMS visible courses: {cms_visible_count}")
            logger.info(f"   Save response count: {save_response_count}")
            logger.info(f"   Sync response count: {sync_response_count}")
            
            # The fix should ensure that:
            # 1. API returns only visible courses
            # 2. Admin operations count only visible courses
            # 3. Counts match between API and admin operations
            
            counts_match = (
                api_visible_count == cms_visible_count and
                api_visible_count == save_response_count and
                api_visible_count == sync_response_count
            )
            
            if counts_match:
                logger.info("✅ Course count comparison working correctly - all counts match")
                logger.info("✅ Sync verification fix is working properly")
                self.test_results["course_count_comparison"] = True
                return True
            else:
                self.errors.append(f"Course count mismatch detected:")
                self.errors.append(f"  API visible: {api_visible_count}")
                self.errors.append(f"  CMS visible: {cms_visible_count}")
                self.errors.append(f"  Save response: {save_response_count}")
                self.errors.append(f"  Sync response: {sync_response_count}")
                return False
                
        except Exception as e:
            self.errors.append(f"Course count comparison test failed: {str(e)}")
            logger.error(f"❌ Course count comparison test failed: {e}")
            return False
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all sync verification tests"""
        logger.info("🚀 Starting sync verification fix testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("Courses Endpoint Visible Only", self.test_courses_endpoint_visible_only),
                ("Admin Authentication", self.test_admin_authentication),
                ("Content Save Operation", self.test_content_save_operation),
                ("Sync Verification Fix", self.test_sync_verification_fix),
                ("Course Count Comparison", self.test_course_count_comparison),
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
                "course_data": self.course_data,
                "errors": self.errors,
                "sync_verification_status": self._get_sync_verification_status()
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _get_sync_verification_status(self) -> str:
        """Get overall sync verification status"""
        if all(self.test_results.values()):
            return "FIXED - Sync verification working correctly"
        elif self.test_results["course_count_comparison"]:
            return "PARTIALLY FIXED - Course counts match but some tests failed"
        else:
            return "NOT FIXED - Sync verification still has issues"
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*60}")
        print("🎯 SYNC VERIFICATION FIX TESTING SUMMARY")
        print(f"{'='*60}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        print(f"\n📊 COURSE COUNT ANALYSIS:")
        course_data = summary['course_data']
        if course_data:
            print(f"  API visible courses: {course_data.get('visible_count', 'N/A')}")
            print(f"  CMS visible courses: {course_data.get('cms_visible', 'N/A')}")
            print(f"  CMS hidden courses: {course_data.get('cms_hidden', 'N/A')}")
            print(f"  Save response count: {course_data.get('save_response_count', 'N/A')}")
            print(f"  Sync response count: {course_data.get('sync_response_count', 'N/A')}")
        
        print(f"\n🎯 SYNC VERIFICATION STATUS:")
        print(f"  {summary['sync_verification_status']}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n{'='*60}")

async def main():
    """Main test execution"""
    tester = SyncVerificationTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/sync_verification_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        # Exit with appropriate code based on sync verification status
        if summary['sync_verification_status'].startswith("FIXED"):
            print(f"\n🎉 SYNC VERIFICATION FIX SUCCESSFUL!")
            return 0
        elif summary['sync_verification_status'].startswith("PARTIALLY"):
            print(f"\n⚠️ SYNC VERIFICATION PARTIALLY FIXED")
            return 1
        else:
            print(f"\n🚨 SYNC VERIFICATION FIX FAILED!")
            return 1
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
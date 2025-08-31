#!/usr/bin/env python3
"""
Content Migration Testing Suite for GRRAS Solutions Training Institute
Tests the new content migration functionality to add courseCategories and learningPaths
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

class ContentMigrationTester:
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
            "admin_authentication": False,
            "cms_content_before_migration": False,
            "courseCategories_missing_before": False,
            "learningPaths_missing_before": False,
            "content_migration_endpoint": False,
            "cms_content_after_migration": False,
            "courseCategories_present_after": False,
            "learningPaths_present_after": False,
            "existing_functionality_preserved": False
        }
        
        self.errors = []
        self.content_before_migration = None
        self.content_after_migration = None
        
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
                    self.test_results["server_health"] = True
                    return True
                else:
                    self.errors.append(f"Health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Server health check failed: {str(e)}")
            logger.error(f"❌ Server health check failed: {e}")
            return False
    
    async def test_admin_authentication(self) -> bool:
        """Test 2: Admin authentication to get token for migration"""
        logger.info("🔍 Testing admin authentication...")
        try:
            # Test login with default password
            login_data = {"password": "grras@admin2024"}
            
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("token")
                    
                    if self.admin_token:
                        logger.info("✅ Admin authentication successful - token obtained")
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
    
    async def test_cms_content_before_migration(self) -> bool:
        """Test 3: Check CMS content before migration to confirm courseCategories and learningPaths are missing"""
        logger.info("🔍 Testing CMS content before migration...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    self.content_before_migration = data.get("content", {})
                    
                    # Check if courseCategories and learningPaths are missing
                    has_courseCategories = 'courseCategories' in self.content_before_migration
                    has_learningPaths = 'learningPaths' in self.content_before_migration
                    
                    logger.info(f"📊 Content structure before migration:")
                    logger.info(f"  - courseCategories present: {has_courseCategories}")
                    logger.info(f"  - learningPaths present: {has_learningPaths}")
                    logger.info(f"  - Available sections: {list(self.content_before_migration.keys())}")
                    
                    # For migration testing, we want to confirm they are missing initially
                    if not has_courseCategories:
                        self.test_results["courseCategories_missing_before"] = True
                        logger.info("✅ courseCategories missing before migration (as expected)")
                    else:
                        logger.warning("⚠️ courseCategories already present before migration")
                    
                    if not has_learningPaths:
                        self.test_results["learningPaths_missing_before"] = True
                        logger.info("✅ learningPaths missing before migration (as expected)")
                    else:
                        logger.warning("⚠️ learningPaths already present before migration")
                    
                    self.test_results["cms_content_before_migration"] = True
                    return True
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"CMS content endpoint failed: {str(e)}")
            logger.error(f"❌ CMS content endpoint failed: {e}")
            return False
    
    async def test_content_migration_endpoint(self) -> bool:
        """Test 4: Test the new POST /api/content/migrate endpoint"""
        logger.info("🔍 Testing content migration endpoint...")
        
        if not self.admin_token:
            logger.error("❌ No admin token available for migration test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            async with self.session.post(f"{self.api_base}/content/migrate", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Content migration successful: {data}")
                    
                    # Check migration response
                    message = data.get("message", "")
                    added_features = data.get("added_features", [])
                    
                    logger.info(f"📊 Migration response:")
                    logger.info(f"  - Message: {message}")
                    logger.info(f"  - Added features: {added_features}")
                    
                    self.test_results["content_migration_endpoint"] = True
                    return True
                else:
                    response_text = await response.text()
                    self.errors.append(f"Content migration failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Content migration test failed: {str(e)}")
            logger.error(f"❌ Content migration test failed: {e}")
            return False
    
    async def test_cms_content_after_migration(self) -> bool:
        """Test 5: Check CMS content after migration to verify courseCategories and learningPaths are present"""
        logger.info("🔍 Testing CMS content after migration...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    self.content_after_migration = data.get("content", {})
                    
                    # Check if courseCategories and learningPaths are now present
                    has_courseCategories = 'courseCategories' in self.content_after_migration
                    has_learningPaths = 'learningPaths' in self.content_after_migration
                    
                    logger.info(f"📊 Content structure after migration:")
                    logger.info(f"  - courseCategories present: {has_courseCategories}")
                    logger.info(f"  - learningPaths present: {has_learningPaths}")
                    logger.info(f"  - Available sections: {list(self.content_after_migration.keys())}")
                    
                    # Verify the new structures are present
                    if has_courseCategories:
                        self.test_results["courseCategories_present_after"] = True
                        logger.info("✅ courseCategories successfully added by migration")
                        
                        # Log structure of courseCategories
                        categories = self.content_after_migration.get("courseCategories", [])
                        logger.info(f"  - Found {len(categories)} course categories")
                        for cat in categories[:3]:  # Show first 3
                            logger.info(f"    • {cat.get('name', 'Unknown')}: {cat.get('description', 'No description')}")
                    else:
                        self.errors.append("courseCategories not found after migration")
                    
                    if has_learningPaths:
                        self.test_results["learningPaths_present_after"] = True
                        logger.info("✅ learningPaths successfully added by migration")
                        
                        # Log structure of learningPaths
                        paths = self.content_after_migration.get("learningPaths", [])
                        logger.info(f"  - Found {len(paths)} learning paths")
                        for path in paths[:3]:  # Show first 3
                            logger.info(f"    • {path.get('name', 'Unknown')}: {path.get('description', 'No description')}")
                    else:
                        self.errors.append("learningPaths not found after migration")
                    
                    self.test_results["cms_content_after_migration"] = True
                    return has_courseCategories and has_learningPaths
                else:
                    self.errors.append(f"CMS content endpoint failed after migration with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"CMS content endpoint failed after migration: {str(e)}")
            logger.error(f"❌ CMS content endpoint failed after migration: {e}")
            return False
    
    async def test_existing_functionality_preserved(self) -> bool:
        """Test 6: Verify that existing functionality still works after migration"""
        logger.info("🔍 Testing that existing functionality is preserved after migration...")
        
        try:
            # Test 1: Courses endpoint still works
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status != 200:
                    self.errors.append("Courses endpoint broken after migration")
                    return False
                
                courses_data = await response.json()
                courses = courses_data.get("courses", [])
                logger.info(f"✅ Courses endpoint working - {len(courses)} courses available")
            
            # Test 2: Individual course endpoint still works
            if courses:
                test_slug = courses[0].get("slug")
                if test_slug:
                    async with self.session.get(f"{self.api_base}/courses/{test_slug}") as response:
                        if response.status != 200:
                            self.errors.append("Individual course endpoint broken after migration")
                            return False
                        logger.info(f"✅ Individual course endpoint working for '{test_slug}'")
            
            # Test 3: Contact form still works
            contact_data = {
                "name": "Migration Test User",
                "email": "migration.test@example.com",
                "phone": "9876543210",
                "course": "DevOps Training",
                "message": "Testing after migration"
            }
            
            async with self.session.post(f"{self.api_base}/contact", json=contact_data) as response:
                if response.status != 200:
                    self.errors.append("Contact form broken after migration")
                    return False
                logger.info("✅ Contact form still working after migration")
            
            # Test 4: Admin endpoints still work
            if self.admin_token:
                headers = {"Authorization": f"Bearer {self.admin_token}"}
                async with self.session.get(f"{self.api_base}/leads", headers=headers) as response:
                    if response.status != 200:
                        self.errors.append("Admin leads endpoint broken after migration")
                        return False
                    
                    leads_data = await response.json()
                    leads = leads_data.get("leads", [])
                    logger.info(f"✅ Admin leads endpoint working - {len(leads)} leads found")
            
            self.test_results["existing_functionality_preserved"] = True
            logger.info("✅ All existing functionality preserved after migration")
            return True
            
        except Exception as e:
            self.errors.append(f"Existing functionality test failed: {str(e)}")
            logger.error(f"❌ Existing functionality test failed: {e}")
            return False
    
    async def run_migration_tests(self) -> Dict[str, Any]:
        """Run all content migration tests"""
        logger.info("🚀 Starting content migration testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence for migration
            tests = [
                ("Server Health Check", self.test_server_health),
                ("Admin Authentication", self.test_admin_authentication),
                ("CMS Content Before Migration", self.test_cms_content_before_migration),
                ("Content Migration Endpoint", self.test_content_migration_endpoint),
                ("CMS Content After Migration", self.test_cms_content_after_migration),
                ("Existing Functionality Preserved", self.test_existing_functionality_preserved),
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
                "migration_successful": (
                    self.test_results["content_migration_endpoint"] and
                    self.test_results["courseCategories_present_after"] and
                    self.test_results["learningPaths_present_after"] and
                    self.test_results["existing_functionality_preserved"]
                ),
                "content_before_migration": self.content_before_migration,
                "content_after_migration": self.content_after_migration
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def print_migration_summary(self, summary: Dict[str, Any]):
        """Print migration test summary"""
        print(f"\n{'='*70}")
        print("🎯 CONTENT MIGRATION TESTING SUMMARY")
        print(f"{'='*70}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 MIGRATION TEST RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        print(f"\n🎯 MIGRATION STATUS:")
        if summary['migration_successful']:
            print("  ✅ MIGRATION SUCCESSFUL")
            print("  ✅ courseCategories and learningPaths added to CMS content")
            print("  ✅ Existing functionality preserved")
        else:
            print("  ❌ MIGRATION FAILED OR INCOMPLETE")
        
        # Show content structure changes
        if summary.get('content_before_migration') and summary.get('content_after_migration'):
            before_sections = set(summary['content_before_migration'].keys())
            after_sections = set(summary['content_after_migration'].keys())
            new_sections = after_sections - before_sections
            
            print(f"\n📋 CONTENT STRUCTURE CHANGES:")
            print(f"  Sections before migration: {len(before_sections)}")
            print(f"  Sections after migration: {len(after_sections)}")
            if new_sections:
                print(f"  New sections added: {', '.join(new_sections)}")
            else:
                print("  No new sections added")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n{'='*70}")

async def main():
    """Main test execution"""
    tester = ContentMigrationTester()
    
    try:
        summary = await tester.run_migration_tests()
        tester.print_migration_summary(summary)
        
        # Save results to file
        with open('/app/content_migration_test_results.json', 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Migration test results saved to: /app/content_migration_test_results.json")
        
        # Exit with appropriate code
        if summary['migration_successful']:
            print(f"\n🎉 CONTENT MIGRATION SUCCESSFUL - Course organization features ready!")
            sys.exit(0)
        else:
            print(f"\n🚨 CONTENT MIGRATION FAILED - Course organization features not available")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Migration test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
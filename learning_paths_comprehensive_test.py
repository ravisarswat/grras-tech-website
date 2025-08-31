#!/usr/bin/env python3
"""
Comprehensive Learning Paths Testing - Addressing Review Request
Tests all specific points mentioned in the review request
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ComprehensiveLearningPathsTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        
    def _get_backend_url(self) -> str:
        """Get backend URL from frontend .env file"""
        try:
            with open(self.frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        url = line.split('=', 1)[1].strip()
                        logger.info(f"✅ Found backend URL: {url}")
                        return url
            return "http://localhost:8001"
        except Exception as e:
            logger.error(f"❌ Error reading frontend .env: {e}")
            return "http://localhost:8001"
    
    async def setup_session(self):
        """Setup HTTP session"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(connector=connector, timeout=timeout)
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
    
    async def test_review_request_points(self):
        """Test all specific points from the review request"""
        logger.info("🎯 COMPREHENSIVE LEARNING PATHS TESTING - REVIEW REQUEST VALIDATION")
        logger.info("="*80)
        
        await self.setup_session()
        
        try:
            # Point 1: Test the GET /api/content endpoint to retrieve current CMS content
            logger.info("\n1️⃣ TESTING GET /api/content ENDPOINT")
            logger.info("-" * 50)
            
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    logger.info("✅ GET /api/content endpoint working correctly")
                    logger.info(f"   Response status: {response.status}")
                    logger.info(f"   Content sections available: {len(content)} sections")
                    logger.info(f"   Available sections: {list(content.keys())}")
                else:
                    logger.error(f"❌ GET /api/content failed with status {response.status}")
                    return
            
            # Point 2: Check if learningPaths section exists and has data
            logger.info("\n2️⃣ CHECKING IF LEARNINGPATHS SECTION EXISTS AND HAS DATA")
            logger.info("-" * 50)
            
            if "learningPaths" in content:
                learning_paths = content["learningPaths"]
                logger.info("✅ learningPaths section EXISTS in CMS content")
                logger.info(f"   Data type: {type(learning_paths).__name__}")
                
                if learning_paths:
                    logger.info("✅ learningPaths section HAS DATA")
                    if isinstance(learning_paths, dict):
                        logger.info(f"   Number of learning paths: {len(learning_paths)}")
                        logger.info(f"   Learning path keys: {list(learning_paths.keys())}")
                    elif isinstance(learning_paths, list):
                        logger.info(f"   Number of learning paths: {len(learning_paths)}")
                else:
                    logger.error("❌ learningPaths section exists but is EMPTY")
                    return
            else:
                logger.error("❌ learningPaths section DOES NOT EXIST in CMS content")
                return
            
            # Point 3: Verify the structure of learning paths data
            logger.info("\n3️⃣ VERIFYING STRUCTURE OF LEARNING PATHS DATA")
            logger.info("-" * 50)
            
            structure_valid = True
            for path_key, path_data in learning_paths.items():
                logger.info(f"\n   📋 Analyzing learning path: {path_key}")
                
                if not isinstance(path_data, dict):
                    logger.error(f"   ❌ Invalid data type for {path_key}: {type(path_data)}")
                    structure_valid = False
                    continue
                
                # Check required fields
                required_fields = ["title", "description", "duration", "courses"]
                missing_fields = [field for field in required_fields if field not in path_data]
                
                if missing_fields:
                    logger.error(f"   ❌ Missing required fields in {path_key}: {missing_fields}")
                    structure_valid = False
                else:
                    logger.info(f"   ✅ All required fields present in {path_key}")
                
                # Check courses structure
                courses = path_data.get("courses", [])
                if isinstance(courses, list) and courses:
                    logger.info(f"   ✅ Courses array valid with {len(courses)} courses")
                    
                    # Check first course structure
                    first_course = courses[0]
                    course_fields = ["courseSlug", "title", "duration", "order"]
                    course_missing = [field for field in course_fields if field not in first_course]
                    
                    if course_missing:
                        logger.warning(f"   ⚠️ Course structure missing fields: {course_missing}")
                    else:
                        logger.info(f"   ✅ Course structure valid")
                else:
                    logger.error(f"   ❌ Invalid or empty courses array in {path_key}")
                    structure_valid = False
                
                # Check additional fields
                additional_fields = ["outcomes", "careerRoles", "level", "totalCourses"]
                present_additional = [field for field in additional_fields if field in path_data]
                logger.info(f"   ℹ️ Additional fields present: {present_additional}")
            
            if structure_valid:
                logger.info("\n✅ LEARNING PATHS DATA STRUCTURE IS VALID")
            else:
                logger.error("\n❌ LEARNING PATHS DATA STRUCTURE HAS ISSUES")
            
            # Point 4: Check if any learning paths are marked as "featured"
            logger.info("\n4️⃣ CHECKING FOR FEATURED LEARNING PATHS")
            logger.info("-" * 50)
            
            featured_paths = []
            non_featured_paths = []
            
            for path_key, path_data in learning_paths.items():
                if isinstance(path_data, dict):
                    is_featured = path_data.get("featured", False)
                    path_title = path_data.get("title", path_key)
                    
                    if is_featured:
                        featured_paths.append(path_title)
                        logger.info(f"   ✅ FEATURED: {path_title}")
                    else:
                        non_featured_paths.append(path_title)
                        logger.info(f"   ℹ️ Standard: {path_title}")
            
            logger.info(f"\n📊 FEATURED LEARNING PATHS SUMMARY:")
            logger.info(f"   Total learning paths: {len(learning_paths)}")
            logger.info(f"   Featured paths: {len(featured_paths)}")
            logger.info(f"   Non-featured paths: {len(non_featured_paths)}")
            
            if featured_paths:
                logger.info("✅ FEATURED LEARNING PATHS FOUND")
                for path in featured_paths:
                    logger.info(f"   🌟 {path}")
            else:
                logger.info("ℹ️ No learning paths marked as featured")
            
            # Point 5: Verify that content migration worked properly
            logger.info("\n5️⃣ VERIFYING CONTENT MIGRATION STATUS")
            logger.info("-" * 50)
            
            migration_checks = {
                "learningPaths": "learningPaths" in content,
                "courseCategories": "courseCategories" in content,
                "learningPaths_has_data": bool(content.get("learningPaths")),
                "courseCategories_has_data": bool(content.get("courseCategories"))
            }
            
            logger.info("📋 Migration Status Check:")
            for check_name, result in migration_checks.items():
                status = "✅ PASS" if result else "❌ FAIL"
                logger.info(f"   {check_name}: {status}")
            
            all_migration_passed = all(migration_checks.values())
            
            if all_migration_passed:
                logger.info("\n✅ CONTENT MIGRATION WORKED PROPERLY")
                logger.info("   Both learningPaths and courseCategories are present with data")
            else:
                logger.error("\n❌ CONTENT MIGRATION HAS ISSUES")
                failed_checks = [name for name, result in migration_checks.items() if not result]
                logger.error(f"   Failed checks: {failed_checks}")
            
            # FINAL SUMMARY
            logger.info("\n" + "="*80)
            logger.info("🎯 FINAL ASSESSMENT - LEARNING PATHS FUNCTIONALITY")
            logger.info("="*80)
            
            final_status = {
                "api_content_endpoint": True,  # We got here, so it works
                "learning_paths_exists": "learningPaths" in content,
                "learning_paths_has_data": bool(content.get("learningPaths")),
                "data_structure_valid": structure_valid,
                "featured_paths_exist": len(featured_paths) > 0,
                "migration_successful": all_migration_passed
            }
            
            logger.info("\n📊 REVIEW REQUEST VALIDATION RESULTS:")
            for check, result in final_status.items():
                status = "✅ WORKING" if result else "❌ FAILED"
                logger.info(f"   {check}: {status}")
            
            all_passed = all(final_status.values())
            
            if all_passed:
                logger.info("\n🎉 ALL REVIEW REQUEST POINTS VALIDATED SUCCESSFULLY")
                logger.info("✅ Learning Paths backend functionality is FULLY WORKING")
                logger.info("✅ Data is properly populated and structured")
                logger.info("✅ Featured paths are configured correctly")
                logger.info("✅ Content migration was successful")
                logger.info("\n💡 CONCLUSION: The issue with empty frontend content is NOT in the backend.")
                logger.info("    The backend is providing all required learning paths data correctly.")
                logger.info("    Investigation should focus on frontend data fetching and component rendering.")
            else:
                logger.error("\n🚨 SOME REVIEW REQUEST POINTS FAILED")
                failed_points = [point for point, result in final_status.items() if not result]
                logger.error(f"    Failed points: {failed_points}")
            
            # Detailed data sample for debugging
            logger.info("\n📋 SAMPLE LEARNING PATHS DATA FOR FRONTEND DEBUGGING:")
            logger.info("-" * 50)
            
            if learning_paths:
                first_path_key = list(learning_paths.keys())[0]
                first_path_data = learning_paths[first_path_key]
                
                logger.info(f"Sample path key: {first_path_key}")
                logger.info(f"Sample path title: {first_path_data.get('title', 'N/A')}")
                logger.info(f"Sample path courses count: {len(first_path_data.get('courses', []))}")
                logger.info(f"Sample path featured: {first_path_data.get('featured', False)}")
                
                # Show exact API path for frontend
                logger.info(f"\n🔗 FRONTEND API ACCESS PATH:")
                logger.info(f"   API Endpoint: GET {self.backend_url}/api/content")
                logger.info(f"   Data Location: response.data.content.learningPaths")
                logger.info(f"   Data Format: Dictionary with keys: {list(learning_paths.keys())}")
            
        finally:
            await self.cleanup_session()

async def main():
    """Main test execution"""
    tester = ComprehensiveLearningPathsTester()
    await tester.test_review_request_points()

if __name__ == "__main__":
    asyncio.run(main())
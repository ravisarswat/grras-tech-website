#!/usr/bin/env python3
"""
Learning Paths CMS Content Testing Suite
Focused testing for Learning Paths data structure and content
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

class LearningPathsTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results specific to learning paths
        self.test_results = {
            "cms_content_accessible": False,
            "learning_paths_section_exists": False,
            "learning_paths_has_data": False,
            "learning_paths_structure_valid": False,
            "featured_learning_paths_exist": False,
            "content_migration_successful": False
        }
        
        self.errors = []
        self.learning_paths_data = None
        
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
    
    async def test_cms_content_access(self) -> bool:
        """Test 1: Access CMS content endpoint"""
        logger.info("🔍 Testing CMS content endpoint access...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    if content:
                        logger.info("✅ CMS content endpoint accessible")
                        self.test_results["cms_content_accessible"] = True
                        return content
                    else:
                        self.errors.append("CMS content endpoint returned empty content")
                        return False
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"CMS content endpoint access failed: {str(e)}")
            logger.error(f"❌ CMS content endpoint access failed: {e}")
            return False
    
    async def test_learning_paths_section(self, content: Dict[str, Any]) -> bool:
        """Test 2: Check if learningPaths section exists"""
        logger.info("🔍 Checking for learningPaths section in CMS content...")
        
        if "learningPaths" in content:
            logger.info("✅ learningPaths section found in CMS content")
            self.test_results["learning_paths_section_exists"] = True
            self.learning_paths_data = content["learningPaths"]
            return True
        else:
            logger.error("❌ learningPaths section NOT found in CMS content")
            logger.info(f"Available CMS sections: {list(content.keys())}")
            self.errors.append("learningPaths section missing from CMS content")
            return False
    
    async def test_learning_paths_data(self) -> bool:
        """Test 3: Verify learning paths has actual data"""
        logger.info("🔍 Checking if learningPaths has data...")
        
        if not self.learning_paths_data:
            self.errors.append("No learning paths data to validate")
            return False
        
        if isinstance(self.learning_paths_data, list) and len(self.learning_paths_data) > 0:
            logger.info(f"✅ learningPaths contains {len(self.learning_paths_data)} learning paths")
            self.test_results["learning_paths_has_data"] = True
            return True
        elif isinstance(self.learning_paths_data, dict) and self.learning_paths_data:
            logger.info("✅ learningPaths contains data (dictionary format)")
            self.test_results["learning_paths_has_data"] = True
            return True
        else:
            logger.error("❌ learningPaths section exists but is empty or invalid")
            self.errors.append("learningPaths section is empty or has invalid data structure")
            return False
    
    async def test_learning_paths_structure(self) -> bool:
        """Test 4: Validate learning paths data structure"""
        logger.info("🔍 Validating learningPaths data structure...")
        
        if not self.learning_paths_data:
            self.errors.append("No learning paths data to validate structure")
            return False
        
        try:
            # Expected structure for learning paths
            required_fields = ["id", "title", "description", "duration", "courses"]
            optional_fields = ["featured", "level", "outcomes", "prerequisites"]
            
            valid_paths = 0
            total_paths = 0
            
            # Handle both list and dict formats
            paths_to_check = []
            if isinstance(self.learning_paths_data, list):
                paths_to_check = self.learning_paths_data
            elif isinstance(self.learning_paths_data, dict):
                # If it's a dict, check if it has learning path objects
                for key, value in self.learning_paths_data.items():
                    if isinstance(value, (list, dict)):
                        if isinstance(value, list):
                            paths_to_check.extend(value)
                        else:
                            paths_to_check.append(value)
            
            for path in paths_to_check:
                total_paths += 1
                if isinstance(path, dict):
                    missing_fields = [field for field in required_fields if field not in path]
                    if not missing_fields:
                        valid_paths += 1
                        logger.info(f"✅ Learning path '{path.get('title', 'Unknown')}' has valid structure")
                    else:
                        logger.warning(f"⚠️ Learning path '{path.get('title', 'Unknown')}' missing fields: {missing_fields}")
                else:
                    logger.warning(f"⚠️ Invalid learning path data type: {type(path)}")
            
            if valid_paths > 0:
                logger.info(f"✅ Found {valid_paths}/{total_paths} learning paths with valid structure")
                self.test_results["learning_paths_structure_valid"] = True
                return True
            else:
                self.errors.append("No learning paths have valid structure")
                return False
                
        except Exception as e:
            self.errors.append(f"Learning paths structure validation failed: {str(e)}")
            logger.error(f"❌ Learning paths structure validation failed: {e}")
            return False
    
    async def test_featured_learning_paths(self) -> bool:
        """Test 5: Check for featured learning paths"""
        logger.info("🔍 Checking for featured learning paths...")
        
        if not self.learning_paths_data:
            self.errors.append("No learning paths data to check for featured paths")
            return False
        
        try:
            featured_count = 0
            total_paths = 0
            
            # Handle both list and dict formats
            paths_to_check = []
            if isinstance(self.learning_paths_data, list):
                paths_to_check = self.learning_paths_data
            elif isinstance(self.learning_paths_data, dict):
                for key, value in self.learning_paths_data.items():
                    if isinstance(value, (list, dict)):
                        if isinstance(value, list):
                            paths_to_check.extend(value)
                        else:
                            paths_to_check.append(value)
            
            for path in paths_to_check:
                total_paths += 1
                if isinstance(path, dict):
                    if path.get("featured", False):
                        featured_count += 1
                        logger.info(f"✅ Featured learning path found: '{path.get('title', 'Unknown')}'")
            
            if featured_count > 0:
                logger.info(f"✅ Found {featured_count}/{total_paths} featured learning paths")
                self.test_results["featured_learning_paths_exist"] = True
                return True
            else:
                logger.info(f"ℹ️ No featured learning paths found (0/{total_paths})")
                # This is not necessarily an error, just information
                return True
                
        except Exception as e:
            self.errors.append(f"Featured learning paths check failed: {str(e)}")
            logger.error(f"❌ Featured learning paths check failed: {e}")
            return False
    
    async def test_content_migration_status(self) -> bool:
        """Test 6: Verify content migration worked properly"""
        logger.info("🔍 Verifying content migration status...")
        
        # Check if we have both courseCategories and learningPaths
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    has_categories = "courseCategories" in content
                    has_learning_paths = "learningPaths" in content
                    
                    if has_categories and has_learning_paths:
                        logger.info("✅ Content migration successful - both courseCategories and learningPaths present")
                        self.test_results["content_migration_successful"] = True
                        return True
                    else:
                        missing = []
                        if not has_categories:
                            missing.append("courseCategories")
                        if not has_learning_paths:
                            missing.append("learningPaths")
                        
                        logger.error(f"❌ Content migration incomplete - missing: {missing}")
                        self.errors.append(f"Content migration incomplete - missing sections: {missing}")
                        return False
                else:
                    self.errors.append(f"Cannot verify migration status - content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Content migration status check failed: {str(e)}")
            logger.error(f"❌ Content migration status check failed: {e}")
            return False
    
    async def run_learning_paths_tests(self) -> Dict[str, Any]:
        """Run all learning paths specific tests"""
        logger.info("🚀 Starting Learning Paths CMS Content Testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("CMS Content Access", self.test_cms_content_access),
                ("Content Migration Status", self.test_content_migration_status),
            ]
            
            passed_tests = 0
            total_tests = len(tests) + 4  # Additional tests depend on content access
            
            # First, test content access
            logger.info(f"\n{'='*50}")
            logger.info(f"Running: CMS Content Access")
            logger.info(f"{'='*50}")
            
            content = await self.test_cms_content_access()
            if content:
                passed_tests += 1
                logger.info(f"✅ CMS Content Access: PASSED")
                
                # Run dependent tests
                dependent_tests = [
                    ("Learning Paths Section Exists", lambda: self.test_learning_paths_section(content)),
                    ("Learning Paths Has Data", self.test_learning_paths_data),
                    ("Learning Paths Structure Valid", self.test_learning_paths_structure),
                    ("Featured Learning Paths Check", self.test_featured_learning_paths),
                ]
                
                for test_name, test_func in dependent_tests:
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
            else:
                logger.error(f"❌ CMS Content Access: FAILED")
                # Skip dependent tests if content access fails
                logger.warning("⚠️ Skipping dependent tests due to content access failure")
            
            # Test migration status independently
            logger.info(f"\n{'='*50}")
            logger.info(f"Running: Content Migration Status")
            logger.info(f"{'='*50}")
            
            try:
                result = await self.test_content_migration_status()
                if result:
                    passed_tests += 1
                    logger.info(f"✅ Content Migration Status: PASSED")
                else:
                    logger.error(f"❌ Content Migration Status: FAILED")
            except Exception as e:
                logger.error(f"❌ Content Migration Status: ERROR - {e}")
                self.errors.append(f"Content Migration Status: {str(e)}")
            
            # Generate summary
            success_rate = (passed_tests / total_tests) * 100
            
            summary = {
                "timestamp": datetime.now().isoformat(),
                "backend_url": self.backend_url,
                "test_focus": "Learning Paths CMS Content",
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{success_rate:.1f}%",
                "test_results": self.test_results,
                "errors": self.errors,
                "learning_paths_data_summary": self._analyze_learning_paths_data(),
                "recommendations": self._generate_recommendations()
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _analyze_learning_paths_data(self) -> Dict[str, Any]:
        """Analyze the learning paths data structure"""
        if not self.learning_paths_data:
            return {"status": "No data available"}
        
        analysis = {
            "data_type": str(type(self.learning_paths_data).__name__),
            "has_data": bool(self.learning_paths_data),
        }
        
        try:
            if isinstance(self.learning_paths_data, list):
                analysis["count"] = len(self.learning_paths_data)
                analysis["structure"] = "Array of learning paths"
            elif isinstance(self.learning_paths_data, dict):
                analysis["keys"] = list(self.learning_paths_data.keys())
                analysis["structure"] = "Dictionary containing learning paths data"
            
            # Sample first item if available
            sample_item = None
            if isinstance(self.learning_paths_data, list) and self.learning_paths_data:
                sample_item = self.learning_paths_data[0]
            elif isinstance(self.learning_paths_data, dict):
                for key, value in self.learning_paths_data.items():
                    if isinstance(value, (list, dict)):
                        if isinstance(value, list) and value:
                            sample_item = value[0]
                        elif isinstance(value, dict):
                            sample_item = value
                        break
            
            if sample_item and isinstance(sample_item, dict):
                analysis["sample_fields"] = list(sample_item.keys())
            
        except Exception as e:
            analysis["analysis_error"] = str(e)
        
        return analysis
    
    def _generate_recommendations(self) -> List[str]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        if not self.test_results["cms_content_accessible"]:
            recommendations.append("Fix CMS content endpoint - backend API is not accessible")
        
        if not self.test_results["learning_paths_section_exists"]:
            recommendations.append("Run content migration to add learningPaths section to CMS")
        
        if not self.test_results["learning_paths_has_data"]:
            recommendations.append("Populate learningPaths with default data or migrate existing content")
        
        if not self.test_results["learning_paths_structure_valid"]:
            recommendations.append("Fix learningPaths data structure - ensure required fields (id, title, description, duration, courses)")
        
        if not self.test_results["content_migration_successful"]:
            recommendations.append("Complete content migration - run /api/content/migrate endpoint with admin authentication")
        
        if not recommendations:
            recommendations.append("Learning Paths functionality appears to be working correctly")
        
        return recommendations
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*60}")
        print("🎯 LEARNING PATHS CMS CONTENT TESTING SUMMARY")
        print(f"{'='*60}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        print(f"\n📋 LEARNING PATHS DATA ANALYSIS:")
        data_analysis = summary['learning_paths_data_summary']
        for key, value in data_analysis.items():
            print(f"  {key}: {value}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n💡 RECOMMENDATIONS:")
        for rec in summary['recommendations']:
            print(f"  • {rec}")
        
        print(f"\n{'='*60}")

async def main():
    """Main test execution"""
    tester = LearningPathsTester()
    
    try:
        summary = await tester.run_learning_paths_tests()
        tester.print_summary(summary)
        
        # Save results to file
        with open('/app/learning_paths_test_results.json', 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: /app/learning_paths_test_results.json")
        
        # Determine exit code based on critical issues
        critical_failures = [
            not summary['test_results']['cms_content_accessible'],
            not summary['test_results']['learning_paths_section_exists'],
            not summary['test_results']['content_migration_successful']
        ]
        
        if any(critical_failures):
            print(f"\n🚨 CRITICAL ISSUES DETECTED - Learning Paths functionality needs attention!")
            sys.exit(1)
        elif summary['success_rate'] == "100.0%":
            print(f"\n🎉 ALL TESTS PASSED - Learning Paths functionality is working correctly!")
            sys.exit(0)
        else:
            print(f"\n⚠️ SOME TESTS FAILED - Learning Paths has minor issues")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
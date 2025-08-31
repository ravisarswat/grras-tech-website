#!/usr/bin/env python3
"""
Production Learning Paths Data Issue Debug Test
Specifically tests the production backend at https://grras-tech-website-production.up.railway.app
to debug the Learning Paths data issue as requested in the review.
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime
from typing import Dict, Any, List

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductionLearningPathsTester:
    def __init__(self):
        # Production backend URL as specified in review request
        self.backend_url = "https://grras-tech-website-production.up.railway.app"
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        
        # Test results
        self.test_results = {
            "production_backend_accessible": False,
            "content_endpoint_working": False,
            "learning_paths_section_exists": False,
            "learning_paths_data_populated": False,
            "learning_paths_structure_valid": False,
            "frontend_data_format_compatible": False
        }
        
        self.errors = []
        self.learning_paths_data = None
        
    async def setup_session(self):
        """Setup HTTP session"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout
        )
        logger.info("✅ HTTP session initialized for production testing")
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            logger.info("✅ HTTP session closed")
    
    async def test_production_backend_accessibility(self) -> bool:
        """Test 1: Check if production backend is accessible"""
        logger.info("🔍 Testing production backend accessibility...")
        try:
            async with self.session.get(f"{self.api_base}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Production backend accessible: {data}")
                    self.test_results["production_backend_accessible"] = True
                    return True
                else:
                    self.errors.append(f"Production backend health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Production backend accessibility failed: {str(e)}")
            logger.error(f"❌ Production backend accessibility failed: {e}")
            return False
    
    async def test_content_endpoint(self) -> bool:
        """Test 2: Check if /api/content endpoint is working"""
        logger.info("🔍 Testing production /api/content endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    logger.info(f"✅ Content endpoint working - Found {len(content)} sections")
                    logger.info(f"📊 Available sections: {list(content.keys())}")
                    
                    self.test_results["content_endpoint_working"] = True
                    return content
                else:
                    self.errors.append(f"Content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Content endpoint test failed: {str(e)}")
            logger.error(f"❌ Content endpoint test failed: {e}")
            return False
    
    async def test_learning_paths_section_exists(self, content: Dict) -> bool:
        """Test 3: Check if learningPaths section exists in CMS content"""
        logger.info("🔍 Checking if learningPaths section exists...")
        
        if not content:
            self.errors.append("No content data available to check learningPaths section")
            return False
        
        if "learningPaths" in content:
            logger.info("✅ learningPaths section found in CMS content")
            self.learning_paths_data = content["learningPaths"]
            self.test_results["learning_paths_section_exists"] = True
            return True
        else:
            logger.error("❌ learningPaths section NOT FOUND in CMS content")
            logger.info(f"📊 Available sections: {list(content.keys())}")
            self.errors.append("learningPaths section missing from CMS content")
            return False
    
    async def test_learning_paths_data_populated(self) -> bool:
        """Test 4: Check if learningPaths has proper data"""
        logger.info("🔍 Checking if learningPaths data is populated...")
        
        if not self.learning_paths_data:
            self.errors.append("No learningPaths data available to check")
            return False
        
        if isinstance(self.learning_paths_data, dict) and len(self.learning_paths_data) > 0:
            logger.info(f"✅ learningPaths data populated with {len(self.learning_paths_data)} paths")
            logger.info(f"📊 Learning paths found: {list(self.learning_paths_data.keys())}")
            self.test_results["learning_paths_data_populated"] = True
            return True
        else:
            logger.error("❌ learningPaths section exists but is empty or invalid format")
            logger.info(f"📊 learningPaths data type: {type(self.learning_paths_data)}")
            logger.info(f"📊 learningPaths content: {self.learning_paths_data}")
            self.errors.append("learningPaths section is empty or has invalid format")
            return False
    
    async def test_learning_paths_structure(self) -> bool:
        """Test 5: Validate learning paths structure"""
        logger.info("🔍 Validating learning paths data structure...")
        
        if not self.learning_paths_data:
            self.errors.append("No learningPaths data available for structure validation")
            return False
        
        required_fields = ["title", "slug", "description", "featured", "courses", "outcomes", "careerRoles"]
        structure_valid = True
        
        for path_key, path_data in self.learning_paths_data.items():
            logger.info(f"🔍 Validating learning path: {path_key}")
            
            if not isinstance(path_data, dict):
                logger.error(f"❌ Learning path {path_key} is not a dictionary")
                structure_valid = False
                continue
            
            missing_fields = [field for field in required_fields if field not in path_data]
            if missing_fields:
                logger.warning(f"⚠️ Learning path '{path_key}' missing fields: {missing_fields}")
                structure_valid = False
            else:
                logger.info(f"✅ Learning path '{path_key}' has all required fields")
                
                # Check courses structure
                courses = path_data.get("courses", [])
                if isinstance(courses, list) and len(courses) > 0:
                    logger.info(f"  📚 Contains {len(courses)} courses")
                    
                    # Validate course progression data
                    for i, course in enumerate(courses):
                        if isinstance(course, dict) and "slug" in course:
                            logger.info(f"    ✅ Course {i+1}: {course.get('slug')}")
                        else:
                            logger.warning(f"    ⚠️ Course {i+1}: Invalid structure")
                else:
                    logger.warning(f"  ⚠️ No courses or invalid courses structure")
                    structure_valid = False
        
        if structure_valid:
            logger.info("✅ All learning paths have valid structure")
            self.test_results["learning_paths_structure_valid"] = True
        else:
            self.errors.append("Some learning paths have invalid structure")
        
        return structure_valid
    
    async def test_frontend_data_format_compatibility(self) -> bool:
        """Test 6: Check if data format matches frontend expectations"""
        logger.info("🔍 Checking frontend data format compatibility...")
        
        if not self.learning_paths_data:
            self.errors.append("No learningPaths data available for frontend compatibility check")
            return False
        
        # Check if data is in the expected format for frontend consumption
        frontend_compatible = True
        
        for path_key, path_data in self.learning_paths_data.items():
            # Check if it has the expected structure for frontend components
            expected_frontend_fields = {
                "title": str,
                "slug": str, 
                "description": str,
                "featured": bool,
                "courses": list,
                "outcomes": list,
                "careerRoles": list
            }
            
            for field, expected_type in expected_frontend_fields.items():
                if field in path_data:
                    actual_value = path_data[field]
                    if not isinstance(actual_value, expected_type):
                        logger.warning(f"⚠️ Path '{path_key}' field '{field}' has type {type(actual_value)} but expected {expected_type}")
                        frontend_compatible = False
                    else:
                        logger.info(f"  ✅ Field '{field}': {expected_type.__name__} ✓")
                else:
                    logger.warning(f"⚠️ Path '{path_key}' missing frontend field: {field}")
                    frontend_compatible = False
        
        if frontend_compatible:
            logger.info("✅ Learning paths data format is compatible with frontend expectations")
            self.test_results["frontend_data_format_compatible"] = True
        else:
            self.errors.append("Learning paths data format has compatibility issues with frontend")
        
        return frontend_compatible
    
    async def analyze_learning_paths_issue(self) -> Dict[str, Any]:
        """Comprehensive analysis of the learning paths issue"""
        logger.info("🔍 Starting comprehensive learning paths analysis...")
        
        # Detailed analysis results
        analysis = {
            "issue_location": "unknown",
            "root_cause": "unknown", 
            "data_availability": False,
            "structure_issues": [],
            "frontend_compatibility": False,
            "recommended_actions": []
        }
        
        if not self.test_results["production_backend_accessible"]:
            analysis["issue_location"] = "backend_connectivity"
            analysis["root_cause"] = "Production backend is not accessible"
            analysis["recommended_actions"].append("Check production backend deployment and health")
            return analysis
        
        if not self.test_results["content_endpoint_working"]:
            analysis["issue_location"] = "content_api"
            analysis["root_cause"] = "Content API endpoint is not working"
            analysis["recommended_actions"].append("Fix content API endpoint on production backend")
            return analysis
        
        if not self.test_results["learning_paths_section_exists"]:
            analysis["issue_location"] = "cms_data_structure"
            analysis["root_cause"] = "learningPaths section missing from CMS content"
            analysis["recommended_actions"].extend([
                "Add learningPaths section to production CMS content",
                "Run content migration on production backend",
                "Verify CMS content structure includes learningPaths"
            ])
            return analysis
        
        if not self.test_results["learning_paths_data_populated"]:
            analysis["issue_location"] = "cms_data_content"
            analysis["root_cause"] = "learningPaths section exists but is empty"
            analysis["recommended_actions"].extend([
                "Populate learningPaths with actual learning path data",
                "Import learning paths from preview environment to production",
                "Verify learning paths content is properly saved"
            ])
            return analysis
        
        if not self.test_results["learning_paths_structure_valid"]:
            analysis["issue_location"] = "data_structure"
            analysis["root_cause"] = "learningPaths data has structural issues"
            analysis["structure_issues"] = self.errors
            analysis["recommended_actions"].extend([
                "Fix learning paths data structure",
                "Ensure all required fields are present",
                "Validate course progression data"
            ])
            return analysis
        
        if not self.test_results["frontend_data_format_compatible"]:
            analysis["issue_location"] = "data_format"
            analysis["root_cause"] = "learningPaths data format incompatible with frontend"
            analysis["recommended_actions"].extend([
                "Update learning paths data format to match frontend expectations",
                "Check frontend component requirements",
                "Ensure proper data types for all fields"
            ])
            return analysis
        
        # If all backend tests pass, the issue is likely in the frontend
        analysis["issue_location"] = "frontend_integration"
        analysis["root_cause"] = "Backend data is correct, issue is in frontend rendering"
        analysis["data_availability"] = True
        analysis["frontend_compatibility"] = True
        analysis["recommended_actions"].extend([
            "Check frontend learning paths components",
            "Verify frontend API data fetching",
            "Debug frontend state management for learning paths",
            "Check frontend routing for learning paths page"
        ])
        
        return analysis
    
    async def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run comprehensive learning paths debugging test"""
        logger.info("🚀 Starting production learning paths debugging...")
        
        await self.setup_session()
        
        try:
            # Test sequence for debugging learning paths issue
            tests = [
                ("Production Backend Accessibility", self.test_production_backend_accessibility),
                ("Content Endpoint", self.test_content_endpoint),
            ]
            
            content_data = None
            
            # Run initial tests
            for test_name, test_func in tests:
                logger.info(f"\n{'='*50}")
                logger.info(f"Running: {test_name}")
                logger.info(f"{'='*50}")
                
                try:
                    if test_name == "Content Endpoint":
                        content_data = await test_func()
                        if not content_data:
                            break
                    else:
                        result = await test_func()
                        if not result:
                            break
                except Exception as e:
                    logger.error(f"❌ {test_name}: ERROR - {e}")
                    self.errors.append(f"{test_name}: {str(e)}")
                    break
            
            # Continue with learning paths specific tests if content is available
            if content_data:
                learning_paths_tests = [
                    ("Learning Paths Section Exists", lambda: self.test_learning_paths_section_exists(content_data)),
                    ("Learning Paths Data Populated", self.test_learning_paths_data_populated),
                    ("Learning Paths Structure Valid", self.test_learning_paths_structure),
                    ("Frontend Data Format Compatible", self.test_frontend_data_format_compatibility),
                ]
                
                for test_name, test_func in learning_paths_tests:
                    logger.info(f"\n{'='*50}")
                    logger.info(f"Running: {test_name}")
                    logger.info(f"{'='*50}")
                    
                    try:
                        await test_func()
                    except Exception as e:
                        logger.error(f"❌ {test_name}: ERROR - {e}")
                        self.errors.append(f"{test_name}: {str(e)}")
            
            # Perform comprehensive analysis
            analysis = await self.analyze_learning_paths_issue()
            
            # Generate summary
            summary = {
                "timestamp": datetime.now().isoformat(),
                "backend_url": self.backend_url,
                "test_results": self.test_results,
                "errors": self.errors,
                "learning_paths_data": self.learning_paths_data,
                "issue_analysis": analysis,
                "debugging_complete": True
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def print_debug_summary(self, summary: Dict[str, Any]):
        """Print debugging summary"""
        print(f"\n{'='*70}")
        print("🔍 PRODUCTION LEARNING PATHS DEBUG SUMMARY")
        print(f"{'='*70}")
        print(f"Production URL: {summary['backend_url']}")
        print(f"Debug Time: {summary['timestamp']}")
        
        print(f"\n📊 TEST RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        analysis = summary['issue_analysis']
        print(f"\n🎯 ISSUE ANALYSIS:")
        print(f"  Issue Location: {analysis['issue_location']}")
        print(f"  Root Cause: {analysis['root_cause']}")
        print(f"  Data Available: {'✅ YES' if analysis['data_availability'] else '❌ NO'}")
        print(f"  Frontend Compatible: {'✅ YES' if analysis['frontend_compatibility'] else '❌ NO'}")
        
        if analysis['recommended_actions']:
            print(f"\n🔧 RECOMMENDED ACTIONS:")
            for i, action in enumerate(analysis['recommended_actions'], 1):
                print(f"  {i}. {action}")
        
        if summary['learning_paths_data']:
            print(f"\n📚 LEARNING PATHS DATA FOUND:")
            for path_key, path_data in summary['learning_paths_data'].items():
                title = path_data.get('title', 'Unknown Title')
                courses_count = len(path_data.get('courses', []))
                featured = '⭐ Featured' if path_data.get('featured') else 'Standard'
                print(f"  • {title} ({courses_count} courses) - {featured}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n{'='*70}")

async def main():
    """Main debug execution"""
    tester = ProductionLearningPathsTester()
    
    try:
        summary = await tester.run_comprehensive_test()
        tester.print_debug_summary(summary)
        
        # Save results to file
        results_file = '/app/production_learning_paths_debug.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Debug results saved to: {results_file}")
        
        # Determine exit code based on analysis
        analysis = summary['issue_analysis']
        if analysis['issue_location'] == "frontend_integration":
            print(f"\n✅ BACKEND DATA IS CORRECT - Issue is in frontend integration")
            return 0
        else:
            print(f"\n🚨 BACKEND ISSUE IDENTIFIED - {analysis['root_cause']}")
            return 1
            
    except Exception as e:
        logger.error(f"❌ Debug execution failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
#!/usr/bin/env python3
"""
Comprehensive Production Backend Test for Review Request
Tests all specific requirements mentioned in the review request:
1. Learning Paths Data Check: GET /api/content and verify learningPaths section
2. Learning Paths Structure: Check proper structure with required fields
3. CMS Content Analysis: Verify learning paths are properly structured and not empty
4. Frontend Data Format: Ensure data format matches frontend expectations
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

class ComprehensiveProductionTester:
    def __init__(self):
        # Production backend URL as specified in review request
        self.backend_url = "https://grras-tech-website-production.up.railway.app"
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        
        # Test results for review requirements
        self.review_results = {
            "learning_paths_data_check": False,
            "learning_paths_structure_validation": False,
            "cms_content_analysis": False,
            "frontend_data_format_validation": False
        }
        
        self.detailed_findings = {
            "learning_paths_count": 0,
            "featured_paths_count": 0,
            "total_courses_in_paths": 0,
            "structure_issues": [],
            "missing_fields": [],
            "data_quality_score": 0
        }
        
        self.errors = []
        self.cms_content = None
        self.learning_paths_data = None
        
    async def setup_session(self):
        """Setup HTTP session"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout
        )
        logger.info("✅ HTTP session initialized for comprehensive production testing")
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            logger.info("✅ HTTP session closed")
    
    async def test_learning_paths_data_check(self) -> bool:
        """Review Requirement 1: Learning Paths Data Check"""
        logger.info("🔍 REVIEW REQUIREMENT 1: Learning Paths Data Check")
        logger.info("Testing GET https://grras-tech-website-production.up.railway.app/api/content")
        
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    self.cms_content = data.get("content", {})
                    
                    logger.info(f"✅ GET /api/content successful - Status: {response.status}")
                    logger.info(f"📊 CMS Content sections found: {len(self.cms_content)}")
                    logger.info(f"📋 Available sections: {list(self.cms_content.keys())}")
                    
                    # Check if learningPaths section exists
                    if "learningPaths" in self.cms_content:
                        self.learning_paths_data = self.cms_content["learningPaths"]
                        logger.info("✅ learningPaths section EXISTS in CMS content")
                        
                        if isinstance(self.learning_paths_data, dict) and len(self.learning_paths_data) > 0:
                            self.detailed_findings["learning_paths_count"] = len(self.learning_paths_data)
                            logger.info(f"✅ learningPaths section has PROPER DATA with {len(self.learning_paths_data)} paths")
                            
                            # Count featured paths
                            featured_count = sum(1 for path in self.learning_paths_data.values() 
                                               if isinstance(path, dict) and path.get("featured", False))
                            self.detailed_findings["featured_paths_count"] = featured_count
                            logger.info(f"📊 Featured learning paths: {featured_count}")
                            
                            self.review_results["learning_paths_data_check"] = True
                            return True
                        else:
                            logger.error("❌ learningPaths section exists but is EMPTY or invalid format")
                            self.errors.append("learningPaths section is empty or has invalid format")
                            return False
                    else:
                        logger.error("❌ learningPaths section NOT FOUND in CMS content")
                        self.errors.append("learningPaths section missing from CMS content")
                        return False
                else:
                    logger.error(f"❌ GET /api/content failed - Status: {response.status}")
                    self.errors.append(f"Content API failed with status {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Learning Paths Data Check failed: {e}")
            self.errors.append(f"Learning Paths Data Check failed: {str(e)}")
            return False
    
    async def test_learning_paths_structure_validation(self) -> bool:
        """Review Requirement 2: Learning Paths Structure Validation"""
        logger.info("🔍 REVIEW REQUIREMENT 2: Learning Paths Structure Validation")
        logger.info("Checking if learning paths have proper structure with required fields")
        
        if not self.learning_paths_data:
            logger.error("❌ No learning paths data available for structure validation")
            self.errors.append("No learning paths data for structure validation")
            return False
        
        # Required fields as per review request
        required_fields = {
            "title": "Learning path title",
            "slug": "URL-friendly identifier", 
            "description": "Learning path description",
            "featured": "Featured flag for prominence",
            "courses": "Course progression data",
            "outcomes": "Career outcomes",
            "careerRoles": "Career roles and opportunities"
        }
        
        structure_valid = True
        total_courses = 0
        
        logger.info(f"📋 Validating structure for {len(self.learning_paths_data)} learning paths...")
        
        for path_key, path_data in self.learning_paths_data.items():
            logger.info(f"\n🔍 Validating: {path_key}")
            
            if not isinstance(path_data, dict):
                logger.error(f"❌ Learning path {path_key} is not a dictionary")
                self.detailed_findings["structure_issues"].append(f"{path_key}: Not a dictionary")
                structure_valid = False
                continue
            
            path_title = path_data.get("title", "Unknown")
            logger.info(f"  📚 Title: {path_title}")
            
            # Check all required fields
            missing_fields = []
            for field, description in required_fields.items():
                if field not in path_data:
                    missing_fields.append(field)
                    logger.error(f"    ❌ Missing: {field} ({description})")
                else:
                    value = path_data[field]
                    logger.info(f"    ✅ {field}: {type(value).__name__}")
                    
                    # Special validation for courses
                    if field == "courses" and isinstance(value, list):
                        courses_count = len(value)
                        total_courses += courses_count
                        logger.info(f"      📊 Contains {courses_count} courses")
                        
                        # Validate course progression data
                        for i, course in enumerate(value):
                            if isinstance(course, dict):
                                course_slug = course.get("courseSlug") or course.get("slug")
                                course_title = course.get("title", "Unknown")
                                course_order = course.get("order", i+1)
                                logger.info(f"        {course_order}. {course_title} ({course_slug})")
                            else:
                                logger.warning(f"        ⚠️ Course {i+1}: Invalid structure")
            
            if missing_fields:
                self.detailed_findings["missing_fields"].extend([f"{path_key}.{field}" for field in missing_fields])
                structure_valid = False
            else:
                logger.info(f"    ✅ All required fields present")
        
        self.detailed_findings["total_courses_in_paths"] = total_courses
        
        if structure_valid:
            logger.info("✅ ALL learning paths have proper structure with required fields")
            self.review_results["learning_paths_structure_validation"] = True
        else:
            logger.error("❌ Some learning paths have structural issues")
            self.errors.append("Learning paths structure validation failed")
        
        return structure_valid
    
    async def test_cms_content_analysis(self) -> bool:
        """Review Requirement 3: CMS Content Analysis"""
        logger.info("🔍 REVIEW REQUIREMENT 3: CMS Content Analysis")
        logger.info("Verifying that learning paths are properly structured and not empty")
        
        if not self.cms_content or not self.learning_paths_data:
            logger.error("❌ No CMS content available for analysis")
            self.errors.append("No CMS content for analysis")
            return False
        
        # Comprehensive CMS content analysis
        analysis_results = {
            "cms_sections_count": len(self.cms_content),
            "learning_paths_present": "learningPaths" in self.cms_content,
            "learning_paths_populated": len(self.learning_paths_data) > 0,
            "data_quality_issues": []
        }
        
        logger.info(f"📊 CMS Content Analysis Results:")
        logger.info(f"  Total CMS sections: {analysis_results['cms_sections_count']}")
        logger.info(f"  Learning paths present: {'✅ YES' if analysis_results['learning_paths_present'] else '❌ NO'}")
        logger.info(f"  Learning paths populated: {'✅ YES' if analysis_results['learning_paths_populated'] else '❌ NO'}")
        
        # Data quality analysis
        quality_score = 0
        max_score = 0
        
        for path_key, path_data in self.learning_paths_data.items():
            max_score += 10  # 10 points per path
            path_score = 0
            
            # Check data completeness (2 points each)
            required_checks = [
                ("title", lambda x: isinstance(x, str) and len(x) > 0),
                ("description", lambda x: isinstance(x, str) and len(x) > 10),
                ("courses", lambda x: isinstance(x, list) and len(x) > 0),
                ("outcomes", lambda x: isinstance(x, list) and len(x) > 0),
                ("careerRoles", lambda x: isinstance(x, list) and len(x) > 0)
            ]
            
            for field, validator in required_checks:
                if field in path_data and validator(path_data[field]):
                    path_score += 2
                else:
                    analysis_results["data_quality_issues"].append(f"{path_key}.{field}: Quality issue")
            
            quality_score += path_score
            logger.info(f"  📊 {path_key}: {path_score}/10 quality points")
        
        # Calculate overall quality score
        overall_quality = (quality_score / max_score * 100) if max_score > 0 else 0
        self.detailed_findings["data_quality_score"] = overall_quality
        
        logger.info(f"📊 Overall Data Quality Score: {overall_quality:.1f}%")
        
        if analysis_results["learning_paths_present"] and analysis_results["learning_paths_populated"] and overall_quality >= 80:
            logger.info("✅ CMS Content Analysis: Learning paths are properly structured and well-populated")
            self.review_results["cms_content_analysis"] = True
            return True
        else:
            logger.error("❌ CMS Content Analysis: Issues found with learning paths structure or content")
            self.errors.append("CMS content analysis found issues")
            return False
    
    async def test_frontend_data_format_validation(self) -> bool:
        """Review Requirement 4: Frontend Data Format Validation"""
        logger.info("🔍 REVIEW REQUIREMENT 4: Frontend Data Format Validation")
        logger.info("Ensuring learning paths data format matches what the frontend expects")
        
        if not self.learning_paths_data:
            logger.error("❌ No learning paths data for frontend format validation")
            self.errors.append("No learning paths data for frontend validation")
            return False
        
        # Expected frontend data format requirements
        frontend_requirements = {
            "title": {"type": str, "required": True, "description": "Display title"},
            "slug": {"type": str, "required": True, "description": "URL routing"},
            "description": {"type": str, "required": True, "description": "Path description"},
            "featured": {"type": bool, "required": True, "description": "Homepage display"},
            "courses": {"type": list, "required": True, "description": "Course progression"},
            "outcomes": {"type": list, "required": True, "description": "Learning outcomes"},
            "careerRoles": {"type": list, "required": True, "description": "Career opportunities"},
            "duration": {"type": str, "required": False, "description": "Time estimate"},
            "level": {"type": str, "required": False, "description": "Difficulty level"},
            "averageSalary": {"type": str, "required": False, "description": "Salary information"}
        }
        
        format_compatible = True
        compatibility_issues = []
        
        logger.info(f"📋 Validating frontend compatibility for {len(self.learning_paths_data)} learning paths...")
        
        for path_key, path_data in self.learning_paths_data.items():
            logger.info(f"\n🔍 Frontend validation: {path_key}")
            
            for field, requirements in frontend_requirements.items():
                expected_type = requirements["type"]
                is_required = requirements["required"]
                description = requirements["description"]
                
                if field in path_data:
                    actual_value = path_data[field]
                    if isinstance(actual_value, expected_type):
                        logger.info(f"    ✅ {field}: {expected_type.__name__} ✓ ({description})")
                    else:
                        logger.error(f"    ❌ {field}: Expected {expected_type.__name__}, got {type(actual_value).__name__}")
                        compatibility_issues.append(f"{path_key}.{field}: Type mismatch")
                        format_compatible = False
                elif is_required:
                    logger.error(f"    ❌ {field}: MISSING (required for {description})")
                    compatibility_issues.append(f"{path_key}.{field}: Missing required field")
                    format_compatible = False
                else:
                    logger.info(f"    ⚪ {field}: Optional field not present")
            
            # Special validation for courses array structure
            if "courses" in path_data and isinstance(path_data["courses"], list):
                courses = path_data["courses"]
                logger.info(f"    📚 Validating {len(courses)} courses structure...")
                
                for i, course in enumerate(courses):
                    if isinstance(course, dict):
                        # Check course object structure
                        course_slug = course.get("courseSlug") or course.get("slug")
                        course_title = course.get("title")
                        course_order = course.get("order")
                        
                        if course_slug and course_title:
                            logger.info(f"      ✅ Course {i+1}: Valid structure")
                        else:
                            logger.warning(f"      ⚠️ Course {i+1}: Missing slug or title")
                    else:
                        logger.error(f"      ❌ Course {i+1}: Invalid structure (not a dict)")
                        compatibility_issues.append(f"{path_key}.courses[{i}]: Invalid structure")
                        format_compatible = False
        
        if format_compatible:
            logger.info("✅ Frontend Data Format: All learning paths compatible with frontend expectations")
            self.review_results["frontend_data_format_validation"] = True
        else:
            logger.error("❌ Frontend Data Format: Compatibility issues found")
            logger.error(f"Issues: {compatibility_issues}")
            self.errors.extend(compatibility_issues)
        
        return format_compatible
    
    async def generate_review_response(self) -> Dict[str, Any]:
        """Generate comprehensive response to review request"""
        
        # Overall assessment
        all_requirements_met = all(self.review_results.values())
        
        response = {
            "review_request_status": "COMPLETED",
            "timestamp": datetime.now().isoformat(),
            "production_backend_url": self.backend_url,
            "overall_result": "✅ BACKEND DATA IS CORRECT" if all_requirements_met else "❌ BACKEND ISSUES FOUND",
            
            # Review requirements results
            "review_requirements": {
                "1_learning_paths_data_check": {
                    "status": "✅ PASS" if self.review_results["learning_paths_data_check"] else "❌ FAIL",
                    "description": "GET /api/content and verify learningPaths section exists",
                    "result": "learningPaths section exists and has proper data" if self.review_results["learning_paths_data_check"] else "learningPaths section missing or empty"
                },
                "2_learning_paths_structure": {
                    "status": "✅ PASS" if self.review_results["learning_paths_structure_validation"] else "❌ FAIL", 
                    "description": "Check proper structure with title, slug, description, featured, courses, outcomes, careerRoles",
                    "result": "All required fields present with proper structure" if self.review_results["learning_paths_structure_validation"] else "Missing required fields or structural issues"
                },
                "3_cms_content_analysis": {
                    "status": "✅ PASS" if self.review_results["cms_content_analysis"] else "❌ FAIL",
                    "description": "Verify learning paths are properly structured and not empty", 
                    "result": f"Learning paths properly structured with {self.detailed_findings['data_quality_score']:.1f}% quality score" if self.review_results["cms_content_analysis"] else "Learning paths have structural or content issues"
                },
                "4_frontend_data_format": {
                    "status": "✅ PASS" if self.review_results["frontend_data_format_validation"] else "❌ FAIL",
                    "description": "Ensure data format matches frontend expectations",
                    "result": "Data format fully compatible with frontend" if self.review_results["frontend_data_format_validation"] else "Data format compatibility issues found"
                }
            },
            
            # Detailed findings
            "detailed_findings": self.detailed_findings,
            
            # Learning paths summary
            "learning_paths_summary": {
                "total_paths": self.detailed_findings["learning_paths_count"],
                "featured_paths": self.detailed_findings["featured_paths_count"],
                "total_courses": self.detailed_findings["total_courses_in_paths"],
                "data_quality": f"{self.detailed_findings['data_quality_score']:.1f}%"
            },
            
            # Issue analysis
            "issue_analysis": {
                "backend_data_status": "✅ CORRECT" if all_requirements_met else "❌ ISSUES FOUND",
                "root_cause": "Frontend integration issue - backend data is correct" if all_requirements_met else "Backend data structure or content issues",
                "recommended_action": "Debug frontend learning paths components and routing" if all_requirements_met else "Fix backend learning paths data structure and content"
            },
            
            # Errors if any
            "errors": self.errors
        }
        
        return response
    
    async def run_comprehensive_review_test(self) -> Dict[str, Any]:
        """Run comprehensive test for all review requirements"""
        logger.info("🚀 Starting Comprehensive Production Backend Test for Review Request")
        logger.info("="*80)
        
        await self.setup_session()
        
        try:
            # Run all review requirement tests
            review_tests = [
                ("Learning Paths Data Check", self.test_learning_paths_data_check),
                ("Learning Paths Structure Validation", self.test_learning_paths_structure_validation),
                ("CMS Content Analysis", self.test_cms_content_analysis),
                ("Frontend Data Format Validation", self.test_frontend_data_format_validation),
            ]
            
            for test_name, test_func in review_tests:
                logger.info(f"\n{'='*60}")
                logger.info(f"🔍 {test_name}")
                logger.info(f"{'='*60}")
                
                try:
                    await test_func()
                except Exception as e:
                    logger.error(f"❌ {test_name}: ERROR - {e}")
                    self.errors.append(f"{test_name}: {str(e)}")
            
            # Generate comprehensive response
            response = await self.generate_review_response()
            
            return response
            
        finally:
            await self.cleanup_session()
    
    def print_review_response(self, response: Dict[str, Any]):
        """Print comprehensive review response"""
        print(f"\n{'='*80}")
        print("🎯 COMPREHENSIVE PRODUCTION BACKEND TEST RESULTS")
        print(f"{'='*80}")
        print(f"Production URL: {response['production_backend_url']}")
        print(f"Test Time: {response['timestamp']}")
        print(f"Overall Result: {response['overall_result']}")
        
        print(f"\n📋 REVIEW REQUIREMENTS RESULTS:")
        for req_key, req_data in response['review_requirements'].items():
            print(f"  {req_key}: {req_data['status']}")
            print(f"    Description: {req_data['description']}")
            print(f"    Result: {req_data['result']}")
        
        print(f"\n📊 LEARNING PATHS SUMMARY:")
        summary = response['learning_paths_summary']
        print(f"  Total Learning Paths: {summary['total_paths']}")
        print(f"  Featured Paths: {summary['featured_paths']}")
        print(f"  Total Courses in Paths: {summary['total_courses']}")
        print(f"  Data Quality Score: {summary['data_quality']}")
        
        print(f"\n🎯 ISSUE ANALYSIS:")
        analysis = response['issue_analysis']
        print(f"  Backend Data Status: {analysis['backend_data_status']}")
        print(f"  Root Cause: {analysis['root_cause']}")
        print(f"  Recommended Action: {analysis['recommended_action']}")
        
        if response['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in response['errors']:
                print(f"  • {error}")
        
        print(f"\n{'='*80}")

async def main():
    """Main test execution for review request"""
    tester = ComprehensiveProductionTester()
    
    try:
        response = await tester.run_comprehensive_review_test()
        tester.print_review_response(response)
        
        # Save results to file
        results_file = '/app/comprehensive_production_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(response, f, indent=2)
        
        print(f"\n💾 Comprehensive test results saved to: {results_file}")
        
        # Determine exit code based on results
        if response['overall_result'].startswith("✅"):
            print(f"\n✅ ALL REVIEW REQUIREMENTS MET - Backend data is correct")
            print(f"🔍 Issue is in frontend integration, not backend data")
            return 0
        else:
            print(f"\n🚨 BACKEND ISSUES FOUND - Review requirements not fully met")
            return 1
            
    except Exception as e:
        logger.error(f"❌ Comprehensive test execution failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
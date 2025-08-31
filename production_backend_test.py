#!/usr/bin/env python3
"""
Production Backend Testing Suite for GRRAS Solutions Training Institute
Tests the production backend at https://grras-tech-website-production.up.railway.app
"""

import asyncio
import aiohttp
import json
import sys
from datetime import datetime
from typing import Dict, Any, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductionBackendTester:
    def __init__(self):
        # Production backend URL from review request
        self.backend_url = "https://grras-tech-website-production.up.railway.app"
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results
        self.test_results = {
            "health_check": False,
            "courses_endpoint": False,
            "cms_content": False,
            "admin_authentication": False,
            "course_analysis": False
        }
        
        self.errors = []
        self.courses_found = []
        self.certification_courses = []
        
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
    
    async def test_health_check(self) -> bool:
        """Test 1: Health check endpoint"""
        logger.info("🔍 Testing health check endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/health") as response:
                logger.info(f"Health check response status: {response.status}")
                logger.info(f"Health check response headers: {dict(response.headers)}")
                
                if response.status == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' in content_type:
                        data = await response.json()
                        logger.info(f"✅ Health check passed: {data}")
                        self.test_results["health_check"] = True
                        return True
                    else:
                        # Check if it's HTML (frontend app)
                        text_content = await response.text()
                        if '<html' in text_content.lower():
                            logger.warning("⚠️ Health check returned HTML instead of JSON - Backend API not accessible")
                            self.errors.append("Health check endpoint returns HTML (frontend app) instead of JSON API response")
                        else:
                            logger.warning(f"⚠️ Health check returned unexpected content type: {content_type}")
                            self.errors.append(f"Health check returned unexpected content type: {content_type}")
                        return False
                else:
                    self.errors.append(f"Health check failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Health check failed: {str(e)}")
            logger.error(f"❌ Health check failed: {e}")
            return False
    
    async def test_courses_endpoint(self) -> bool:
        """Test 2: Get current courses"""
        logger.info("🔍 Testing courses endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                logger.info(f"Courses endpoint response status: {response.status}")
                logger.info(f"Courses endpoint response headers: {dict(response.headers)}")
                
                if response.status == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' in content_type:
                        data = await response.json()
                        courses = data.get("courses", [])
                        self.courses_found = courses
                        
                        logger.info(f"✅ Found {len(courses)} courses in production")
                        
                        # Log course titles for analysis
                        for course in courses:
                            title = course.get("title", "Unknown")
                            slug = course.get("slug", "unknown")
                            logger.info(f"  📚 Course: {title} (slug: {slug})")
                        
                        self.test_results["courses_endpoint"] = True
                        return True
                    else:
                        text_content = await response.text()
                        if '<html' in text_content.lower():
                            logger.warning("⚠️ Courses endpoint returned HTML instead of JSON")
                            self.errors.append("Courses endpoint returns HTML (frontend app) instead of JSON API response")
                        else:
                            logger.warning(f"⚠️ Courses endpoint returned unexpected content type: {content_type}")
                            self.errors.append(f"Courses endpoint returned unexpected content type: {content_type}")
                        return False
                else:
                    self.errors.append(f"Courses endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Courses endpoint failed: {str(e)}")
            logger.error(f"❌ Courses endpoint failed: {e}")
            return False
    
    async def test_cms_content(self) -> bool:
        """Test 3: Get CMS content"""
        logger.info("🔍 Testing CMS content endpoint...")
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                logger.info(f"CMS content response status: {response.status}")
                logger.info(f"CMS content response headers: {dict(response.headers)}")
                
                if response.status == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' in content_type:
                        data = await response.json()
                        content = data.get("content", {})
                        
                        logger.info(f"✅ CMS content accessible")
                        logger.info(f"  📊 CMS sections: {list(content.keys())}")
                        
                        # Check for courses in CMS content
                        cms_courses = content.get("courses", [])
                        logger.info(f"  📚 Courses in CMS: {len(cms_courses)}")
                        
                        self.test_results["cms_content"] = True
                        return True
                    else:
                        text_content = await response.text()
                        if '<html' in text_content.lower():
                            logger.warning("⚠️ CMS content endpoint returned HTML instead of JSON")
                            self.errors.append("CMS content endpoint returns HTML (frontend app) instead of JSON API response")
                        else:
                            logger.warning(f"⚠️ CMS content endpoint returned unexpected content type: {content_type}")
                            self.errors.append(f"CMS content endpoint returned unexpected content type: {content_type}")
                        return False
                else:
                    self.errors.append(f"CMS content endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"CMS content endpoint failed: {str(e)}")
            logger.error(f"❌ CMS content endpoint failed: {e}")
            return False
    
    async def test_admin_authentication(self) -> bool:
        """Test 4: Admin authentication with provided password"""
        logger.info("🔍 Testing admin authentication...")
        try:
            # Test with password from review request
            login_data = {"password": "grras-admin"}
            
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                logger.info(f"Admin login response status: {response.status}")
                logger.info(f"Admin login response headers: {dict(response.headers)}")
                
                if response.status == 200:
                    content_type = response.headers.get('content-type', '')
                    if 'application/json' in content_type:
                        data = await response.json()
                        self.admin_token = data.get("token")
                        
                        if self.admin_token:
                            logger.info("✅ Admin authentication successful with 'grras-admin' password")
                            self.test_results["admin_authentication"] = True
                            return True
                        else:
                            logger.warning("⚠️ Admin login successful but no token received")
                            self.errors.append("Admin login successful but no token received")
                            return False
                    else:
                        text_content = await response.text()
                        if '<html' in text_content.lower():
                            logger.warning("⚠️ Admin login endpoint returned HTML instead of JSON")
                            self.errors.append("Admin login endpoint returns HTML (frontend app) instead of JSON API response")
                        else:
                            logger.warning(f"⚠️ Admin login endpoint returned unexpected content type: {content_type}")
                            self.errors.append(f"Admin login endpoint returned unexpected content type: {content_type}")
                        return False
                elif response.status == 401:
                    logger.warning("⚠️ Admin authentication failed - Invalid password 'grras-admin'")
                    self.errors.append("Admin authentication failed with password 'grras-admin'")
                    return False
                else:
                    self.errors.append(f"Admin login failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Admin authentication failed: {str(e)}")
            logger.error(f"❌ Admin authentication failed: {e}")
            return False
    
    def analyze_courses(self) -> bool:
        """Test 5: Analyze courses for new certification courses"""
        logger.info("🔍 Analyzing courses for new certification courses...")
        
        if not self.courses_found:
            logger.warning("⚠️ No courses found to analyze")
            self.errors.append("No courses available for analysis")
            return False
        
        # Expected new certification courses from review request
        expected_certification_courses = [
            "aws",
            "kubernetes", 
            "red hat",
            "rhcsa",
            "rhce",
            "cka",
            "cks",
            "cloud practitioner",
            "solutions architect"
        ]
        
        # Analyze existing courses
        found_certifications = []
        
        for course in self.courses_found:
            title = course.get("title", "").lower()
            slug = course.get("slug", "").lower()
            
            # Check if course matches any expected certification
            for cert in expected_certification_courses:
                if cert in title or cert in slug:
                    found_certifications.append({
                        "title": course.get("title"),
                        "slug": course.get("slug"),
                        "matched_keyword": cert
                    })
                    break
        
        self.certification_courses = found_certifications
        
        logger.info(f"📊 Course Analysis Results:")
        logger.info(f"  Total courses in production: {len(self.courses_found)}")
        logger.info(f"  Certification courses found: {len(found_certifications)}")
        
        if found_certifications:
            logger.info("  🎯 Found certification courses:")
            for cert in found_certifications:
                logger.info(f"    • {cert['title']} (matched: {cert['matched_keyword']})")
        else:
            logger.warning("  ⚠️ No new certification courses (AWS, Kubernetes, Red Hat) found in production")
        
        # Check for missing certifications
        missing_keywords = []
        for keyword in expected_certification_courses:
            found = any(keyword in cert['matched_keyword'] for cert in found_certifications)
            if not found:
                missing_keywords.append(keyword)
        
        if missing_keywords:
            logger.warning(f"  ❌ Missing certification keywords: {missing_keywords}")
            self.errors.append(f"Missing certification courses for keywords: {missing_keywords}")
        
        self.test_results["course_analysis"] = True
        return True
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all production backend tests"""
        logger.info("🚀 Starting production backend testing...")
        logger.info(f"🌐 Testing production backend: {self.backend_url}")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("Health Check", self.test_health_check),
                ("Courses Endpoint", self.test_courses_endpoint),
                ("CMS Content", self.test_cms_content),
                ("Admin Authentication", self.test_admin_authentication),
                ("Course Analysis", self.analyze_courses),
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
                "errors": self.errors,
                "courses_analysis": {
                    "total_courses": len(self.courses_found),
                    "certification_courses_found": len(self.certification_courses),
                    "certification_courses": self.certification_courses,
                    "all_courses": [{"title": c.get("title"), "slug": c.get("slug")} for c in self.courses_found]
                },
                "backend_accessible": self.test_results["health_check"] or self.test_results["courses_endpoint"],
                "new_certifications_missing": len(self.certification_courses) == 0
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*70}")
        print("🎯 PRODUCTION BACKEND TESTING SUMMARY")
        print(f"{'='*70}")
        print(f"Production URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        print(f"\n🎯 BACKEND ACCESSIBILITY:")
        if summary['backend_accessible']:
            print("  ✅ Production backend API is accessible")
        else:
            print("  ❌ Production backend API is NOT accessible")
            print("  ℹ️  Backend may not be deployed or serving only frontend app")
        
        print(f"\n📚 COURSES ANALYSIS:")
        courses_data = summary['courses_analysis']
        print(f"  Total courses in production: {courses_data['total_courses']}")
        print(f"  Certification courses found: {courses_data['certification_courses_found']}")
        
        if courses_data['certification_courses']:
            print(f"  🎯 Found certification courses:")
            for cert in courses_data['certification_courses']:
                print(f"    • {cert['title']}")
        else:
            print(f"  ⚠️ No new certification courses (AWS, Kubernetes, Red Hat) found")
        
        if courses_data['all_courses']:
            print(f"\n📋 ALL COURSES IN PRODUCTION:")
            for course in courses_data['all_courses']:
                print(f"    • {course['title']} (slug: {course['slug']})")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n🎯 KEY FINDINGS:")
        if summary['new_certifications_missing']:
            print("  ❌ NEW CERTIFICATION COURSES ARE MISSING from production backend")
            print("  📝 AWS, Kubernetes, and Red Hat certification courses not found")
        else:
            print("  ✅ Some certification courses found in production")
        
        if not summary['backend_accessible']:
            print("  🚨 CRITICAL: Production backend API endpoints are not accessible")
            print("  📝 Production site appears to serve only React frontend application")
        
        print(f"\n{'='*70}")

async def main():
    """Main test execution"""
    tester = ProductionBackendTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        results_file = '/app/production_backend_test_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: {results_file}")
        
        # Determine exit code based on findings
        if not summary['backend_accessible']:
            print(f"\n🚨 CRITICAL: Production backend API is not accessible!")
            sys.exit(1)
        elif summary['new_certifications_missing']:
            print(f"\n⚠️ WARNING: New certification courses missing from production")
            sys.exit(1)
        else:
            print(f"\n✅ Production backend testing completed")
            sys.exit(0)
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
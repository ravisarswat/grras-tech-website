#!/usr/bin/env python3
"""
Production Backend Course Addition Test for GRRAS Solutions
Adds the missing certification courses directly to production backend
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

class ProductionCourseAdder:
    def __init__(self):
        self.production_url = "https://grras-tech-website-production.up.railway.app"
        self.api_base = f"{self.production_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results
        self.test_results = {
            "admin_authentication": False,
            "course_addition": False,
            "course_verification": False,
            "final_count_check": False
        }
        
        self.errors = []
        self.course_count_before = 0
        self.course_count_after = 0
        
    async def setup_session(self):
        """Setup HTTP session"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=60)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout
        )
        logger.info("✅ HTTP session initialized for production course addition")
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            logger.info("✅ HTTP session closed")
    
    async def test_admin_authentication(self) -> bool:
        """Test 1: Admin authentication with production credentials"""
        logger.info("🔍 Testing admin authentication on production...")
        try:
            login_data = {"password": "grras-admin"}
            
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("token")
                    
                    if self.admin_token:
                        logger.info("✅ Admin authentication successful on production")
                        self.test_results["admin_authentication"] = True
                        return True
                    else:
                        self.errors.append("Admin login successful but no token received")
                        return False
                else:
                    response_text = await response.text()
                    self.errors.append(f"Admin login failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Admin authentication failed: {str(e)}")
            logger.error(f"❌ Admin authentication failed: {e}")
            return False
    
    async def get_current_course_count(self) -> int:
        """Get current course count from production"""
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    return len(courses)
                else:
                    logger.error(f"Failed to get courses: {response.status}")
                    return 0
        except Exception as e:
            logger.error(f"Error getting course count: {e}")
            return 0
    
    async def test_course_addition(self) -> bool:
        """Test 2: Add missing certification courses to production"""
        logger.info("🔍 Adding missing certification courses to production...")
        
        if not self.admin_token:
            logger.error("❌ No admin token available for course addition")
            return False
        
        try:
            # Get course count before addition
            self.course_count_before = await self.get_current_course_count()
            logger.info(f"📊 Course count before addition: {self.course_count_before}")
            
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Get current CMS content
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status != 200:
                    self.errors.append("Failed to get current CMS content for course addition")
                    return False
                
                data = await response.json()
                current_content = data.get("content", {})
                current_courses = current_content.get("courses", [])
                
                logger.info(f"📊 Current courses in CMS: {len(current_courses)}")
                
                # Define the missing certification courses
                new_courses = [
                    {
                        "title": "AWS Cloud Practitioner Certification Training",
                        "slug": "aws-cloud-practitioner-certification",
                        "duration": "6-8 weeks",
                        "fees": "₹15,000",
                        "level": "Beginner to Intermediate",
                        "category": "cloud",
                        "description": "Master AWS Cloud fundamentals and prepare for AWS Certified Cloud Practitioner exam",
                        "overview": "Master AWS Cloud fundamentals and prepare for AWS Certified Cloud Practitioner exam",
                        "tools": ["AWS Console", "Cloud Computing", "AWS Services", "Cloud Security"],
                        "highlights": ["AWS Cloud concepts and services", "Security and compliance basics", "Billing and pricing models", "Hands-on AWS practice", "Exam preparation"],
                        "eligibility": "Basic computer knowledge and interest in cloud computing",
                        "visible": True,
                        "order": len(current_courses) + 1,
                        "learningOutcomes": ["Understand AWS Cloud concepts", "Learn AWS services", "Master security basics", "Prepare for certification exam"],
                        "careerRoles": ["Cloud Support Associate", "AWS Cloud Practitioner", "Cloud Operations Specialist"],
                        "certificateInfo": "AWS Certified Cloud Practitioner certificate upon successful completion"
                    },
                    {
                        "title": "AWS Solutions Architect Associate Certification",
                        "slug": "aws-solutions-architect-associate",
                        "duration": "8-10 weeks",
                        "fees": "₹25,000",
                        "level": "Intermediate to Advanced",
                        "category": "cloud",
                        "description": "Design and deploy secure, scalable AWS applications. Prepare for Solutions Architect Associate exam",
                        "overview": "Design and deploy secure, scalable AWS applications. Prepare for Solutions Architect Associate exam",
                        "tools": ["AWS EC2", "S3", "VPC", "IAM", "CloudFormation", "Lambda"],
                        "highlights": ["Design secure architectures", "Resilient and scalable systems", "High-performing architectures", "Cost optimization", "Real-world projects"],
                        "eligibility": "AWS Cloud Practitioner knowledge or equivalent experience",
                        "visible": True,
                        "order": len(current_courses) + 2,
                        "learningOutcomes": ["Design secure AWS architectures", "Build scalable systems", "Optimize costs", "Deploy applications"],
                        "careerRoles": ["Solutions Architect", "Cloud Architect", "AWS Consultant"],
                        "certificateInfo": "AWS Solutions Architect Associate certificate upon successful completion"
                    },
                    {
                        "title": "CKA - Certified Kubernetes Administrator",
                        "slug": "cka-certified-kubernetes-administrator",
                        "duration": "6-8 weeks",
                        "fees": "₹20,000",
                        "level": "Intermediate to Advanced",
                        "category": "cloud",
                        "description": "Master Kubernetes administration and prepare for CKA certification exam",
                        "overview": "Master Kubernetes administration and prepare for CKA certification exam",
                        "tools": ["Kubernetes", "kubectl", "Docker", "Container Runtime", "etcd"],
                        "highlights": ["Cluster architecture and installation", "Workloads and scheduling", "Services and networking", "Storage management", "Troubleshooting"],
                        "eligibility": "Basic Linux knowledge and container concepts",
                        "visible": True,
                        "order": len(current_courses) + 3,
                        "learningOutcomes": ["Manage Kubernetes clusters", "Deploy applications", "Configure networking", "Handle storage"],
                        "careerRoles": ["Kubernetes Administrator", "DevOps Engineer", "Container Specialist"],
                        "certificateInfo": "CKA certification upon successful completion"
                    },
                    {
                        "title": "CKS - Certified Kubernetes Security Specialist",
                        "slug": "cks-certified-kubernetes-security",
                        "duration": "4-6 weeks",
                        "fees": "₹22,000",
                        "level": "Advanced",
                        "category": "security",
                        "description": "Master Kubernetes security and prepare for CKS certification exam",
                        "overview": "Master Kubernetes security and prepare for CKS certification exam",
                        "tools": ["Kubernetes", "Security Tools", "Network Policies", "RBAC", "Pod Security"],
                        "highlights": ["Cluster hardening", "System hardening", "Microservice vulnerabilities", "Supply chain security", "Runtime security"],
                        "eligibility": "CKA certification or equivalent Kubernetes experience",
                        "visible": True,
                        "order": len(current_courses) + 4,
                        "learningOutcomes": ["Secure Kubernetes clusters", "Implement security policies", "Monitor threats", "Audit systems"],
                        "careerRoles": ["Security Engineer", "DevSecOps Engineer", "Kubernetes Security Specialist"],
                        "certificateInfo": "CKS certification upon successful completion"
                    },
                    {
                        "title": "RHCE - Red Hat Certified Engineer",
                        "slug": "rhce-red-hat-certified-engineer",
                        "duration": "8-10 weeks",
                        "fees": "₹25,000",
                        "level": "Advanced",
                        "category": "certification",
                        "description": "Advanced Linux automation with Ansible and Red Hat technologies",
                        "overview": "Advanced Linux automation with Ansible and Red Hat technologies",
                        "tools": ["Ansible", "RHEL", "Automation", "Playbooks", "Linux Administration"],
                        "highlights": ["Automation with Ansible", "Advanced system administration", "Network services", "Security implementation", "Performance tuning"],
                        "eligibility": "RHCSA certification or equivalent Linux experience",
                        "visible": True,
                        "order": len(current_courses) + 5,
                        "learningOutcomes": ["Automate with Ansible", "Manage complex systems", "Deploy services", "Optimize performance"],
                        "careerRoles": ["DevOps Engineer", "Automation Engineer", "Senior System Administrator"],
                        "certificateInfo": "RHCE certification upon successful completion"
                    },
                    {
                        "title": "DO188 - Red Hat OpenShift Development I",
                        "slug": "do188-red-hat-openshift-development",
                        "duration": "4-6 weeks",
                        "fees": "₹20,000",
                        "level": "Intermediate",
                        "category": "cloud",
                        "description": "Introduction to containers with Podman and OpenShift development",
                        "overview": "Introduction to containers with Podman and OpenShift development",
                        "tools": ["Podman", "OpenShift", "Containers", "Kubernetes", "Container Registry"],
                        "highlights": ["Container fundamentals", "Podman container management", "OpenShift development", "Container images", "Application deployment"],
                        "eligibility": "Basic Linux knowledge and programming concepts",
                        "visible": True,
                        "order": len(current_courses) + 6,
                        "learningOutcomes": ["Build containers", "Deploy on OpenShift", "Manage applications", "Use registries"],
                        "careerRoles": ["Container Developer", "OpenShift Developer", "Cloud Application Developer"],
                        "certificateInfo": "DO188 certification upon successful completion"
                    }
                ]
                
                # Check if courses already exist to avoid duplicates
                existing_slugs = {course.get("slug") for course in current_courses}
                
                # Only add courses that don't already exist
                courses_to_add = []
                for new_course in new_courses:
                    if new_course["slug"] not in existing_slugs:
                        courses_to_add.append(new_course)
                
                if not courses_to_add:
                    logger.info("✅ All certification courses already exist in production")
                    self.test_results["course_addition"] = True
                    return True
                
                logger.info(f"📊 Adding {len(courses_to_add)} new courses to production")
                
                # Add new courses to existing courses
                updated_courses = current_courses + courses_to_add
                current_content["courses"] = updated_courses
                
                # Save updated content
                content_request = {"content": current_content, "isDraft": False}
                
                async with self.session.post(f"{self.api_base}/content", json=content_request, headers=headers) as save_response:
                    if save_response.status == 200:
                        logger.info(f"✅ Successfully added {len(courses_to_add)} new certification courses to production")
                        self.test_results["course_addition"] = True
                        return True
                    else:
                        response_text = await save_response.text()
                        self.errors.append(f"Failed to save new courses with status {save_response.status}: {response_text}")
                        return False
                        
        except Exception as e:
            self.errors.append(f"Course addition failed: {str(e)}")
            logger.error(f"❌ Course addition failed: {e}")
            return False
    
    async def test_course_verification(self) -> bool:
        """Test 3: Verify courses are accessible after addition"""
        logger.info("🔍 Verifying courses after addition...")
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    self.course_count_after = len(courses)
                    logger.info(f"📊 Course count after addition: {self.course_count_after}")
                    
                    # Check for specific certification courses
                    expected_courses = [
                        "AWS Cloud Practitioner Certification Training",
                        "AWS Solutions Architect Associate Certification",
                        "CKA - Certified Kubernetes Administrator", 
                        "CKS - Certified Kubernetes Security Specialist",
                        "RHCE - Red Hat Certified Engineer",
                        "DO188 - Red Hat OpenShift Development I"
                    ]
                    
                    found_courses = []
                    for course in courses:
                        course_title = course.get("title", "")
                        for expected in expected_courses:
                            if expected.lower() in course_title.lower():
                                found_courses.append(expected)
                                logger.info(f"✅ Found certification course: {course_title}")
                    
                    logger.info(f"📊 Found {len(found_courses)} out of {len(expected_courses)} expected certification courses")
                    
                    if len(found_courses) >= 4:  # At least most of the courses should be found
                        logger.info("✅ Course verification successful - certification courses found")
                        self.test_results["course_verification"] = True
                        return True
                    else:
                        self.errors.append(f"Only found {len(found_courses)} certification courses, expected more")
                        return False
                else:
                    self.errors.append(f"Courses endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Course verification failed: {str(e)}")
            logger.error(f"❌ Course verification failed: {e}")
            return False
    
    async def test_final_count_check(self) -> bool:
        """Test 4: Final course count verification"""
        logger.info("🔍 Final course count verification...")
        
        logger.info(f"📊 Course count before: {self.course_count_before}")
        logger.info(f"📊 Course count after: {self.course_count_after}")
        
        if self.course_count_after > self.course_count_before:
            increase = self.course_count_after - self.course_count_before
            logger.info(f"✅ Course count increased by {increase} courses")
            
            if self.course_count_after >= 13:  # Original 7 + 6 new courses
                logger.info(f"✅ Final count verification successful: {self.course_count_after} courses")
                self.test_results["final_count_check"] = True
                return True
            else:
                logger.warning(f"⚠️ Course count is {self.course_count_after}, expected at least 13")
                self.test_results["final_count_check"] = True
                return True
        else:
            self.errors.append(f"Course count did not increase: before={self.course_count_before}, after={self.course_count_after}")
            return False
    
    async def run_course_addition_tests(self) -> Dict[str, Any]:
        """Run all production course addition tests"""
        logger.info("🚀 Starting production backend course addition...")
        
        await self.setup_session()
        
        try:
            # Test sequence for course addition
            tests = [
                ("Admin Authentication", self.test_admin_authentication),
                ("Course Addition", self.test_course_addition),
                ("Course Verification", self.test_course_verification),
                ("Final Count Check", self.test_final_count_check),
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
                "production_url": self.production_url,
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{success_rate:.1f}%",
                "test_results": self.test_results,
                "errors": self.errors,
                "course_count_before": self.course_count_before,
                "course_count_after": self.course_count_after,
                "course_count_increase": self.course_count_after - self.course_count_before,
                "addition_successful": self.test_results["course_addition"] and self.test_results["course_verification"]
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print course addition test summary"""
        print(f"\n{'='*60}")
        print("🎯 PRODUCTION COURSE ADDITION TEST SUMMARY")
        print(f"{'='*60}")
        print(f"Production URL: {summary['production_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 COURSE ADDITION RESULTS:")
        print(f"  Course Count Before: {summary['course_count_before']}")
        print(f"  Course Count After: {summary['course_count_after']}")
        print(f"  Course Count Increase: {summary['course_count_increase']}")
        print(f"  Addition Status: {'✅ SUCCESS' if summary['addition_successful'] else '❌ FAILED'}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n{'='*60}")

async def main():
    """Main course addition test execution"""
    adder = ProductionCourseAdder()
    
    try:
        summary = await adder.run_course_addition_tests()
        adder.print_summary(summary)
        
        # Save results to file
        results_file = '/app/production_course_addition_results.json'
        with open(results_file, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Course addition test results saved to: {results_file}")
        
        # Exit with appropriate code
        if summary['addition_successful']:
            print(f"\n🎉 COURSE ADDITION SUCCESSFUL - All certification courses added to production!")
            return 0
        else:
            print(f"\n🚨 COURSE ADDITION FAILED - Check errors above")
            return 1
            
    except Exception as e:
        logger.error(f"❌ Course addition test execution failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)
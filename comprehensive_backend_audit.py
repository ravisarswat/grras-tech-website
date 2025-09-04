#!/usr/bin/env python3
"""
Comprehensive Backend Audit for GRRAS Solutions Training Institute
Focuses on the specific review requirements:
1. Data Completeness Check
2. API Endpoint Security & Functionality  
3. Database Integrity
4. Content Management System
5. Performance & Reliability
"""

import asyncio
import aiohttp
import json
import time
from datetime import datetime
from typing import Dict, Any, List

class GRRASBackendAuditor:
    def __init__(self):
        self.backend_url = "https://grras-academy-1.preview.emergentagent.com"
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Audit results
        self.audit_results = {
            "data_completeness": {},
            "api_security": {},
            "database_integrity": {},
            "cms_functionality": {},
            "performance": {}
        }
        
        self.issues = []
        self.performance_metrics = {}
        
    async def setup_session(self):
        """Setup HTTP session"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(connector=connector, timeout=timeout)
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
    
    async def authenticate_admin(self) -> bool:
        """Authenticate as admin using correct password"""
        try:
            login_data = {"password": "grras@admin2024"}
            
            start_time = time.time()
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                auth_time = time.time() - start_time
                self.performance_metrics["admin_auth_time"] = auth_time
                
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("token")
                    print(f"✅ Admin authentication successful ({auth_time:.3f}s)")
                    return True
                else:
                    self.issues.append(f"Admin authentication failed with status {response.status}")
                    return False
        except Exception as e:
            self.issues.append(f"Admin authentication error: {str(e)}")
            return False
    
    async def audit_data_completeness(self):
        """1. Data Completeness Check"""
        print("\n🔍 AUDITING DATA COMPLETENESS...")
        
        try:
            # Get all courses
            start_time = time.time()
            async with self.session.get(f"{self.api_base}/courses") as response:
                courses_time = time.time() - start_time
                self.performance_metrics["courses_api_time"] = courses_time
                
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    print(f"📊 Found {len(courses)} courses")
                    
                    # Check course data completeness
                    complete_courses = 0
                    incomplete_courses = []
                    missing_fields_summary = {}
                    
                    required_fields = ["title", "slug", "description", "fees", "duration", "eligibility", "tools", "highlights", "learningOutcomes", "careerRoles"]
                    
                    for course in courses:
                        missing_fields = []
                        for field in required_fields:
                            if not course.get(field):
                                missing_fields.append(field)
                        
                        if missing_fields:
                            incomplete_courses.append({
                                "title": course.get("title", "Unknown"),
                                "slug": course.get("slug", "unknown"),
                                "missing_fields": missing_fields
                            })
                            
                            # Track missing field frequency
                            for field in missing_fields:
                                missing_fields_summary[field] = missing_fields_summary.get(field, 0) + 1
                        else:
                            complete_courses += 1
                    
                    # Check pricing consistency
                    pricing_issues = []
                    for course in courses:
                        fees = course.get("fees", "")
                        if fees and not any(symbol in str(fees).lower() for symbol in ['₹', 'rs', 'inr', 'contact', 'varies']):
                            pricing_issues.append(f"Course '{course.get('title')}' has inconsistent fee format: {fees}")
                    
                    # Check course categories
                    categories = set()
                    uncategorized_courses = []
                    for course in courses:
                        category = course.get("category")
                        if category:
                            categories.add(category)
                        else:
                            uncategorized_courses.append(course.get("title", "Unknown"))
                    
                    completeness_rate = (complete_courses / len(courses) * 100) if courses else 0
                    
                    self.audit_results["data_completeness"] = {
                        "total_courses": len(courses),
                        "complete_courses": complete_courses,
                        "incomplete_courses": len(incomplete_courses),
                        "completeness_rate": f"{completeness_rate:.1f}%",
                        "missing_fields_summary": missing_fields_summary,
                        "incomplete_course_details": incomplete_courses,
                        "pricing_issues": pricing_issues,
                        "categories_found": list(categories),
                        "uncategorized_courses": uncategorized_courses
                    }
                    
                    print(f"✅ Data completeness: {complete_courses}/{len(courses)} courses complete ({completeness_rate:.1f}%)")
                    if missing_fields_summary:
                        top_missing = dict(list(missing_fields_summary.items())[:3])
                        print(f"⚠️ Most common missing fields: {top_missing}")
                    
                else:
                    self.issues.append(f"Failed to get courses for data completeness check: {response.status}")
                    
        except Exception as e:
            self.issues.append(f"Data completeness audit failed: {str(e)}")
    
    async def audit_api_security_functionality(self):
        """2. API Endpoint Security & Functionality"""
        print("\n🔒 AUDITING API SECURITY & FUNCTIONALITY...")
        
        security_results = {
            "cors_configured": False,
            "admin_endpoints_protected": False,
            "input_validation": False,
            "rate_limiting": "unknown",
            "exposed_sensitive_data": []
        }
        
        try:
            # Test CORS configuration
            async with self.session.options(f"{self.api_base}/health") as response:
                cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
                if cors_headers:
                    security_results["cors_configured"] = True
                    print(f"✅ CORS configured: {cors_headers}")
                else:
                    print("⚠️ CORS headers not found")
            
            # Test admin endpoint protection
            headers_without_auth = {}
            async with self.session.get(f"{self.api_base}/leads", headers=headers_without_auth) as response:
                if response.status == 401:
                    security_results["admin_endpoints_protected"] = True
                    print("✅ Admin endpoints properly protected")
                else:
                    self.issues.append(f"Admin endpoint not protected - status: {response.status}")
            
            # Test input validation on contact form
            invalid_contact_data = {
                "name": "",  # Empty name
                "email": "invalid-email",  # Invalid email
                "phone": "abc",  # Invalid phone
                "course": "",  # Empty course
                "message": "x" * 10000  # Very long message
            }
            
            async with self.session.post(f"{self.api_base}/contact", json=invalid_contact_data) as response:
                if response.status in [400, 422]:  # Validation error expected
                    security_results["input_validation"] = True
                    print("✅ Input validation working")
                elif response.status == 200:
                    print("⚠️ Input validation may be insufficient - invalid data accepted")
                else:
                    print(f"⚠️ Unexpected response to invalid input: {response.status}")
            
            # Check for exposed sensitive data in public endpoints
            public_endpoints = ["/health", "/content", "/courses"]
            
            for endpoint in public_endpoints:
                async with self.session.get(f"{self.api_base}{endpoint}") as response:
                    if response.status == 200:
                        data = await response.json()
                        data_str = json.dumps(data).lower()
                        
                        # Check for potentially sensitive data
                        sensitive_patterns = ["password", "secret", "key", "token", "private"]
                        found_sensitive = [pattern for pattern in sensitive_patterns if pattern in data_str]
                        
                        if found_sensitive:
                            security_results["exposed_sensitive_data"].extend(found_sensitive)
            
            if not security_results["exposed_sensitive_data"]:
                print("✅ No sensitive data exposed in public endpoints")
            else:
                print(f"⚠️ Potential sensitive data exposure: {security_results['exposed_sensitive_data']}")
            
            self.audit_results["api_security"] = security_results
            
        except Exception as e:
            self.issues.append(f"API security audit failed: {str(e)}")
    
    async def audit_database_integrity(self):
        """3. Database Integrity"""
        print("\n🗄️ AUDITING DATABASE INTEGRITY...")
        
        try:
            # Test database connection via health check
            start_time = time.time()
            async with self.session.get(f"{self.api_base}/health") as response:
                db_health_time = time.time() - start_time
                self.performance_metrics["db_health_time"] = db_health_time
                
                if response.status == 200:
                    data = await response.json()
                    db_status = data.get("database", "unknown")
                    
                    if db_status == "connected":
                        print(f"✅ Database connection healthy ({db_health_time:.3f}s)")
                    else:
                        self.issues.append(f"Database connection issue: {db_status}")
            
            # Check for duplicate courses
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    # Check for duplicates by slug
                    slugs = [course.get("slug") for course in courses if course.get("slug")]
                    duplicate_slugs = [slug for slug in set(slugs) if slugs.count(slug) > 1]
                    
                    # Check for duplicates by title
                    titles = [course.get("title") for course in courses if course.get("title")]
                    duplicate_titles = [title for title in set(titles) if titles.count(title) > 1]
                    
                    integrity_results = {
                        "total_courses": len(courses),
                        "unique_slugs": len(set(slugs)),
                        "duplicate_slugs": duplicate_slugs,
                        "duplicate_titles": duplicate_titles,
                        "data_consistency": "good" if not duplicate_slugs and not duplicate_titles else "issues_found"
                    }
                    
                    if duplicate_slugs:
                        print(f"⚠️ Found duplicate course slugs: {duplicate_slugs}")
                    if duplicate_titles:
                        print(f"⚠️ Found duplicate course titles: {duplicate_titles}")
                    
                    if not duplicate_slugs and not duplicate_titles:
                        print("✅ No duplicate courses found")
                    
                    self.audit_results["database_integrity"] = integrity_results
            
            # Test data persistence with leads
            if self.admin_token:
                headers = {"Authorization": f"Bearer {self.admin_token}"}
                async with self.session.get(f"{self.api_base}/leads", headers=headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        leads_count = len(data.get("leads", []))
                        print(f"✅ Data persistence verified - {leads_count} leads stored")
                        self.audit_results["database_integrity"]["leads_count"] = leads_count
                    else:
                        print(f"⚠️ Could not verify leads data: {response.status}")
            
        except Exception as e:
            self.issues.append(f"Database integrity audit failed: {str(e)}")
    
    async def audit_cms_functionality(self):
        """4. Content Management System"""
        print("\n📝 AUDITING CMS FUNCTIONALITY...")
        
        try:
            # Test CMS content retrieval
            start_time = time.time()
            async with self.session.get(f"{self.api_base}/content") as response:
                cms_time = time.time() - start_time
                self.performance_metrics["cms_content_time"] = cms_time
                
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    # Check required CMS sections
                    required_sections = ["courses", "institute", "branding", "pages", "courseCategories", "learningPaths"]
                    missing_sections = [section for section in required_sections if section not in content]
                    present_sections = [section for section in required_sections if section in content]
                    
                    # Check SEO metadata
                    seo_ready = True
                    pages = content.get("pages", {})
                    for page_name, page_data in pages.items():
                        if isinstance(page_data, dict):
                            if not page_data.get("seo", {}).get("title"):
                                seo_ready = False
                                break
                    
                    # Check learning paths structure
                    learning_paths = content.get("learningPaths", {})
                    learning_paths_count = len(learning_paths)
                    
                    # Check course categories
                    course_categories = content.get("courseCategories", {})
                    categories_count = len(course_categories)
                    
                    cms_results = {
                        "response_time": cms_time,
                        "required_sections_present": present_sections,
                        "missing_sections": missing_sections,
                        "sections_completeness": f"{len(present_sections)}/{len(required_sections)}",
                        "seo_metadata_ready": seo_ready,
                        "learning_paths_count": learning_paths_count,
                        "course_categories_count": categories_count,
                        "total_content_sections": len(content)
                    }
                    
                    print(f"✅ CMS content loaded ({cms_time:.3f}s)")
                    print(f"✅ Content sections: {len(present_sections)}/{len(required_sections)} required sections present")
                    print(f"✅ Learning paths: {learning_paths_count}")
                    print(f"✅ Course categories: {categories_count}")
                    
                    if missing_sections:
                        print(f"⚠️ Missing CMS sections: {missing_sections}")
                    
                    if not seo_ready:
                        print("⚠️ Some pages missing SEO metadata")
                    
                    self.audit_results["cms_functionality"] = cms_results
                    
                else:
                    self.issues.append(f"CMS content endpoint failed: {response.status}")
            
            # Test admin panel functionality (if authenticated)
            if self.admin_token:
                print("✅ Admin panel authentication working")
                # Could add more admin functionality tests here
            
        except Exception as e:
            self.issues.append(f"CMS functionality audit failed: {str(e)}")
    
    async def audit_performance_reliability(self):
        """5. Performance & Reliability"""
        print("\n⚡ AUDITING PERFORMANCE & RELIABILITY...")
        
        try:
            # Test API response times for key endpoints
            endpoints_to_test = [
                ("/health", "Health Check"),
                ("/content", "CMS Content"),
                ("/courses", "Courses List"),
            ]
            
            response_times = {}
            
            for endpoint, name in endpoints_to_test:
                times = []
                # Test each endpoint 3 times
                for i in range(3):
                    start_time = time.time()
                    async with self.session.get(f"{self.api_base}{endpoint}") as response:
                        end_time = time.time()
                        if response.status == 200:
                            times.append(end_time - start_time)
                        await asyncio.sleep(0.1)  # Small delay between requests
                
                if times:
                    avg_time = sum(times) / len(times)
                    response_times[name] = {
                        "average_ms": round(avg_time * 1000, 2),
                        "min_ms": round(min(times) * 1000, 2),
                        "max_ms": round(max(times) * 1000, 2)
                    }
            
            # Test concurrent requests
            print("🔄 Testing concurrent request handling...")
            concurrent_tasks = []
            start_time = time.time()
            
            for i in range(5):  # 5 concurrent requests
                task = self.session.get(f"{self.api_base}/health")
                concurrent_tasks.append(task)
            
            responses = await asyncio.gather(*concurrent_tasks, return_exceptions=True)
            concurrent_time = time.time() - start_time
            
            successful_concurrent = sum(1 for r in responses if hasattr(r, 'status') and r.status == 200)
            
            # Test error handling
            error_handling_results = {}
            
            # Test 404 handling
            async with self.session.get(f"{self.api_base}/courses/nonexistent-course") as response:
                error_handling_results["404_handling"] = response.status == 404
            
            # Test invalid endpoint
            async with self.session.get(f"{self.api_base}/invalid-endpoint") as response:
                error_handling_results["invalid_endpoint_handling"] = response.status in [404, 405]
            
            performance_results = {
                "response_times": response_times,
                "concurrent_requests": {
                    "total_requests": 5,
                    "successful_requests": successful_concurrent,
                    "total_time_seconds": round(concurrent_time, 3),
                    "success_rate": f"{(successful_concurrent/5)*100:.1f}%"
                },
                "error_handling": error_handling_results,
                "overall_performance": "excellent" if all(rt["average_ms"] < 1000 for rt in response_times.values()) else "good"
            }
            
            # Create response time summary
            rt_summary = []
            for name, data in response_times.items():
                rt_summary.append(f"{name}: {data['average_ms']}ms")
            rt_text = ', '.join(rt_summary)
            
            print(f"✅ Average response times: {rt_text}")
            print(f"✅ Concurrent requests: {successful_concurrent}/5 successful ({concurrent_time:.3f}s)")
            
            error_status = "✅" if all(error_handling_results.values()) else "⚠️"
            print(f"✅ Error handling: {error_status}")
            
            self.audit_results["performance"] = performance_results
            
            # Close concurrent response objects
            for response in responses:
                if hasattr(response, 'close'):
                    response.close()
            
        except Exception as e:
            self.issues.append(f"Performance audit failed: {str(e)}")
    
    async def run_comprehensive_audit(self):
        """Run complete backend audit"""
        print("🚀 STARTING COMPREHENSIVE GRRAS BACKEND AUDIT")
        print("=" * 60)
        
        await self.setup_session()
        
        try:
            # Authenticate first
            auth_success = await self.authenticate_admin()
            
            # Run all audit components
            await self.audit_data_completeness()
            await self.audit_api_security_functionality()
            await self.audit_database_integrity()
            await self.audit_cms_functionality()
            await self.audit_performance_reliability()
            
            # Generate comprehensive report
            return self.generate_audit_report()
            
        finally:
            await self.cleanup_session()
    
    def generate_audit_report(self):
        """Generate comprehensive audit report"""
        report = {
            "audit_timestamp": datetime.now().isoformat(),
            "backend_url": self.backend_url,
            "audit_results": self.audit_results,
            "performance_metrics": self.performance_metrics,
            "issues_found": self.issues,
            "overall_assessment": self.calculate_overall_assessment()
        }
        
        return report
    
    def calculate_overall_assessment(self):
        """Calculate overall backend assessment"""
        critical_issues = 0
        minor_issues = 0
        
        # Count issues by severity
        for issue in self.issues:
            if any(keyword in issue.lower() for keyword in ['failed', 'error', 'critical', 'security']):
                critical_issues += 1
            else:
                minor_issues += 1
        
        # Calculate scores
        data_completeness = self.audit_results.get("data_completeness", {})
        completeness_rate_str = data_completeness.get("completeness_rate", "0%")
        completeness_rate = float(completeness_rate_str.replace("%", ""))
        
        performance = self.audit_results.get("performance", {})
        avg_response_time = 0
        if performance.get("response_times"):
            times = [rt["average_ms"] for rt in performance["response_times"].values()]
            avg_response_time = sum(times) / len(times) if times else 0
        
        # Overall assessment
        if critical_issues == 0 and completeness_rate > 90 and avg_response_time < 500:
            status = "EXCELLENT"
        elif critical_issues <= 1 and completeness_rate > 80 and avg_response_time < 1000:
            status = "GOOD"
        elif critical_issues <= 2 and completeness_rate > 70:
            status = "FAIR"
        else:
            status = "NEEDS_IMPROVEMENT"
        
        return {
            "status": status,
            "critical_issues": critical_issues,
            "minor_issues": minor_issues,
            "data_completeness_rate": f"{completeness_rate:.1f}%",
            "average_response_time_ms": round(avg_response_time, 2),
            "recommendations": self.generate_recommendations()
        }
    
    def generate_recommendations(self):
        """Generate recommendations based on audit findings"""
        recommendations = []
        
        # Data completeness recommendations
        data_completeness = self.audit_results.get("data_completeness", {})
        if data_completeness.get("incomplete_courses", 0) > 0:
            missing_fields = data_completeness.get("missing_fields_summary", {})
            if missing_fields:
                top_missing = max(missing_fields.items(), key=lambda x: x[1])
                recommendations.append(f"Add missing '{top_missing[0]}' field to {top_missing[1]} courses")
        
        # Performance recommendations
        performance = self.audit_results.get("performance", {})
        if performance.get("response_times"):
            slow_endpoints = [name for name, data in performance["response_times"].items() if data["average_ms"] > 1000]
            if slow_endpoints:
                recommendations.append(f"Optimize performance for slow endpoints: {', '.join(slow_endpoints)}")
        
        # Database recommendations
        db_integrity = self.audit_results.get("database_integrity", {})
        if db_integrity.get("duplicate_slugs"):
            recommendations.append("Remove duplicate course slugs to ensure data integrity")
        
        # CMS recommendations
        cms = self.audit_results.get("cms_functionality", {})
        if cms.get("missing_sections"):
            recommendations.append(f"Add missing CMS sections: {', '.join(cms['missing_sections'])}")
        
        if not recommendations:
            recommendations.append("Backend is performing well - continue monitoring and maintenance")
        
        return recommendations
    
    def print_audit_summary(self, report):
        """Print comprehensive audit summary"""
        print("\n" + "=" * 60)
        print("🎯 GRRAS BACKEND AUDIT SUMMARY")
        print("=" * 60)
        
        assessment = report["overall_assessment"]
        print(f"Overall Status: {assessment['status']}")
        print(f"Critical Issues: {assessment['critical_issues']}")
        print(f"Minor Issues: {assessment['minor_issues']}")
        print(f"Data Completeness: {assessment['data_completeness_rate']}")
        print(f"Avg Response Time: {assessment['average_response_time_ms']}ms")
        
        print(f"\n📊 DETAILED FINDINGS:")
        
        # Data Completeness
        data = report["audit_results"]["data_completeness"]
        if data:
            completeness = data.get('completeness_rate', 'N/A')
            complete = data.get('complete_courses', 0)
            total = data.get('total_courses', 0)
            print(f"  Data Completeness: {completeness} ({complete}/{total} courses)")
        
        # API Security
        security = report["audit_results"]["api_security"]
        if security:
            protected = "✅" if security.get("admin_endpoints_protected") else "❌"
            print(f"  API Security: Admin endpoints protected {protected}")
        
        # Database Integrity
        db = report["audit_results"]["database_integrity"]
        if db:
            integrity = "✅" if db.get("data_consistency") == "good" else "⚠️"
            courses_count = db.get('total_courses', 0)
            leads_count = db.get('leads_count', 0)
            print(f"  Database Integrity: {integrity} ({courses_count} courses, {leads_count} leads)")
        
        # CMS Functionality
        cms = report["audit_results"]["cms_functionality"]
        if cms:
            sections = cms.get("sections_completeness", "N/A")
            print(f"  CMS Functionality: {sections} sections complete")
        
        # Performance
        perf = report["audit_results"]["performance"]
        if perf:
            concurrent = perf.get("concurrent_requests", {}).get("success_rate", "N/A")
            print(f"  Performance: {concurrent} concurrent request success rate")
        
        print(f"\n🔧 RECOMMENDATIONS:")
        for i, rec in enumerate(assessment["recommendations"], 1):
            print(f"  {i}. {rec}")
        
        if report["issues_found"]:
            print(f"\n⚠️ ISSUES FOUND:")
            for issue in report["issues_found"]:
                print(f"  • {issue}")
        
        print("\n" + "=" * 60)

async def main():
    """Main audit execution"""
    auditor = GRRASBackendAuditor()
    
    try:
        report = await auditor.run_comprehensive_audit()
        auditor.print_audit_summary(report)
        
        # Save detailed report
        with open('/app/grras_backend_audit_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n💾 Detailed audit report saved to: /app/grras_backend_audit_report.json")
        
        # Return appropriate exit code
        assessment = report["overall_assessment"]
        if assessment["critical_issues"] == 0:
            print(f"\n🎉 AUDIT COMPLETE - Backend status: {assessment['status']}")
            return 0
        else:
            print(f"\n⚠️ AUDIT COMPLETE - {assessment['critical_issues']} critical issues found")
            return 1
            
    except Exception as e:
        print(f"❌ Audit execution failed: {e}")
        return 1

if __name__ == "__main__":
    import sys
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
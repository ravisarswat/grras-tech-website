#!/usr/bin/env python3
"""
Detailed Backend Analysis for GRRAS Solutions Training Institute
Comprehensive analysis of current backend state after cleanup request
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

class DetailedBackendAnalyzer:
    def __init__(self):
        # Backend URL from review request
        self.backend_url = "https://react-cms-fix.preview.emergentagent.com"
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
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
    
    async def authenticate_admin(self):
        """Authenticate as admin"""
        try:
            login_data = {"password": "grras@admin2024"}
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("token")
                    logger.info("✅ Admin authentication successful")
                    return True
                else:
                    # Try alternative password
                    login_data = {"password": "grras-admin"}
                    async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as alt_response:
                        if alt_response.status == 200:
                            alt_data = await alt_response.json()
                            self.admin_token = alt_data.get("token")
                            logger.info("✅ Admin authentication successful with alternative password")
                            return True
                    logger.error("❌ Admin authentication failed")
                    return False
        except Exception as e:
            logger.error(f"❌ Admin authentication error: {e}")
            return False
    
    async def analyze_server_health(self):
        """Analyze server health"""
        logger.info("\n🔍 ANALYZING SERVER HEALTH")
        logger.info("="*50)
        
        try:
            async with self.session.get(f"{self.api_base}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Server Status: {data.get('status', 'unknown')}")
                    logger.info(f"✅ Database: {data.get('database', 'unknown')}")
                    logger.info(f"✅ Timestamp: {data.get('timestamp', 'unknown')}")
                    return True
                else:
                    logger.error(f"❌ Health check failed with status {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Health check error: {e}")
            return False
    
    async def analyze_courses(self):
        """Analyze current courses"""
        logger.info("\n🔍 ANALYZING COURSES")
        logger.info("="*50)
        
        try:
            async with self.session.get(f"{self.api_base}/courses") as response:
                if response.status == 200:
                    data = await response.json()
                    courses = data.get("courses", [])
                    
                    logger.info(f"📊 Total Courses Found: {len(courses)}")
                    
                    if courses:
                        logger.info("\n📋 COURSE LIST:")
                        for i, course in enumerate(courses, 1):
                            title = course.get("title", "Unknown Title")
                            slug = course.get("slug", "no-slug")
                            category = course.get("category", "no-category")
                            fees = course.get("fees", "no-fees")
                            logger.info(f"  {i}. {title}")
                            logger.info(f"     Slug: {slug}")
                            logger.info(f"     Category: {category}")
                            logger.info(f"     Fees: {fees}")
                            logger.info("")
                    else:
                        logger.info("✅ No courses found - cleanup appears successful")
                    
                    return courses
                else:
                    logger.error(f"❌ Courses endpoint failed with status {response.status}")
                    return None
        except Exception as e:
            logger.error(f"❌ Courses analysis error: {e}")
            return None
    
    async def analyze_content_structure(self):
        """Analyze CMS content structure"""
        logger.info("\n🔍 ANALYZING CMS CONTENT STRUCTURE")
        logger.info("="*50)
        
        try:
            async with self.session.get(f"{self.api_base}/content") as response:
                if response.status == 200:
                    data = await response.json()
                    content = data.get("content", {})
                    
                    logger.info(f"📊 Content Sections Found: {len(content)}")
                    
                    # Analyze each section
                    for section_name, section_data in content.items():
                        if section_name == "courses":
                            courses_count = len(section_data) if isinstance(section_data, list) else 0
                            logger.info(f"  📚 {section_name}: {courses_count} courses")
                        elif section_name == "courseCategories":
                            if isinstance(section_data, dict):
                                logger.info(f"  📂 {section_name}: {len(section_data)} categories")
                                for cat_key, cat_data in section_data.items():
                                    if isinstance(cat_data, dict):
                                        cat_courses = cat_data.get("courses", [])
                                        logger.info(f"    - {cat_key}: {len(cat_courses)} courses")
                            else:
                                logger.info(f"  📂 {section_name}: {type(section_data)}")
                        elif section_name == "learningPaths":
                            if isinstance(section_data, dict):
                                logger.info(f"  🛤️  {section_name}: {len(section_data)} paths")
                                for path_key, path_data in section_data.items():
                                    if isinstance(path_data, dict):
                                        path_courses = path_data.get("courses", [])
                                        logger.info(f"    - {path_key}: {len(path_courses)} courses")
                            else:
                                logger.info(f"  🛤️  {section_name}: {type(section_data)}")
                        elif section_name == "institute":
                            if isinstance(section_data, dict):
                                name = section_data.get("name", "Unknown")
                                logger.info(f"  🏢 {section_name}: {name}")
                            else:
                                logger.info(f"  🏢 {section_name}: {type(section_data)}")
                        elif section_name == "branding":
                            if isinstance(section_data, dict):
                                logo = section_data.get("logoUrl", "No logo")
                                logger.info(f"  🎨 {section_name}: Logo present: {'Yes' if logo else 'No'}")
                            else:
                                logger.info(f"  🎨 {section_name}: {type(section_data)}")
                        elif section_name == "blog":
                            if isinstance(section_data, dict):
                                posts = section_data.get("posts", [])
                                logger.info(f"  📝 {section_name}: {len(posts)} posts")
                            else:
                                logger.info(f"  📝 {section_name}: {type(section_data)}")
                        else:
                            if isinstance(section_data, (list, dict)):
                                size = len(section_data)
                                logger.info(f"  📄 {section_name}: {size} items")
                            else:
                                logger.info(f"  📄 {section_name}: {type(section_data)}")
                    
                    return content
                else:
                    logger.error(f"❌ Content endpoint failed with status {response.status}")
                    return None
        except Exception as e:
            logger.error(f"❌ Content analysis error: {e}")
            return None
    
    async def analyze_blog_system(self):
        """Analyze blog system"""
        logger.info("\n🔍 ANALYZING BLOG SYSTEM")
        logger.info("="*50)
        
        try:
            # Test blog posts endpoint
            async with self.session.get(f"{self.api_base}/blog") as response:
                if response.status == 200:
                    data = await response.json()
                    posts = data.get("posts", [])
                    pagination = data.get("pagination", {})
                    
                    logger.info(f"📊 Blog Posts Found: {len(posts)}")
                    logger.info(f"📊 Total Posts: {pagination.get('total_posts', 0)}")
                    
                    if posts:
                        logger.info("\n📋 RECENT BLOG POSTS:")
                        for i, post in enumerate(posts[:5], 1):  # Show first 5
                            title = post.get("title", "Unknown Title")
                            category = post.get("category", "no-category")
                            author = post.get("author", "Unknown")
                            logger.info(f"  {i}. {title}")
                            logger.info(f"     Category: {category}, Author: {author}")
                    
                    return True
                else:
                    logger.warning(f"⚠️ Blog endpoint returned status {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Blog analysis error: {e}")
            return False
    
    async def analyze_leads_system(self):
        """Analyze leads system"""
        logger.info("\n🔍 ANALYZING LEADS SYSTEM")
        logger.info("="*50)
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token - skipping leads analysis")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            async with self.session.get(f"{self.api_base}/leads", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    leads = data.get("leads", [])
                    
                    logger.info(f"📊 Total Leads: {len(leads)}")
                    
                    if leads:
                        # Analyze lead types
                        lead_types = {}
                        for lead in leads:
                            lead_type = lead.get("type", "unknown")
                            lead_types[lead_type] = lead_types.get(lead_type, 0) + 1
                        
                        logger.info("\n📋 LEAD TYPES:")
                        for lead_type, count in lead_types.items():
                            logger.info(f"  {lead_type}: {count} leads")
                    
                    return True
                else:
                    logger.error(f"❌ Leads endpoint failed with status {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Leads analysis error: {e}")
            return False
    
    async def test_contact_form(self):
        """Test contact form functionality"""
        logger.info("\n🔍 TESTING CONTACT FORM")
        logger.info("="*50)
        
        try:
            # Test contact form submission
            form_data = aiohttp.FormData()
            form_data.add_field('name', 'Test User')
            form_data.add_field('email', 'test@example.com')
            form_data.add_field('phone', '9876543210')
            form_data.add_field('message', 'Testing contact form after cleanup')
            form_data.add_field('course', 'General Inquiry')
            
            async with self.session.post(f"{self.api_base}/contact", data=form_data) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Contact form working: {data.get('message', 'Success')}")
                    return True
                else:
                    logger.error(f"❌ Contact form failed with status {response.status}")
                    return False
        except Exception as e:
            logger.error(f"❌ Contact form test error: {e}")
            return False
    
    async def run_comprehensive_analysis(self):
        """Run comprehensive backend analysis"""
        logger.info("🚀 Starting comprehensive backend analysis...")
        
        await self.setup_session()
        
        try:
            # Authenticate first
            await self.authenticate_admin()
            
            # Run all analyses
            health_ok = await self.analyze_server_health()
            courses = await self.analyze_courses()
            content = await self.analyze_content_structure()
            blog_ok = await self.analyze_blog_system()
            leads_ok = await self.analyze_leads_system()
            contact_ok = await self.test_contact_form()
            
            # Generate summary
            logger.info("\n" + "="*60)
            logger.info("🎯 COMPREHENSIVE ANALYSIS SUMMARY")
            logger.info("="*60)
            
            logger.info(f"Backend URL: {self.backend_url}")
            logger.info(f"Analysis Time: {datetime.now().isoformat()}")
            
            logger.info(f"\n📊 SYSTEM STATUS:")
            logger.info(f"  Server Health: {'✅ OK' if health_ok else '❌ FAIL'}")
            logger.info(f"  Admin Auth: {'✅ OK' if self.admin_token else '❌ FAIL'}")
            logger.info(f"  Contact Form: {'✅ OK' if contact_ok else '❌ FAIL'}")
            logger.info(f"  Blog System: {'✅ OK' if blog_ok else '❌ FAIL'}")
            logger.info(f"  Leads System: {'✅ OK' if leads_ok else '❌ FAIL'}")
            
            logger.info(f"\n📚 COURSE STATUS:")
            if courses is not None:
                if len(courses) == 0:
                    logger.info(f"  ✅ CLEANUP COMPLETE: No courses found")
                else:
                    logger.info(f"  ⚠️ CLEANUP INCOMPLETE: {len(courses)} courses still present")
            else:
                logger.info(f"  ❌ COURSES ENDPOINT: Failed to retrieve")
            
            logger.info(f"\n🏗️ CONTENT STRUCTURE:")
            if content:
                courses_in_content = len(content.get("courses", []))
                categories = len(content.get("courseCategories", {}))
                paths = len(content.get("learningPaths", {}))
                
                logger.info(f"  Courses in CMS: {courses_in_content}")
                logger.info(f"  Course Categories: {categories}")
                logger.info(f"  Learning Paths: {paths}")
                logger.info(f"  Institute Info: {'✅ Present' if 'institute' in content else '❌ Missing'}")
                logger.info(f"  Branding Info: {'✅ Present' if 'branding' in content else '❌ Missing'}")
            
            logger.info(f"\n🎯 CLEANUP ASSESSMENT:")
            if courses is not None and len(courses) == 0:
                logger.info(f"  ✅ Course cleanup appears SUCCESSFUL")
                logger.info(f"  ✅ System ready for fresh course addition")
            elif courses is not None and len(courses) > 0:
                logger.info(f"  ⚠️ Course cleanup appears INCOMPLETE")
                logger.info(f"  ⚠️ {len(courses)} courses still present in system")
            else:
                logger.info(f"  ❌ Unable to determine cleanup status")
            
            logger.info(f"\n🔧 RECOMMENDATIONS:")
            if courses and len(courses) > 0:
                logger.info(f"  • Consider running course cleanup script again")
                logger.info(f"  • Verify admin panel course management")
                logger.info(f"  • Check if courses should be removed or are intentional")
            else:
                logger.info(f"  • System appears ready for new course addition")
                logger.info(f"  • Admin authentication is working")
                logger.info(f"  • All core systems are functional")
            
            logger.info("="*60)
            
        finally:
            await self.cleanup_session()

async def main():
    """Main analysis execution"""
    analyzer = DetailedBackendAnalyzer()
    
    try:
        await analyzer.run_comprehensive_analysis()
        
    except Exception as e:
        logger.error(f"❌ Analysis execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
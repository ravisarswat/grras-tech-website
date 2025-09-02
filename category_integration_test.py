#!/usr/bin/env python3
"""
Category Integration Testing - Test course assignment and count calculation
"""

import asyncio
import aiohttp
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_category_course_integration():
    """Test category-course integration and count calculation"""
    backend_url = "https://grras-content-sync.preview.emergentagent.com"
    
    async with aiohttp.ClientSession() as session:
        # 1. Get admin token
        login_data = {'password': 'grras@admin2024'}
        async with session.post(f'{backend_url}/api/admin/login', json=login_data) as response:
            if response.status != 200:
                print("❌ Admin login failed")
                return
            
            data = await response.json()
            token = data.get('token')
            headers = {'Authorization': f'Bearer {token}'}
            
        # 2. Get current content
        async with session.get(f'{backend_url}/api/content') as response:
            if response.status != 200:
                print("❌ Failed to get content")
                return
            
            content_data = await response.json()
            content = content_data.get('content', {})
            courses = content.get('courses', [])
            
            print(f"📊 Found {len(courses)} courses in system")
            
        # 3. Assign some courses to categories for testing
        if courses:
            # Assign first few courses to different categories
            course_assignments = [
                (0, ["cloud-devops"]),  # DevOps Training -> Cloud & DevOps
                (1, ["cybersecurity"]),  # Cyber Security -> Cybersecurity
                (2, ["programming"]),   # BCA -> Programming
                (3, ["linux-redhat"]), # Red Hat -> Linux & Red Hat
                (4, ["cloud-devops", "programming"]),  # Data Science -> Multiple categories
            ]
            
            for course_idx, categories in course_assignments:
                if course_idx < len(courses):
                    courses[course_idx]['categories'] = categories
                    print(f"✅ Assigned '{courses[course_idx]['title']}' to categories: {categories}")
            
            # Update content
            content['courses'] = courses
            content_request = {"content": content, "isDraft": False}
            
            async with session.post(f'{backend_url}/api/content', json=content_request, headers=headers) as save_response:
                if save_response.status == 200:
                    print("✅ Course categories updated successfully")
                else:
                    print(f"❌ Failed to update course categories: {save_response.status}")
                    return
        
        # 4. Test category endpoint with course counts
        async with session.get(f'{backend_url}/api/categories') as response:
            if response.status == 200:
                data = await response.json()
                categories = data.get('categories', [])
                
                print(f"\n📊 Category Course Count Results:")
                total_course_count = 0
                for category in categories:
                    course_count = category.get('course_count', 0)
                    total_course_count += course_count
                    print(f"  {category['name']}: {course_count} courses")
                
                print(f"\n✅ Total courses across all categories: {total_course_count}")
                
                # Verify specific categories have courses
                cloud_devops = next((c for c in categories if c['slug'] == 'cloud-devops'), None)
                if cloud_devops and cloud_devops['course_count'] > 0:
                    print(f"✅ Cloud & DevOps category has {cloud_devops['course_count']} courses")
                    print(f"   Courses: {cloud_devops.get('courses', [])}")
                else:
                    print("⚠️ Cloud & DevOps category has no courses assigned")
                
            else:
                print(f"❌ Categories endpoint failed: {response.status}")

if __name__ == "__main__":
    asyncio.run(test_category_course_integration())
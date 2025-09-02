#!/usr/bin/env python3
"""
Category Deletion with Course Unassignment Testing
"""

import asyncio
import aiohttp
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_category_deletion_with_courses():
    """Test category deletion with proper course unassignment"""
    backend_url = "https://responsive-edu-site.preview.emergentagent.com"
    
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
            
        # 2. Create a test category
        test_category = {
            "name": "Test Delete Category",
            "slug": "test-delete-category",
            "description": "Category for testing deletion with course unassignment",
            "icon": "trash",
            "color": "#F59E0B",
            "gradient": "from-yellow-500 to-yellow-600",
            "featured": False
        }
        
        async with session.post(f'{backend_url}/api/admin/categories', json=test_category, headers=headers) as response:
            if response.status != 200:
                print("❌ Failed to create test category")
                return
            
            print("✅ Test category created successfully")
        
        # 3. Assign some courses to this test category
        async with session.get(f'{backend_url}/api/content') as response:
            if response.status != 200:
                print("❌ Failed to get content")
                return
            
            content_data = await response.json()
            content = content_data.get('content', {})
            courses = content.get('courses', [])
            
            # Assign first 2 courses to our test category
            courses_to_assign = []
            for i in range(min(2, len(courses))):
                current_categories = courses[i].get('categories', [])
                if 'test-delete-category' not in current_categories:
                    current_categories.append('test-delete-category')
                    courses[i]['categories'] = current_categories
                    courses_to_assign.append(courses[i]['title'])
            
            if courses_to_assign:
                # Update content
                content['courses'] = courses
                content_request = {"content": content, "isDraft": False}
                
                async with session.post(f'{backend_url}/api/content', json=content_request, headers=headers) as save_response:
                    if save_response.status == 200:
                        print(f"✅ Assigned {len(courses_to_assign)} courses to test category:")
                        for course_title in courses_to_assign:
                            print(f"   - {course_title}")
                    else:
                        print(f"❌ Failed to assign courses: {save_response.status}")
                        return
        
        # 4. Verify category has courses assigned
        async with session.get(f'{backend_url}/api/categories') as response:
            if response.status == 200:
                data = await response.json()
                categories = data.get('categories', [])
                
                test_cat = next((c for c in categories if c['slug'] == 'test-delete-category'), None)
                if test_cat:
                    print(f"✅ Test category found with {test_cat['course_count']} courses assigned")
                else:
                    print("⚠️ Test category not found in public categories (might not be featured)")
        
        # 5. Delete the test category and verify course unassignment
        async with session.delete(f'{backend_url}/api/admin/categories/test-delete-category', headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                message = data.get('message', '')
                unassigned_count = data.get('unassigned_courses', 0)
                affected_courses = data.get('affected_courses', [])
                
                print(f"✅ Category deletion successful: {message}")
                print(f"📊 Courses unassigned: {unassigned_count}")
                print(f"📊 Affected course slugs: {affected_courses}")
                
                # 6. Verify courses are actually unassigned
                async with session.get(f'{backend_url}/api/content') as verify_response:
                    if verify_response.status == 200:
                        verify_data = await verify_response.json()
                        verify_content = verify_data.get('content', {})
                        verify_courses = verify_content.get('courses', [])
                        
                        still_assigned = []
                        for course in verify_courses:
                            if 'test-delete-category' in course.get('categories', []):
                                still_assigned.append(course['title'])
                        
                        if not still_assigned:
                            print("✅ All courses successfully unassigned from deleted category")
                        else:
                            print(f"❌ Some courses still assigned to deleted category: {still_assigned}")
                
                # 7. Verify category is actually deleted
                async with session.get(f'{backend_url}/api/admin/categories', headers=headers) as verify_response:
                    if verify_response.status == 200:
                        verify_data = await verify_response.json()
                        remaining_categories = verify_data.get('categories', [])
                        
                        deleted_cat_exists = any(cat.get('slug') == 'test-delete-category' for cat in remaining_categories)
                        
                        if not deleted_cat_exists:
                            print("✅ Category successfully removed from system")
                        else:
                            print("❌ Category still exists after deletion")
                
            else:
                response_text = await response.text()
                print(f"❌ Category deletion failed: {response.status} - {response_text}")

if __name__ == "__main__":
    asyncio.run(test_category_deletion_with_courses())
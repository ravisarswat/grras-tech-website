#!/usr/bin/env python3
"""
Test script to delete a category directly via API
This will test the delete functionality that should work in admin panel
"""

import asyncio
import aiohttp
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

async def test_delete_category():
    """Test deleting a category via direct API call"""
    
    backend_url = "https://grras-tech-website-production.up.railway.app"
    api_base = f"{backend_url}/api"
    
    try:
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=60)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            
            # Step 1: Admin login
            logging.info("🔐 Logging in as admin...")
            login_data = {"password": "grras-admin"}
            
            async with session.post(f"{api_base}/admin/login", json=login_data) as response:
                if response.status != 200:
                    logging.error("❌ Admin login failed")
                    return
                
                auth_data = await response.json()
                admin_token = auth_data.get("token")
                
                if not admin_token:
                    logging.error("❌ No admin token received")
                    return
                
                logging.info("✅ Admin login successful")
            
            # Step 2: Get current content
            logging.info("📊 Fetching current categories...")
            async with session.get(f"{api_base}/content") as response:
                if response.status != 200:
                    logging.error(f"❌ Failed to fetch content: {response.status}")
                    return
                
                content_response = await response.json()
                content = content_response.get("content", {})
                current_categories = content.get("courseCategories", {})
                
                logging.info(f"📋 Found {len(current_categories)} categories:")
                for slug, category in current_categories.items():
                    name = category.get('name', slug)
                    logging.info(f"   - {slug}: {name}")
            
            # Step 3: Find a test category to delete
            test_category_slug = None
            test_category_name = None
            
            # Look for test categories first
            for slug, category in current_categories.items():
                if slug.startswith('category-') or slug.lower() in ['demo', 'test', 'new-category']:
                    test_category_slug = slug
                    test_category_name = category.get('name', slug)
                    break
            
            if not test_category_slug:
                logging.info("ℹ️ No test categories found. Creating a test category first...")
                
                # Create a test category
                test_category_slug = 'test-delete-category'
                test_category_name = 'Test Delete Category'
                
                content['courseCategories'][test_category_slug] = {
                    'name': test_category_name,
                    'title': test_category_name,
                    'slug': test_category_slug,
                    'description': 'Test category for delete functionality',
                    'order': 999,
                    'visible': True,
                    'courses': [],
                    'createdBy': 'delete-test-script'
                }
                
                # Save test category
                save_data = {
                    "content": content,
                    "isDraft": False
                }
                
                headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}
                
                async with session.post(f"{api_base}/content", json=save_data, headers=headers) as save_response:
                    if save_response.status == 200:
                        logging.info(f"✅ Test category '{test_category_name}' created")
                    else:
                        logging.error("❌ Failed to create test category")
                        return
            
            logging.info(f"🎯 Testing delete of category: {test_category_name} (slug: {test_category_slug})")
            
            # Step 4: Delete the test category
            logging.info("🗑️ Deleting test category...")
            
            # Remove from categories
            updated_categories = {k: v for k, v in content['courseCategories'].items() if k != test_category_slug}
            
            # Remove from courses (if any)
            updated_courses = []
            for course in content.get('courses', []):
                updated_course = course.copy()
                if 'categories' in updated_course:
                    updated_course['categories'] = [cat for cat in updated_course['categories'] if cat != test_category_slug]
                updated_courses.append(updated_course)
            
            # Update content
            updated_content = {
                **content,
                'courseCategories': updated_categories,
                'courses': updated_courses,
                'meta': {
                    **content.get('meta', {}),
                    'lastModified': '2025-09-02T16:20:00Z',
                    'modifiedBy': 'delete-test-script'
                }
            }
            
            # Save updated content
            save_data = {
                "content": updated_content,
                "isDraft": False
            }
            
            async with session.post(f"{api_base}/content", json=save_data, headers=headers) as delete_response:
                if delete_response.status == 200:
                    logging.info(f"✅ Category '{test_category_name}' successfully deleted!")
                    
                    # Verify deletion
                    async with session.get(f"{api_base}/content") as verify_response:
                        if verify_response.status == 200:
                            verify_data = await verify_response.json()
                            remaining_categories = verify_data.get("content", {}).get("courseCategories", {})
                            
                            if test_category_slug not in remaining_categories:
                                logging.info("🎉 SUCCESS: Category deletion verified in database!")
                                logging.info(f"📊 Remaining categories: {len(remaining_categories)}")
                                
                                for slug, category in remaining_categories.items():
                                    name = category.get('name', slug)
                                    logging.info(f"   ✅ {slug}: {name}")
                                    
                            else:
                                logging.warning("⚠️ Category still exists in database after delete")
                else:
                    error_data = await delete_response.json().catch(lambda: {'detail': 'Unknown error'})
                    logging.error(f"❌ Failed to delete category: {error_data}")
    
    except Exception as e:
        logging.error(f"❌ Error during delete test: {e}")

if __name__ == "__main__":
    print("🧪 Category Delete Test")
    print("=" * 40)
    print("Testing direct API delete functionality")
    print("=" * 40)
    
    asyncio.run(test_delete_category())
    
    print("\n✅ Delete test completed!")
    print("💡 This same logic should work in admin panel delete function")
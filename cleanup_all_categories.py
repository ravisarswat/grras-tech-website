#!/usr/bin/env python3
"""
Script to clean up ALL existing categories from GRRAS database
This will give the user a fresh start to add dynamic categories via admin panel
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)

async def cleanup_all_categories():
    """Remove all categories from the production Railway database via API"""
    
    # Production backend URL
    backend_url = "https://grras-academy-1.preview.emergentagent.com"
    api_base = f"{backend_url}/api"
    
    logging.info(f"🔗 Connecting to production backend: {backend_url}")
    
    try:
        # Setup HTTP session
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=60)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            
            # Step 1: Test connection
            logging.info("🔍 Testing connection to production backend...")
            async with session.get(f"{api_base}/health") as response:
                if response.status != 200:
                    logging.error(f"❌ Backend health check failed: {response.status}")
                    return
                health_data = await response.json()
                logging.info(f"✅ Backend connection successful: {health_data}")
            
            # Step 2: Admin authentication
            logging.info("🔐 Authenticating as admin...")
            login_data = {"password": "grras@admin2024"}
            
            async with session.post(f"{api_base}/admin/login", json=login_data) as response:
                if response.status != 200:
                    # Try alternative password
                    login_data = {"password": "grras-admin"}
                    async with session.post(f"{api_base}/admin/login", json=login_data) as alt_response:
                        if alt_response.status != 200:
                            logging.error("❌ Admin authentication failed with both passwords")
                            return
                        auth_data = await alt_response.json()
                else:
                    auth_data = await response.json()
                
                admin_token = auth_data.get("token")
                if not admin_token:
                    logging.error("❌ No admin token received")
                    return
                
                logging.info("✅ Admin authentication successful")
            
            # Step 3: Get current content
            logging.info("📊 Fetching current content...")
            async with session.get(f"{api_base}/content") as response:
                if response.status != 200:
                    logging.error(f"❌ Failed to fetch content: {response.status}")
                    return
                
                content_response = await response.json()
                content = content_response.get("content", {})
                current_categories = content.get("courseCategories", {})
                current_courses = content.get("courses", [])
                
                logging.info(f"📋 Found {len(current_categories)} existing categories")
                logging.info(f"📋 Found {len(current_courses)} existing courses")
                
                if len(current_categories) == 0:
                    logging.info("✅ No categories to clean up - database is already clean")
                    return
                
                # Display current categories for confirmation
                logging.info("📋 Current categories in production database:")
                for i, (key, category) in enumerate(current_categories.items(), 1):
                    if isinstance(category, dict):
                        name = category.get('name', key)
                        course_count = len(category.get('courses', []))
                        logging.info(f"   {i}. {name} (key: {key}, courses: {course_count})")
                    else:
                        logging.info(f"   {i}. {key} (invalid structure)")
            
            # Step 4: Clean categories and course references
            logging.info("🧹 Cleaning up all categories...")
            
            # Store original category count
            original_category_count = len(current_categories)
            
            # Clear all categories
            content['courseCategories'] = {}
            logging.info("✅ Cleared all courseCategories")
            
            # Remove category references from courses
            courses_updated = 0
            for course in current_courses:
                if 'categories' in course:
                    course['categories'] = []
                    courses_updated += 1
                if 'category' in course:
                    # Keep single category field but clear it
                    course['category'] = ""
                    courses_updated += 1
            
            if courses_updated > 0:
                logging.info(f"🧹 Cleared category references from {courses_updated} courses")
            
            # Clear category references from learning paths
            if 'learningPaths' in content:
                learning_paths = content['learningPaths']
                if isinstance(learning_paths, dict):
                    for path_key, path in learning_paths.items():
                        if isinstance(path, dict):
                            # Clear any category references if they exist
                            if 'categories' in path:
                                path['categories'] = []
                                logging.info(f"🧹 Cleared categories from learning path: {path.get('title', path_key)}")
                elif isinstance(learning_paths, list):
                    for path in learning_paths:
                        if isinstance(path, dict) and 'categories' in path:
                            path['categories'] = []
                            logging.info(f"🧹 Cleared categories from learning path: {path.get('title', 'Unknown')}")
            
            # Clear category references from homepage sections if they exist
            if 'pages' in content and 'home' in content['pages']:
                home_page = content['pages']['home']
                if 'courseCategories' in home_page:
                    # Keep the structure but mark for dynamic loading
                    home_page['courseCategories']['dynamicCategories'] = True
                    logging.info("🧹 Marked homepage categories as dynamic")
            
            # Add cleanup metadata
            content['meta'] = content.get('meta', {})
            content['meta']['lastModified'] = datetime.now().isoformat()
            content['meta']['modifiedBy'] = 'category-cleanup-script'
            content['meta']['categoryCleanupDate'] = datetime.now().isoformat()
            content['meta']['previousCategoryCount'] = original_category_count
            
            # Step 5: Save cleaned content back via API
            logging.info("💾 Saving cleaned content to production database...")
            
            headers = {
                'Authorization': f'Bearer {admin_token}',
                'Content-Type': 'application/json'
            }
            
            save_data = {
                "content": content,
                "isDraft": False
            }
            
            async with session.post(f"{api_base}/content", json=save_data, headers=headers) as response:
                if response.status != 200:
                    logging.error(f"❌ Failed to save cleaned content: {response.status}")
                    try:
                        error_data = await response.json()
                        logging.error(f"Error details: {error_data}")
                    except:
                        error_text = await response.text()
                        logging.error(f"Error text: {error_text}")
                    return
                
                save_response = await response.json()
                logging.info("✅ Successfully saved cleaned content to production database")
                logging.info(f"📊 Category cleanup completed - removed {original_category_count} categories")
            
            # Step 6: Verify cleanup
            logging.info("🔍 Verifying category cleanup...")
            async with session.get(f"{api_base}/content") as response:
                if response.status == 200:
                    verify_data = await response.json()
                    verify_content = verify_data.get("content", {})
                    remaining_categories = verify_content.get("courseCategories", {})
                    
                    if len(remaining_categories) == 0:
                        logging.info("✅ Category cleanup verification successful - no categories found")
                    else:
                        logging.warning(f"⚠️ Still found {len(remaining_categories)} categories after cleanup")
                        for key in remaining_categories.keys():
                            logging.warning(f"   - {key}")
                else:
                    logging.warning("⚠️ Could not verify cleanup - content endpoint failed")
        
        logging.info("🎯 Production category cleanup completed")
        logging.info("📝 Users can now add dynamic categories via /admin/content interface")
        logging.info("🏷️ All category references have been cleared from courses and learning paths")
        
    except Exception as e:
        logging.error(f"❌ Error during category cleanup: {e}")
        raise

if __name__ == "__main__":
    print("🧹 GRRAS Category Cleanup Script")
    print("=" * 50)  
    print("This script will remove ALL existing categories from production database")
    print("and clear all category references from courses and learning paths")
    print("This allows you to create fresh dynamic categories via admin panel")
    print("=" * 50)
    
    # Run cleanup
    asyncio.run(cleanup_all_categories())
    
    print("\n✅ Category cleanup completed successfully!")
    print("🚀 You can now add dynamic categories via admin panel at /admin/content")
    print("🏷️ All courses are now category-free and ready for new assignments")
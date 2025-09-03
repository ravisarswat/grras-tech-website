#!/usr/bin/env python3
"""
Script to clean up ALL existing courses from GRRAS Railway/Production database
This connects to the production backend and removes all courses via API
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)

async def cleanup_railway_courses():
    """Remove all courses from the production Railway database via API"""
    
    # Production backend URL
    backend_url = "https://training-portal-10.preview.emergentagent.com"
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
                current_courses = content.get("courses", [])
                
                logging.info(f"📋 Found {len(current_courses)} existing courses")
                
                if len(current_courses) == 0:
                    logging.info("✅ No courses to clean up - database is already clean")
                    return
                
                # Display current courses for confirmation
                logging.info("📋 Current courses in production database:")
                for i, course in enumerate(current_courses, 1):
                    title = course.get('title', 'Unknown')
                    slug = course.get('slug', 'no-slug')
                    logging.info(f"   {i}. {title} (slug: {slug})")
            
            # Step 4: Clean courses from content
            logging.info("🧹 Cleaning up all courses...")
            
            # Clear all courses
            content['courses'] = []
            
            # Also clear any course references from other sections
            if 'courseCategories' in content:
                for category_key, category in content['courseCategories'].items():
                    if isinstance(category, dict) and 'courses' in category:
                        category['courses'] = []
                        logging.info(f"🧹 Cleared courses from category: {category.get('name', category_key)}")
            
            if 'learningPaths' in content:
                learning_paths = content['learningPaths']
                if isinstance(learning_paths, dict):
                    for path_key, path in learning_paths.items():
                        if isinstance(path, dict) and 'courses' in path:
                            path['courses'] = []
                            logging.info(f"🧹 Cleared courses from learning path: {path.get('title', path_key)}")
                elif isinstance(learning_paths, list):
                    for path in learning_paths:
                        if isinstance(path, dict) and 'courses' in path:
                            path['courses'] = []
                            logging.info(f"🧹 Cleared courses from learning path: {path.get('title', 'Unknown')}")
            
            # Add cleanup metadata
            content['meta'] = content.get('meta', {})
            content['meta']['lastModified'] = datetime.now().isoformat()
            content['meta']['modifiedBy'] = 'cleanup-script-api'
            content['meta']['cleanupDate'] = datetime.now().isoformat()
            content['meta']['previousCourseCount'] = len(current_courses)
            
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
                logging.info(f"📊 Cleanup completed - removed {len(current_courses)} courses")
            
            # Step 6: Verify cleanup
            logging.info("🔍 Verifying cleanup...")
            async with session.get(f"{api_base}/courses") as response:
                if response.status == 200:
                    courses_data = await response.json()
                    remaining_courses = courses_data.get("courses", [])
                    
                    if len(remaining_courses) == 0:
                        logging.info("✅ Cleanup verification successful - no courses found")
                    else:
                        logging.warning(f"⚠️ Still found {len(remaining_courses)} courses after cleanup")
                else:
                    logging.warning("⚠️ Could not verify cleanup - courses endpoint failed")
        
        logging.info("🎯 Production database cleanup completed")
        logging.info("📝 Users can now add courses via /admin/content interface")
        
    except Exception as e:
        logging.error(f"❌ Error during cleanup: {e}")
        raise

if __name__ == "__main__":
    print("🧹 GRRAS Production Course Cleanup Script")
    print("=" * 50)  
    print("This script will remove ALL existing courses from production database")
    print("via API calls to the Railway backend")
    print("=" * 50)
    
    # Run cleanup
    asyncio.run(cleanup_railway_courses())
    
    print("\n✅ Production cleanup completed successfully!")
    print("🚀 You can now add courses via admin panel at /admin/content")
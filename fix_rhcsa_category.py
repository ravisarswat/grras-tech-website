#!/usr/bin/env python3
"""
Fix RHCSA course category assignment
The course should be in Red Hat Technologies category but showing in Other
"""

import asyncio
import aiohttp
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

async def fix_rhcsa_category():
    """Fix RHCSA course category assignment"""
    
    backend_url = "https://grras-tech-website-production.up.railway.app"
    api_base = f"{backend_url}/api"
    
    try:
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=60)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            
            # Step 1: Admin login
            logging.info("🔐 Admin login...")
            login_data = {"password": "grras-admin"}
            
            async with session.post(f"{api_base}/admin/login", json=login_data) as response:
                if response.status != 200:
                    logging.error("❌ Login failed")
                    return
                
                auth_data = await response.json()
                admin_token = auth_data.get("token")
                logging.info("✅ Login successful")
            
            # Step 2: Get current content
            async with session.get(f"{api_base}/content") as response:
                content_response = await response.json()
                content = content_response.get("content", {})
                courses = content.get("courses", [])
                categories = content.get("courseCategories", {})
                
                logging.info(f"📋 Found {len(courses)} courses and {len(categories)} categories")
            
            # Step 3: Find RHCSA course
            rhcsa_course = None
            rhcsa_index = None
            
            for i, course in enumerate(courses):
                if 'rhcsa' in course.get('title', '').lower() or 'rhcsa' in course.get('slug', '').lower():
                    rhcsa_course = course
                    rhcsa_index = i
                    break
            
            if not rhcsa_course:
                logging.error("❌ RHCSA course not found")
                return
                
            logging.info(f"✅ Found RHCSA course: {rhcsa_course.get('title')}")
            logging.info(f"📋 Current categories: {rhcsa_course.get('categories', [])}")
            logging.info(f"📋 Current category field: {rhcsa_course.get('category', 'None')}")
            
            # Step 4: Check if redhat category exists
            if 'redhat' not in categories:
                logging.error("❌ Red Hat category not found in database")
                logging.info(f"Available categories: {list(categories.keys())}")
                return
            
            # Step 5: Fix RHCSA course assignment
            logging.info("🔧 Fixing RHCSA course assignment...")
            
            # Update RHCSA course to be properly assigned to redhat category
            updated_course = {
                **rhcsa_course,
                'categories': ['redhat'],  # Assign to Red Hat Technologies
                'category': 'redhat',      # Also set legacy field for compatibility
                'visible': True            # Ensure it's visible
            }
            
            # Update courses array
            courses[rhcsa_index] = updated_course
            
            # Step 6: Save updated content
            updated_content = {
                **content,
                'courses': courses,
                'meta': {
                    **content.get('meta', {}),
                    'lastModified': '2025-09-02T16:35:00Z',
                    'modifiedBy': 'fix-rhcsa-category'
                }
            }
            
            headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}
            save_data = {"content": updated_content, "isDraft": False}
            
            async with session.post(f"{api_base}/content", json=save_data, headers=headers) as save_response:
                if save_response.status == 200:
                    logging.info("✅ Successfully fixed RHCSA course assignment!")
                    
                    # Verify the fix
                    async with session.get(f"{api_base}/content") as verify_response:
                        verify_data = await verify_response.json()
                        verify_courses = verify_data.get("content", {}).get("courses", [])
                        
                        # Find RHCSA course in updated data
                        for course in verify_courses:
                            if 'rhcsa' in course.get('title', '').lower():
                                logging.info(f"🔍 Verified RHCSA categories: {course.get('categories', [])}")
                                if 'redhat' in course.get('categories', []):
                                    logging.info("🎉 SUCCESS: RHCSA is now properly assigned to Red Hat Technologies!")
                                else:
                                    logging.warning("⚠️ RHCSA still not properly assigned")
                                break
                else:
                    logging.error(f"❌ Failed to save: {save_response.status}")
    
    except Exception as e:
        logging.error(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔧 RHCSA Category Fix")
    print("=" * 40)
    print("Fixing RHCSA course assignment to Red Hat Technologies category")
    print("=" * 40)
    
    asyncio.run(fix_rhcsa_category())
    
    print("\n✅ Fix completed!")
    print("🎯 RHCSA should now appear in Red Hat Technologies tab")
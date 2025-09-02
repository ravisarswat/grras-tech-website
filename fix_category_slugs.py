#!/usr/bin/env python3
"""
Fix category slugs in database - convert names to proper slugs
"""

import asyncio
import aiohttp
import json
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO)

def generate_slug(name):
    """Generate URL-friendly slug from category name"""
    # Convert to lowercase
    slug = name.lower()
    # Remove special characters, keep only letters, numbers, spaces, and hyphens
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    # Replace multiple hyphens with single
    slug = re.sub(r'-+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    return slug

async def fix_category_slugs():
    """Fix category slugs in production database"""
    
    backend_url = "https://grras-tech-website-production.up.railway.app"
    api_base = f"{backend_url}/api"
    
    try:
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=60)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            
            # Admin login
            logging.info("🔐 Admin login...")
            login_data = {"password": "grras-admin"}
            
            async with session.post(f"{api_base}/admin/login", json=login_data) as response:
                if response.status != 200:
                    logging.error("❌ Login failed")
                    return
                
                auth_data = await response.json()
                admin_token = auth_data.get("token")
                logging.info("✅ Login successful")
            
            # Get current content
            async with session.get(f"{api_base}/content") as response:
                content_response = await response.json()
                content = content_response.get("content", {})
                current_categories = content.get("courseCategories", {})
                current_courses = content.get("courses", [])
                
                logging.info(f"📋 Current categories: {list(current_categories.keys())}")
            
            # Check for categories that need slug fixes
            categories_to_fix = {}
            fixed_categories = {}
            slug_mapping = {}  # old_key -> new_slug
            
            for key, category in current_categories.items():
                category_name = category.get('name', key)
                proper_slug = generate_slug(category_name)
                
                logging.info(f"🔍 Category: {category_name}")
                logging.info(f"   Current key: {key}")
                logging.info(f"   Proper slug: {proper_slug}")
                
                if key != proper_slug:
                    logging.info(f"   ⚠️ NEEDS FIX: {key} → {proper_slug}")
                    categories_to_fix[key] = category
                    slug_mapping[key] = proper_slug
                    
                    # Create fixed category
                    fixed_category = {
                        **category,
                        'slug': proper_slug,
                        'name': category_name
                    }
                    fixed_categories[proper_slug] = fixed_category
                else:
                    logging.info(f"   ✅ OK: Slug is correct")
                    fixed_categories[key] = category
            
            if not categories_to_fix:
                logging.info("✅ All category slugs are already correct!")
                return
                
            logging.info(f"🔧 Fixing {len(categories_to_fix)} category slugs...")
            
            # Update course references to use new slugs
            updated_courses = []
            for course in current_courses:
                updated_course = course.copy()
                
                # Update categories array
                if 'categories' in updated_course and updated_course['categories']:
                    updated_categories = []
                    for cat_slug in updated_course['categories']:
                        if cat_slug in slug_mapping:
                            updated_categories.append(slug_mapping[cat_slug])
                            logging.info(f"   🔄 Course '{course.get('title', 'Unknown')}': {cat_slug} → {slug_mapping[cat_slug]}")
                        else:
                            updated_categories.append(cat_slug)
                    updated_course['categories'] = updated_categories
                
                # Update legacy category field if exists
                if 'category' in updated_course and updated_course['category'] in slug_mapping:
                    old_cat = updated_course['category']
                    updated_course['category'] = slug_mapping[old_cat]
                    logging.info(f"   🔄 Course legacy category: {old_cat} → {slug_mapping[old_cat]}")
                
                updated_courses.append(updated_course)
            
            # Create updated content
            updated_content = {
                **content,
                'courseCategories': fixed_categories,
                'courses': updated_courses,
                'meta': {
                    **content.get('meta', {}),
                    'lastModified': '2025-09-02T17:30:00Z',
                    'modifiedBy': 'fix-category-slugs',
                    'slugsFixed': len(categories_to_fix)
                }
            }
            
            # Save to database
            headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}
            save_data = {"content": updated_content, "isDraft": False}
            
            async with session.post(f"{api_base}/content", json=save_data, headers=headers) as save_response:
                if save_response.status == 200:
                    logging.info(f"✅ Successfully fixed {len(categories_to_fix)} category slugs!")
                    
                    # Verify fixes
                    async with session.get(f"{api_base}/content") as verify_response:
                        verify_data = await verify_response.json()
                        verify_categories = verify_data.get("content", {}).get("courseCategories", {})
                        
                        logging.info(f"🔍 Verification - Updated categories:")
                        for slug, category in verify_categories.items():
                            name = category.get('name', slug)
                            logging.info(f"   ✅ {slug}: {name}")
                            
                        logging.info("🎉 SUCCESS: All category slugs are now properly formatted!")
                else:
                    logging.error(f"❌ Failed to save: {save_response.status}")
    
    except Exception as e:
        logging.error(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🔧 Category Slug Fix Script")
    print("=" * 40)
    print("Converting category names to proper URL slugs")
    print("=" * 40)
    
    asyncio.run(fix_category_slugs())
    
    print("\n✅ Slug fix completed!")
    print("🎯 All categories now have proper URL-friendly slugs")
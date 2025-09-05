#!/usr/bin/env python3
"""
Final category cleanup - Remove ALL categories including test categories
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)

async def final_category_cleanup():
    """Final cleanup of all categories"""
    
    backend_url = "https://grras-seo-optimize.preview.emergentagent.com"
    api_base = f"{backend_url}/api"
    
    # Get admin token first
    login_data = {"password": "grras-admin"}
    
    try:
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=60)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            
            # Login
            async with session.post(f"{api_base}/admin/login", json=login_data) as response:
                if response.status != 200:
                    logging.error("❌ Admin authentication failed")
                    return
                auth_data = await response.json()
                admin_token = auth_data.get("token")
                
                if not admin_token:
                    logging.error("❌ No admin token received")
                    return
                
                logging.info("✅ Admin authentication successful")
            
            # Get current content
            async with session.get(f"{api_base}/content") as response:
                if response.status != 200:
                    logging.error(f"❌ Failed to fetch content: {response.status}")
                    return
                
                content_response = await response.json()
                content = content_response.get("content", {})
                current_categories = content.get("courseCategories", {})
                
                logging.info(f"📋 Found {len(current_categories)} categories to remove:")
                for key, category in current_categories.items():
                    logging.info(f"   - {key}: {category.get('title', category.get('name', key))}")
            
            # CLEAR ALL CATEGORIES COMPLETELY
            content['courseCategories'] = {}
            
            # Add cleanup metadata
            content['meta'] = content.get('meta', {})
            content['meta']['lastModified'] = datetime.now().isoformat()
            content['meta']['modifiedBy'] = 'final-category-cleanup'
            content['meta']['finalCleanupDate'] = datetime.now().isoformat()
            
            # Save
            headers = {
                'Authorization': f'Bearer {admin_token}',
                'Content-Type': 'application/json'
            }
            
            save_data = {
                "content": content,
                "isDraft": False
            }
            
            async with session.post(f"{api_base}/content", json=save_data, headers=headers) as response:
                if response.status == 200:
                    logging.info("✅ Successfully cleaned all categories")
                    
                    # Verify
                    async with session.get(f"{api_base}/content") as verify_response:
                        if verify_response.status == 200:
                            verify_data = await verify_response.json()
                            remaining_categories = verify_data.get("content", {}).get("courseCategories", {})
                            logging.info(f"🔍 Verification: {len(remaining_categories)} categories remaining")
                            
                            if len(remaining_categories) == 0:
                                logging.info("🎉 ALL CATEGORIES SUCCESSFULLY REMOVED!")
                            else:
                                logging.warning(f"⚠️ Still {len(remaining_categories)} categories found")
                        
                else:
                    logging.error(f"❌ Failed to save: {response.status}")
                    error_text = await response.text()
                    logging.error(f"Error: {error_text}")
    
    except Exception as e:
        logging.error(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🧹 Final Category Cleanup")
    print("=" * 40)
    print("Removing ALL categories from database")
    print("=" * 40)
    
    asyncio.run(final_category_cleanup())
    
    print("\n✅ Final cleanup completed!")
    print("🎯 Now you can add fresh categories via admin panel")
#!/usr/bin/env python3
"""
Manual category cleanup using correct admin token
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)

async def manual_category_cleanup():
    """Manual category cleanup with correct token"""
    
    backend_url = "https://grras-academy.preview.emergentagent.com"
    api_base = f"{backend_url}/api"
    
    # Known working admin token
    admin_token = "6c6e0e5380a415fde98489d9cd5f7d524ba5d6250a79b52c025773e78001f0da"
    
    try:
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=60)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            
            # Get current content
            logging.info("📊 Fetching current content...")
            async with session.get(f"{api_base}/content") as response:
                if response.status != 200:
                    logging.error(f"❌ Failed to fetch content: {response.status}")
                    return
                
                content_response = await response.json()
                content = content_response.get("content", {})
                current_categories = content.get("courseCategories", {})
                
                logging.info(f"📋 Found {len(current_categories)} existing categories")
                
                # Display current categories
                for key, category in current_categories.items():
                    if isinstance(category, dict):
                        name = category.get('name', key)
                        logging.info(f"   - {name} (key: {key})")
            
            # Clear all categories
            logging.info("🧹 Clearing all categories...")
            content['courseCategories'] = {}
            
            # Clear category references from courses
            current_courses = content.get("courses", [])
            for course in current_courses:
                if 'categories' in course:
                    course['categories'] = []
                if 'category' in course:
                    course['category'] = ""
            
            # Add metadata
            content['meta'] = content.get('meta', {})
            content['meta']['lastModified'] = datetime.now().isoformat()
            content['meta']['modifiedBy'] = 'manual-category-cleanup'
            content['meta']['categoryCleanupDate'] = datetime.now().isoformat()
            
            # Save with correct headers
            logging.info("💾 Saving cleaned content...")
            
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
                    logging.info("✅ Successfully saved cleaned content")
                    
                    # Verify
                    async with session.get(f"{api_base}/content") as verify_response:
                        if verify_response.status == 200:
                            verify_data = await verify_response.json()
                            remaining_categories = verify_data.get("content", {}).get("courseCategories", {})
                            logging.info(f"🔍 Verification: {len(remaining_categories)} categories remaining")
                        
                else:
                    logging.error(f"❌ Failed to save: {response.status}")
                    error_text = await response.text()
                    logging.error(f"Error: {error_text}")
    
    except Exception as e:
        logging.error(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(manual_category_cleanup())
#!/usr/bin/env python3
"""
Delete test categories from production database
"""

import asyncio
import aiohttp
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

async def delete_test_categories():
    """Delete test categories"""
    
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
                
                logging.info(f"📋 Current categories: {list(current_categories.keys())}")
            
            # Find test categories to delete
            test_categories_to_delete = []
            for slug in current_categories.keys():
                if slug.startswith('category-') and slug != 'category':
                    test_categories_to_delete.append(slug)
            
            if not test_categories_to_delete:
                logging.info("ℹ️ No test categories found to delete")
                return
            
            logging.info(f"🗑️ Deleting {len(test_categories_to_delete)} test categories: {test_categories_to_delete}")
            
            # Delete test categories
            updated_categories = {k: v for k, v in current_categories.items() if k not in test_categories_to_delete}
            
            # Update content
            updated_content = {
                **content,
                'courseCategories': updated_categories,
                'meta': {
                    **content.get('meta', {}),
                    'lastModified': '2025-09-02T16:25:00Z',
                    'modifiedBy': 'cleanup-test-categories'
                }
            }
            
            # Save
            headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}
            save_data = {"content": updated_content, "isDraft": False}
            
            async with session.post(f"{api_base}/content", json=save_data, headers=headers) as save_response:
                if save_response.status == 200:
                    logging.info(f"✅ Successfully deleted {len(test_categories_to_delete)} test categories!")
                    
                    # Verify
                    async with session.get(f"{api_base}/content") as verify_response:
                        verify_data = await verify_response.json()
                        remaining_categories = verify_data.get("content", {}).get("courseCategories", {})
                        
                        logging.info(f"📊 Remaining categories ({len(remaining_categories)}):")
                        for slug, category in remaining_categories.items():
                            name = category.get('name', slug)
                            logging.info(f"   ✅ {slug}: {name}")
                else:
                    logging.error(f"❌ Failed to save: {save_response.status}")
    
    except Exception as e:
        logging.error(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(delete_test_categories())
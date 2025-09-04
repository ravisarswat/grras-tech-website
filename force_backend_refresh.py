#!/usr/bin/env python3
"""
Force Backend Refresh Script
Force the backend to refresh its connection and clear any caches
"""

import requests
import json
import time
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

BACKEND_URL = "https://grras-academy.preview.emergentagent.com"
ADMIN_PASSWORD = "grras-admin"

def get_admin_token():
    """Get admin authentication token"""
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json().get("token")
        else:
            logger.error(f"Failed to get admin token: {response.status_code}")
            return None
            
    except Exception as e:
        logger.error(f"Error getting admin token: {e}")
        return None

def force_sync():
    """Force backend synchronization"""
    try:
        token = get_admin_token()
        if not token:
            return False
        
        logger.info("🔄 Forcing backend synchronization...")
        
        response = requests.post(
            f"{BACKEND_URL}/api/admin/force-sync",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30
        )
        
        if response.status_code == 200:
            sync_data = response.json()
            logger.info(f"✅ Force sync successful: {sync_data}")
            return True
        else:
            logger.error(f"❌ Force sync failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Force sync error: {e}")
        return False

def check_content_before_after():
    """Check content before and after sync"""
    try:
        logger.info("📋 Checking content API...")
        
        response = requests.get(f"{BACKEND_URL}/api/content", timeout=10)
        
        if response.status_code == 200:
            content_data = response.json()
            content = content_data.get("content", {})
            course_categories = content.get("courseCategories", {})
            
            logger.info(f"📊 Content API Results:")
            logger.info(f"   Total categories: {len(course_categories)}")
            logger.info(f"   Categories: {list(course_categories.keys())}")
            
            # Check for old categories
            old_categories = ["general", "cloud", "security", "certification"]
            found_old = [cat for cat in old_categories if cat in course_categories]
            
            if found_old:
                logger.warning(f"⚠️ Old categories still present: {found_old}")
                return False
            else:
                logger.info("✅ No old categories found in API response")
                return True
                
        else:
            logger.error(f"❌ Content API failed: {response.status_code}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Content API check failed: {e}")
        return False

def main():
    """Main refresh process"""
    logger.info("🚀 STARTING BACKEND REFRESH PROCESS")
    logger.info("=" * 50)
    
    # Check initial state
    logger.info("1️⃣ Checking initial content state...")
    initial_clean = check_content_before_after()
    
    if initial_clean:
        logger.info("✅ Content API already shows clean state!")
        return True
    
    # Force sync
    logger.info("2️⃣ Forcing backend synchronization...")
    sync_success = force_sync()
    
    if not sync_success:
        logger.error("❌ Force sync failed")
        return False
    
    # Wait a moment for sync to complete
    logger.info("⏳ Waiting for sync to complete...")
    time.sleep(3)
    
    # Check final state
    logger.info("3️⃣ Checking final content state...")
    final_clean = check_content_before_after()
    
    if final_clean:
        logger.info("🎉 SUCCESS! Backend now shows clean courseCategories")
        return True
    else:
        logger.error("❌ Backend still shows old categories after sync")
        return False

if __name__ == "__main__":
    success = main()
    
    if success:
        print("\n🎯 BACKEND REFRESH SUMMARY:")
        print("✅ Backend successfully refreshed")
        print("✅ courseCategories now show clean state")
        print("✅ Frontend will reflect cleaned database")
    else:
        print("\n❌ BACKEND REFRESH FAILED:")
        print("❌ Backend may still be showing cached data")
        print("❌ Manual intervention may be required")
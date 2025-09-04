#!/usr/bin/env python3
"""
Clean Local Database Script
Clean the courseCategories field in the local MongoDB that the backend is using
"""

import asyncio
import json
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Local database connection
LOCAL_MONGO_URL = "mongodb://localhost:27017"
DATABASE_NAME = "grras_database"
COLLECTION_NAME = "content"

# Categories to remove (old stored categories)
OLD_CATEGORIES_TO_REMOVE = ["general", "cloud", "security", "certification"]

class LocalDatabaseCleaner:
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None
        self.backup_data = None
        
    async def connect_to_local(self):
        """Connect to local MongoDB database"""
        try:
            logger.info("🔗 Connecting to LOCAL MongoDB...")
            self.client = AsyncIOMotorClient(LOCAL_MONGO_URL)
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info("✅ Successfully connected to local MongoDB")
            
            self.db = self.client[DATABASE_NAME]
            self.collection = self.db[COLLECTION_NAME]
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to local MongoDB: {e}")
            return False
    
    async def backup_current_state(self):
        """Create backup of current courseCategories data"""
        try:
            logger.info("💾 Creating backup of current local courseCategories data...")
            
            # Get current content document
            content_doc = await self.collection.find_one({})
            
            if not content_doc:
                logger.warning("⚠️ No content document found in local collection")
                return False
            
            # Extract courseCategories for backup
            course_categories = content_doc.get('courseCategories', {})
            
            # Create backup with timestamp
            backup_timestamp = datetime.utcnow().isoformat()
            self.backup_data = {
                "backup_timestamp": backup_timestamp,
                "database_type": "local",
                "original_courseCategories": course_categories,
                "document_id": str(content_doc.get('_id', 'unknown'))
            }
            
            # Save backup to file
            backup_filename = f"/app/local_courseCategories_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(backup_filename, 'w') as f:
                json.dump(self.backup_data, f, indent=2, default=str)
            
            logger.info(f"✅ Local backup created: {backup_filename}")
            logger.info(f"📊 Current local courseCategories: {course_categories}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to create local backup: {e}")
            return False
    
    async def analyze_current_categories(self):
        """Analyze current courseCategories structure"""
        try:
            logger.info("🔍 Analyzing current local courseCategories structure...")
            
            content_doc = await self.collection.find_one({})
            if not content_doc:
                logger.error("❌ No content document found in local database")
                return False
            
            course_categories = content_doc.get('courseCategories', {})
            
            logger.info("📋 CURRENT LOCAL COURSE CATEGORIES ANALYSIS:")
            logger.info(f"   Type: {type(course_categories)}")
            logger.info(f"   Count: {len(course_categories) if isinstance(course_categories, dict) else 'N/A'}")
            
            if isinstance(course_categories, dict):
                for key, value in course_categories.items():
                    logger.info(f"   - {key}: {value}")
                    
                # Check for old categories
                old_categories_found = []
                for old_cat in OLD_CATEGORIES_TO_REMOVE:
                    if old_cat in course_categories:
                        old_categories_found.append(old_cat)
                
                if old_categories_found:
                    logger.info(f"🎯 OLD CATEGORIES FOUND IN LOCAL: {old_categories_found}")
                else:
                    logger.info("✅ No old categories found in local - courseCategories may already be clean")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to analyze local categories: {e}")
            return False
    
    async def clean_course_categories(self):
        """Clean courseCategories field - remove old categories"""
        try:
            logger.info("🧹 Starting local courseCategories cleanup...")
            
            # Get current content document
            content_doc = await self.collection.find_one({})
            if not content_doc:
                logger.error("❌ No content document found in local database")
                return False
            
            course_categories = content_doc.get('courseCategories', {})
            
            if not isinstance(course_categories, dict):
                logger.info("ℹ️ Local courseCategories is not a dictionary, setting to empty dict")
                cleaned_categories = {}
            else:
                # Remove old categories
                cleaned_categories = {}
                removed_categories = []
                kept_categories = []
                
                for key, value in course_categories.items():
                    if key in OLD_CATEGORIES_TO_REMOVE:
                        removed_categories.append(key)
                        logger.info(f"🗑️ Removing old category from local: {key} = {value}")
                    else:
                        cleaned_categories[key] = value
                        kept_categories.append(key)
                        logger.info(f"✅ Keeping user category in local: {key} = {value}")
                
                logger.info(f"📊 LOCAL CLEANUP SUMMARY:")
                logger.info(f"   Removed: {removed_categories}")
                logger.info(f"   Kept: {kept_categories}")
                logger.info(f"   Final count: {len(cleaned_categories)}")
            
            # Update the document
            update_result = await self.collection.update_one(
                {"_id": content_doc["_id"]},
                {
                    "$set": {
                        "courseCategories": cleaned_categories,
                        "lastCategoriesCleanup": datetime.utcnow().isoformat(),
                        "cleanupBy": "local_cleanup_script"
                    }
                }
            )
            
            if update_result.modified_count > 0:
                logger.info("✅ Local courseCategories field successfully cleaned!")
                return True
            else:
                logger.warning("⚠️ No documents were modified in local database")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to clean local courseCategories: {e}")
            return False
    
    async def verify_cleanup(self):
        """Verify that cleanup was successful"""
        try:
            logger.info("🔍 Verifying local cleanup results...")
            
            # Get updated content document
            content_doc = await self.collection.find_one({})
            if not content_doc:
                logger.error("❌ No content document found for local verification")
                return False
            
            course_categories = content_doc.get('courseCategories', {})
            
            logger.info("📋 POST-CLEANUP LOCAL VERIFICATION:")
            logger.info(f"   Type: {type(course_categories)}")
            logger.info(f"   Count: {len(course_categories) if isinstance(course_categories, dict) else 'N/A'}")
            
            if isinstance(course_categories, dict):
                if len(course_categories) == 0:
                    logger.info("✅ Local courseCategories is now empty - cleanup successful!")
                else:
                    logger.info("📋 Remaining categories in local:")
                    for key, value in course_categories.items():
                        logger.info(f"   - {key}: {value}")
                
                # Check if any old categories remain
                remaining_old_categories = []
                for old_cat in OLD_CATEGORIES_TO_REMOVE:
                    if old_cat in course_categories:
                        remaining_old_categories.append(old_cat)
                
                if remaining_old_categories:
                    logger.error(f"❌ OLD CATEGORIES STILL PRESENT IN LOCAL: {remaining_old_categories}")
                    return False
                else:
                    logger.info("✅ All old categories successfully removed from local!")
            
            # Check cleanup metadata
            cleanup_timestamp = content_doc.get('lastCategoriesCleanup')
            if cleanup_timestamp:
                logger.info(f"📅 Local cleanup timestamp: {cleanup_timestamp}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to verify local cleanup: {e}")
            return False
    
    async def close_connection(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("🔌 Local database connection closed")

async def main():
    """Main cleanup process"""
    cleaner = LocalDatabaseCleaner()
    
    try:
        logger.info("🚀 STARTING LOCAL DATABASE CLEANUP")
        logger.info("=" * 60)
        
        # Step 1: Connect to local database
        if not await cleaner.connect_to_local():
            logger.error("❌ Failed to connect to local database")
            return False
        
        # Step 2: Analyze current state
        if not await cleaner.analyze_current_categories():
            logger.error("❌ Failed to analyze current local categories")
            return False
        
        # Step 3: Create backup
        if not await cleaner.backup_current_state():
            logger.error("❌ Failed to create local backup")
            return False
        
        # Step 4: Clean courseCategories field
        if not await cleaner.clean_course_categories():
            logger.error("❌ Failed to clean local courseCategories")
            return False
        
        # Step 5: Verify cleanup
        if not await cleaner.verify_cleanup():
            logger.error("❌ Local cleanup verification failed")
            return False
        
        logger.info("=" * 60)
        logger.info("🎉 LOCAL DATABASE CLEANUP COMPLETED SUCCESSFULLY!")
        logger.info("✅ Local courseCategories field has been cleaned")
        logger.info("✅ Old categories (general, cloud, security, certification) removed from local")
        logger.info("✅ Backend will now reflect cleaned state")
        logger.info("✅ Local backup created for safety")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ CRITICAL ERROR during local cleanup: {e}")
        return False
    
    finally:
        await cleaner.close_connection()

if __name__ == "__main__":
    # Run the cleanup process
    success = asyncio.run(main())
    
    if success:
        print("\n🎯 LOCAL CLEANUP SUMMARY:")
        print("✅ Local database successfully cleaned")
        print("✅ courseCategories field cleared of old categories")
        print("✅ Backend will now show clean categories state")
        print("✅ Local backup created for rollback if needed")
    else:
        print("\n❌ LOCAL CLEANUP FAILED:")
        print("❌ Local database cleanup encountered errors")
        print("❌ Check logs above for details")
        print("❌ Backend may still show old categories")
#!/usr/bin/env python3
"""
PRODUCTION DATABASE CLEANUP SCRIPT
GRRAS Solutions - Course Categories Field Cleanup

CRITICAL: This script connects to PRODUCTION MongoDB and modifies live data.
Handle with extreme care.

Task: Clean courseCategories field - remove old categories (general, cloud, security, certification)
"""

import asyncio
import json
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# PRODUCTION DATABASE CREDENTIALS
PRODUCTION_MONGO_URL = "mongodb+srv://ravisarswat_db_user:eackhKxcUXVYpR34@cluster0.bsofcav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "grras_database"
COLLECTION_NAME = "content"
ADMIN_PASSWORD = "grras-admin"

# Categories to remove (old stored categories)
OLD_CATEGORIES_TO_REMOVE = ["general", "cloud", "security", "certification"]

class ProductionDatabaseCleaner:
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None
        self.backup_data = None
        
    async def connect_to_production(self):
        """Connect to production MongoDB database"""
        try:
            logger.info("🔗 Connecting to PRODUCTION MongoDB...")
            self.client = AsyncIOMotorClient(PRODUCTION_MONGO_URL)
            
            # Test connection
            await self.client.admin.command('ping')
            logger.info("✅ Successfully connected to production MongoDB")
            
            self.db = self.client[DATABASE_NAME]
            self.collection = self.db[COLLECTION_NAME]
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to production MongoDB: {e}")
            return False
    
    async def backup_current_state(self):
        """Create backup of current courseCategories data"""
        try:
            logger.info("💾 Creating backup of current courseCategories data...")
            
            # Get current content document
            content_doc = await self.collection.find_one({})
            
            if not content_doc:
                logger.warning("⚠️ No content document found in collection")
                return False
            
            # Extract courseCategories for backup
            course_categories = content_doc.get('courseCategories', {})
            
            # Create backup with timestamp
            backup_timestamp = datetime.utcnow().isoformat()
            self.backup_data = {
                "backup_timestamp": backup_timestamp,
                "original_courseCategories": course_categories,
                "document_id": str(content_doc.get('_id', 'unknown'))
            }
            
            # Save backup to file
            backup_filename = f"/app/courseCategories_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(backup_filename, 'w') as f:
                json.dump(self.backup_data, f, indent=2, default=str)
            
            logger.info(f"✅ Backup created: {backup_filename}")
            logger.info(f"📊 Current courseCategories: {course_categories}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to create backup: {e}")
            return False
    
    async def analyze_current_categories(self):
        """Analyze current courseCategories structure"""
        try:
            logger.info("🔍 Analyzing current courseCategories structure...")
            
            content_doc = await self.collection.find_one({})
            if not content_doc:
                logger.error("❌ No content document found")
                return False
            
            course_categories = content_doc.get('courseCategories', {})
            
            logger.info("📋 CURRENT COURSE CATEGORIES ANALYSIS:")
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
                    logger.info(f"🎯 OLD CATEGORIES FOUND: {old_categories_found}")
                else:
                    logger.info("✅ No old categories found - courseCategories may already be clean")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to analyze categories: {e}")
            return False
    
    async def clean_course_categories(self):
        """Clean courseCategories field - remove old categories"""
        try:
            logger.info("🧹 Starting courseCategories cleanup...")
            
            # Get current content document
            content_doc = await self.collection.find_one({})
            if not content_doc:
                logger.error("❌ No content document found")
                return False
            
            course_categories = content_doc.get('courseCategories', {})
            
            if not isinstance(course_categories, dict):
                logger.info("ℹ️ courseCategories is not a dictionary, setting to empty dict")
                cleaned_categories = {}
            else:
                # Remove old categories
                cleaned_categories = {}
                removed_categories = []
                kept_categories = []
                
                for key, value in course_categories.items():
                    if key in OLD_CATEGORIES_TO_REMOVE:
                        removed_categories.append(key)
                        logger.info(f"🗑️ Removing old category: {key} = {value}")
                    else:
                        cleaned_categories[key] = value
                        kept_categories.append(key)
                        logger.info(f"✅ Keeping user category: {key} = {value}")
                
                logger.info(f"📊 CLEANUP SUMMARY:")
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
                        "cleanupBy": "production_cleanup_script"
                    }
                }
            )
            
            if update_result.modified_count > 0:
                logger.info("✅ courseCategories field successfully cleaned!")
                return True
            else:
                logger.warning("⚠️ No documents were modified")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to clean courseCategories: {e}")
            return False
    
    async def verify_cleanup(self):
        """Verify that cleanup was successful"""
        try:
            logger.info("🔍 Verifying cleanup results...")
            
            # Get updated content document
            content_doc = await self.collection.find_one({})
            if not content_doc:
                logger.error("❌ No content document found for verification")
                return False
            
            course_categories = content_doc.get('courseCategories', {})
            
            logger.info("📋 POST-CLEANUP VERIFICATION:")
            logger.info(f"   Type: {type(course_categories)}")
            logger.info(f"   Count: {len(course_categories) if isinstance(course_categories, dict) else 'N/A'}")
            
            if isinstance(course_categories, dict):
                if len(course_categories) == 0:
                    logger.info("✅ courseCategories is now empty - cleanup successful!")
                else:
                    logger.info("📋 Remaining categories:")
                    for key, value in course_categories.items():
                        logger.info(f"   - {key}: {value}")
                
                # Check if any old categories remain
                remaining_old_categories = []
                for old_cat in OLD_CATEGORIES_TO_REMOVE:
                    if old_cat in course_categories:
                        remaining_old_categories.append(old_cat)
                
                if remaining_old_categories:
                    logger.error(f"❌ OLD CATEGORIES STILL PRESENT: {remaining_old_categories}")
                    return False
                else:
                    logger.info("✅ All old categories successfully removed!")
            
            # Check cleanup metadata
            cleanup_timestamp = content_doc.get('lastCategoriesCleanup')
            if cleanup_timestamp:
                logger.info(f"📅 Cleanup timestamp: {cleanup_timestamp}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to verify cleanup: {e}")
            return False
    
    async def test_frontend_impact(self):
        """Test how the changes will affect frontend"""
        try:
            logger.info("🌐 Testing frontend impact...")
            
            # Simulate API call that frontend would make
            content_doc = await self.collection.find_one({})
            if not content_doc:
                logger.error("❌ No content document found")
                return False
            
            # Remove MongoDB-specific fields for frontend simulation
            frontend_content = {k: v for k, v in content_doc.items() if k != '_id'}
            course_categories = frontend_content.get('courseCategories', {})
            
            logger.info("🎯 FRONTEND IMPACT ANALYSIS:")
            logger.info(f"   Frontend will receive courseCategories: {course_categories}")
            logger.info(f"   CategoryManager will show: {len(course_categories)} categories")
            
            if len(course_categories) == 0:
                logger.info("✅ Frontend CategoryManager will show empty categories list")
                logger.info("✅ Delete functions will work properly without interference")
            else:
                logger.info(f"ℹ️ Frontend will show {len(course_categories)} user-created categories")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to test frontend impact: {e}")
            return False
    
    async def close_connection(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("🔌 Database connection closed")

async def main():
    """Main cleanup process"""
    cleaner = ProductionDatabaseCleaner()
    
    try:
        logger.info("🚀 STARTING PRODUCTION DATABASE CLEANUP")
        logger.info("=" * 60)
        
        # Step 1: Connect to production database
        if not await cleaner.connect_to_production():
            logger.error("❌ Failed to connect to production database")
            return False
        
        # Step 2: Analyze current state
        if not await cleaner.analyze_current_categories():
            logger.error("❌ Failed to analyze current categories")
            return False
        
        # Step 3: Create backup
        if not await cleaner.backup_current_state():
            logger.error("❌ Failed to create backup")
            return False
        
        # Step 4: Clean courseCategories field
        if not await cleaner.clean_course_categories():
            logger.error("❌ Failed to clean courseCategories")
            return False
        
        # Step 5: Verify cleanup
        if not await cleaner.verify_cleanup():
            logger.error("❌ Cleanup verification failed")
            return False
        
        # Step 6: Test frontend impact
        if not await cleaner.test_frontend_impact():
            logger.error("❌ Frontend impact test failed")
            return False
        
        logger.info("=" * 60)
        logger.info("🎉 PRODUCTION DATABASE CLEANUP COMPLETED SUCCESSFULLY!")
        logger.info("✅ courseCategories field has been cleaned")
        logger.info("✅ Old categories (general, cloud, security, certification) removed")
        logger.info("✅ Frontend CategoryManager will reflect cleaned state")
        logger.info("✅ Backup created for safety")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ CRITICAL ERROR during cleanup: {e}")
        return False
    
    finally:
        await cleaner.close_connection()

if __name__ == "__main__":
    # Run the cleanup process
    success = asyncio.run(main())
    
    if success:
        print("\n🎯 CLEANUP SUMMARY:")
        print("✅ Production database successfully cleaned")
        print("✅ courseCategories field cleared of old categories")
        print("✅ Frontend will show clean categories state")
        print("✅ Backup created for rollback if needed")
    else:
        print("\n❌ CLEANUP FAILED:")
        print("❌ Production database cleanup encountered errors")
        print("❌ Check logs above for details")
        print("❌ Database may be in inconsistent state")
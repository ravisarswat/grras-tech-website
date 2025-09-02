#!/usr/bin/env python3
"""
Script to clean up ALL existing courses from GRRAS database
This will give the user a fresh start to add courses via admin panel
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
load_dotenv()

async def cleanup_all_courses():
    """Remove all courses from the database to allow fresh admin panel setup"""
    
    # MongoDB connection - same as server.py
    mongo_url = (
        os.environ.get('MONGO_URI') or           # GitHub ENV (primary)
        os.environ.get('DATABASE_URL') or        # Railway fallback
        os.environ.get('MONGO_URL', 'mongodb://localhost:27017')  # Local fallback
    )
    
    db_name = os.environ.get('DB_NAME', 'grras_database')
    
    logging.info(f"🔗 Connecting to MongoDB: {mongo_url[:50]}{'...' if len(mongo_url) > 50 else ''}")
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await db.list_collection_names()
        logging.info("✅ MongoDB connection successful")
        
        # Get current content
        content_doc = await db.content.find_one({"type": "site_content"})
        
        if not content_doc:
            logging.warning("⚠️ No content document found in database")
            return
        
        # Remove MongoDB _id and type fields for processing
        content_doc.pop('_id', None)
        content_doc.pop('type', None)
        
        # Get current courses count
        current_courses = content_doc.get('courses', [])
        current_count = len(current_courses)
        
        logging.info(f"📊 Found {current_count} existing courses")
        
        if current_count == 0:
            logging.info("✅ No courses to clean up - database is already clean")
            return
        
        # Display current courses for confirmation
        logging.info("📋 Current courses in database:")
        for i, course in enumerate(current_courses, 1):
            title = course.get('title', 'Unknown')
            slug = course.get('slug', 'no-slug')
            logging.info(f"   {i}. {title} (slug: {slug})")
        
        # Clear all courses
        content_doc['courses'] = []
        
        # Also clear any course references from other sections
        if 'courseCategories' in content_doc:
            for category_key, category in content_doc['courseCategories'].items():
                if 'courses' in category:
                    category['courses'] = []
                    logging.info(f"🧹 Cleared courses from category: {category.get('name', category_key)}")
        
        if 'learningPaths' in content_doc:
            for path_key, path in content_doc['learningPaths'].items():
                if 'courses' in path:
                    path['courses'] = []
                    logging.info(f"🧹 Cleared courses from learning path: {path.get('title', path_key)}")
        
        # Add cleanup metadata
        from datetime import datetime, timezone
        content_doc['meta'] = content_doc.get('meta', {})
        content_doc['meta']['lastModified'] = datetime.now(timezone.utc).isoformat()
        content_doc['meta']['modifiedBy'] = 'cleanup-script'
        content_doc['meta']['cleanupDate'] = datetime.now(timezone.utc).isoformat()
        content_doc['meta']['previousCourseCount'] = current_count
        
        # Add type back for MongoDB
        content_doc['type'] = 'site_content'
        
        # Save cleaned content back to database
        await db.content.replace_one(
            {"type": "site_content"}, 
            content_doc, 
            upsert=True
        )
        
        logging.info("✅ Successfully cleaned up all courses from database")
        logging.info(f"📊 Removed {current_count} courses")
        logging.info("🎯 Admin panel is now ready for fresh course additions")
        logging.info("📝 Users can now add courses via /admin/content interface")
        
        # Close connection
        client.close()
        
    except Exception as e:
        logging.error(f"❌ Error during cleanup: {e}")
        raise

if __name__ == "__main__":
    print("🧹 GRRAS Course Cleanup Script")
    print("=" * 50)
    print("This script will remove ALL existing courses from the database")
    print("This allows you to start fresh and add courses via admin panel")
    print("=" * 50)
    
    # Run cleanup
    asyncio.run(cleanup_all_courses())
    
    print("\n✅ Cleanup completed successfully!")
    print("🚀 You can now add courses via admin panel at /admin/content")
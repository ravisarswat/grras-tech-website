#!/usr/bin/env python3
"""
Migrate the correct category data to test_database (where backend reads from)
"""

import asyncio
import json
import os
from datetime import datetime
import motor.motor_asyncio

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
SOURCE_DB = "grras_database"  # Where the correct data is
TARGET_DB = "test_database"   # Where the backend reads from

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
source_db = client[SOURCE_DB]
target_db = client[TARGET_DB]

async def migrate_to_correct_database():
    """Copy correct data from grras_database to test_database"""
    try:
        print(f"🚀 Migrating data from {SOURCE_DB} to {TARGET_DB}...")
        
        # Get the correct data from source database
        print(f"📥 Reading data from {SOURCE_DB}...")
        source_doc = await source_db.content.find_one(
            {"type": "site_content"},
            sort=[("updated_at", -1)]
        )
        
        if not source_doc:
            print(f"❌ No site_content found in {SOURCE_DB}")
            return False
        
        # Remove MongoDB-specific fields
        source_doc.pop('_id', None)
        
        print(f"✅ Found correct data:")
        print(f"   Categories: {len(source_doc.get('courseCategories', {}))}")
        print(f"   Courses: {len(source_doc.get('courses', []))}")
        
        # Update the document with migration info
        source_doc['updated_at'] = datetime.utcnow()
        source_doc['user'] = 'database-migration'
        source_doc['migration_note'] = f'Migrated from {SOURCE_DB} to {TARGET_DB}'
        
        # Save to target database
        print(f"📤 Saving data to {TARGET_DB}...")
        result = await target_db.content.replace_one(
            {"type": "site_content"},
            source_doc,
            upsert=True
        )
        
        if result.upserted_id or result.modified_count > 0:
            print("✅ Data successfully migrated!")
            
            # Verify the migration
            print("\n🔍 Verifying migration...")
            verify_doc = await target_db.content.find_one(
                {"type": "site_content"},
                sort=[("updated_at", -1)]
            )
            
            if verify_doc:
                categories = verify_doc.get('courseCategories', {})
                courses = verify_doc.get('courses', [])
                
                print(f"✅ Verification successful:")
                print(f"   Categories in {TARGET_DB}: {len(categories)}")
                print(f"   Courses in {TARGET_DB}: {len(courses)}")
                
                print(f"\n📊 Category breakdown:")
                for slug, category in categories.items():
                    category_courses = [c for c in courses if slug in c.get('categories', [])]
                    print(f"   • {category['name']}: {len(category_courses)} courses")
                
                return True
            else:
                print(f"❌ Verification failed - no data found in {TARGET_DB}")
                return False
        else:
            print("❌ Migration failed - no changes made")
            return False
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(migrate_to_correct_database())
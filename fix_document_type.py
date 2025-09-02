#!/usr/bin/env python3
"""
Fix Document Type Mismatch in MongoDB
"""

import asyncio
import json
import sys
import os
from datetime import datetime
import motor.motor_asyncio

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'grras_database')

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def fix_document_type():
    """Fix document type from 'main' to 'site_content'"""
    try:
        print("🚀 Fixing Document Type Mismatch...")
        
        # Find document with type 'main'
        main_doc = await db.content.find_one({"type": "main"})
        if not main_doc:
            print("❌ No document with type 'main' found")
            return False
        
        content_data = main_doc.get("data", {})
        print(f"📊 Found document with {len(content_data.get('courseCategories', {}))} categories")
        
        # Create new document with type 'site_content'
        site_content_doc = {
            "type": "site_content",
            **content_data,  # Flatten the data
            "updated_at": datetime.utcnow(),
            "user": "fix_document_type",
            "is_draft": False
        }
        
        # Remove the old document and insert the new one
        await db.content.delete_one({"type": "main"})
        await db.content.insert_one(site_content_doc)
        
        print("✅ Document type fixed: 'main' → 'site_content'")
        
        # Verify the fix
        verify_doc = await db.content.find_one({"type": "site_content"})
        if verify_doc:
            categories = verify_doc.get("courseCategories", {})
            courses = verify_doc.get("courses", [])
            print(f"✅ Verification: {len(categories)} categories, {len(courses)} courses")
            print(f"✅ Categories: {list(categories.keys())}")
        
        return True
        
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(fix_document_type())
    sys.exit(0 if result else 1)
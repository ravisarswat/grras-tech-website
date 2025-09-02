#!/usr/bin/env python3
"""
Debug using exact ContentManager logic to replicate the backend behavior
"""

import asyncio
import json
import os
import sys
import logging
from datetime import datetime
import motor.motor_asyncio

# Add the backend directory to path to import ContentManager
sys.path.append('/app/backend')
from content_manager import ContentManager

# Set up logging
logging.basicConfig(level=logging.INFO)

# MongoDB configuration - Using exact same logic as server.py
mongo_url = (
    os.environ.get('MONGO_URI') or           # GitHub ENV (primary)
    os.environ.get('DATABASE_URL') or        # Railway fallback
    os.environ.get('MONGO_URL', 'mongodb://localhost:27017')  # Local fallback
)

db_name = os.environ.get('DB_NAME', 'grras_database')

print(f"🔗 Using MongoDB URL: {mongo_url}")
print(f"🔗 Using DB Name: {db_name}")

async def debug_with_content_manager():
    """Debug using exact ContentManager logic"""
    try:
        print("🔍 Testing with ContentManager (exact backend logic)...")
        
        # Create MongoDB client exactly like server.py
        client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
        
        # Initialize ContentManager exactly like server.py
        content_manager = ContentManager(
            mongo_client=client,
            db_name=db_name
        )
        
        print("✅ ContentManager initialized")
        
        # Test the exact method calls
        print("\n1️⃣ Testing get_content()...")
        content = await content_manager.get_content()
        
        categories = content.get('courseCategories', {})
        courses = content.get('courses', [])
        
        print(f"📊 Categories: {len(categories)}")
        print(f"📊 Courses: {len(courses)}")
        
        print("\nCategory keys:", list(categories.keys()))
        print("First few course titles:", [c.get('title', 'NO TITLE') for c in courses[:3]])
        
        print("\n2️⃣ Testing _get_content_mongo() directly...")
        direct_content = await content_manager._get_content_mongo()
        
        if direct_content:
            direct_categories = direct_content.get('courseCategories', {})
            direct_courses = direct_content.get('courses', [])
            
            print(f"📊 Direct Categories: {len(direct_categories)}")
            print(f"📊 Direct Courses: {len(direct_courses)}")
            
            print("Direct category keys:", list(direct_categories.keys()))
            print("Direct course titles:", [c.get('title', 'NO TITLE') for c in direct_courses[:3]])
        else:
            print("❌ Direct content is None")
        
        # Test database query directly
        print("\n3️⃣ Testing database query manually...")
        db = client[db_name]
        
        manual_doc = await db.content.find_one(
            {"type": "site_content"},
            sort=[("updated_at", -1)]
        )
        
        if manual_doc:
            manual_categories = manual_doc.get('courseCategories', {})
            manual_courses = manual_doc.get('courses', [])
            
            print(f"📊 Manual Categories: {len(manual_categories)}")
            print(f"📊 Manual Courses: {len(manual_courses)}")
            
            print("Manual category keys:", list(manual_categories.keys()))
            print("Manual course titles:", [c.get('title', 'NO TITLE') for c in manual_courses[:3]])
        else:
            print("❌ Manual query returned None")
        
        return True
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(debug_with_content_manager())
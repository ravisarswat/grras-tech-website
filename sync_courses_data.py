#!/usr/bin/env python3
"""
Sync Courses Data from API to MongoDB
"""

import asyncio
import json
import sys
import os
from datetime import datetime
import motor.motor_asyncio
import aiohttp

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'grras_database')

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def get_courses_from_api():
    """Get courses from API endpoint"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get('http://localhost:8001/api/content') as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('content', {})
                else:
                    print(f"❌ API request failed: {response.status}")
                    return {}
    except Exception as e:
        print(f"❌ Error fetching from API: {e}")
        return {}

async def sync_courses_to_mongodb():
    """Sync courses from API to MongoDB"""
    try:
        print("🚀 Syncing Courses Data from API to MongoDB...")
        
        # Get current content from API
        api_content = await get_courses_from_api()
        courses = api_content.get("courses", [])
        
        print(f"📊 Found {len(courses)} courses from API")
        
        if not courses:
            print("❌ No courses found in API")
            return False
        
        # Get existing content from MongoDB
        content_doc = await db.content.find_one({"type": "main"})
        if content_doc:
            mongodb_content = content_doc.get("data", {})
        else:
            mongodb_content = {}
        
        # Preserve existing categories if they exist
        if "courseCategories" not in mongodb_content:
            mongodb_content["courseCategories"] = {}
        
        # Update courses in MongoDB
        mongodb_content["courses"] = courses
        
        # Also sync other content if needed
        for key in ["institute", "courseCategories", "learningPaths", "blog"]:
            if key in api_content:
                mongodb_content[key] = api_content[key]
        
        # Save to MongoDB
        await db.content.update_one(
            {"type": "main"},
            {
                "$set": {
                    "data": mongodb_content,
                    "updated_at": datetime.utcnow(),
                    "user": "sync_script",
                    "is_draft": False
                }
            },
            upsert=True
        )
        
        print(f"✅ Successfully synced {len(courses)} courses to MongoDB")
        
        # Show some sample courses
        print("\n📋 Sample Courses:")
        for i, course in enumerate(courses[:5], 1):
            print(f"{i}. {course.get('title', 'Unknown')} (slug: {course.get('slug', 'unknown')})")
        
        return True
        
    except Exception as e:
        print(f"❌ Sync failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(sync_courses_to_mongodb())
    sys.exit(0 if result else 1)
#!/usr/bin/env python3
"""
Verify MongoDB Data for Categories and Courses
"""

import asyncio
import json
import sys
import os
import motor.motor_asyncio

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'grras_database')

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def verify_data():
    """Verify current data in MongoDB"""
    try:
        print("🔍 Verifying MongoDB Data...")
        
        # Get content document
        content_doc = await db.content.find_one({"type": "main"})
        if not content_doc:
            print("❌ No content document found")
            return False
        
        content = content_doc.get("data", {})
        categories = content.get("courseCategories", {})
        courses = content.get("courses", [])
        
        print(f"📊 Categories in MongoDB: {len(categories)}")
        print(f"📊 Courses in MongoDB: {len(courses)}")
        
        print("\n📋 CATEGORIES:")
        for slug, category in categories.items():
            print(f"  • {category.get('name', 'Unknown')} ({slug}) - Order: {category.get('order', 'N/A')}")
        
        print("\n📋 COURSES WITH CATEGORIES:")
        for course in courses[:10]:  # Show first 10
            categories_list = course.get("categories", [])
            print(f"  • {course.get('title', 'Unknown')} → {categories_list}")
        
        # Count courses per category
        print("\n📊 COURSE COUNTS PER CATEGORY:")
        for slug, category in categories.items():
            category_courses = [c for c in courses if slug in c.get("categories", [])]
            print(f"  • {category.get('name', 'Unknown')}: {len(category_courses)} courses")
        
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(verify_data())
    sys.exit(0 if result else 1)
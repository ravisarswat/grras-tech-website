#!/usr/bin/env python3
"""
Debug MongoDB content to understand the data sync issue
"""

import asyncio
import json
import os
from datetime import datetime
import motor.motor_asyncio

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'grras_database')

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def debug_mongodb():
    """Debug MongoDB content documents"""
    try:
        print("🔍 Debugging MongoDB content documents...")
        print(f"📊 Database: {DB_NAME}")
        print(f"📊 Connection: {MONGO_URL[:50]}...")
        
        # Check all content documents
        print("\n📋 ALL CONTENT DOCUMENTS:")
        print("=" * 50)
        
        content_docs = []
        async for doc in db.content.find().sort("updated_at", -1):
            content_docs.append(doc)
        
        print(f"Found {len(content_docs)} content documents")
        
        for i, doc in enumerate(content_docs):
            print(f"\n📄 Document {i+1}:")
            print(f"   Type: {doc.get('type', 'NO TYPE')}")
            print(f"   Updated: {doc.get('updated_at', 'NO DATE')}")
            print(f"   User: {doc.get('user', 'NO USER')}")
            print(f"   Draft: {doc.get('is_draft', 'NO DRAFT FLAG')}")
            
            # Check categories and courses
            if 'courseCategories' in doc:
                categories = doc['courseCategories']
                print(f"   Categories: {len(categories)} ({list(categories.keys())[:5]}{'...' if len(categories) > 5 else ''})")
            else:
                print("   Categories: NOT FOUND")
            
            if 'courses' in doc:
                courses = doc['courses']
                print(f"   Courses: {len(courses)}")
            else:
                print("   Courses: NOT FOUND")
        
        # Focus on site_content documents
        print("\n🎯 SITE_CONTENT DOCUMENTS ONLY:")
        print("=" * 50)
        
        site_content_docs = []
        async for doc in db.content.find({"type": "site_content"}).sort("updated_at", -1):
            site_content_docs.append(doc)
        
        print(f"Found {len(site_content_docs)} site_content documents")
        
        if site_content_docs:
            latest_doc = site_content_docs[0]
            print(f"\n📄 LATEST SITE_CONTENT DOCUMENT:")
            print(f"   Updated: {latest_doc.get('updated_at')}")
            print(f"   User: {latest_doc.get('user')}")
            
            categories = latest_doc.get('courseCategories', {})
            courses = latest_doc.get('courses', [])
            
            print(f"   Categories: {len(categories)}")
            for slug, cat in categories.items():
                print(f"      • {cat.get('name', 'NO NAME')} ({slug})")
            
            print(f"   Courses: {len(courses)}")
            for course in courses[:5]:  # Show first 5 courses
                print(f"      • {course.get('title', 'NO TITLE')} (categories: {course.get('categories', [])})")
            
            if len(courses) > 5:
                print(f"      ... and {len(courses) - 5} more courses")
        
        # Check what ContentManager would actually fetch
        print("\n🔍 SIMULATING CONTENT MANAGER QUERY:")
        print("=" * 50)
        
        content_manager_doc = await db.content.find_one(
            {"type": "site_content"},
            sort=[("updated_at", -1)]
        )
        
        if content_manager_doc:
            print("✅ ContentManager would fetch:")
            categories = content_manager_doc.get('courseCategories', {})
            courses = content_manager_doc.get('courses', [])
            print(f"   Categories: {len(categories)} - {list(categories.keys())}")
            print(f"   Courses: {len(courses)}")
        else:
            print("❌ ContentManager would fetch: NOTHING")
        
        return True
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(debug_mongodb())
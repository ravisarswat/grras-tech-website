#!/usr/bin/env python3
"""
Debug test_database (the one backend is actually using)
"""

import asyncio
import json
import os
from datetime import datetime
import motor.motor_asyncio

# MongoDB configuration - using test_database
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = "test_database"  # The one backend is actually using

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

async def debug_test_database():
    """Debug test_database content"""
    try:
        print(f"🔍 Debugging {DB_NAME} (backend's actual database)...")
        
        # List all collections
        collections = await db.list_collection_names()
        print(f"📊 Found {len(collections)} collections: {collections}")
        
        if 'content' in collections:
            print(f"\n📋 CONTENT COLLECTION IN {DB_NAME}:")
            print("=" * 50)
            
            # Get all content documents
            content_docs = []
            async for doc in db.content.find().sort("updated_at", -1):
                content_docs.append(doc)
            
            print(f"Found {len(content_docs)} content documents")
            
            for i, doc in enumerate(content_docs):
                print(f"\n📄 Document {i+1}:")
                print(f"   Type: {doc.get('type', 'NO TYPE')}")
                print(f"   Updated: {doc.get('updated_at', 'NO DATE')}")
                print(f"   User: {doc.get('user', 'NO USER')}")
                
                # Check categories and courses
                if 'courseCategories' in doc:
                    categories = doc['courseCategories']
                    print(f"   Categories: {len(categories)} - {list(categories.keys())[:5]}{'...' if len(categories) > 5 else ''}")
                
                if 'courses' in doc:
                    courses = doc['courses']
                    print(f"   Courses: {len(courses)}")
                    if courses:
                        print(f"      First course: {courses[0].get('title', 'NO TITLE')}")
                
                # Check if there's old data structure
                if 'data' in doc and isinstance(doc['data'], dict):
                    data = doc['data']
                    if 'courseCategories' in data:
                        categories = data['courseCategories']
                        print(f"   Data.Categories: {len(categories)} - {list(categories.keys())[:5]}{'...' if len(categories) > 5 else ''}")
                    if 'courses' in data:
                        courses = data['courses']
                        print(f"   Data.Courses: {len(courses)}")
        else:
            print(f"❌ No 'content' collection found in {DB_NAME}")
        
        return True
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(debug_test_database())
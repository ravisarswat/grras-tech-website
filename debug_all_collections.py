#!/usr/bin/env python3
"""
Debug all MongoDB collections to find the source of old data
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

async def debug_all_collections():
    """Debug all collections in the database"""
    try:
        print("🔍 Debugging all MongoDB collections...")
        
        # List all collections
        collections = await db.list_collection_names()
        print(f"📊 Found {len(collections)} collections: {collections}")
        
        for collection_name in collections:
            print(f"\n📋 COLLECTION: {collection_name}")
            print("=" * 50)
            
            collection = db[collection_name]
            doc_count = await collection.count_documents({})
            print(f"Documents: {doc_count}")
            
            if doc_count > 0:
                # Get first few documents
                docs = []
                async for doc in collection.find().limit(3):
                    docs.append(doc)
                
                for i, doc in enumerate(docs):
                    print(f"\nDocument {i+1}:")
                    
                    # Show key fields
                    if 'type' in doc:
                        print(f"   Type: {doc['type']}")
                    if 'updated_at' in doc:
                        print(f"   Updated: {doc['updated_at']}")
                    if 'user' in doc:
                        print(f"   User: {doc['user']}")
                    
                    # Check for content-like fields
                    if 'courseCategories' in doc:
                        categories = doc['courseCategories']
                        print(f"   Categories: {len(categories)} - {list(categories.keys())[:3]}{'...' if len(categories) > 3 else ''}")
                    
                    if 'courses' in doc:
                        courses = doc['courses']
                        print(f"   Courses: {len(courses)}")
                        if courses:
                            print(f"      First course: {courses[0].get('title', 'NO TITLE')}")
                    
                    if 'data' in doc and isinstance(doc['data'], dict):
                        data = doc['data']
                        if 'courseCategories' in data:
                            categories = data['courseCategories']
                            print(f"   Data.Categories: {len(categories)} - {list(categories.keys())[:3]}{'...' if len(categories) > 3 else ''}")
                        if 'courses' in data:
                            courses = data['courses']
                            print(f"   Data.Courses: {len(courses)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(debug_all_collections())
#!/usr/bin/env python3
"""
Debug ContentManager Directly
"""

import asyncio
import sys
import os
import motor.motor_asyncio

# Add the backend directory to the Python path
sys.path.append('/app/backend')

from content_manager import ContentManager

async def debug_content_manager():
    """Debug ContentManager directly"""
    try:
        print("🚀 Testing ContentManager Directly...")
        
        # Initialize MongoDB client
        MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        DB_NAME = os.environ.get('DB_NAME', 'grras_database')
        mongo_client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
        
        # Initialize content manager with MongoDB client
        content_manager = ContentManager(
            mongo_client=mongo_client,
            db_name=DB_NAME
        )
        
        # Test direct MongoDB access
        print("\n1. Testing direct MongoDB access:")
        mongo_content = await content_manager._get_content_mongo()
        if mongo_content:
            categories = mongo_content.get("courseCategories", {})
            courses = mongo_content.get("courses", [])
            print(f"   Categories from MongoDB: {len(categories)}")
            print(f"   Courses from MongoDB: {len(courses)}")
            print(f"   Sample categories: {list(categories.keys())[:3]}")
        else:
            print("   No content found in MongoDB")
        
        # Test get_content method
        print("\n2. Testing get_content method:")
        full_content = await content_manager.get_content()
        if full_content:
            categories = full_content.get("courseCategories", {})
            courses = full_content.get("courses", [])
            print(f"   Categories from get_content: {len(categories)}")
            print(f"   Courses from get_content: {len(courses)}")
            print(f"   Sample categories: {list(categories.keys())[:3]}")
            
            # Check if it matches MongoDB
            if mongo_content and categories != mongo_content.get("courseCategories", {}):
                print("   ❌ MISMATCH! get_content returns different data than MongoDB")
                print(f"   MongoDB keys: {list(mongo_content.get('courseCategories', {}).keys())}")
                print(f"   get_content keys: {list(categories.keys())}")
            else:
                print("   ✅ get_content matches MongoDB data")
        else:
            print("   No content found from get_content")
            
        return True
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(debug_content_manager())
    sys.exit(0 if result else 1)
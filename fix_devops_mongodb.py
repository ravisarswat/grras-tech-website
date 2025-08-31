#!/usr/bin/env python3
"""
Fix DevOps Training course in MongoDB
This script directly updates the course in the MongoDB database
"""

import os
import sys
from pymongo import MongoClient
from datetime import datetime

def update_devops_course_mongodb():
    """Update DevOps Training course directly in MongoDB"""
    
    # Get MongoDB URL from environment
    mongo_url = os.environ.get('MONGO_URL')
    if not mongo_url:
        print("❌ MONGO_URL environment variable not found")
        return False
    
    try:
        # Connect to MongoDB
        client = MongoClient(mongo_url)
        db = client.get_default_database()
        
        print("✅ Connected to MongoDB")
        
        # Find the DevOps Training course
        courses_collection = db.courses if 'courses' in db.list_collection_names() else db.content
        
        # Check if content collection exists (structured differently)
        if 'content' in db.list_collection_names():
            print("Using content collection...")
            content_doc = courses_collection.find_one()
            if content_doc and 'courses' in content_doc:
                courses = content_doc['courses']
                devops_course_found = False
                
                for i, course in enumerate(courses):
                    if course.get('slug') == 'devops-training':
                        print(f"✅ Found DevOps Training course in content collection")
                        print(f"   Current category: {course.get('category', 'None')}")
                        print(f"   Current level: {course.get('level', 'None')}")
                        
                        # Update the course
                        courses[i]['category'] = 'devops'
                        courses[i]['level'] = 'Professional Level'
                        
                        # Update the entire document
                        courses_collection.update_one(
                            {},  # Find the first document
                            {'$set': {'courses': courses, 'lastUpdated': datetime.utcnow().isoformat()}}
                        )
                        
                        print(f"✅ Updated category to: devops")
                        print(f"✅ Updated level to: Professional Level")
                        
                        devops_course_found = True
                        break
                
                if not devops_course_found:
                    print("❌ DevOps Training course not found in content collection")
                    return False
            else:
                print("❌ No content document or courses array found")
                return False
        else:
            # Direct courses collection
            print("Using direct courses collection...")
            result = courses_collection.update_one(
                {'slug': 'devops-training'},
                {
                    '$set': {
                        'category': 'devops',
                        'level': 'Professional Level',
                        'lastUpdated': datetime.utcnow().isoformat()
                    }
                }
            )
            
            if result.matched_count > 0:
                print("✅ DevOps Training course updated successfully!")
                print(f"   Updated category to: devops")
                print(f"   Updated level to: Professional Level")
            else:
                print("❌ DevOps Training course not found in courses collection")
                return False
        
        client.close()
        print("✅ MongoDB connection closed")
        return True
        
    except Exception as e:
        print(f"❌ Error updating course in MongoDB: {e}")
        return False

if __name__ == "__main__":
    print("=== FIXING DEVOPS TRAINING COURSE IN MONGODB ===")
    success = update_devops_course_mongodb()
    
    if success:
        print("\n🎉 SUCCESS! DevOps Training course updated in MongoDB!")
        print("   - Category: devops")
        print("   - Level: Professional Level")
        print("\nPlease restart the backend service:")
        print("   sudo supervisorctl restart backend")
    else:
        print("\n❌ Failed to update DevOps course in MongoDB")
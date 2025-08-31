#!/usr/bin/env python3
"""
Script to fix DevOps Training course categorization
This will directly update the course in the backend data
"""

import json
import os
from datetime import datetime

def update_devops_course():
    """Update DevOps Training course to correct category and level"""
    
    # Path to the courses data file (assuming it's in backend/data/)
    data_file = "/app/backend/data/content.json"
    
    if not os.path.exists(data_file):
        print(f"❌ Data file not found: {data_file}")
        return False
    
    try:
        # Read current data
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        print("✅ Loaded content.json")
        
        # Find and update DevOps Training course
        courses = data.get('courses', [])
        devops_course_found = False
        
        for course in courses:
            if course.get('slug') == 'devops-training':
                print(f"✅ Found DevOps Training course")
                print(f"   Current category: {course.get('category', 'None')}")
                print(f"   Current level: {course.get('level', 'None')}")
                
                # Update the course
                course['category'] = 'devops'
                course['level'] = 'Professional Level'
                
                print(f"✅ Updated category to: devops")
                print(f"✅ Updated level to: Professional Level")
                
                devops_course_found = True
                break
        
        if not devops_course_found:
            print("❌ DevOps Training course not found in content.json")
            return False
        
        # Save updated data
        with open(data_file, 'w') as f:
            json.dump(data, f, indent=2)
        
        print("✅ Successfully updated content.json")
        print("✅ DevOps Training course is now properly categorized!")
        
        return True
        
    except Exception as e:
        print(f"❌ Error updating course: {e}")
        return False

if __name__ == "__main__":
    print("=== FIXING DEVOPS TRAINING COURSE CATEGORIZATION ===")
    success = update_devops_course()
    
    if success:
        print("\n🎉 SUCCESS! DevOps Training course has been fixed!")
        print("   - Category: devops")
        print("   - Level: Professional Level")
        print("\nPlease restart the backend service to apply changes:")
        print("   sudo supervisorctl restart backend")
    else:
        print("\n❌ Failed to fix DevOps course categorization")
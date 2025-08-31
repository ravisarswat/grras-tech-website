#!/usr/bin/env python3
"""
Backend Data Cleanup Script for GRRAS Solutions
- Remove test courses from production data
- Ensure all courses have complete required fields
- Fix any data quality issues
"""

import asyncio
import json
import sys
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def cleanup_backend_data():
    """Clean up backend data by removing test courses and ensuring data completeness"""
    
    # MongoDB connection - same as server.py
    mongo_url = (
        os.environ.get('MONGO_URI') or
        os.environ.get('DATABASE_URL') or 
        os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    )
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'grras_database')]
    
    try:
        print("🔗 Connected to MongoDB")
        
        # Get current content
        content_doc = await db.content.find_one({})
        if not content_doc:
            print("❌ No content document found")
            return
            
        print(f"✅ Found content document with {len(content_doc.get('courses', []))} courses")
        
        courses = content_doc.get('courses', [])
        
        # Identify test courses to remove
        test_courses = []
        production_courses = []
        
        for course in courses:
            if 'test' in course.get('title', '').lower():
                test_courses.append(course.get('title', 'Unknown'))
            else:
                production_courses.append(course)
        
        print(f"\n📊 Analysis:")
        print(f"   Total courses: {len(courses)}")
        print(f"   Test courses: {len(test_courses)}")
        print(f"   Production courses: {len(production_courses)}")
        
        if test_courses:
            print(f"\n🗑️  Test courses to remove:")
            for title in test_courses:
                print(f"   - {title}")
        
        # Check for missing fields in production courses
        required_fields = ['title', 'slug', 'description', 'duration', 'fees', 'eligibility']
        optional_fields = ['learningOutcomes', 'careerRoles', 'oneLiner']
        
        courses_needing_updates = []
        
        for course in production_courses:
            missing_fields = []
            for field in required_fields:
                if not course.get(field):
                    missing_fields.append(field)
            
            missing_optional = []
            for field in optional_fields:
                if not course.get(field):
                    missing_optional.append(field)
            
            if missing_fields or missing_optional:
                courses_needing_updates.append({
                    'title': course.get('title', 'Unknown'),
                    'slug': course.get('slug', 'unknown'),
                    'missing_required': missing_fields,
                    'missing_optional': missing_optional
                })
        
        if courses_needing_updates:
            print(f"\n⚠️  Courses needing field updates:")
            for course in courses_needing_updates:
                print(f"   - {course['title']}")
                if course['missing_required']:
                    print(f"     Missing required: {', '.join(course['missing_required'])}")
                if course['missing_optional']:
                    print(f"     Missing optional: {', '.join(course['missing_optional'])}")
        
        # Ask for confirmation
        print(f"\n🔧 Proposed changes:")
        print(f"   1. Remove {len(test_courses)} test courses")
        print(f"   2. Keep {len(production_courses)} production courses")
        if courses_needing_updates:
            print(f"   3. Fix missing fields in {len(courses_needing_updates)} courses")
        
        confirm = input("\nProceed with cleanup? (y/N): ").strip().lower()
        if confirm != 'y':
            print("❌ Cleanup cancelled")
            return
        
        # Perform cleanup
        content_doc['courses'] = production_courses
        
        # Fix missing fields for specific courses
        for course in content_doc['courses']:
            # Add missing oneLiner for courses that don't have it
            if not course.get('oneLiner'):
                if 'aws' in course.get('title', '').lower():
                    if 'practitioner' in course.get('title', '').lower():
                        course['oneLiner'] = "AWS Cloud fundamentals and certification preparation for cloud computing basics"
                    elif 'architect' in course.get('title', '').lower():
                        course['oneLiner'] = "Design scalable AWS architectures and prepare for Solutions Architect certification"
                elif 'kubernetes' in course.get('title', '').lower():
                    if 'cka' in course.get('title', '').lower():
                        course['oneLiner'] = "Master Kubernetes administration and container orchestration for production environments"
                    elif 'cks' in course.get('title', '').lower():
                        course['oneLiner'] = "Advanced Kubernetes security practices and CKS certification preparation"
                elif 'red hat' in course.get('title', '').lower():
                    if 'rhcsa' in course.get('title', '').lower():
                        course['oneLiner'] = "Red Hat Linux system administration fundamentals and RHCSA certification"
                    elif 'rhce' in course.get('title', '').lower():
                        course['oneLiner'] = "Advanced Red Hat automation with Ansible and RHCE certification preparation"
                    elif 'do188' in course.get('title', '').lower():
                        course['oneLiner'] = "Container development with Podman and OpenShift application deployment"
                elif 'cyber security' in course.get('title', '').lower():
                    course['oneLiner'] = "Comprehensive cybersecurity training with ethical hacking and security certification"
            
            # Add missing learningOutcomes for key courses
            if not course.get('learningOutcomes') and 'cyber security' in course.get('title', '').lower():
                course['learningOutcomes'] = [
                    "Master ethical hacking techniques and penetration testing",
                    "Understand network security and vulnerability assessment",
                    "Learn incident response and security management",
                    "Gain expertise in security tools and frameworks"
                ]
                
            # Add missing careerRoles for key courses  
            if not course.get('careerRoles') and 'cyber security' in course.get('title', '').lower():
                course['careerRoles'] = [
                    "Cybersecurity Analyst",
                    "Ethical Hacker",
                    "Security Consultant", 
                    "Penetration Tester",
                    "Security Operations Center (SOC) Analyst"
                ]
        
        # Update the database
        result = await db.content.replace_one(
            {'_id': content_doc['_id']},
            content_doc
        )
        
        if result.modified_count > 0:
            print("✅ Backend data cleanup completed successfully!")
            print(f"   - Removed {len(test_courses)} test courses")
            print(f"   - Retained {len(production_courses)} production courses")
            print(f"   - Updated courses with missing fields")
        else:
            print("⚠️  No changes were made to the database")
            
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(cleanup_backend_data())
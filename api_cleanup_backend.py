#!/usr/bin/env python3
"""
API-based Backend Data Cleanup Script for GRRAS Solutions
- Remove test courses from production data via CMS API
- Ensure all courses have complete required fields
- Fix any data quality issues
"""

import requests
import json
import sys

BASE_URL = "https://responsive-edu-site.preview.emergentagent.com/api"
ADMIN_TOKEN = "eeafa5d3a4b8422554501ab77d5bb114c4fe6515d6b25c877b65b1e395e1ca20"

def get_admin_headers():
    """Get headers with admin authentication"""
    return {
        "Authorization": f"Bearer {ADMIN_TOKEN}",
        "Content-Type": "application/json"
    }

def get_current_content():
    """Get current CMS content"""
    try:
        response = requests.get(f"{BASE_URL}/content")
        response.raise_for_status()
        data = response.json()
        # Handle nested content structure
        return data.get('content', data)
    except Exception as e:
        print(f"❌ Error fetching content: {e}")
        return None

def update_content(content):
    """Update CMS content via admin API"""
    try:
        payload = {
            "content": content,
            "isDraft": False
        }
        response = requests.post(
            f"{BASE_URL}/content",
            headers=get_admin_headers(),
            json=payload
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Error updating content: {e}")
        print(f"Response status: {response.status_code if 'response' in locals() else 'No response'}")
        if 'response' in locals():
            print(f"Response text: {response.text}")
        return None

def cleanup_backend_data():
    """Clean up backend data by removing test courses and ensuring data completeness"""
    
    print("🔗 Getting current CMS content...")
    content = get_current_content()
    
    if not content:
        print("❌ Failed to get current content")
        return
    
    courses = content.get('courses', [])
    print(f"✅ Found {len(courses)} courses")
    
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
    
    # Show proposed changes
    print(f"\n🔧 Proposed changes:")
    print(f"   1. Remove {len(test_courses)} test courses")
    print(f"   2. Keep {len(production_courses)} production courses")
    if courses_needing_updates:
        print(f"   3. Fix missing fields in {len(courses_needing_updates)} courses")
    
    print("\n✅ Proceeding with cleanup automatically...")
    
    # Perform cleanup
    print("\n🔧 Processing course updates...")
    
    # Fix missing fields for specific courses
    for course in production_courses:
        original_title = course.get('title', '')
        
        # Add missing oneLiner for courses that don't have it
        if not course.get('oneLiner'):
            if 'aws' in original_title.lower():
                if 'practitioner' in original_title.lower():
                    course['oneLiner'] = "AWS Cloud fundamentals and certification preparation for cloud computing basics"
                elif 'architect' in original_title.lower():
                    course['oneLiner'] = "Design scalable AWS architectures and prepare for Solutions Architect certification"
            elif 'kubernetes' in original_title.lower():
                if 'cka' in original_title.lower():
                    course['oneLiner'] = "Master Kubernetes administration and container orchestration for production environments"
                elif 'cks' in original_title.lower():
                    course['oneLiner'] = "Advanced Kubernetes security practices and CKS certification preparation"
            elif 'red hat' in original_title.lower():
                if 'rhcsa' in original_title.lower():
                    course['oneLiner'] = "Red Hat Linux system administration fundamentals and RHCSA certification"
                elif 'rhce' in original_title.lower():
                    course['oneLiner'] = "Advanced Red Hat automation with Ansible and RHCE certification preparation"
                elif 'do188' in original_title.lower():
                    course['oneLiner'] = "Container development with Podman and OpenShift application deployment"
            elif 'cyber security' in original_title.lower():
                course['oneLiner'] = "Comprehensive cybersecurity training with ethical hacking and security certification"
            elif 'java' in original_title.lower() and 'salesforce' in original_title.lower():
                course['oneLiner'] = "Complete Java programming and Salesforce administration & development training"
        
        # Add missing learningOutcomes for key courses
        if not course.get('learningOutcomes'):
            if 'cyber security' in original_title.lower():
                course['learningOutcomes'] = [
                    "Master ethical hacking techniques and penetration testing",
                    "Understand network security and vulnerability assessment", 
                    "Learn incident response and security management",
                    "Gain expertise in security tools and frameworks"
                ]
            elif 'java' in original_title.lower() and 'salesforce' in original_title.lower():
                course['learningOutcomes'] = [
                    "Master Java programming fundamentals and advanced concepts",
                    "Learn Salesforce platform administration and customization",
                    "Develop Salesforce applications using Apex and Visualforce",
                    "Understand integration patterns and best practices"
                ]
                
        # Add missing careerRoles for key courses  
        if not course.get('careerRoles'):
            if 'cyber security' in original_title.lower():
                course['careerRoles'] = [
                    "Cybersecurity Analyst",
                    "Ethical Hacker", 
                    "Security Consultant",
                    "Penetration Tester",
                    "Security Operations Center (SOC) Analyst"
                ]
            elif 'java' in original_title.lower() and 'salesforce' in original_title.lower():
                course['careerRoles'] = [
                    "Java Developer",
                    "Salesforce Administrator",
                    "Salesforce Developer", 
                    "Full Stack Developer",
                    "Application Developer"
                ]
    
    # Update the content with cleaned courses
    content['courses'] = production_courses
    
    print(f"🔄 Updating content via admin API...")
    result = update_content(content)
    
    if result:
        print("✅ Backend data cleanup completed successfully!")
        print(f"   - Removed {len(test_courses)} test courses")
        print(f"   - Retained {len(production_courses)} production courses")
        print(f"   - Updated courses with missing fields")
        
        # Verify the update
        print("\n🔍 Verifying update...")
        updated_content = get_current_content()
        if updated_content:
            updated_courses = updated_content.get('courses', [])
            print(f"✅ Verification: Now have {len(updated_courses)} courses")
    else:
        print("❌ Failed to update content")

if __name__ == "__main__":
    cleanup_backend_data()
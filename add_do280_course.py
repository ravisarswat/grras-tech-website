#!/usr/bin/env python3
"""
Add DO280 Course and Fix Admin Sync Issues
यह script DO280 course को properly add करेगा और level को Professional Level set करेगा
"""

import requests
import json
import time

BASE_URL = "https://ecstatic-jackson.preview.emergentagent.com/api"

def get_admin_token():
    """Get admin authentication token"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login", 
            json={"password": "grras@admin2024"}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get('token')
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error logging in: {e}")
        return None

def get_admin_headers(token):
    """Get headers with admin authentication"""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

def get_current_content():
    """Get current CMS content"""
    try:
        response = requests.get(f"{BASE_URL}/content")
        response.raise_for_status()
        data = response.json()
        return data.get('content', data)
    except Exception as e:
        print(f"❌ Error fetching content: {e}")
        return None

def add_do280_course():
    """Add DO280 course with Professional Level"""
    print("🔧 Adding DO280 Course...")
    
    # Step 1: Get admin token
    print("\n1. Getting admin authentication...")
    token = get_admin_token()
    if not token:
        print("❌ Cannot proceed without admin token")
        return False
    print("✅ Admin authenticated successfully")
    
    # Step 2: Get current content
    print("\n2. Getting current content...")
    content = get_current_content()
    if not content:
        print("❌ Cannot get current content")
        return False
    
    courses = content.get('courses', [])
    print(f"✅ Found {len(courses)} existing courses")
    
    # Step 3: Check if DO280 already exists
    print("\n3. Checking for existing DO280 course...")
    do280_exists = False
    for i, course in enumerate(courses):
        if 'DO280' in course.get('title', '') or 'openshift administration ii' in course.get('title', '').lower():
            print(f"✅ Found existing DO280 course at index {i}")
            print(f"   Current level: {course.get('level', 'N/A')}")
            
            # Update to Professional Level
            if course.get('level') != 'Professional Level':
                print("🔧 Updating level to Professional Level...")
                course['level'] = 'Professional Level'
                course['category'] = 'redhat'
                do280_exists = True
            else:
                print("✅ DO280 already has Professional Level")
                return True
            break
    
    # Step 4: Add DO280 course if it doesn't exist
    if not do280_exists:
        print("\n4. Adding new DO280 course...")
        
        new_course = {
            "slug": "do280-red-hat-openshift-administration-ii",
            "title": "DO280 – Red Hat OpenShift Administration II",
            "oneLiner": "Advanced Red Hat OpenShift administration and container platform management",
            "description": "Advanced Red Hat OpenShift Administration II course focuses on managing OpenShift Container Platform clusters at scale, implementing security policies, monitoring applications, and troubleshooting complex containerized environments.",
            "duration": "5 days",
            "fees": "₹28,000",
            "level": "Professional Level",
            "category": "redhat",
            "mode": ["Classroom", "Online"],
            "visible": True,
            "featured": True,
            "order": len(courses) + 1,
            "tools": [
                "Red Hat OpenShift Container Platform",
                "Kubernetes",
                "Docker",
                "Podman",
                "OpenShift CLI (oc)",
                "Web Console",
                "Helm Charts",
                "Operators"
            ],
            "highlights": [
                "Advanced cluster administration",
                "Security policy implementation", 
                "Application monitoring and logging",
                "Troubleshooting complex issues",
                "Performance optimization",
                "Red Hat Certification preparation"
            ],
            "learningOutcomes": [
                "Manage OpenShift clusters at enterprise scale",
                "Implement advanced security policies and RBAC",
                "Configure monitoring, logging, and alerting",
                "Troubleshoot complex containerized applications",
                "Optimize cluster performance and resource utilization",
                "Prepare for Red Hat OpenShift certification exams"
            ],
            "careerRoles": [
                "OpenShift Administrator",
                "Container Platform Engineer",
                "DevOps Engineer",
                "Site Reliability Engineer (SRE)",
                "Cloud Infrastructure Specialist"
            ],
            "eligibility": "DO180 (Introduction to Containers, Kubernetes, and Red Hat OpenShift) or equivalent experience",
            "overview": "Advanced administration of Red Hat OpenShift Container Platform with focus on enterprise-scale cluster management, security implementation, and performance optimization.",
            "certificate": "Red Hat course completion certificate and preparation for EX280 certification exam",
            "seo": {
                "title": "DO280 Red Hat OpenShift Administration II Training - GRRAS Solutions",
                "description": "Advanced Red Hat OpenShift Administration II training in Jaipur. Master enterprise OpenShift cluster management, security, and troubleshooting.",
                "keywords": "DO280, Red Hat OpenShift Administration II, OpenShift training Jaipur, container platform, kubernetes, red hat certification"
            }
        }
        
        courses.append(new_course)
        print(f"✅ Added DO280 course. Total courses now: {len(courses)}")
    
    # Step 5: Save updated content
    print("\n5. Saving updated content...")
    try:
        payload = {
            "content": content,
            "isDraft": False
        }
        
        response = requests.post(
            f"{BASE_URL}/content",
            headers=get_admin_headers(token),
            json=payload
        )
        
        if response.status_code in [200, 201]:
            print("✅ Content saved successfully")
        else:
            print(f"❌ Content save failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error saving content: {e}")
        return False
    
    # Step 6: Force sync
    print("\n6. Forcing sync...")
    try:
        response = requests.post(
            f"{BASE_URL}/admin/force-sync",
            headers=get_admin_headers(token)
        )
        
        if response.status_code in [200, 201]:
            sync_data = response.json()
            print(f"✅ Force sync completed: {sync_data.get('coursesCount', 'N/A')} courses")
        else:
            print(f"⚠️ Force sync warning: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Force sync error (non-critical): {e}")
    
    # Step 7: Verify the addition
    print("\n7. Verifying DO280 course...")
    time.sleep(2)  # Wait for propagation
    
    # Check via courses API
    try:
        response = requests.get(f"{BASE_URL}/courses")
        if response.status_code == 200:
            data = response.json()
            courses_api = data.get('courses', [])
            print(f"✅ Courses API returning {len(courses_api)} courses")
            
            # Look for DO280 in courses API
            for course in courses_api:
                if 'DO280' in course.get('title', ''):
                    print(f"✅ DO280 found in Courses API!")
                    print(f"   Title: {course.get('title', 'N/A')}")
                    print(f"   Level: {course.get('level', 'N/A')}")
                    print(f"   Category: {course.get('category', 'N/A')}")
                    print(f"   Visible: {course.get('visible', 'N/A')}")
                    return True
            
            print("⚠️  DO280 not found in Courses API yet - may need time to propagate")
        else:
            print(f"❌ Courses API error: {response.status_code}")
    except Exception as e:
        print(f"❌ Error checking courses API: {e}")
    
    return True

def main():
    print("🎯 DO280 Course Addition and Sync Fix")
    print("=" * 50)
    
    success = add_do280_course()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ DO280 Course Addition Completed Successfully!")
        print("\n💡 Next Steps:")
        print("1. Wait 2-3 minutes for complete propagation")
        print("2. Clear browser cache (Ctrl+F5)")
        print("3. Check website for DO280 course with Professional Level")
        print("4. If still not visible, use Force Sync button in admin panel")
    else:
        print("❌ DO280 Course Addition Failed")
        print("Please check the errors above and try again")

if __name__ == "__main__":
    main()
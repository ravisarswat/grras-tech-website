#!/usr/bin/env python3
"""
Test MongoDB connection string priority and error handling
"""

import requests
import json
from pathlib import Path

# Get backend URL
def get_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BASE_URL = get_backend_url()
API_BASE = f"{BASE_URL}/api"

def test_mongodb_connection_details():
    """Test detailed MongoDB connection information"""
    print("🔍 TESTING MONGODB CONNECTION DETAILS")
    print("=" * 60)
    
    try:
        # Test content endpoint
        response = requests.get(f"{API_BASE}/content", timeout=10)
        print(f"Content API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            
            # Analyze content structure
            print(f"Content sections: {list(content.keys())}")
            
            courses = content.get("courses", [])
            print(f"Number of courses: {len(courses)}")
            
            if courses:
                print("Course details:")
                for i, course in enumerate(courses[:3]):  # Show first 3 courses
                    print(f"  {i+1}. {course.get('slug', 'N/A')} - {course.get('title', 'N/A')}")
                    print(f"     Tools: {len(course.get('tools', []))} items")
                    print(f"     Fees: {course.get('fees', 'N/A')}")
            
            # Check institute data
            institute = content.get("institute", {})
            if institute:
                print(f"Institute data present: {list(institute.keys())}")
            
            # Check for MongoDB-specific indicators
            meta = content.get("meta", {})
            print(f"Meta information: {meta}")
            
        else:
            print(f"❌ Content API failed: {response.status_code}")
            print(f"Response: {response.text[:200]}")
    
    except Exception as e:
        print(f"❌ Connection test failed: {e}")

def test_courses_api_details():
    """Test courses API details"""
    print("\n🎓 TESTING COURSES API DETAILS")
    print("=" * 60)
    
    try:
        response = requests.get(f"{API_BASE}/courses", timeout=10)
        print(f"Courses API Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            courses = data.get("courses", [])
            print(f"API returned {len(courses)} courses")
            
            for course in courses:
                slug = course.get("slug", "N/A")
                title = course.get("title", "N/A")
                tools_count = len(course.get("tools", []))
                print(f"  - {slug}: {title} ({tools_count} tools)")
        else:
            print(f"❌ Courses API failed: {response.status_code}")
    
    except Exception as e:
        print(f"❌ Courses API test failed: {e}")

def test_individual_course_details():
    """Test individual course endpoint"""
    print("\n📚 TESTING INDIVIDUAL COURSE DETAILS")
    print("=" * 60)
    
    test_slugs = ["devops-training", "bca-degree", "redhat-certifications", "data-science-machine-learning"]
    
    for slug in test_slugs:
        try:
            response = requests.get(f"{API_BASE}/courses/{slug}", timeout=10)
            if response.status_code == 200:
                course = response.json()
                tools = course.get("tools", [])
                print(f"✅ {slug}: {course.get('title', 'N/A')} ({len(tools)} tools)")
            elif response.status_code == 404:
                print(f"❌ {slug}: Not found (404)")
            else:
                print(f"❌ {slug}: HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ {slug}: Error - {e}")

if __name__ == "__main__":
    print(f"Testing MongoDB connection at: {BASE_URL}")
    test_mongodb_connection_details()
    test_courses_api_details()
    test_individual_course_details()
#!/usr/bin/env python3
"""
Test Admin CMS operations for MongoDB single source of truth
"""

import requests
import json
import time
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
ADMIN_PASSWORD = "grras-admin"

def test_admin_login():
    """Test admin login functionality"""
    print("🔐 TESTING ADMIN LOGIN")
    print("=" * 50)
    
    # Test valid login
    login_data = {"password": ADMIN_PASSWORD}
    response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=10)
    
    print(f"Login Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Login Response: {data}")
        
        # Check for JWT token
        cookies = response.cookies
        if "admin_token" in cookies:
            print("✅ JWT token cookie set successfully")
            return cookies
        else:
            print("❌ No JWT token cookie found")
    else:
        print(f"❌ Login failed: {response.text}")
    
    return None

def test_admin_content_operations(admin_cookies):
    """Test admin content save operations"""
    if not admin_cookies:
        print("❌ No admin cookies - skipping content operations")
        return
    
    print("\n📝 TESTING ADMIN CONTENT OPERATIONS")
    print("=" * 50)
    
    try:
        # Get current content
        current_response = requests.get(f"{API_BASE}/content", timeout=10)
        if current_response.status_code != 200:
            print("❌ Could not get current content")
            return
        
        current_content = current_response.json()["content"]
        print(f"Current content sections: {list(current_content.keys())}")
        
        # Create test update
        test_timestamp = int(time.time())
        updated_content = current_content.copy()
        
        # Add test marker to verify MongoDB persistence
        if "home" not in updated_content:
            updated_content["home"] = {}
        
        test_marker = f"ADMIN_CMS_TEST_{test_timestamp}"
        updated_content["home"]["testMarker"] = test_marker
        
        print(f"Adding test marker: {test_marker}")
        
        # Save content via authenticated endpoint
        save_response = requests.post(
            f"{API_BASE}/content", 
            json={"content": updated_content}, 
            cookies=admin_cookies, 
            timeout=10
        )
        
        print(f"Save Status: {save_response.status_code}")
        if save_response.status_code == 200:
            save_data = save_response.json()
            print(f"Save Response: {save_data}")
            
            # Wait for persistence
            time.sleep(1)
            
            # Verify the change persisted in MongoDB
            verify_response = requests.get(f"{API_BASE}/content", timeout=10)
            if verify_response.status_code == 200:
                verify_content = verify_response.json()["content"]
                saved_marker = verify_content.get("home", {}).get("testMarker", "")
                
                if saved_marker == test_marker:
                    print(f"✅ Content successfully persisted in MongoDB: {saved_marker}")
                else:
                    print(f"❌ Content not persisted. Expected: {test_marker}, Got: {saved_marker}")
            else:
                print("❌ Could not verify content persistence")
        else:
            print(f"❌ Content save failed: {save_response.text}")
    
    except Exception as e:
        print(f"❌ Content operations test failed: {e}")

def test_mongodb_vs_json_fallback():
    """Test to verify MongoDB is being used, not JSON fallback"""
    print("\n🔍 TESTING MONGODB VS JSON FALLBACK")
    print("=" * 50)
    
    try:
        response = requests.get(f"{API_BASE}/content", timeout=10)
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            
            # Check for MongoDB-specific indicators
            courses = content.get("courses", [])
            meta = content.get("meta", {})
            
            print(f"Number of courses: {len(courses)}")
            print(f"Meta information: {meta}")
            
            # Check for variety in course data (indicates real CMS, not static JSON)
            if courses:
                fees_variety = set(course.get("fees", "") for course in courses)
                tools_variety = [len(course.get("tools", [])) for course in courses]
                
                print(f"Fee structures found: {len(fees_variety)}")
                print(f"Tools count variety: {tools_variety}")
                
                if len(fees_variety) > 1:
                    print("✅ Multiple fee structures indicate MongoDB CMS data")
                else:
                    print("⚠️  Uniform fee structure (may still be MongoDB)")
                
                if meta.get("lastModified"):
                    print(f"✅ Last modified timestamp indicates dynamic MongoDB data: {meta['lastModified']}")
                else:
                    print("⚠️  No modification timestamp found")
            
        else:
            print(f"❌ Content API failed: {response.status_code}")
    
    except Exception as e:
        print(f"❌ MongoDB vs JSON test failed: {e}")

if __name__ == "__main__":
    print(f"Testing Admin CMS operations at: {BASE_URL}")
    
    # Test admin login
    admin_cookies = test_admin_login()
    
    # Test content operations
    test_admin_content_operations(admin_cookies)
    
    # Test MongoDB vs JSON fallback
    test_mongodb_vs_json_fallback()
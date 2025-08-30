#!/usr/bin/env python3
"""
Production Deployment Verification Script for GRRAS Solutions
Run this after Railway deployment to verify everything is working
"""

import requests
import sys

def verify_production(base_url):
    """Verify production deployment is working"""
    
    print(f"🚀 Verifying GRRAS Solutions deployment at: {base_url}")
    print("=" * 60)
    
    tests = []
    
    # Test 1: Homepage loads
    try:
        response = requests.get(base_url, timeout=30)
        if response.status_code == 200:
            tests.append("✅ Homepage loads successfully")
        else:
            tests.append(f"❌ Homepage failed: {response.status_code}")
    except Exception as e:
        tests.append(f"❌ Homepage error: {e}")
    
    # Test 2: API health check
    try:
        response = requests.get(f"{base_url}/api/health", timeout=30)
        if response.status_code == 200:
            tests.append("✅ Backend API working")
        else:
            tests.append(f"❌ API failed: {response.status_code}")
    except Exception as e:
        tests.append(f"❌ API error: {e}")
    
    # Test 3: Courses API
    try:
        response = requests.get(f"{base_url}/api/courses", timeout=30)
        if response.status_code == 200:
            courses = response.json().get('courses', [])
            tests.append(f"✅ Courses API working ({len(courses)} courses)")
            
            # Check for C/C++/DSA course specifically
            cpp_course = next((c for c in courses if c.get('slug') == 'c-cpp-dsa'), None)
            if cpp_course:
                tests.append("✅ C/C++/DSA course found in API")
            else:
                tests.append("⚠️  C/C++/DSA course not found (add manually)")
        else:
            tests.append(f"❌ Courses API failed: {response.status_code}")
    except Exception as e:
        tests.append(f"❌ Courses API error: {e}")
    
    # Test 4: Admin login page
    try:
        response = requests.get(f"{base_url}/admin/content", timeout=30)
        if response.status_code == 200:
            tests.append("✅ Admin panel accessible")
        else:
            tests.append(f"⚠️  Admin panel status: {response.status_code}")
    except Exception as e:
        tests.append(f"❌ Admin panel error: {e}")
    
    # Test 5: Footer improvements visible
    try:
        response = requests.get(base_url, timeout=30)
        if response.status_code == 200 and "Training Institute" in response.text:
            tests.append("✅ Footer improvements deployed")
        else:
            tests.append("⚠️  Footer changes may not be visible")
    except Exception as e:
        tests.append(f"❌ Footer check error: {e}")
    
    # Print results
    print("\n📊 VERIFICATION RESULTS:")
    for test in tests:
        print(f"   {test}")
    
    # Summary
    passed = len([t for t in tests if t.startswith("✅")])
    warnings = len([t for t in tests if t.startswith("⚠️")])
    failed = len([t for t in tests if t.startswith("❌")])
    
    print(f"\n📈 SUMMARY: {passed} passed, {warnings} warnings, {failed} failed")
    
    if failed == 0:
        print("🎉 Deployment verification successful!")
        return True
    else:
        print("🔧 Some issues found - check the results above")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("Enter your Railway production URL (e.g., https://your-app.up.railway.app): ").strip()
    
    if not url.startswith('http'):
        url = f"https://{url}"
    
    verify_production(url)
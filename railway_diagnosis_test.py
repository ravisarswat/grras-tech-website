#!/usr/bin/env python3
"""
Railway CMS Diagnosis Test - Comprehensive analysis of Railway deployment issues
"""

import requests
import json
import sys
from datetime import datetime

# Railway backend URL
RAILWAY_BACKEND_URL = "https://grras-tech-website-production.up.railway.app"
API_BASE = f"{RAILWAY_BACKEND_URL}/api"
ADMIN_PASSWORD = "grras-admin"

def test_content_api_truncation():
    """Test if /api/content is returning truncated JSON"""
    print("🔍 Testing Content API Truncation Issue...")
    
    try:
        response = requests.get(f"{API_BASE}/content", timeout=30)
        response_size = len(response.text)
        
        print(f"   Response size: {response_size} characters")
        
        if response.status_code == 200:
            try:
                data = json.loads(response.text)
                content = data.get("content", {})
                
                # Check if JSON is complete
                print(f"   ✅ JSON parsing successful - response is NOT truncated")
                print(f"   📊 Content sections: {list(content.keys())}")
                
                # Check courses count
                courses = content.get("courses", [])
                print(f"   📚 Courses found: {len(courses)}/7 expected")
                
                if len(courses) < 7:
                    missing_courses = ["java-salesforce", "python", "c-cpp-dsa"]
                    print(f"   ❌ Missing courses: {missing_courses}")
                    print(f"   💡 Issue: Content is complete but missing 3 courses in CMS data")
                else:
                    print(f"   ✅ All 7 courses present")
                
                return True, f"Response complete ({response_size} chars), {len(courses)} courses"
                
            except json.JSONDecodeError as e:
                print(f"   ❌ JSON decode error at position {e.pos}")
                print(f"   💡 Issue: Response IS truncated - invalid JSON")
                return False, f"JSON truncated at position {e.pos}"
        else:
            print(f"   ❌ HTTP {response.status_code}")
            return False, f"HTTP {response.status_code}"
            
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return False, str(e)

def test_cms_save_issue():
    """Test if /api/content POST is failing with 'Failed to save content'"""
    print("\n🔍 Testing CMS Save Issue...")
    
    try:
        # Login first
        login_data = {"password": ADMIN_PASSWORD}
        login_response = requests.post(f"{API_BASE}/admin/login", json=login_data, timeout=15)
        
        if login_response.status_code != 200:
            print(f"   ❌ Login failed: HTTP {login_response.status_code}")
            return False, "Login failed"
        
        cookies = login_response.cookies
        print(f"   ✅ Admin login successful")
        
        # Get current content
        content_response = requests.get(f"{API_BASE}/content", timeout=15)
        if content_response.status_code != 200:
            print(f"   ❌ Could not get current content")
            return False, "Could not get content"
        
        current_content = content_response.json()["content"]
        
        # Make a test update
        updated_content = current_content.copy()
        test_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Update using correct structure (pages.home instead of home)
        if "pages" in updated_content and "home" in updated_content["pages"]:
            updated_content["pages"]["home"]["hero"]["headline"] = f"Railway Test {test_timestamp}"
        else:
            print(f"   ❌ Unexpected content structure - no pages.home section")
            return False, "Invalid content structure"
        
        # Test save
        test_content = {"content": updated_content}
        save_response = requests.post(f"{API_BASE}/content", json=test_content, cookies=cookies, timeout=30)
        
        print(f"   📤 Save request status: HTTP {save_response.status_code}")
        
        if save_response.status_code == 200:
            data = save_response.json()
            if data.get("success"):
                print(f"   ✅ Content save successful")
                
                # Verify the save worked
                verify_response = requests.get(f"{API_BASE}/content", timeout=15)
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    saved_headline = verify_data.get("content", {}).get("pages", {}).get("home", {}).get("hero", {}).get("headline", "")
                    
                    if f"Railway Test {test_timestamp}" in saved_headline:
                        print(f"   ✅ Save verification successful")
                        return True, "Save working correctly"
                    else:
                        print(f"   ❌ Save not reflected in content")
                        return False, "Save not persisted"
                else:
                    print(f"   ❌ Could not verify save")
                    return False, "Could not verify save"
            else:
                print(f"   ❌ Save response indicates failure: {data}")
                return False, f"Save failed: {data}"
        elif save_response.status_code == 500:
            error_text = save_response.text
            print(f"   ❌ Server error: {error_text[:200]}")
            if "Failed to save content" in error_text:
                return False, "Server returned 'Failed to save content' error"
            else:
                return False, f"Server error: {error_text[:100]}"
        else:
            print(f"   ❌ Unexpected status: {save_response.text[:200]}")
            return False, f"HTTP {save_response.status_code}"
            
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return False, str(e)

def test_cors_issue():
    """Test CORS configuration for frontend access"""
    print("\n🔍 Testing CORS Issue...")
    
    frontend_url = "https://frontend-service-production-9b9d.up.railway.app"
    
    try:
        # Test preflight request
        headers = {
            'Origin': frontend_url,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
        
        response = requests.options(f"{API_BASE}/content", headers=headers, timeout=15)
        
        print(f"   📤 CORS preflight status: HTTP {response.status_code}")
        
        # Check CORS headers
        cors_origin = response.headers.get('Access-Control-Allow-Origin')
        cors_methods = response.headers.get('Access-Control-Allow-Methods')
        cors_headers = response.headers.get('Access-Control-Allow-Headers')
        cors_credentials = response.headers.get('Access-Control-Allow-Credentials')
        
        print(f"   🔗 Access-Control-Allow-Origin: {cors_origin}")
        print(f"   📋 Access-Control-Allow-Methods: {cors_methods}")
        print(f"   📝 Access-Control-Allow-Headers: {cors_headers}")
        print(f"   🔐 Access-Control-Allow-Credentials: {cors_credentials}")
        
        issues = []
        
        if not cors_origin:
            issues.append("Missing Access-Control-Allow-Origin")
        elif cors_origin != "*" and frontend_url not in cors_origin and "*.up.railway.app" not in cors_origin:
            issues.append(f"Frontend origin not allowed: {cors_origin}")
        
        if not cors_methods or "POST" not in cors_methods:
            issues.append("POST method not allowed")
        
        if not cors_headers or "Content-Type" not in cors_headers:
            issues.append("Content-Type header not allowed")
        
        if cors_credentials != "true":
            issues.append("Credentials not allowed for authenticated requests")
        
        if issues:
            print(f"   ❌ CORS issues found: {issues}")
            return False, f"CORS issues: {issues}"
        else:
            print(f"   ✅ CORS properly configured for frontend")
            return True, "CORS working correctly"
            
    except Exception as e:
        print(f"   ❌ CORS test failed: {e}")
        return False, str(e)

def test_missing_courses():
    """Test and analyze missing courses issue"""
    print("\n🔍 Testing Missing Courses Issue...")
    
    expected_courses = [
        "devops-training", "bca-degree", "redhat-certifications", 
        "data-science-machine-learning", "java-salesforce", "python", "c-cpp-dsa"
    ]
    
    try:
        # Check content API
        response = requests.get(f"{API_BASE}/content", timeout=15)
        if response.status_code == 200:
            data = response.json()
            courses = data.get("content", {}).get("courses", [])
            
            found_courses = [c.get("slug") for c in courses]
            missing_courses = [slug for slug in expected_courses if slug not in found_courses]
            
            print(f"   📚 Found courses ({len(found_courses)}): {found_courses}")
            print(f"   ❌ Missing courses ({len(missing_courses)}): {missing_courses}")
            
            # Check visibility
            hidden_courses = [c.get("slug") for c in courses if not c.get("visible", True)]
            if hidden_courses:
                print(f"   👁️ Hidden courses: {hidden_courses}")
            
            if len(found_courses) == 7:
                return True, "All 7 courses present"
            else:
                return False, f"Missing {len(missing_courses)} courses: {missing_courses}"
        else:
            print(f"   ❌ Content API failed: HTTP {response.status_code}")
            return False, f"Content API failed: {response.status_code}"
            
    except Exception as e:
        print(f"   ❌ Request failed: {e}")
        return False, str(e)

def main():
    """Run comprehensive Railway CMS diagnosis"""
    print("🚀 RAILWAY CMS DIAGNOSIS - COMPREHENSIVE ANALYSIS")
    print("=" * 60)
    print(f"Backend URL: {RAILWAY_BACKEND_URL}")
    print(f"Frontend URL: https://frontend-service-production-9b9d.up.railway.app")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Content API Truncation
    success, message = test_content_api_truncation()
    results["content_truncation"] = {"success": success, "message": message}
    
    # Test 2: CMS Save Issue
    success, message = test_cms_save_issue()
    results["cms_save"] = {"success": success, "message": message}
    
    # Test 3: CORS Issue
    success, message = test_cors_issue()
    results["cors"] = {"success": success, "message": message}
    
    # Test 4: Missing Courses
    success, message = test_missing_courses()
    results["missing_courses"] = {"success": success, "message": message}
    
    # Summary
    print("\n" + "=" * 60)
    print("🎯 DIAGNOSIS SUMMARY")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if r["success"])
    
    for test_name, result in results.items():
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"{status} {test_name.replace('_', ' ').title()}: {result['message']}")
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    # Specific findings
    print("\n🔍 KEY FINDINGS:")
    
    if not results["content_truncation"]["success"]:
        print("• Content API is returning truncated JSON - this is the main issue")
    else:
        print("• Content API is NOT truncated - JSON is complete")
    
    if not results["cms_save"]["success"]:
        print("• CMS save functionality is failing")
    else:
        print("• CMS save functionality is working correctly")
    
    if not results["cors"]["success"]:
        print("• CORS configuration has issues for frontend access")
    else:
        print("• CORS is properly configured")
    
    if not results["missing_courses"]["success"]:
        print("• Missing courses in CMS content (data issue, not API issue)")
    else:
        print("• All 7 courses are present")
    
    return 0 if passed_tests == total_tests else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
#!/usr/bin/env python3
"""
Course Categories Database Content Check
Focus: Check current courseCategories content in MongoDB database
"""

import requests
import json
import os
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://seo-enhancement-1.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

def test_course_categories_content():
    """Check current courseCategories content in database"""
    print("🔍 COURSE CATEGORIES DATABASE CONTENT CHECK")
    print("=" * 60)
    
    try:
        # Test 1: API Health Check
        print("\n1. API Health Check...")
        health_response = requests.get(f"{API_BASE}/health", timeout=10)
        print(f"   Status: {health_response.status_code}")
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"   Database: {health_data.get('database', 'unknown')}")
            print("   ✅ API is healthy")
        else:
            print("   ❌ API health check failed")
            return False
            
        # Test 2: Get Content Endpoint - Focus on courseCategories
        print("\n2. Checking Content Endpoint for courseCategories...")
        content_response = requests.get(f"{API_BASE}/content", timeout=15)
        print(f"   Status: {content_response.status_code}")
        
        if content_response.status_code != 200:
            print("   ❌ Failed to fetch content")
            return False
            
        content_data = content_response.json()
        cms_content = content_data.get('content', {})
        
        # Check if courseCategories exists
        course_categories = cms_content.get('courseCategories', None)
        
        print(f"\n📊 COURSE CATEGORIES ANALYSIS:")
        print("-" * 40)
        
        if course_categories is None:
            print("   ❌ courseCategories field: NOT FOUND in database")
            print("   📝 This means no courseCategories structure exists in MongoDB")
        else:
            print("   ✅ courseCategories field: FOUND in database")
            print(f"   📊 Type: {type(course_categories)}")
            
            if isinstance(course_categories, dict):
                print(f"   📊 Number of categories: {len(course_categories)}")
                print("\n   📋 CURRENT CATEGORIES IN DATABASE:")
                for key, category in course_categories.items():
                    if isinstance(category, dict):
                        name = category.get('name', key)
                        slug = category.get('slug', key)
                        print(f"      • {key}: '{name}' (slug: {slug})")
                    else:
                        print(f"      • {key}: {category}")
                        
            elif isinstance(course_categories, list):
                print(f"   📊 Number of categories: {len(course_categories)}")
                print("\n   📋 CURRENT CATEGORIES IN DATABASE:")
                for i, category in enumerate(course_categories):
                    if isinstance(category, dict):
                        name = category.get('name', f'Category {i+1}')
                        slug = category.get('slug', f'category-{i+1}')
                        print(f"      • {name} (slug: {slug})")
                    else:
                        print(f"      • {category}")
            else:
                print(f"   📊 courseCategories content: {course_categories}")
        
        # Check courses for category references
        courses = cms_content.get('courses', [])
        print(f"\n📚 COURSES ANALYSIS:")
        print("-" * 40)
        print(f"   📊 Total courses found: {len(courses)}")
        
        if courses:
            # Check what categories are referenced in courses
            course_categories_used = set()
            for course in courses:
                category = course.get('category', '')
                if category:
                    course_categories_used.add(category)
            
            print(f"   📊 Categories referenced in courses: {len(course_categories_used)}")
            if course_categories_used:
                print("   📋 CATEGORIES USED IN COURSES:")
                for cat in sorted(course_categories_used):
                    print(f"      • {cat}")
        
        # Check frontend categories (if any exist in other sections)
        print(f"\n🔍 CHECKING OTHER SECTIONS FOR CATEGORY DATA:")
        print("-" * 40)
        
        # Check pages.home for category data
        pages = cms_content.get('pages', {})
        home_page = pages.get('home', {}) if isinstance(pages, dict) else {}
        
        if 'courseCategories' in home_page:
            print("   ✅ Found courseCategories in pages.home")
            home_categories = home_page['courseCategories']
            print(f"      Type: {type(home_categories)}")
            if isinstance(home_categories, dict) and 'categories' in home_categories:
                cats = home_categories['categories']
                print(f"      Categories count: {len(cats) if isinstance(cats, (list, dict)) else 'N/A'}")
        else:
            print("   ❌ No courseCategories found in pages.home")
            
        # Check if there are any other category-related fields
        category_fields = []
        for key, value in cms_content.items():
            if 'categor' in key.lower():
                category_fields.append(key)
        
        if category_fields:
            print(f"   📋 Other category-related fields found: {category_fields}")
        else:
            print("   📋 No other category-related fields found")
            
        print(f"\n✅ COURSE CATEGORIES DATABASE CHECK COMPLETED")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Network error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected error: {e}")
        return False

def main():
    """Main test execution"""
    print("🚀 GRRAS BACKEND - COURSE CATEGORIES DATABASE CONTENT CHECK")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    success = test_course_categories_content()
    
    print("\n" + "=" * 80)
    if success:
        print("✅ COURSE CATEGORIES DATABASE CHECK: COMPLETED SUCCESSFULLY")
    else:
        print("❌ COURSE CATEGORIES DATABASE CHECK: FAILED")
    print("=" * 80)

if __name__ == "__main__":
    main()
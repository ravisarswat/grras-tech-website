#!/usr/bin/env python3
"""
Fixed Category & Course Migration Script - Resolves Backend Data Sync Issue
Creates 8 technology tracks and properly assigns courses
Uses correct document type: "site_content"
"""

import asyncio
import json
import sys
import os
from datetime import datetime
import motor.motor_asyncio

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'grras_database')

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Define the 8 required technology tracks as specified in requirements
TECHNOLOGY_TRACKS = {
    "red-hat": {
        "name": "Red Hat",
        "slug": "red-hat",
        "description": "Red Hat certifications (RHCSA, RHCE), Linux administration, and enterprise server management",
        "icon": "server",
        "color": "#EE0000",
        "gradient": "from-red-500 to-red-700",
        "featured": True,
        "seo": {
            "title": "Red Hat Certification Training - RHCSA, RHCE - GRRAS Jaipur",
            "description": "Red Hat authorized training center in Jaipur. RHCSA, RHCE certification courses with hands-on labs and guaranteed placement assistance.",
            "keywords": "red hat training jaipur, rhcsa certification, rhce course, linux training"
        },
        "course_keywords": ["red hat", "rhcsa", "rhce", "redhat", "linux"]
    },
    "aws": {
        "name": "AWS",
        "slug": "aws",
        "description": "Amazon Web Services cloud computing, AWS certifications, and cloud architecture training",
        "icon": "cloud",
        "color": "#FF9900",
        "gradient": "from-orange-400 to-orange-600",
        "featured": True,
        "seo": {
            "title": "AWS Cloud Training & Certification - Solutions Architect Jaipur",
            "description": "Professional AWS training in Jaipur. AWS Solutions Architect, Developer, SysOps certifications with hands-on projects.",
            "keywords": "aws training jaipur, aws certification, cloud computing, aws solutions architect"
        },
        "course_keywords": ["aws", "amazon", "cloud practitioner", "solutions architect"]
    },
    "kubernetes": {
        "name": "Kubernetes",
        "slug": "kubernetes",
        "description": "Container orchestration, Kubernetes administration, and cloud-native applications",
        "icon": "container",
        "color": "#326CE5",
        "gradient": "from-blue-500 to-blue-700",
        "featured": True,
        "seo": {
            "title": "Kubernetes Training - CKA, CKS Certification Jaipur",
            "description": "Master Kubernetes with CKA, CKS, CKAD certifications. Container orchestration training with hands-on projects.",
            "keywords": "kubernetes training jaipur, cka certification, container orchestration, k8s"
        },
        "course_keywords": ["kubernetes", "k8s", "cka", "cks", "ckad", "container"]
    },
    "devops": {
        "name": "DevOps",
        "slug": "devops",
        "description": "DevOps practices, CI/CD pipelines, automation, and infrastructure as code",
        "icon": "terminal",
        "color": "#10B981",
        "gradient": "from-green-500 to-green-700",
        "featured": True,
        "seo": {
            "title": "DevOps Training - CI/CD, Jenkins, Ansible Jaipur",
            "description": "Master DevOps with Jenkins, Ansible, Terraform, GitLab CI/CD. Complete automation and deployment training.",
            "keywords": "devops training jaipur, jenkins course, ansible certification, terraform training"
        },
        "course_keywords": ["devops", "jenkins", "ansible", "terraform", "gitlab", "cicd", "automation"]
    },
    "cybersecurity": {
        "name": "Cybersecurity",
        "slug": "cybersecurity",
        "description": "Ethical hacking, penetration testing, security analysis, and cyber defense strategies",
        "icon": "shield",
        "color": "#8B5CF6",
        "gradient": "from-purple-500 to-purple-700",
        "featured": True,
        "seo": {
            "title": "Cybersecurity & Ethical Hacking Training - GRRAS Jaipur",
            "description": "Professional cybersecurity training in Jaipur. Learn ethical hacking, penetration testing, and security analysis.",
            "keywords": "cybersecurity training jaipur, ethical hacking course, penetration testing, security certification"
        },
        "course_keywords": ["cyber", "security", "ethical", "hacking", "penetration"]
    },
    "programming": {
        "name": "Programming",
        "slug": "programming",
        "description": "Programming languages, software development, data structures, and algorithms",
        "icon": "code",
        "color": "#6366F1",
        "gradient": "from-indigo-500 to-indigo-700",
        "featured": True,
        "seo": {
            "title": "Programming & Software Development Training - GRRAS Jaipur",
            "description": "Learn programming languages, data structures, algorithms, and software development. C/C++, Python, Java courses.",
            "keywords": "programming courses jaipur, c++ training, python course, software development, data science"
        },
        "course_keywords": ["programming", "c++", "data structures", "python", "java", "development", "data science", "machine learning"]
    },
    "degree-programs": {
        "name": "Degree Programs",
        "slug": "degree-programs",
        "description": "Industry-integrated degree programs with specializations in emerging technologies",
        "icon": "graduation-cap",
        "color": "#F59E0B",
        "gradient": "from-amber-500 to-amber-700",
        "featured": True,
        "seo": {
            "title": "IT Degree Programs - BCA, MCA with Industry Integration - GRRAS Jaipur",
            "description": "Industry-integrated BCA, MCA degree programs with cloud computing, AI/ML specializations.",
            "keywords": "bca degree jaipur, mca program, it degree courses, industry integrated education"
        },
        "course_keywords": ["bca", "degree", "bachelor", "master"]
    },
    "server-admin": {
        "name": "Server Admin",
        "slug": "server-admin",
        "description": "Server administration, network infrastructure, system administration, and IT infrastructure management",
        "icon": "database",
        "color": "#64748B",
        "gradient": "from-slate-500 to-slate-700",
        "featured": True,
        "seo": {
            "title": "Server Administration Training - System Admin Certification Jaipur",
            "description": "Master server administration, network infrastructure, system administration with hands-on labs.",
            "keywords": "server administration training, system admin certification, network infrastructure"
        },
        "course_keywords": ["server", "administration", "network", "infrastructure", "system"]
    }
}

async def get_content():
    """Get current content from MongoDB - USING CORRECT DOCUMENT TYPE"""
    try:
        # Use the same document type as content_manager.py
        content_doc = await db.content.find_one(
            {"type": "site_content"},
            sort=[("updated_at", -1)]
        )
        if content_doc:
            content_doc.pop('_id', None)
            content_doc.pop('type', None)
            return content_doc
        return {}
    except Exception as e:
        print(f"Error getting content: {e}")
        return {}

async def save_content(content_data):
    """Save content to MongoDB - USING CORRECT DOCUMENT TYPE"""
    try:
        # Use the same document type as content_manager.py
        content_doc = {
            "type": "site_content",
            **content_data,
            "updated_at": datetime.utcnow(),
            "user": "category-migration",
            "is_draft": False
        }
        
        await db.content.replace_one(
            {"type": "site_content"},
            content_doc,
            upsert=True
        )
        return True
    except Exception as e:
        print(f"Error saving content: {e}")
        return False

async def fix_categories_and_assignments():
    """Create 8 technology tracks and fix course assignments"""
    try:
        print("🚀 Starting complete category fix...")
        
        # Get current content
        content = await get_content()
        courses = content.get("courses", [])
        
        print(f"📊 Found {len(courses)} existing courses")
        
        # Create the 8 technology tracks
        course_categories = {}
        
        for category_slug, category_data in TECHNOLOGY_TRACKS.items():
            course_categories[category_slug] = {
                "name": category_data["name"],
                "slug": category_data["slug"],
                "description": category_data["description"],
                "icon": category_data["icon"],
                "color": category_data["color"],
                "gradient": category_data["gradient"],
                "featured": category_data["featured"],
                "seo": category_data["seo"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            print(f"✅ Created category: {category_data['name']} ({category_slug})")
        
        # Clear existing course assignments and reassign properly
        assignment_stats = {}
        
        for course in courses:
            course_title = course.get("title", "").lower()
            course_slug = course.get("slug", "").lower()
            course_description = course.get("description", "").lower()
            course_content = f"{course_title} {course_slug} {course_description}"
            
            # Clear existing categories
            course["categories"] = []
            assigned_to = []
            
            # Assign to appropriate categories based on content
            for category_slug, category_data in TECHNOLOGY_TRACKS.items():
                keywords = category_data["course_keywords"]
                
                # Check if any keyword matches
                if any(keyword in course_content for keyword in keywords):
                    course["categories"].append(category_slug)
                    assigned_to.append(category_data["name"])
                    
                    # Track assignment stats
                    if category_slug not in assignment_stats:
                        assignment_stats[category_slug] = []
                    assignment_stats[category_slug].append(course.get("title", "Unknown"))
            
            if assigned_to:
                print(f"📝 Assigned '{course.get('title')}' to: {', '.join(assigned_to)}")
            else:
                print(f"⚠️  No category assigned for: '{course.get('title')}'")
        
        # Update content
        content["courseCategories"] = course_categories
        content["courses"] = courses
        
        # Save updated content
        success = await save_content(content)
        
        if success:
            print("\n📊 CATEGORY ASSIGNMENT STATISTICS:")
            print("=" * 50)
            
            for category_slug, assigned_courses in assignment_stats.items():
                category_name = TECHNOLOGY_TRACKS[category_slug]["name"]
                print(f"\n✅ {category_name} ({len(assigned_courses)} courses):")
                for course_title in assigned_courses:
                    print(f"   • {course_title}")
            
            # Categories with no courses
            empty_categories = [
                TECHNOLOGY_TRACKS[slug]["name"] 
                for slug in TECHNOLOGY_TRACKS.keys() 
                if slug not in assignment_stats
            ]
            if empty_categories:
                print(f"\n⚠️  Empty categories: {', '.join(empty_categories)}")
            
            print(f"\n🎉 Category fix completed successfully!")
            print(f"📊 Created {len(TECHNOLOGY_TRACKS)} technology tracks")
            print(f"📊 Processed {len(courses)} courses")
            print(f"📊 Total assignments: {sum(len(courses) for courses in assignment_stats.values())}")
        
        return success
        
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def verify_fix():
    """Verify the fix was successful"""
    try:
        print("\n🔍 Verifying category fix...")
        
        content = await get_content()
        categories = content.get("courseCategories", {})
        courses = content.get("courses", [])
        
        print(f"✅ Found {len(categories)} categories")
        print(f"✅ Found {len(courses)} courses")
        
        # Verify we have all 8 required categories
        required_categories = set(TECHNOLOGY_TRACKS.keys())
        actual_categories = set(categories.keys())
        
        if required_categories == actual_categories:
            print("✅ All 8 technology tracks present")
        else:
            missing = required_categories - actual_categories
            extra = actual_categories - required_categories
            if missing:
                print(f"❌ Missing categories: {missing}")
            if extra:
                print(f"⚠️  Extra categories: {extra}")
        
        # Check category course counts
        total_assignments = 0
        for category_slug, category in categories.items():
            category_courses = [c for c in courses if category_slug in c.get("categories", [])]
            course_count = len(category_courses)
            total_assignments += course_count
            print(f"📊 {category['name']}: {course_count} courses")
        
        print(f"📊 Total course assignments: {total_assignments}")
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

if __name__ == "__main__":
    async def main():
        success = await fix_categories_and_assignments()
        if success:
            await verify_fix()
        return success

    result = asyncio.run(main())
    sys.exit(0 if result else 1)
#!/usr/bin/env python3
"""
Comprehensive Category & Course Migration Script
Creates all major categories with proper metadata and assigns existing courses
"""

import asyncio
import json
import sys
import os
from datetime import datetime
import motor.motor_asyncio
from urllib.parse import quote_plus

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'grras_database')

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Define comprehensive category structure with official metadata
COMPREHENSIVE_CATEGORIES = {
    "linux-redhat": {
        "name": "Linux & Red Hat",
        "slug": "linux-redhat", 
        "description": "Linux administration, Red Hat certifications (RHCSA, RHCE), and enterprise server management",
        "icon": "server",
        "color": "#EF4444",
        "gradient": "from-red-500 to-red-600",
        "featured": True,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg",
        "seo": {
            "title": "Red Hat & Linux Certification Training - GRRAS Jaipur",
            "description": "Red Hat authorized training center in Jaipur. RHCSA, RHCE certification courses with hands-on labs and guaranteed placement assistance.",
            "keywords": "red hat training jaipur, rhcsa certification, linux training, rhce course"
        },
        "course_keywords": ["red hat", "rhcsa", "rhce", "linux", "centos", "rpm", "yum"]
    },
    "aws-cloud": {
        "name": "AWS Cloud Platform",
        "slug": "aws-cloud",
        "description": "Amazon Web Services cloud computing, AWS certifications, and cloud architecture training",
        "icon": "cloud",
        "color": "#FF9900", 
        "gradient": "from-orange-500 to-yellow-500",
        "featured": True,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
        "seo": {
            "title": "AWS Cloud Training & Certification - Solutions Architect Jaipur",
            "description": "Professional AWS training in Jaipur. AWS Solutions Architect, Developer, SysOps certifications with hands-on projects.",
            "keywords": "aws training jaipur, aws certification, cloud computing, aws solutions architect"
        },
        "course_keywords": ["aws", "amazon", "cloud", "ec2", "s3", "lambda", "rds"]
    },
    "kubernetes-containers": {
        "name": "Kubernetes & Containers", 
        "slug": "kubernetes-containers",
        "description": "Container orchestration, Kubernetes administration, OpenShift, and cloud-native applications",
        "icon": "container",
        "color": "#326CE5",
        "gradient": "from-blue-500 to-blue-600", 
        "featured": True,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg",
        "seo": {
            "title": "Kubernetes & Container Training - CKA, CKS Certification Jaipur",
            "description": "Master Kubernetes with CKA, CKS, CKAD certifications. OpenShift training with hands-on projects in Jaipur's premier institute.",
            "keywords": "kubernetes training jaipur, cka certification, openshift course, container orchestration"
        },
        "course_keywords": ["kubernetes", "k8s", "docker", "container", "openshift", "cka", "cks", "ckad"]
    },
    "devops-engineering": {
        "name": "DevOps Engineering",
        "slug": "devops-engineering", 
        "description": "DevOps, MLOps, SecOps, and automation technologies for continuous integration and deployment",
        "icon": "terminal",
        "color": "#10B981",
        "gradient": "from-green-500 to-green-600",
        "featured": True,
        "logo_url": "https://cdn-icons-png.flaticon.com/512/2906/2906274.png",
        "seo": {
            "title": "DevOps Engineering Training - CI/CD, Jenkins, Ansible Jaipur", 
            "description": "Master DevOps with Jenkins, Ansible, Terraform, GitLab CI/CD. MLOps and SecOps training with real-world projects.",
            "keywords": "devops training jaipur, jenkins course, ansible certification, terraform training"
        },
        "course_keywords": ["devops", "jenkins", "ansible", "terraform", "gitlab", "cicd", "mlops", "secops", "automation"]
    },
    "cybersecurity": {
        "name": "Cybersecurity & Ethical Hacking",
        "slug": "cybersecurity",
        "description": "Ethical hacking, penetration testing, security analysis, and cyber defense strategies",
        "icon": "shield", 
        "color": "#8B5CF6",
        "gradient": "from-purple-500 to-purple-600",
        "featured": True,
        "logo_url": "https://cdn-icons-png.flaticon.com/512/2913/2913016.png",
        "seo": {
            "title": "Cybersecurity & Ethical Hacking Training - GRRAS Jaipur",
            "description": "Professional cybersecurity training in Jaipur. Learn ethical hacking, penetration testing, and security analysis with industry experts.",
            "keywords": "cybersecurity training jaipur, ethical hacking course, penetration testing, security certification"
        },
        "course_keywords": ["cyber", "security", "ethical", "hacking", "penetration", "ceh", "cissp", "security"]
    },
    "programming-development": {
        "name": "Programming & Development",
        "slug": "programming-development",
        "description": "Full-stack development, programming languages, web technologies, and software engineering",
        "icon": "code",
        "color": "#6366F1", 
        "gradient": "from-indigo-500 to-indigo-600",
        "featured": True,
        "logo_url": "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
        "seo": {
            "title": "Programming & Web Development Training - Full Stack Jaipur",
            "description": "Learn full-stack development, Python, Java, JavaScript, React, Node.js with hands-on projects and placement support.",
            "keywords": "programming course jaipur, web development, full stack training, python java javascript"
        },
        "course_keywords": ["programming", "development", "python", "java", "javascript", "react", "node", "web", "full stack"]
    },
    "degree-programs": {
        "name": "Degree Programs", 
        "slug": "degree-programs",
        "description": "Industry-integrated degree programs with specializations in emerging technologies",
        "icon": "graduation-cap",
        "color": "#F59E0B",
        "gradient": "from-amber-500 to-amber-600",
        "featured": True, 
        "logo_url": "https://cdn-icons-png.flaticon.com/512/3074/3074058.png",
        "seo": {
            "title": "IT Degree Programs - BCA, MCA with Industry Integration - GRRAS Jaipur",
            "description": "Industry-integrated BCA, MCA degree programs with cloud computing, AI/ML specializations. Guaranteed placement assistance in Jaipur.",
            "keywords": "bca degree jaipur, mca program, it degree courses, industry integrated education"
        },
        "course_keywords": ["bca", "mca", "degree", "bachelor", "master", "computer", "application"]
    },
    "server-networking": {
        "name": "Server Administration & Networking",
        "slug": "server-networking", 
        "description": "Server administration, network infrastructure, system administration, and IT infrastructure management",
        "icon": "database",
        "color": "#64748B",
        "gradient": "from-slate-500 to-slate-600", 
        "featured": True,
        "logo_url": "https://cdn-icons-png.flaticon.com/512/1163/1163451.png",
        "seo": {
            "title": "Server Administration & Networking Training - GRRAS Jaipur",
            "description": "Master server administration, network infrastructure, system administration with hands-on labs and certification preparation.",
            "keywords": "server administration training, networking course jaipur, system admin certification"
        },
        "course_keywords": ["server", "administration", "networking", "network", "infrastructure", "system", "admin"]
    }
}

async def get_content():
    """Get current content from MongoDB"""
    try:
        content_doc = await db.content.find_one({"type": "main"})
        if content_doc:
            return content_doc.get("data", {})
        return {}
    except Exception as e:
        print(f"Error getting content: {e}")
        return {}

async def save_content(content_data):
    """Save content to MongoDB"""
    try:
        await db.content.update_one(
            {"type": "main"},
            {
                "$set": {
                    "data": content_data,
                    "updated_at": datetime.utcnow(),
                    "user": "migration",
                    "is_draft": False
                }
            },
            upsert=True
        )
        return True
    except Exception as e:
        print(f"Error saving content: {e}")
        return False

async def migrate_categories_and_courses():
    """Migrate all categories and assign courses appropriately"""
    try:
        print("🚀 Starting comprehensive category and course migration...")
        
        # Get current content
        content = await get_content()
        courses = content.get("courses", [])
        
        print(f"📊 Found {len(courses)} existing courses")
        
        # Initialize or get existing categories
        course_categories = content.get("courseCategories", {})
        
        # Create/update all comprehensive categories
        for category_slug, category_data in COMPREHENSIVE_CATEGORIES.items():
            # Create category entry
            course_categories[category_slug] = {
                "name": category_data["name"],
                "slug": category_data["slug"], 
                "description": category_data["description"],
                "icon": category_data["icon"],
                "color": category_data["color"],
                "gradient": category_data["gradient"],
                "featured": category_data["featured"],
                "logo_url": category_data.get("logo_url", ""),
                "seo": category_data["seo"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            print(f"✅ Created/Updated category: {category_data['name']} ({category_slug})")
        
        # Assign courses to appropriate categories based on keywords
        assignment_stats = {}
        
        for course in courses:
            course_title = course.get("title", "").lower()
            course_description = course.get("description", "").lower()
            course_content = f"{course_title} {course_description}"
            
            # Initialize categories list if not exists
            if "categories" not in course:
                course["categories"] = []
            
            original_categories = course["categories"].copy()
            assigned_categories = []
            
            # Check each category for keyword matches
            for category_slug, category_data in COMPREHENSIVE_CATEGORIES.items():
                keywords = category_data["course_keywords"]
                
                # Check if any keyword matches
                if any(keyword in course_content for keyword in keywords):
                    if category_slug not in course["categories"]:
                        course["categories"].append(category_slug)
                        assigned_categories.append(category_data["name"])
                        
                        # Track assignment stats
                        if category_slug not in assignment_stats:
                            assignment_stats[category_slug] = []
                        assignment_stats[category_slug].append(course.get("title", "Unknown"))
            
            # Special handling for DevOps Engineering cleanup
            if "devops-engineering" in course["categories"]:
                # Remove server/networking courses from DevOps
                server_keywords = ["server", "administration", "networking", "network", "infrastructure"]
                if any(keyword in course_content for keyword in server_keywords):
                    # Move to server-networking category
                    if "server-networking" not in course["categories"]:
                        course["categories"].append("server-networking")
                    # Keep in DevOps only if it has DevOps-specific content
                    devops_keywords = ["devops", "cicd", "jenkins", "ansible", "automation"]
                    if not any(keyword in course_content for keyword in devops_keywords):
                        course["categories"].remove("devops-engineering")
            
            if assigned_categories:
                print(f"📝 Assigned '{course.get('title')}' to: {', '.join(assigned_categories)}")
        
        # Update content with new categories and course assignments
        content["courseCategories"] = course_categories
        content["courses"] = courses
        
        # Save updated content
        await save_content(content)
        
        # Print assignment statistics
        print("\n📊 CATEGORY ASSIGNMENT STATISTICS:")
        print("=" * 50)
        
        for category_slug, assigned_courses in assignment_stats.items():
            category_name = COMPREHENSIVE_CATEGORIES[category_slug]["name"]
            print(f"\n✅ {category_name} ({len(assigned_courses)} courses):")
            for course_title in assigned_courses:
                print(f"   • {course_title}")
        
        print(f"\n🎉 Migration completed successfully!")
        print(f"📊 Created {len(COMPREHENSIVE_CATEGORIES)} categories")
        print(f"📊 Processed {len(courses)} courses")
        print(f"📊 Total assignments: {sum(len(courses) for courses in assignment_stats.values())}")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def verify_migration():
    """Verify the migration was successful"""
    try:
        print("\n🔍 Verifying migration results...")
        
        content = await get_content()
        categories = content.get("courseCategories", {})
        courses = content.get("courses", [])
        
        print(f"✅ Found {len(categories)} categories")
        print(f"✅ Found {len(courses)} courses")
        
        # Check category course counts
        for category_slug, category in categories.items():
            category_courses = [c for c in courses if category_slug in c.get("categories", [])]
            print(f"📊 {category['name']}: {len(category_courses)} courses")
        
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

if __name__ == "__main__":
    async def main():
        success = await migrate_categories_and_courses()
        if success:
            await verify_migration()
        return success

    result = asyncio.run(main())
    sys.exit(0 if result else 1)
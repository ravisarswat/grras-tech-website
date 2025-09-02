#!/usr/bin/env python3
"""
Create 8 Technology Track Categories with Proper Course Assignment
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

# Define the exact 8 Technology Track Categories
TECHNOLOGY_TRACKS = {
    "red-hat-technologies": {
        "name": "Red Hat Technologies",
        "slug": "red-hat-technologies",
        "description": "Master Red Hat Enterprise Linux, OpenShift, and enterprise-grade Linux systems administration",
        "icon": "server",
        "color": "#EE0000",
        "gradient": "from-red-600 to-red-700",
        "featured": True,
        "order": 1,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg",
        "seo": {
            "title": "Red Hat Technologies Training - RHCSA, RHCE Certification Jaipur",
            "description": "Master Red Hat Enterprise Linux with RHCSA, RHCE certifications. Hands-on Red Hat training in Jaipur with expert instructors and placement support.",
            "keywords": "red hat training jaipur, rhcsa certification, rhce course, linux training, red hat enterprise linux"
        },
        "course_keywords": ["red hat", "rhcsa", "rhce", "redhat", "linux", "enterprise linux", "openshift"]
    },
    "aws-cloud-platform": {
        "name": "AWS Cloud Platform",
        "slug": "aws-cloud-platform",
        "description": "Amazon Web Services cloud computing, certifications, and cloud architecture for modern applications",
        "icon": "cloud",
        "color": "#FF9900",
        "gradient": "from-orange-500 to-yellow-500",
        "featured": True,
        "order": 2,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
        "seo": {
            "title": "AWS Cloud Platform Training - Solutions Architect Certification Jaipur",
            "description": "Professional AWS training in Jaipur. AWS Solutions Architect, Developer, SysOps certifications with hands-on cloud projects.",
            "keywords": "aws training jaipur, aws certification, cloud computing, aws solutions architect, amazon web services"
        },
        "course_keywords": ["aws", "amazon", "cloud", "ec2", "s3", "lambda", "rds", "cloudformation", "solutions architect"]
    },
    "kubernetes-containers": {
        "name": "Kubernetes & Containers",
        "slug": "kubernetes-containers",
        "description": "Container orchestration, Kubernetes administration, Docker, and cloud-native application deployment",
        "icon": "container",
        "color": "#326CE5",
        "gradient": "from-blue-500 to-blue-600",
        "featured": True,
        "order": 3,
        "logo_url": "https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg",
        "seo": {
            "title": "Kubernetes & Container Training - CKA, CKS, CKAD Certification Jaipur",
            "description": "Master Kubernetes container orchestration with CKA, CKS, CKAD certifications. Docker and OpenShift training with hands-on projects.",
            "keywords": "kubernetes training jaipur, cka certification, docker course, container orchestration, openshift training"
        },
        "course_keywords": ["kubernetes", "k8s", "docker", "container", "openshift", "cka", "cks", "ckad", "pod", "helm"]
    },
    "devops-engineering": {
        "name": "DevOps Engineering",
        "slug": "devops-engineering",
        "description": "DevOps, MLOps, SecOps, and automation technologies for continuous integration and deployment",
        "icon": "terminal",
        "color": "#10B981",
        "gradient": "from-green-500 to-green-600",
        "featured": True,
        "order": 4,
        "logo_url": "https://cdn-icons-png.flaticon.com/512/2906/2906274.png",
        "seo": {
            "title": "DevOps Engineering Training - CI/CD, Jenkins, Ansible, Terraform Jaipur",
            "description": "Master DevOps with Jenkins, Ansible, Terraform, GitLab CI/CD. MLOps and SecOps training with real-world automation projects.",
            "keywords": "devops training jaipur, jenkins course, ansible certification, terraform training, cicd pipeline"
        },
        "course_keywords": ["devops", "jenkins", "ansible", "terraform", "gitlab", "cicd", "mlops", "secops", "automation", "pipeline", "git"]
    },
    "cybersecurity-ethical-hacking": {
        "name": "Cybersecurity & Ethical Hacking",
        "slug": "cybersecurity-ethical-hacking",
        "description": "Ethical hacking, penetration testing, cybersecurity analysis, and cyber defense strategies",
        "icon": "shield",
        "color": "#8B5CF6",
        "gradient": "from-purple-500 to-purple-600",
        "featured": True,
        "order": 5,
        "logo_url": "https://cdn-icons-png.flaticon.com/512/2913/2913016.png",
        "seo": {
            "title": "Cybersecurity & Ethical Hacking Training - CEH, CISSP Certification Jaipur",
            "description": "Professional cybersecurity training in Jaipur. Learn ethical hacking, penetration testing, and security analysis with industry experts.",
            "keywords": "cybersecurity training jaipur, ethical hacking course, penetration testing, ceh certification, security training"
        },
        "course_keywords": ["cyber", "security", "ethical", "hacking", "penetration", "ceh", "cissp", "malware", "forensics"]
    },
    "programming-development": {
        "name": "Programming & Development",
        "slug": "programming-development",
        "description": "Full-stack development, programming languages, web technologies, and modern software engineering",
        "icon": "code",
        "color": "#6366F1",
        "gradient": "from-indigo-500 to-indigo-600",
        "featured": True,
        "order": 6,
        "logo_url": "https://cdn-icons-png.flaticon.com/512/1005/1005141.png",
        "seo": {
            "title": "Programming & Web Development Training - Full Stack, Python, Java Jaipur",
            "description": "Learn full-stack development, Python, Java, JavaScript, React, Node.js with hands-on projects and placement support in Jaipur.",
            "keywords": "programming course jaipur, web development, full stack training, python java javascript, react nodejs"
        },
        "course_keywords": ["programming", "development", "python", "java", "javascript", "react", "node", "web", "full stack", "coding"]
    },
    "degree-programs": {
        "name": "Degree Programs",
        "slug": "degree-programs",
        "description": "Industry-integrated degree programs with specializations in emerging technologies and guaranteed placement",
        "icon": "graduation-cap",
        "color": "#F59E0B",
        "gradient": "from-amber-500 to-amber-600",
        "featured": True,
        "order": 7,
        "logo_url": "https://cdn-icons-png.flaticon.com/512/3074/3074058.png",
        "seo": {
            "title": "IT Degree Programs - BCA, MCA with Industry Integration - GRRAS Jaipur",
            "description": "Industry-integrated BCA, MCA degree programs with cloud computing, AI/ML specializations. Guaranteed placement assistance in Jaipur.",
            "keywords": "bca degree jaipur, mca program, it degree courses, industry integrated education, computer applications"
        },
        "course_keywords": ["bca", "mca", "degree", "bachelor", "master", "computer", "application", "graduation"]
    },
    "server-administration-networking": {
        "name": "Server Administration & Networking",
        "slug": "server-administration-networking",
        "description": "Server administration, network infrastructure, system administration, and IT infrastructure management",
        "icon": "database",
        "color": "#64748B",
        "gradient": "from-slate-500 to-slate-600",
        "featured": True,
        "order": 8,
        "logo_url": "https://cdn-icons-png.flaticon.com/512/1163/1163451.png",
        "seo": {
            "title": "Server Administration & Networking Training - System Admin Certification Jaipur",
            "description": "Master server administration, network infrastructure, system administration with hands-on labs and certification preparation.",
            "keywords": "server administration training, networking course jaipur, system admin certification, infrastructure management"
        },
        "course_keywords": ["server", "administration", "networking", "network", "infrastructure", "system", "admin", "windows server", "tcp", "ip"]
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
                    "user": "technology_tracks_migration",
                    "is_draft": False
                }
            },
            upsert=True
        )
        return True
    except Exception as e:
        print(f"Error saving content: {e}")
        return False

async def create_technology_tracks():
    """Create the 8 technology track categories and assign courses"""
    try:
        print("🚀 Creating 8 Technology Track Categories...")
        
        # Get current content
        content = await get_content()
        courses = content.get("courses", [])
        
        print(f"📊 Found {len(courses)} existing courses")
        
        # Clear existing categories and start fresh
        course_categories = {}
        
        # Create all 8 technology track categories
        for category_slug, category_data in TECHNOLOGY_TRACKS.items():
            course_categories[category_slug] = {
                "name": category_data["name"],
                "slug": category_data["slug"],
                "description": category_data["description"],
                "icon": category_data["icon"],
                "color": category_data["color"],
                "gradient": category_data["gradient"],
                "featured": category_data["featured"],
                "order": category_data["order"],
                "logo_url": category_data.get("logo_url", ""),
                "seo": category_data["seo"],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            
            print(f"✅ Created category: {category_data['name']} (Order: {category_data['order']})")
        
        # Clear all existing course categories to start fresh
        for course in courses:
            course["categories"] = []
        
        # Smart course assignment based on title and content
        assignment_stats = {}
        
        for course in courses:
            course_title = course.get("title", "").lower()
            course_description = course.get("description", "").lower()
            course_content = f"{course_title} {course_description}"
            
            assigned_categories = []
            
            # Check each category for keyword matches
            for category_slug, category_data in TECHNOLOGY_TRACKS.items():
                keywords = category_data["course_keywords"]
                
                # Check if any keyword matches course content
                if any(keyword.lower() in course_content for keyword in keywords):
                    course["categories"].append(category_slug)
                    assigned_categories.append(category_data["name"])
                    
                    # Track assignment stats
                    if category_slug not in assignment_stats:
                        assignment_stats[category_slug] = []
                    assignment_stats[category_slug].append(course.get("title", "Unknown"))
            
            # Special handling for DevOps vs Server Administration
            if "devops-engineering" in course["categories"] and "server-administration-networking" in course["categories"]:
                # Prioritize DevOps if it has automation/CI/CD keywords
                devops_keywords = ["devops", "cicd", "jenkins", "ansible", "automation", "pipeline"]
                server_keywords = ["server", "administration", "networking", "network", "infrastructure", "windows"]
                
                devops_score = sum(1 for keyword in devops_keywords if keyword in course_content)
                server_score = sum(1 for keyword in server_keywords if keyword in course_content)
                
                if devops_score > server_score:
                    # Keep in DevOps, remove from Server
                    course["categories"].remove("server-administration-networking")
                    print(f"🔧 Moved '{course.get('title')}' to DevOps (higher automation score)")
                elif server_score > devops_score:
                    # Keep in Server, remove from DevOps
                    course["categories"].remove("devops-engineering")
                    print(f"🖥️ Moved '{course.get('title')}' to Server Administration (higher infrastructure score)")
            
            if assigned_categories:
                print(f"📝 Assigned '{course.get('title')}' to: {', '.join(assigned_categories)}")
            else:
                print(f"⚠️ No category assigned to '{course.get('title')}'")
        
        # Update content with new categories and course assignments
        content["courseCategories"] = course_categories
        content["courses"] = courses
        
        # Save updated content
        await save_content(content)
        
        # Print assignment statistics
        print("\n📊 TECHNOLOGY TRACK ASSIGNMENT STATISTICS:")
        print("=" * 60)
        
        for category_slug, assigned_courses in assignment_stats.items():
            category_name = TECHNOLOGY_TRACKS[category_slug]["name"]
            order = TECHNOLOGY_TRACKS[category_slug]["order"]
            print(f"\n{order}. ✅ {category_name} ({len(assigned_courses)} courses):")
            for course_title in assigned_courses:
                print(f"      • {course_title}")
        
        # Count unassigned courses
        unassigned_courses = [c for c in courses if not c.get("categories")]
        if unassigned_courses:
            print(f"\n⚠️ UNASSIGNED COURSES ({len(unassigned_courses)}):")
            for course in unassigned_courses:
                print(f"      • {course.get('title', 'Unknown')}")
        
        print(f"\n🎉 Technology Tracks created successfully!")
        print(f"📊 Created {len(TECHNOLOGY_TRACKS)} categories")
        print(f"📊 Processed {len(courses)} courses")
        print(f"📊 Total assignments: {sum(len(courses) for courses in assignment_stats.values())}")
        print(f"📊 Unassigned courses: {len(unassigned_courses)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def verify_technology_tracks():
    """Verify the technology tracks were created successfully"""
    try:
        print("\n🔍 Verifying Technology Tracks...")
        
        content = await get_content()
        categories = content.get("courseCategories", {})
        courses = content.get("courses", [])
        
        print(f"✅ Found {len(categories)} categories")
        print(f"✅ Found {len(courses)} courses")
        
        # Check each technology track
        for i, (category_slug, expected_data) in enumerate(TECHNOLOGY_TRACKS.items(), 1):
            if category_slug in categories:
                category = categories[category_slug]
                category_courses = [c for c in courses if category_slug in c.get("categories", [])]
                
                print(f"{i}. ✅ {category['name']}: {len(category_courses)} courses")
                print(f"      Color: {category['color']}, Order: {category['order']}")
                print(f"      SEO: {category['seo']['title'][:50]}...")
                
                if category_courses:
                    print(f"      Courses: {', '.join([c['title'] for c in category_courses[:3]])}{'...' if len(category_courses) > 3 else ''}")
            else:
                print(f"{i}. ❌ {expected_data['name']}: NOT FOUND")
        
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

if __name__ == "__main__":
    async def main():
        success = await create_technology_tracks()
        if success:
            await verify_technology_tracks()
        return success

    result = asyncio.run(main())
    sys.exit(0 if result else 1)
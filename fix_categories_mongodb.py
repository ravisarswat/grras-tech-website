#!/usr/bin/env python3
"""
Fix Categories in MongoDB - Replace with Technology Tracks
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

# The exact 8 Technology Track Categories
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
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
        }
    }
}

async def fix_categories_in_mongodb():
    """Replace old categories with technology tracks in MongoDB"""
    try:
        print("🚀 Fixing Categories in MongoDB...")
        
        # Get current content
        content_doc = await db.content.find_one({"type": "main"})
        if not content_doc:
            print("❌ No content document found")
            return False
        
        content = content_doc.get("data", {})
        courses = content.get("courses", [])
        
        print(f"📊 Found {len(courses)} courses")
        
        # Replace courseCategories with technology tracks
        new_categories = {}
        for category_slug, category_data in TECHNOLOGY_TRACKS.items():
            new_categories[category_slug] = {
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
            print(f"✅ Added category: {category_data['name']} (Order: {category_data['order']})")
        
        # Update content with new categories
        content["courseCategories"] = new_categories
        
        # Save updated content
        await db.content.update_one(
            {"type": "main"},
            {
                "$set": {
                    "data": content,
                    "updated_at": datetime.utcnow(),
                    "user": "fix_categories",
                    "is_draft": False
                }
            }
        )
        
        print(f"\n✅ Successfully updated {len(new_categories)} categories in MongoDB")
        
        # Verify counts
        print("\n📊 COURSE COUNTS PER CATEGORY:")
        for slug, category in new_categories.items():
            category_courses = [c for c in courses if slug in c.get("categories", [])]
            print(f"  • {category['name']}: {len(category_courses)} courses")
            if category_courses:
                for course in category_courses[:3]:
                    print(f"      - {course['title']}")
                if len(category_courses) > 3:
                    print(f"      - ... and {len(category_courses) - 3} more")
        
        return True
        
    except Exception as e:
        print(f"❌ Fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(fix_categories_in_mongodb())
    sys.exit(0 if result else 1)
#!/usr/bin/env python3
"""
Complete CMS Fix - Categories, Courses, and Admin Management
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

# Sample courses data with proper categories
SAMPLE_COURSES = [
    {
        "title": "Red Hat Certified System Administrator (RHCSA)",
        "slug": "rhcsa-training",
        "description": "Master Red Hat Enterprise Linux system administration with hands-on labs and certification preparation.",
        "categories": ["red-hat-technologies"],
        "visible": True,
        "featured": True,
        "level": "Professional",
        "duration": "2 months",
        "price": "₹35,000",
        "highlights": ["Hands-on Labs", "Certification Prep", "Expert Instructors"],
        "icon": "🔴",
        "order": 1
    },
    {
        "title": "AWS Solutions Architect Associate",
        "slug": "aws-solutions-architect",
        "description": "Design and deploy scalable systems on Amazon Web Services cloud platform.",
        "categories": ["aws-cloud-platform"],
        "visible": True,
        "featured": True,
        "level": "Professional",
        "duration": "3 months",
        "price": "₹45,000",
        "highlights": ["AWS Certification", "Cloud Architecture", "Hands-on Projects"],
        "icon": "☁️",
        "order": 2
    },
    {
        "title": "Kubernetes Administrator (CKA)",
        "slug": "kubernetes-administrator",
        "description": "Master container orchestration with Kubernetes and earn CKA certification.",
        "categories": ["kubernetes-containers"],
        "visible": True,
        "featured": True,
        "level": "Advanced",
        "duration": "2 months",
        "price": "₹40,000",
        "highlights": ["CKA Certification", "Container Orchestration", "Production Ready"],
        "icon": "⚙️",
        "order": 3
    },
    {
        "title": "DevOps Engineering Masterclass",
        "slug": "devops-masterclass",
        "description": "Complete DevOps pipeline with Jenkins, Ansible, Terraform, and GitLab CI/CD.",
        "categories": ["devops-engineering"],
        "visible": True,
        "featured": True,
        "level": "Professional",
        "duration": "4 months",
        "price": "₹55,000",
        "highlights": ["CI/CD Pipelines", "Automation Tools", "Real Projects"],
        "icon": "🔧",
        "order": 4
    },
    {
        "title": "Ethical Hacking & Cybersecurity",
        "slug": "ethical-hacking",
        "description": "Learn penetration testing, vulnerability assessment, and cyber defense strategies.",
        "categories": ["cybersecurity-ethical-hacking"],
        "visible": True,
        "featured": True,
        "level": "Professional",
        "duration": "3 months",
        "price": "₹50,000",
        "highlights": ["CEH Preparation", "Penetration Testing", "Security Analysis"],
        "icon": "🛡️",
        "order": 5
    },
    {
        "title": "Full Stack Web Development",
        "slug": "full-stack-development",
        "description": "Complete web development with React, Node.js, MongoDB, and deployment.",
        "categories": ["programming-development"],
        "visible": True,
        "featured": True,
        "level": "Beginner to Advanced",
        "duration": "6 months",
        "price": "₹60,000",
        "highlights": ["React & Node.js", "Real Projects", "Portfolio Building"],
        "icon": "💻",
        "order": 6
    },
    {
        "title": "BCA with Cloud Specialization",
        "slug": "bca-cloud-specialization",
        "description": "3-year BCA degree with cloud computing and modern technology specialization.",
        "categories": ["degree-programs"],
        "visible": True,
        "featured": True,
        "level": "Undergraduate",
        "duration": "3 years",
        "price": "₹2,50,000",
        "highlights": ["Industry Integration", "Cloud Specialization", "Placement Guarantee"],
        "icon": "🎓",
        "order": 7
    },
    {
        "title": "Windows Server Administration",
        "slug": "windows-server-admin",
        "description": "Master Windows Server administration, Active Directory, and network infrastructure.",
        "categories": ["server-administration-networking"],
        "visible": True,
        "featured": True,
        "level": "Professional",
        "duration": "2 months",
        "price": "₹38,000",
        "highlights": ["Active Directory", "Network Security", "Server Management"],
        "icon": "🖥️",
        "order": 8
    }
]

# Complete Technology Tracks with proper metadata
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

async def complete_cms_fix():
    """Complete CMS fix with categories, courses, and proper structure"""
    try:
        print("🚀 Starting Complete CMS Fix...")
        
        # Delete all existing content documents
        await db.content.delete_many({})
        
        # Create comprehensive content structure
        new_content = {
            "type": "site_content",
            "courseCategories": {},
            "courses": SAMPLE_COURSES,
            "institute": {
                "name": "GRRAS Solutions",
                "tagline": "Transform Your Career with Industry-Ready Skills",
                "description": "Premier IT training institute in Jaipur offering world-class certification courses",
                "contact": {
                    "phone": "+91-294-2985675",
                    "email": "info@grrassolutions.com",
                    "address": "Jaipur, Rajasthan"
                }
            },
            "updated_at": datetime.utcnow(),
            "user": "complete_cms_fix",
            "is_draft": False
        }
        
        # Add all technology track categories
        for category_slug, category_data in TECHNOLOGY_TRACKS.items():
            new_content["courseCategories"][category_slug] = {
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
        
        # Insert the complete content
        await db.content.insert_one(new_content)
        
        print(f"\n🎉 Complete CMS Fix Applied Successfully!")
        print(f"📊 Created {len(TECHNOLOGY_TRACKS)} categories")
        print(f"📊 Created {len(SAMPLE_COURSES)} sample courses")
        
        # Verify data
        print("\n📊 VERIFICATION:")
        for category_slug, category in new_content["courseCategories"].items():
            category_courses = [c for c in SAMPLE_COURSES if category_slug in c.get("categories", [])]
            print(f"  • {category['name']}: {len(category_courses)} course{'s' if len(category_courses) != 1 else ''}")
            for course in category_courses:
                print(f"      - {course['title']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Complete CMS fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(complete_cms_fix())
    sys.exit(0 if result else 1)
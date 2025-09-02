#!/usr/bin/env python3
"""
Fix Complete System - Backend + Frontend Integration
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

# Complete Technology Tracks with proper courses
COMPLETE_SYSTEM_DATA = {
    "type": "site_content",
    "courseCategories": {
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
                "keywords": "red hat training jaipur, rhcsa certification, rhce course, linux training"
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
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
                "keywords": "aws training jaipur, aws certification, cloud computing, aws solutions architect"
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
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
                "keywords": "kubernetes training jaipur, cka certification, docker course, container orchestration"
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
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
                "keywords": "devops training jaipur, jenkins course, ansible certification, terraform training"
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
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
                "keywords": "cybersecurity training jaipur, ethical hacking course, penetration testing, ceh certification"
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
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
                "keywords": "programming course jaipur, web development, full stack training, python java javascript"
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
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
                "keywords": "bca degree jaipur, mca program, it degree courses, industry integrated education"
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
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
                "keywords": "server administration training, networking course jaipur, system admin certification"
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    },
    "courses": [
        {
            "title": "Red Hat Certified System Administrator (RHCSA)",
            "slug": "rhcsa-training",
            "description": "Master Red Hat Enterprise Linux system administration with hands-on labs and certification preparation. Learn essential skills for managing enterprise Linux environments.",
            "categories": ["red-hat-technologies"],
            "visible": True,
            "featured": True,
            "level": "Professional",
            "duration": "2 months",
            "price": "₹35,000",
            "oneLiner": "Master Enterprise Linux Administration",
            "overview": "Comprehensive RHCSA certification training with hands-on labs",
            "highlights": ["Hands-on Labs", "RHCSA Certification Prep", "Expert Instructors", "Job Assistance"],
            "icon": "🔴",
            "order": 1,
            "seo": {
                "title": "RHCSA Training in Jaipur - Red Hat Certification Course",
                "description": "Master Red Hat Enterprise Linux with RHCSA certification training in Jaipur. Hands-on labs, expert instructors, and job assistance.",
                "keywords": "rhcsa training jaipur, red hat certification, linux administration course"
            }
        },
        {
            "title": "AWS Solutions Architect Associate",
            "slug": "aws-solutions-architect",
            "description": "Design and deploy scalable systems on Amazon Web Services cloud platform. Master cloud architecture patterns and AWS services.",
            "categories": ["aws-cloud-platform"],
            "visible": True,
            "featured": True,
            "level": "Professional",
            "duration": "3 months",
            "price": "₹45,000",
            "oneLiner": "Design Scalable Cloud Solutions",
            "overview": "Complete AWS Solutions Architect certification with hands-on cloud projects",
            "highlights": ["AWS Certification", "Cloud Architecture", "Hands-on Projects", "Industry Mentors"],
            "icon": "☁️",
            "order": 2,
            "seo": {
                "title": "AWS Solutions Architect Training in Jaipur - Cloud Certification",
                "description": "Professional AWS Solutions Architect training in Jaipur. Master cloud architecture with hands-on projects and certification preparation.",
                "keywords": "aws solutions architect jaipur, aws training, cloud computing course"
            }
        },
        {
            "title": "Kubernetes Administrator (CKA)",
            "slug": "kubernetes-administrator-cka",
            "description": "Master container orchestration with Kubernetes and earn CKA certification. Learn to manage production Kubernetes clusters.",
            "categories": ["kubernetes-containers"],
            "visible": True,
            "featured": True,
            "level": "Advanced",
            "duration": "2 months",
            "price": "₹40,000",
            "oneLiner": "Master Container Orchestration",
            "overview": "Complete CKA certification training with production-ready Kubernetes skills",
            "highlights": ["CKA Certification", "Container Orchestration", "Production Ready", "Hands-on Labs"],
            "icon": "⚙️",
            "order": 3,
            "seo": {
                "title": "CKA Kubernetes Training in Jaipur - Container Orchestration Course",
                "description": "Master Kubernetes with CKA certification training in Jaipur. Learn container orchestration with hands-on labs and expert guidance.",
                "keywords": "cka training jaipur, kubernetes certification, container orchestration course"
            }
        },
        {
            "title": "DevOps Engineering Masterclass",
            "slug": "devops-masterclass",
            "description": "Complete DevOps pipeline with Jenkins, Ansible, Terraform, and GitLab CI/CD. Master automation and deployment strategies.",
            "categories": ["devops-engineering"],
            "visible": True,
            "featured": True,
            "level": "Professional",
            "duration": "4 months",
            "price": "₹55,000",
            "oneLiner": "Complete CI/CD Pipeline Mastery",
            "overview": "End-to-end DevOps training with automation tools and real-world projects",
            "highlights": ["CI/CD Pipelines", "Automation Tools", "Real Projects", "Industry Practices"],
            "icon": "🔧",
            "order": 4,
            "seo": {
                "title": "DevOps Training in Jaipur - CI/CD Pipeline Course",
                "description": "Master DevOps with Jenkins, Ansible, Terraform training in Jaipur. Complete CI/CD pipeline development with hands-on projects.",
                "keywords": "devops training jaipur, jenkins course, cicd pipeline, automation training"
            }
        },
        {
            "title": "Ethical Hacking & Cybersecurity",
            "slug": "ethical-hacking-cybersecurity",
            "description": "Learn penetration testing, vulnerability assessment, and cyber defense strategies. Master ethical hacking techniques for security.",
            "categories": ["cybersecurity-ethical-hacking"],
            "visible": True,
            "featured": True,
            "level": "Professional",
            "duration": "3 months",
            "price": "₹50,000",
            "oneLiner": "Master Cyber Defense Strategies",
            "overview": "Complete ethical hacking and cybersecurity training with practical labs",
            "highlights": ["CEH Preparation", "Penetration Testing", "Security Analysis", "Hands-on Labs"],
            "icon": "🛡️",
            "order": 5,
            "seo": {
                "title": "Ethical Hacking Training in Jaipur - Cybersecurity Course",
                "description": "Professional ethical hacking and cybersecurity training in Jaipur. Learn penetration testing with hands-on labs and expert instructors.",
                "keywords": "ethical hacking training jaipur, cybersecurity course, penetration testing, ceh certification"
            }
        },
        {
            "title": "Full Stack Web Development",
            "slug": "full-stack-development",
            "description": "Complete web development with React, Node.js, MongoDB, and deployment. Build modern web applications from frontend to backend.",
            "categories": ["programming-development"],
            "visible": True,
            "featured": True,
            "level": "Beginner to Advanced",
            "duration": "6 months",
            "price": "₹60,000",
            "oneLiner": "Build Modern Web Applications",
            "overview": "Complete full-stack development with MERN stack and modern deployment practices",
            "highlights": ["React & Node.js", "Real Projects", "Portfolio Building", "Job Assistance"],
            "icon": "💻",
            "order": 6,
            "seo": {
                "title": "Full Stack Web Development Training in Jaipur - MERN Stack Course",
                "description": "Learn full-stack web development with React, Node.js, MongoDB in Jaipur. Build real projects with modern deployment practices.",
                "keywords": "full stack development jaipur, mern stack training, web development course, react nodejs"
            }
        },
        {
            "title": "Data Science & Machine Learning",
            "slug": "data-science-ml",
            "description": "Master data science with Python, machine learning algorithms, and AI applications. Build predictive models and data-driven solutions.",
            "categories": ["programming-development"],
            "visible": True,
            "featured": True,
            "level": "Intermediate",
            "duration": "5 months",
            "price": "₹65,000",
            "oneLiner": "Build AI-Powered Solutions",
            "overview": "Complete data science and machine learning training with Python and real-world projects",
            "highlights": ["Python & ML Libraries", "Predictive Models", "AI Applications", "Industry Projects"],
            "icon": "🤖",
            "order": 7,
            "seo": {
                "title": "Data Science & Machine Learning Training in Jaipur - Python AI Course",
                "description": "Master data science and machine learning with Python in Jaipur. Build AI applications with hands-on projects and expert guidance.",
                "keywords": "data science training jaipur, machine learning course, python ai training, data analytics"
            }
        },
        {
            "title": "BCA with Cloud Specialization",
            "slug": "bca-cloud-specialization",
            "description": "3-year BCA degree with cloud computing and modern technology specialization. Industry-integrated curriculum with placement guarantee.",
            "categories": ["degree-programs"],
            "visible": True,
            "featured": True,
            "level": "Undergraduate",
            "duration": "3 years",
            "price": "₹2,50,000",
            "oneLiner": "Industry-Ready BCA Degree",
            "overview": "Complete BCA degree with cloud computing specialization and industry integration",
            "highlights": ["Industry Integration", "Cloud Specialization", "Placement Guarantee", "Modern Curriculum"],
            "icon": "🎓",
            "order": 8,
            "seo": {
                "title": "BCA with Cloud Computing Specialization in Jaipur - IT Degree Program",
                "description": "Industry-integrated BCA degree with cloud computing specialization in Jaipur. Guaranteed placement assistance with modern curriculum.",
                "keywords": "bca degree jaipur, cloud computing course, it degree program, computer applications"
            }
        },
        {
            "title": "Windows Server Administration",
            "slug": "windows-server-admin",
            "description": "Master Windows Server administration, Active Directory, and network infrastructure. Learn enterprise server management skills.",
            "categories": ["server-administration-networking"],
            "visible": True,
            "featured": True,
            "level": "Professional",
            "duration": "2 months",
            "price": "₹38,000",
            "oneLiner": "Master Enterprise Server Management",
            "overview": "Complete Windows Server administration with Active Directory and network infrastructure",
            "highlights": ["Active Directory", "Network Security", "Server Management", "Enterprise Skills"],
            "icon": "🖥️",
            "order": 9,
            "seo": {
                "title": "Windows Server Administration Training in Jaipur - Microsoft Server Course",
                "description": "Master Windows Server administration and Active Directory in Jaipur. Learn enterprise server management with hands-on labs.",
                "keywords": "windows server training jaipur, active directory course, server administration, microsoft server"
            }
        },
        {
            "title": "Network Infrastructure & Security",
            "slug": "network-infrastructure-security",
            "description": "Master network design, implementation, and security. Learn routing, switching, and network protection strategies.",
            "categories": ["server-administration-networking"],
            "visible": True,
            "featured": True,
            "level": "Professional",
            "duration": "3 months",
            "price": "₹42,000",
            "oneLiner": "Build Secure Network Infrastructure",
            "overview": "Complete network infrastructure and security training with hands-on labs",
            "highlights": ["Network Design", "Security Implementation", "Routing & Switching", "Hands-on Labs"],
            "icon": "🌐",
            "order": 10,
            "seo": {
                "title": "Network Infrastructure & Security Training in Jaipur - Networking Course",
                "description": "Master network infrastructure and security in Jaipur. Learn routing, switching, and network protection with practical training.",
                "keywords": "network security training jaipur, infrastructure course, routing switching, network administration"
            }
        }
    ],
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
    "learningPaths": [],
    "updated_at": datetime.utcnow(),
    "user": "complete_system_fix",
    "is_draft": False
}

async def fix_complete_system():
    """Fix complete system with proper data"""
    try:
        print("🚀 Fixing Complete System...")
        
        # Delete all existing content documents
        await db.content.delete_many({})
        
        # Insert the complete system data
        await db.content.insert_one(COMPLETE_SYSTEM_DATA)
        
        print(f"✅ Complete system data inserted!")
        print(f"📊 Categories: {len(COMPLETE_SYSTEM_DATA['courseCategories'])}")
        print(f"📊 Courses: {len(COMPLETE_SYSTEM_DATA['courses'])}")
        
        # Verify data
        print("\n📊 VERIFICATION:")
        for category_slug, category in COMPLETE_SYSTEM_DATA["courseCategories"].items():
            category_courses = [c for c in COMPLETE_SYSTEM_DATA["courses"] if category_slug in c.get("categories", [])]
            print(f"  • {category['name']}: {len(category_courses)} course{'s' if len(category_courses) != 1 else ''}")
        
        return True
        
    except Exception as e:
        print(f"❌ System fix failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(fix_complete_system())
    sys.exit(0 if result else 1)
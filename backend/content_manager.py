import os
import json
import aiofiles
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import HTTPException
import logging
import uuid
import shutil

class ContentManager:
    def __init__(self, storage_type: str = "mongo", mongo_client=None, db_name: str = "grras_database"):
        # ENFORCE MONGODB STORAGE - Single source of truth for GitHub deployments
        if not mongo_client:
            raise ValueError("MongoDB client is required. No JSON fallbacks allowed for production.")
        
        self.storage_type = "mongo"  # FORCED MongoDB only
        self.mongo_client = mongo_client
        self.db_name = db_name
        
        # JSON paths used ONLY for local backup/versioning (not primary storage)
        self.runtime_dir = '/app/persistent_cms_data'
        self.json_file = '/app/persistent_cms_data/content.json'
        self.audit_file = '/app/persistent_cms_data/content_audit.json'
        self.versions_dir = '/app/persistent_cms_data/versions'
        self.media_dir = '/app/persistent_cms_data/media'
        self.backups_dir = '/app/persistent_cms_data/backups'
        
        # Template file (git-tracked, READ ONLY for initial seeding if MongoDB is empty)
        self.template_file = '/app/backend/data/content.json'
        
        # Create directories for local operations only
        for dir_path in [self.runtime_dir, self.versions_dir, self.media_dir, self.backups_dir]:
            os.makedirs(dir_path, exist_ok=True)
        
        logging.info("✅ ContentManager initialized - MongoDB ONLY mode (Single Source of Truth)")
    
    def get_default_content(self) -> Dict[str, Any]:
        """Return the comprehensive default content structure"""
        return {
            "branding": {
                "logoUrl": "https://customer-assets.emergentagent.com/job_training-hub-29/artifacts/gl3ldkmg_white%20logo.png",
                "colors": {
                    "primary": "#DC2626",
                    "secondary": "#EA580C", 
                    "accent": "#16A34A",
                    "dark": "#1F2937",
                    "light": "#F3F4F6"
                },
                "fonts": {
                    "primary": "Poppins",
                    "secondary": "Roboto"
                }
            },
            "institute": {
                "name": "GRRAS Solutions Training Institute",
                "shortName": "GRRAS Solutions",
                "tagline": "Empowering Futures Through Technology",
                "address": "A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012",
                "phone": "090019 91227",
                "email": "info@grrassolutions.com",
                "website": "https://grrassolutions.com",
                "social": {
                    "whatsapp": "https://wa.me/919001991227",
                    "instagram": "#",
                    "youtube": "#",
                    "linkedin": "#",
                    "facebook": "#"
                },
                "stats": {
                    "yearsOfExcellence": "18+",
                    "studentsTrained": "5000+", 
                    "placementRate": "95%",
                    "hiringPartners": "100+"
                }
            },
            "courseCategories": {
                # Default categories removed - will be managed dynamically via admin panel
                # Categories added through admin panel will be stored here
            },
            "learningPaths": {
                "cloud-engineer": {
                    "title": "Cloud Engineer Career Path",
                    "slug": "cloud-engineer-path", 
                    "description": "Complete roadmap to become a certified cloud engineer with hands-on experience in AWS, Azure, and DevOps practices",
                    "duration": "6-8 months",
                    "level": "Beginner to Advanced",
                    "totalCourses": 4,
                    "estimatedHours": 480,
                    "featured": True,
                    "courses": [
                        {
                            "courseSlug": "linux-fundamentals",
                            "order": 1,
                            "title": "Linux Fundamentals",
                            "duration": "4 weeks",
                            "prerequisite": False
                        },
                        {
                            "courseSlug": "aws-solutions-architect", 
                            "order": 2,
                            "title": "AWS Solutions Architect",
                            "duration": "8 weeks",
                            "prerequisite": True
                        },
                        {
                            "courseSlug": "devops-training",
                            "order": 3, 
                            "title": "DevOps Engineering",
                            "duration": "12 weeks",
                            "prerequisite": True
                        },
                        {
                            "courseSlug": "kubernetes-administrator",
                            "order": 4,
                            "title": "Kubernetes Administration",
                            "duration": "6 weeks", 
                            "prerequisite": True
                        }
                    ],
                    "outcomes": [
                        "Design and deploy scalable cloud infrastructures",
                        "Implement CI/CD pipelines and DevOps practices", 
                        "Manage containerized applications with Kubernetes",
                        "Optimize cloud costs and security configurations"
                    ],
                    "careerRoles": [
                        "Cloud Engineer",
                        "DevOps Engineer", 
                        "Solutions Architect",
                        "Infrastructure Engineer"
                    ],
                    "averageSalary": "₹8-15 LPA",
                    "seo": {
                        "title": "Cloud Engineer Career Path - Complete Training Program - GRRAS",
                        "description": "Comprehensive cloud engineer career path with AWS, DevOps, Kubernetes training. 6-8 months program with guaranteed placement in Jaipur.",
                        "keywords": "cloud engineer career path, aws devops training, kubernetes course jaipur"
                    }
                },
                "redhat-specialist": {
                    "title": "Red Hat Specialist Path",
                    "slug": "redhat-specialist-path",
                    "description": "Comprehensive Red Hat certification journey from system administration to enterprise solutions",
                    "duration": "4-6 months",
                    "level": "Beginner to Expert", 
                    "totalCourses": 3,
                    "estimatedHours": 360,
                    "featured": True,
                    "courses": [
                        {
                            "courseSlug": "rhcsa-certification",
                            "order": 1,
                            "title": "RHCSA Certification",
                            "duration": "6 weeks",
                            "prerequisite": False
                        },
                        {
                            "courseSlug": "rhce-advanced", 
                            "order": 2,
                            "title": "RHCE Advanced",
                            "duration": "8 weeks",
                            "prerequisite": True
                        },
                        {
                            "courseSlug": "openshift-do280",
                            "order": 3,
                            "title": "OpenShift Administration",
                            "duration": "6 weeks",
                            "prerequisite": True
                        }
                    ],
                    "outcomes": [
                        "Master Red Hat Enterprise Linux administration",
                        "Implement enterprise automation solutions",
                        "Deploy and manage OpenShift clusters", 
                        "Design scalable enterprise infrastructures"
                    ],
                    "careerRoles": [
                        "Linux System Administrator",
                        "Red Hat Solutions Architect",
                        "OpenShift Administrator",
                        "Enterprise Infrastructure Engineer"
                    ],
                    "averageSalary": "₹6-12 LPA",
                    "seo": {
                        "title": "Red Hat Certification Path - RHCSA to OpenShift Expert - GRRAS",
                        "description": "Complete Red Hat specialist path with RHCSA, RHCE, OpenShift certifications. Industry-focused training with placement assistance in Jaipur.",
                        "keywords": "red hat certification path, rhcsa rhce training, openshift course jaipur"
                    }
                },
                "kubernetes-expert": {
                    "title": "Kubernetes Expert Path",
                    "slug": "kubernetes-expert-path",
                    "description": "Master container orchestration from basics to advanced Kubernetes security and management",
                    "duration": "3-4 months",
                    "level": "Intermediate to Expert",
                    "totalCourses": 3,
                    "estimatedHours": 240,
                    "featured": False,
                    "courses": [
                        {
                            "courseSlug": "docker-fundamentals",
                            "order": 1, 
                            "title": "Docker Fundamentals",
                            "duration": "3 weeks",
                            "prerequisite": False
                        },
                        {
                            "courseSlug": "cka-kubernetes",
                            "order": 2,
                            "title": "CKA - Certified Kubernetes Administrator", 
                            "duration": "6 weeks",
                            "prerequisite": True
                        },
                        {
                            "courseSlug": "cks-kubernetes-security",
                            "order": 3,
                            "title": "CKS - Certified Kubernetes Security",
                            "duration": "4 weeks",
                            "prerequisite": True
                        }
                    ],
                    "outcomes": [
                        "Deploy and manage production Kubernetes clusters",
                        "Implement advanced security practices",
                        "Troubleshoot complex containerized applications",
                        "Design cloud-native architectures"
                    ],
                    "careerRoles": [
                        "Kubernetes Administrator", 
                        "Container Platform Engineer",
                        "Cloud Native Developer",
                        "DevOps Security Engineer"
                    ],
                    "averageSalary": "₹10-18 LPA",
                    "seo": {
                        "title": "Kubernetes Expert Certification Path - CKA, CKS Training - GRRAS",
                        "description": "Master Kubernetes with CKA and CKS certifications. Advanced container orchestration and security training with hands-on projects.",
                        "keywords": "kubernetes certification path, cka cks training, container orchestration jaipur"
                    }
                }
            },
            "pages": {
                "home": {
                    "seo": {
                        "title": "GRRAS Solutions Training Institute - IT & Cloud Education in Jaipur",
                        "description": "Premier IT training institute in Jaipur offering BCA degree, DevOps, Red Hat certifications with placement assistance.",
                        "keywords": "IT training Jaipur, BCA degree, DevOps training, Red Hat certification"
                    },
                    "hero": {
                        "headline": "Empowering Students with World-Class IT & Cloud Education",
                        "subtext": "From Degree Programs to Cutting-Edge Certifications",
                        "backgroundImage": "",
                        "ctaPrimary": {
                            "label": "Explore Courses",
                            "href": "/courses",
                            "style": "primary"
                        },
                        "ctaSecondary": {
                            "label": "Apply Now",
                            "href": "/admissions", 
                            "style": "outline"
                        }
                    },
                    "highlights": [
                        {
                            "id": "highlight1",
                            "icon": "🎓",
                            "title": "Recognized Degree Programs",
                            "description": "Industry-integrated BCA degree with modern tech specializations",
                            "order": 1
                        },
                        {
                            "id": "highlight2", 
                            "icon": "🎯",
                            "title": "Industry-Oriented Training",
                            "description": "Practical, hands-on training aligned with current market demands",
                            "order": 2
                        },
                        {
                            "id": "highlight3",
                            "icon": "💼",
                            "title": "Placement Assistance", 
                            "description": "95% placement success rate with top IT companies",
                            "order": 3
                        }
                    ],
                    "popularCourses": {
                        "title": "Our Popular Courses",
                        "subtitle": "Industry-relevant courses designed to make you job-ready",
                        "selectionMode": "auto",
                        "maxItems": 4,
                        "manualSelection": [],
                        "showViewAll": True
                    },
                    "courseCategories": {
                        "title": "Explore by Category",
                        "subtitle": "Find courses organized by your career interests",
                        "showCategories": True,
                        "maxCategories": 6,
                        "layout": "grid"
                    },
                    "learningPaths": {
                        "title": "Guided Learning Paths",
                        "subtitle": "Structured career-focused learning journeys",
                        "showPaths": True,
                        "maxPaths": 3,
                        "featured": True
                    },
                    "courseDiscovery": {
                        "searchPlaceholder": "Search courses (e.g., RHCSA, AWS, Kubernetes)",
                        "quickFilters": ["Popular", "Certification", "Beginner", "Advanced"],
                        "showInstantSearch": True,
                        "maxSearchResults": 6
                    },
                    "featuredCoursesLimit": 4,
                    "showStats": True,
                    "showTestimonials": True,
                    "sections": [
                        {
                            "id": "hero",
                            "type": "hero",
                            "visible": True,
                            "order": 1
                        },
                        {
                            "id": "highlights",
                            "type": "highlights",
                            "visible": True,
                            "order": 2
                        },
                        {
                            "id": "featured_courses",
                            "type": "featured_courses", 
                            "visible": True,
                            "order": 3
                        },
                        {
                            "id": "stats",
                            "type": "stats",
                            "visible": True,
                            "order": 4
                        },
                        {
                            "id": "testimonials",
                            "type": "testimonials",
                            "visible": True,
                            "order": 5
                        }
                    ]
                }
            },
            "courses": [
                {
                    "slug": "devops-training",
                    "title": "DevOps Training", 
                    "oneLiner": "Master Modern DevOps Practices & Cloud Technologies",
                    "description": "Comprehensive DevOps training covering the complete DevOps lifecycle, cloud platforms, containerization, orchestration, and automation tools used in modern software development.",
                    "duration": "6 Months",
                    "fees": "₹45,000 (EMI Available)",
                    "tools": ["Linux (RHCSA)", "Linux Server Administration", "Ansible", "AWS", "Terraform", "Docker", "Kubernetes", "Jenkins", "GitHub"],
                    "visible": True,
                    "featured": True,
                    "order": 1,
                    "thumbnailUrl": "",
                    "category": "cloud",
                    "level": "Intermediate",
                    "mode": ["Classroom", "Online"],
                    "highlights": ["Hands-on AWS Labs", "Real-time Projects", "Industry Mentorship", "DevOps Certification Prep"],
                    "outcomes": [
                        "Master AWS cloud services and deployment strategies",
                        "Implement CI/CD pipelines using Jenkins and GitLab", 
                        "Container orchestration with Docker and Kubernetes",
                        "Infrastructure as Code with Terraform and Ansible"
                    ],
                    "eligibility": "Graduate + Basic IT Knowledge",
                    "intake": "Monthly Batches",
                    "seo": {
                        "title": "DevOps Training in Jaipur - GRRAS Solutions",
                        "description": "Learn DevOps at GRRAS Solutions Jaipur. Master AWS, Docker, Kubernetes, Jenkins and more.",
                        "keywords": "DevOps training Jaipur, AWS certification, Docker Kubernetes course"
                    }
                }
            ],
            "menus": {
                "header": {
                    "primary": [
                        {"label": "Home", "href": "/", "order": 1},
                        {"label": "About", "href": "/about", "order": 2},
                        {"label": "Courses", "href": "/courses", "order": 3, "hasDropdown": True},
                        {"label": "Admissions", "href": "/admissions", "order": 4},
                        {"label": "Testimonials", "href": "/testimonials", "order": 5},
                        {"label": "Blog", "href": "/blog", "order": 6},
                        {"label": "Contact", "href": "/contact", "order": 7}
                    ],
                    "cta": {
                        "label": "Apply Now",
                        "href": "/admissions",
                        "style": "primary"
                    }
                }
            },
            "faqs": [],
            "testimonials": [],
            "blog": {"settings": {"postsPerPage": 6, "enableComments": False}, "posts": []},
            "banners": [],
            "settings": {
                "site": {
                    "title": "GRRAS Solutions Training Institute",
                    "description": "Premier IT training institute in Jaipur offering BCA degree, DevOps, Red Hat certifications with placement assistance.",
                    "keywords": "IT training Jaipur, BCA degree, DevOps training, Red Hat certification",
                    "author": "GRRAS Solutions Training Institute",
                    "language": "en-IN",
                    "timezone": "Asia/Kolkata"
                },
                "lastUpdated": datetime.now(timezone.utc).isoformat(),
                "version": "2.0"
            },
            "meta": {
                "contentVersion": "2.0",
                "lastModified": datetime.now(timezone.utc).isoformat(),
                "modifiedBy": "system",
                "isDraft": False
            }
        }
    
    async def get_content(self) -> Dict[str, Any]:
        """Get content from MongoDB ONLY - Single Source of Truth"""
        try:
            # MONGODB ONLY - No fallbacks during GitHub deployments
            content = await self._get_content_mongo()
            if content and content.get('courses'):
                logging.info("✅ Content loaded from MongoDB (Single Source of Truth)")
                return content
            else:
                # MongoDB empty - ONE-TIME seeding from template (only for fresh installations)
                logging.info("🔄 MongoDB empty - ONE-TIME seeding from template")
                template_content = await self._load_template_content()
                await self._save_content_mongo(template_content)
                logging.info("✅ Template content seeded to MongoDB - will not happen again")
                return template_content
        except Exception as e:
            logging.error(f"❌ CRITICAL: MongoDB connection failed: {e}")
            # NO JSON FALLBACKS - MongoDB must be working for the system to function
            raise HTTPException(
                status_code=503, 
                detail="Database connection required. Please check MONGO_URI configuration."
            )
    
    async def _load_template_content(self) -> Dict[str, Any]:
        """Load content from template file"""
        try:
            if os.path.exists(self.template_file):
                async with aiofiles.open(self.template_file, 'r') as f:
                    content = json.loads(await f.read())
                logging.info("📋 Loaded content from template file")
                return content
        except Exception as e:
            logging.error(f"❌ Error loading template: {e}")
        
        # Ultimate fallback
        return self.get_default_content()
    
    async def save_content(self, content: Dict[str, Any], user: str = "admin", is_draft: bool = False) -> Dict[str, Any]:
        """Save content to MongoDB ONLY - Single Source of Truth"""
        try:
            # Update metadata
            content["meta"]["lastModified"] = datetime.now(timezone.utc).isoformat()
            content["meta"]["modifiedBy"] = user
            content["meta"]["isDraft"] = is_draft
            content["settings"]["lastUpdated"] = datetime.now(timezone.utc).isoformat()
            
            # MONGODB ONLY - No JSON fallbacks
            result = await self._save_content_mongo(content)
            logging.info("✅ Content saved to MongoDB (Single Source of Truth)")
            
            return result
        except Exception as e:
            logging.error(f"❌ CRITICAL: Failed to save content to MongoDB: {e}")
            raise HTTPException(
                status_code=503,
                detail="Failed to save content. Please check database connection."
            )
    
    async def _get_content_mongo(self) -> Dict[str, Any]:
        """Get content from MongoDB"""
        try:
            db = self.mongo_client[self.db_name]
            content = await db.content.find_one({"type": "site_content"})
            
            if content:
                # Remove MongoDB _id field
                content.pop('_id', None)
                content.pop('type', None)
                return content
            else:
                return None
        except Exception as e:
            logging.error(f"Error getting content from MongoDB: {e}")
            raise e
    
    async def _save_content_mongo(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Save content to MongoDB"""
        try:
            db = self.mongo_client[self.db_name]
            
            # Add type field for MongoDB query
            content_with_type = content.copy()
            content_with_type["type"] = "site_content"
            
            # Upsert content
            await db.content.replace_one(
                {"type": "site_content"}, 
                content_with_type, 
                upsert=True
            )
            
            return content
        except Exception as e:
            logging.error(f"Error saving content to MongoDB: {e}")
            raise e
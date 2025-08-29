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
                    "yearsOfExcellence": "10+",
                    "studentsTrained": "5000+", 
                    "placementRate": "95%",
                    "hiringPartners": "100+"
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
                },
                "about": {
                    "seo": {
                        "title": "About GRRAS Solutions - Premier IT Training Institute in Jaipur",
                        "description": "Learn about GRRAS Solutions Training Institute, Jaipur's leading IT education provider with 10+ years of excellence.",
                        "keywords": "GRRAS Solutions, IT training institute Jaipur, about us"
                    },
                    "hero": {
                        "headline": "About GRRAS Solutions",
                        "subtext": "Empowering students with world-class IT education and industry-ready skills since 2014"
                    },
                    "mission": "To provide world-class IT education and training that bridges the gap between academic learning and industry requirements. We are committed to nurturing skilled professionals who can excel in the rapidly evolving technology landscape.",
                    "vision": "To be the leading IT training institute in India, recognized for excellence in education, innovation in teaching methodologies, and success in producing industry-ready professionals who contribute to the global technology ecosystem.",
                    "story": "GRRAS Solutions Training Institute has been empowering students with world-class IT education since 2014. We offer industry-relevant courses, recognized degrees, and guaranteed placement assistance.",
                    "values": [
                        {
                            "title": "Quality Education",
                            "description": "We provide world-class IT education with industry-relevant curriculum and hands-on experience.",
                            "icon": "📚"
                        },
                        {
                            "title": "Student Success", 
                            "description": "Our students success is our priority. We ensure every student gets proper guidance and support.",
                            "icon": "👥"
                        },
                        {
                            "title": "Innovation",
                            "description": "We continuously update our courses and teaching methods to match industry standards.",
                            "icon": "💡"
                        },
                        {
                            "title": "Industry Focus",
                            "description": "Our training programs are designed based on current market demands and industry requirements.",
                            "icon": "🎯"
                        }
                    ],
                    "timeline": [
                        {
                            "year": "2014",
                            "title": "Foundation",
                            "description": "GRRAS Solutions established with a vision to provide quality IT education in Jaipur."
                        },
                        {
                            "year": "2016", 
                            "title": "Industry Partnership",
                            "description": "Partnered with leading IT companies for internships and placement opportunities."
                        },
                        {
                            "year": "2018",
                            "title": "BCA Program Launch",
                            "description": "Launched industry-integrated BCA degree program with specializations."
                        },
                        {
                            "year": "2020",
                            "title": "Red Hat Authorization",
                            "description": "Became authorized Red Hat training partner for official certifications."
                        },
                        {
                            "year": "2022",
                            "title": "Cloud Excellence", 
                            "description": "Established state-of-the-art cloud labs and DevOps training infrastructure."
                        },
                        {
                            "year": "2024",
                            "title": "AI/ML Integration",
                            "description": "Integrated AI/ML modules across all programs to meet future technology needs."
                        }
                    ]
                },
                "admissions": {
                    "seo": {
                        "title": "Admissions Process - Join GRRAS Solutions Training Institute",
                        "description": "Start your IT career with GRRAS Solutions. Learn about our admission process, eligibility criteria, fees, and course options.",
                        "keywords": "GRRAS admissions, IT course admission, BCA admission Jaipur"
                    },
                    "hero": {
                        "headline": "Start Your IT Journey Today",
                        "subtext": "Simple admission process, flexible payment options, and guaranteed placement assistance"
                    },
                    "process": [
                        {
                            "step": 1,
                            "title": "Inquiry",
                            "description": "Submit your inquiry through our website, phone, or visit our campus",
                            "icon": "📧"
                        },
                        {
                            "step": 2,
                            "title": "Counseling", 
                            "description": "Meet with our expert counselors to discuss your career goals and course options",
                            "icon": "👥"
                        },
                        {
                            "step": 3,
                            "title": "Enrollment",
                            "description": "Complete the enrollment process with required documents and fee payment",
                            "icon": "📝"
                        },
                        {
                            "step": 4,
                            "title": "Onboarding",
                            "description": "Join orientation session and start your learning journey",
                            "icon": "🎓"
                        }
                    ]
                },
                "contact": {
                    "seo": {
                        "title": "Contact GRRAS Solutions - IT Training Institute in Jaipur",
                        "description": "Get in touch with GRRAS Solutions Training Institute in Jaipur. Call 090019 91227, visit our Khatipura campus.",
                        "keywords": "contact GRRAS, IT training institute Jaipur, admission enquiry"
                    },
                    "hero": {
                        "headline": "Get in Touch",
                        "subtext": "Ready to start your IT career? Contact our admission counselors for personalized guidance"
                    },
                    "officeHours": [
                        {"day": "Monday - Friday", "hours": "9:00 AM - 7:00 PM"},
                        {"day": "Saturday", "hours": "9:00 AM - 5:00 PM"},
                        {"day": "Sunday", "hours": "10:00 AM - 4:00 PM"}
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
                },
                {
                    "slug": "bca-degree",
                    "title": "BCA Degree Program",
                    "oneLiner": "Industry-Integrated Bachelor Degree Program", 
                    "description": "A comprehensive 3-year BCA degree program designed with industry integration, covering modern technologies like cloud computing, DevOps, and AI/ML along with traditional computer science fundamentals.",
                    "duration": "3 Years",
                    "fees": "Contact for Details",
                    "tools": ["Programming in C", "Java", "DBMS", "Web Technologies", "Cloud & DevOps Basics", "AI/ML Basics"],
                    "visible": True,
                    "featured": True,
                    "order": 2,
                    "thumbnailUrl": "",
                    "category": "degree",
                    "level": "Beginner to Advanced",
                    "mode": ["Classroom"],
                    "highlights": ["UGC Recognized Degree", "Industry Integration", "Cloud & DevOps Specialization", "Placement Assistance"],
                    "outcomes": [
                        "Strong foundation in computer science and programming",
                        "Expertise in modern technologies and cloud platforms",
                        "Industry-ready skills for software development roles"
                    ],
                    "eligibility": "12th Pass (Any Stream)",
                    "intake": "July & January",
                    "seo": {
                        "title": "BCA Degree Program in Jaipur - GRRAS Solutions",
                        "description": "Industry-integrated BCA degree at GRRAS Solutions with cloud computing and DevOps specializations.",
                        "keywords": "BCA degree Jaipur, computer applications course, IT degree program"
                    }
                },
                {
                    "slug": "redhat-certifications", 
                    "title": "Red Hat Certifications",
                    "oneLiner": "Official Red Hat Training & Certification Programs",
                    "description": "Official Red Hat authorized training covering RHCSA, RHCE, and OpenShift certifications with hands-on lab experience and expert instruction from certified trainers.",
                    "duration": "4-6 Months",
                    "fees": "₹35,000 - ₹65,000 (Per Certification)",
                    "tools": ["RHCSA", "RHCE", "DO188 (OpenShift Dev)", "DO280 (OpenShift Admin)", "OpenShift with AI"],
                    "visible": True,
                    "featured": True,
                    "order": 3,
                    "thumbnailUrl": "",
                    "category": "certification",
                    "level": "Intermediate",
                    "mode": ["Classroom", "Online"],
                    "highlights": ["Official Red Hat Training", "Certified Instructors", "Hands-on Lab Environment", "Exam Vouchers Included"],
                    "outcomes": [
                        "Master Red Hat Enterprise Linux administration",
                        "Advanced system administration and automation",
                        "OpenShift container platform expertise"
                    ],
                    "eligibility": "Basic Linux Knowledge",
                    "intake": "Monthly",
                    "seo": {
                        "title": "Red Hat Certification Training in Jaipur - GRRAS Solutions", 
                        "description": "Official Red Hat RHCSA, RHCE, OpenShift training with certified instructors at GRRAS Solutions.",
                        "keywords": "Red Hat certification Jaipur, RHCSA RHCE training, OpenShift course"
                    }
                },
                {
                    "slug": "data-science-machine-learning",
                    "title": "Data Science & Machine Learning", 
                    "oneLiner": "Complete Data Science & Machine Learning Program",
                    "description": "Comprehensive data science program covering statistics, Python programming, machine learning algorithms, deep learning, and real-world project implementation.",
                    "duration": "8 Months",
                    "fees": "₹55,000 (EMI Available)",
                    "tools": ["Python", "Statistics", "Pandas & NumPy", "Scikit-learn", "TensorFlow/Keras"],
                    "visible": True,
                    "featured": True,
                    "order": 4,
                    "thumbnailUrl": "",
                    "category": "programming",
                    "level": "Beginner to Advanced",
                    "mode": ["Classroom", "Online"],
                    "highlights": ["Python & R Programming", "Real Dataset Projects", "Industry Mentorship", "Portfolio Development"],
                    "outcomes": [
                        "Master Python for data science and analytics",
                        "Implement machine learning algorithms from scratch",
                        "Work with real datasets and business problems"
                    ],
                    "eligibility": "Graduate (Any Stream)",
                    "intake": "Bi-monthly",
                    "seo": {
                        "title": "Data Science & Machine Learning Course in Jaipur - GRRAS Solutions",
                        "description": "Complete Data Science and ML training with Python, statistics, and real projects at GRRAS Solutions.",
                        "keywords": "Data Science course Jaipur, Machine Learning training, Python data analytics"
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
                },
                "footer": {
                    "quickLinks": [
                        {"label": "About Us", "href": "/about", "order": 1},
                        {"label": "Courses", "href": "/courses", "order": 2},
                        {"label": "Admissions", "href": "/admissions", "order": 3},
                        {"label": "Testimonials", "href": "/testimonials", "order": 4},
                        {"label": "Blog", "href": "/blog", "order": 5},
                        {"label": "Contact", "href": "/contact", "order": 6}
                    ],
                    "popularCoursesLimit": 6
                }
            },
            "faqs": [
                {
                    "id": "faq1",
                    "question": "Do you provide placement assistance?",
                    "answer": "Yes, we provide 100% placement assistance with our network of 100+ hiring partners including top IT companies.",
                    "category": "placement",
                    "order": 1,
                    "visible": True
                },
                {
                    "id": "faq2", 
                    "question": "What are the admission requirements?",
                    "answer": "For our degree programs, you need 12th pass. For professional courses, basic computer knowledge is preferred but not mandatory.",
                    "category": "admissions",
                    "order": 2,
                    "visible": True
                },
                {
                    "id": "faq3",
                    "question": "Do you offer EMI options?", 
                    "answer": "Yes, we provide flexible EMI options for all our courses. Contact our admission team for details.",
                    "category": "fees",
                    "order": 3,
                    "visible": True
                }
            ],
            "testimonials": [
                {
                    "id": "test1",
                    "name": "Priya Sharma",
                    "role": "DevOps Engineer at TCS",
                    "courseTag": "DevOps Training",
                    "quote": "GRRAS transformed my career! The DevOps training was comprehensive and the placement support was excellent.",
                    "year": "2024",
                    "rating": 5,
                    "avatar": "",
                    "order": 1,
                    "featured": True,
                    "visible": True
                },
                {
                    "id": "test2",
                    "name": "Rahul Agrawal", 
                    "role": "Data Scientist at Infosys",
                    "courseTag": "Data Science & ML",
                    "quote": "Best decision I made was joining GRRAS for Data Science. The practical approach and mentorship were outstanding.",
                    "year": "2024",
                    "rating": 5,
                    "avatar": "",
                    "order": 2,
                    "featured": True,
                    "visible": True
                },
                {
                    "id": "test3",
                    "name": "Sneha Patel",
                    "role": "Software Developer at Wipro", 
                    "courseTag": "BCA Degree Program",
                    "quote": "The BCA program at GRRAS gave me both degree and industry skills. Highly recommend!",
                    "year": "2023",
                    "rating": 5,
                    "avatar": "",
                    "order": 3,
                    "featured": True,
                    "visible": True
                }
            ],
            "blog": {
                "settings": {
                    "postsPerPage": 6,
                    "enableComments": False,
                    "moderateComments": True
                },
                "posts": [
                    {
                        "slug": "what-is-devops-beginners-guide-2025",
                        "title": "What is DevOps? A Beginner's Guide (2025)",
                        "summary": "DevOps is revolutionizing software development. Learn what DevOps is, why it matters, and how to start your DevOps career in 2025.",
                        "body": "<p>DevOps has become one of the most sought-after skills in the technology industry...</p>",
                        "coverImage": "",
                        "tags": ["DevOps", "Career", "Technology", "AWS", "Cloud"],
                        "author": "GRRAS Team",
                        "publishAt": "2025-01-15T00:00:00Z",
                        "status": "published",
                        "featured": True,
                        "seo": {
                            "title": "What is DevOps? Complete Beginner's Guide 2025 - GRRAS Blog",
                            "description": "Learn DevOps fundamentals, career opportunities, and how to get started in 2025. Complete guide for beginners.",
                            "keywords": "DevOps beginner guide, DevOps career, DevOps 2025"
                        }
                    },
                    {
                        "slug": "why-bca-industry-training-future",
                        "title": "Why BCA with Industry Training is the Future",
                        "summary": "Traditional BCA programs are evolving. Discover how industry-integrated BCA degrees prepare you for modern tech careers.",
                        "body": "<p>The Bachelor of Computer Applications (BCA) degree is undergoing a transformation...</p>",
                        "coverImage": "",
                        "tags": ["BCA", "Education", "Career", "Industry Training"],
                        "author": "Dr. Rajesh Sharma",
                        "publishAt": "2025-01-12T00:00:00Z",
                        "status": "published",
                        "featured": True,
                        "seo": {
                            "title": "BCA with Industry Training - Future of Computer Education - GRRAS Blog",
                            "description": "Discover why industry-integrated BCA programs are the future of computer education and career success.",
                            "keywords": "BCA industry training, computer education future, IT degree"
                        }
                    }
                ]
            },
            "banners": [
                {
                    "id": "admission-open",
                    "text": "🎓 Admissions Open for 2025 Batch! Limited Seats Available. Apply Now!",
                    "link": "/admissions",
                    "backgroundColor": "#DC2626",
                    "textColor": "#FFFFFF",
                    "startDate": "2025-01-01T00:00:00Z",
                    "endDate": "2025-12-31T23:59:59Z",
                    "dismissible": True,
                    "visible": True,
                    "order": 1
                }
            ],
            "settings": {
                "site": {
                    "title": "GRRAS Solutions Training Institute",
                    "description": "Premier IT training institute in Jaipur offering BCA degree, DevOps, Red Hat certifications with placement assistance.",
                    "keywords": "IT training Jaipur, BCA degree, DevOps training, Red Hat certification",
                    "author": "GRRAS Solutions Training Institute",
                    "language": "en-IN",
                    "timezone": "Asia/Kolkata"
                },
                "seo": {
                    "enableSitemap": True,
                    "enableRobotsTxt": True,
                    "googleAnalyticsId": "",
                    "googleTagManagerId": "",
                    "facebookPixelId": "",
                    "enableStructuredData": True
                },
                "features": {
                    "enableWhatsAppFloat": True,
                    "enableBlogComments": False,
                    "enableNewsletter": True,
                    "enableLiveChat": False
                },
                "backup": {
                    "enableAutoBackup": True,
                    "backupFrequency": "daily",
                    "retainBackups": 30
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
            # Create version backup before saving (local backup only)
            await self._create_version_backup(content, user)
            
            # Update metadata
            content["meta"]["lastModified"] = datetime.now(timezone.utc).isoformat()
            content["meta"]["modifiedBy"] = user
            content["meta"]["isDraft"] = is_draft
            content["settings"]["lastUpdated"] = datetime.now(timezone.utc).isoformat()
            
            # Get current content for audit
            current_content = await self.get_content()
            
            # MONGODB ONLY - No JSON fallbacks
            result = await self._save_content_mongo(content)
            logging.info("✅ Content saved to MongoDB (Single Source of Truth)")
            
            # Create audit log (MongoDB only)
            await self._create_audit_log(user, current_content, content, is_draft)
            
            return result
        except Exception as e:
            logging.error(f"❌ CRITICAL: Failed to save content to MongoDB: {e}")
            raise HTTPException(
                status_code=503,
                detail="Failed to save content. Please check database connection."
            )
    
    async def publish_content(self, user: str = "admin") -> Dict[str, Any]:
        """Publish draft content"""
        content = await self.get_content()
        if content["meta"].get("isDraft", False):
            content["meta"]["isDraft"] = False
            content["meta"]["publishedAt"] = datetime.now(timezone.utc).isoformat()
            content["meta"]["publishedBy"] = user
            return await self.save_content(content, user, is_draft=False)
        return content
    
    async def get_version_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Get version history"""
        try:
            versions = []
            if os.path.exists(self.versions_dir):
                version_files = [f for f in os.listdir(self.versions_dir) if f.endswith('.json')]
                version_files.sort(reverse=True)  # Most recent first
                
                for file in version_files[:limit]:
                    file_path = os.path.join(self.versions_dir, file)
                    async with aiofiles.open(file_path, 'r') as f:
                        version_data = json.loads(await f.read())
                        versions.append({
                            "id": file.replace('.json', ''),
                            "timestamp": version_data.get("timestamp"),
                            "user": version_data.get("user"),
                            "summary": version_data.get("summary", "Content update"),
                            "isDraft": version_data.get("content", {}).get("meta", {}).get("isDraft", False)
                        })
            
            return versions
        except Exception as e:
            logging.error(f"Error getting version history: {e}")
            return []
    
    async def restore_version(self, version_id: str, user: str = "admin") -> Dict[str, Any]:
        """Restore content from a specific version"""
        try:
            version_file = os.path.join(self.versions_dir, f"{version_id}.json")
            if os.path.exists(version_file):
                async with aiofiles.open(version_file, 'r') as f:
                    version_data = json.loads(await f.read())
                    content = version_data["content"]
                    
                    # Update metadata for restoration
                    content["meta"]["lastModified"] = datetime.now(timezone.utc).isoformat()
                    content["meta"]["modifiedBy"] = user
                    content["meta"]["restoredFrom"] = version_id
                    
                    return await self.save_content(content, user)
            else:
                raise Exception("Version not found")
        except Exception as e:
            logging.error(f"Error restoring version: {e}")
            raise e
    
    async def create_backup(self, user: str = "admin") -> str:
        """Create a manual backup"""
        try:
            content = await self.get_content()
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            backup_filename = f"backup_{timestamp}_{user}.json"
            backup_path = os.path.join(self.backups_dir, backup_filename)
            
            backup_data = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "user": user,
                "type": "manual",
                "content": content
            }
            
            async with aiofiles.open(backup_path, 'w') as f:
                await f.write(json.dumps(backup_data, indent=2, default=str))
            
            return backup_filename
        except Exception as e:
            logging.error(f"Error creating backup: {e}")
            raise e
    
    async def get_backups(self) -> List[Dict[str, Any]]:
        """Get list of available backups"""
        try:
            backups = []
            if os.path.exists(self.backups_dir):
                backup_files = [f for f in os.listdir(self.backups_dir) if f.endswith('.json')]
                backup_files.sort(reverse=True)
                
                for file in backup_files:
                    file_path = os.path.join(self.backups_dir, file)
                    try:
                        async with aiofiles.open(file_path, 'r') as f:
                            backup_data = json.loads(await f.read())
                            backups.append({
                                "filename": file,
                                "timestamp": backup_data.get("timestamp"),
                                "user": backup_data.get("user"),
                                "type": backup_data.get("type", "manual"),
                                "size": os.path.getsize(file_path)
                            })
                    except Exception as e:
                        logging.error(f"Error reading backup file {file}: {e}")
                        continue
            
            return backups
        except Exception as e:
            logging.error(f"Error getting backups: {e}")
            return []
    
    async def restore_backup(self, filename: str, user: str = "admin") -> Dict[str, Any]:
        """Restore content from backup"""
        try:
            backup_path = os.path.join(self.backups_dir, filename)
            if os.path.exists(backup_path):
                async with aiofiles.open(backup_path, 'r') as f:
                    backup_data = json.loads(await f.read())
                    content = backup_data["content"]
                    
                    # Update metadata for restoration
                    content["meta"]["lastModified"] = datetime.now(timezone.utc).isoformat()
                    content["meta"]["modifiedBy"] = user
                    content["meta"]["restoredFromBackup"] = filename
                    
                    return await self.save_content(content, user)
            else:
                raise Exception("Backup not found")
        except Exception as e:
            logging.error(f"Error restoring backup: {e}")
            raise e
    
    async def cleanup_old_backups(self, retain_count: int = 30):
        """Clean up old backup files"""
        try:
            if os.path.exists(self.backups_dir):
                backup_files = [f for f in os.listdir(self.backups_dir) if f.endswith('.json')]
                backup_files.sort(reverse=True)
                
                if len(backup_files) > retain_count:
                    for file in backup_files[retain_count:]:
                        file_path = os.path.join(self.backups_dir, file)
                        os.remove(file_path)
                        logging.info(f"Removed old backup: {file}")
        except Exception as e:
            logging.error(f"Error cleaning up backups: {e}")
    
    async def _create_version_backup(self, content: Dict[str, Any], user: str):
        """Create a version backup before saving"""
        try:
            current_content = await self.get_content()
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S_%f")[:-3]  # Include microseconds
            version_id = f"v_{timestamp}_{user}"
            version_file = os.path.join(self.versions_dir, f"{version_id}.json")
            
            version_data = {
                "id": version_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "user": user,
                "summary": self._get_diff_summary(current_content, content),
                "content": current_content
            }
            
            async with aiofiles.open(version_file, 'w') as f:
                await f.write(json.dumps(version_data, indent=2, default=str))
            
            # Clean up old versions (keep last 50)
            await self._cleanup_old_versions(50)
            
        except Exception as e:
            logging.error(f"Error creating version backup: {e}")
    
    async def _cleanup_old_versions(self, retain_count: int = 50):
        """Clean up old version files"""
        try:
            if os.path.exists(self.versions_dir):
                version_files = [f for f in os.listdir(self.versions_dir) if f.endswith('.json')]
                version_files.sort(reverse=True)
                
                if len(version_files) > retain_count:
                    for file in version_files[retain_count:]:
                        file_path = os.path.join(self.versions_dir, file)
                        os.remove(file_path)
        except Exception as e:
            logging.error(f"Error cleaning up versions: {e}")
    
    async def get_media_files(self) -> List[Dict[str, Any]]:
        """Get list of uploaded media files"""
        try:
            media_files = []
            if os.path.exists(self.media_dir):
                for file in os.listdir(self.media_dir):
                    file_path = os.path.join(self.media_dir, file)
                    if os.path.isfile(file_path):
                        stat = os.stat(file_path)
                        media_files.append({
                            "filename": file,
                            "size": stat.st_size,
                            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                            "url": f"/media/{file}"
                        })
            
            return sorted(media_files, key=lambda x: x["modified"], reverse=True)
        except Exception as e:
            logging.error(f"Error getting media files: {e}")
            return []
    
    async def save_media_file(self, filename: str, file_content: bytes) -> str:
        """Save uploaded media file"""
        try:
            file_path = os.path.join(self.media_dir, filename)
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(file_content)
            
            return f"/media/{filename}"
        except Exception as e:
            logging.error(f"Error saving media file: {e}")
            raise e
    
    async def delete_media_file(self, filename: str) -> bool:
        """Delete media file"""
        try:
            file_path = os.path.join(self.media_dir, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            logging.error(f"Error deleting media file: {e}")
            raise e
    
    async def get_audit_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get audit logs from MongoDB ONLY"""
        return await self._get_audit_mongo(limit)
    
    async def _get_content_json(self) -> Dict[str, Any]:
        """Get content from JSON file with persistent storage"""
        try:
            # FIRST: Check if runtime content exists (this is user's saved data)
            if os.path.exists(self.json_file):
                async with aiofiles.open(self.json_file, 'r') as f:
                    content = json.loads(await f.read())
                logging.info(f"✅ Loaded CMS content from persistent storage: {self.json_file}")
                return content
            
            # SECOND: Runtime file doesn't exist - this is first run after deploy
            logging.warning(f"🔄 Runtime content not found at {self.json_file}, initializing...")
            
            # Try to load from template file (git-tracked initial content)
            template_content = None
            if os.path.exists(self.template_file):
                try:
                    async with aiofiles.open(self.template_file, 'r') as f:
                        template_content = json.loads(await f.read())
                    logging.info(f"📋 Loaded template from {self.template_file}")
                except Exception as e:
                    logging.error(f"❌ Could not load template file: {e}")
            
            # Use template or default content for initial setup
            initial_content = template_content or self.get_default_content()
            
            # Save to persistent location immediately
            await self._save_content_json(initial_content)
            logging.info(f"💾 Initial content saved to persistent storage: {self.json_file}")
            
            return initial_content
            
        except Exception as e:
            logging.error(f"❌ CRITICAL ERROR in _get_content_json: {e}")
            # Emergency fallback
            default_content = self.get_default_content()
            try:
                await self._save_content_json(default_content)
                logging.info("🚨 Emergency fallback content saved")
            except:
                logging.error("🚨 COULD NOT SAVE EMERGENCY FALLBACK")
            return default_content
    
    async def _save_content_json(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Save content to JSON file"""
        try:
            async with aiofiles.open(self.json_file, 'w') as f:
                await f.write(json.dumps(content, indent=2, default=str))
            return content
        except Exception as e:
            logging.error(f"Error saving content JSON: {e}")
            raise e
    
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
                # Return default content and save it
                default_content = self.get_default_content()
                await self._save_content_mongo(default_content)
                return default_content
        except Exception as e:
            logging.error(f"Error reading content from MongoDB: {e}")
            return self.get_default_content()
    
    async def _save_content_mongo(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Save content to MongoDB"""
        try:
            db = self.mongo_client[self.db_name]
            content_doc = {**content, "type": "site_content"}
            
            await db.content.replace_one(
                {"type": "site_content"}, 
                content_doc, 
                upsert=True
            )
            return content
        except Exception as e:
            logging.error(f"Error saving content to MongoDB: {e}")
            raise e
    
    async def _create_audit_log(self, user: str, old_content: Dict[str, Any], new_content: Dict[str, Any], is_draft: bool = False):
        """Create audit log entry in MongoDB ONLY"""
        audit_entry = {
            "user": user,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "changedKeys": self._get_changed_keys(old_content, new_content),
            "diffSummary": self._get_diff_summary(old_content, new_content),
            "isDraft": is_draft,
            "action": "draft" if is_draft else "publish"
        }
        
        # MONGODB ONLY - No JSON fallbacks
        await self._save_audit_mongo(audit_entry)
    
    def _get_changed_keys(self, old_content: Dict[str, Any], new_content: Dict[str, Any]) -> List[str]:
        """Get list of changed keys"""
        changed_keys = []
        
        def compare_dicts(old_dict, new_dict, prefix=""):
            for key in set(list(old_dict.keys()) + list(new_dict.keys())):
                full_key = f"{prefix}.{key}" if prefix else key
                
                if key not in old_dict:
                    changed_keys.append(f"added:{full_key}")
                elif key not in new_dict:
                    changed_keys.append(f"removed:{full_key}")
                elif isinstance(old_dict[key], dict) and isinstance(new_dict[key], dict):
                    compare_dicts(old_dict[key], new_dict[key], full_key)
                elif old_dict[key] != new_dict[key]:
                    changed_keys.append(f"modified:{full_key}")
        
        compare_dicts(old_content, new_content)
        return changed_keys
    
    def _get_diff_summary(self, old_content: Dict[str, Any], new_content: Dict[str, Any]) -> str:
        """Get human-readable diff summary"""
        changed_keys = self._get_changed_keys(old_content, new_content)
        
        if not changed_keys:
            return "No changes detected"
        
        summary_parts = []
        
        # Categorize changes
        added = [k for k in changed_keys if k.startswith("added:")]
        removed = [k for k in changed_keys if k.startswith("removed:")]
        modified = [k for k in changed_keys if k.startswith("modified:")]
        
        if added:
            summary_parts.append(f"Added: {len(added)} items")
        if removed:
            summary_parts.append(f"Removed: {len(removed)} items") 
        if modified:
            summary_parts.append(f"Modified: {len(modified)} items")
        
        return "; ".join(summary_parts)
    
    async def _get_audit_json(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get audit logs from JSON file"""
        try:
            if os.path.exists(self.audit_file):
                async with aiofiles.open(self.audit_file, 'r') as f:
                    logs = json.loads(await f.read())
                return sorted(logs, key=lambda x: x['timestamp'], reverse=True)[:limit]
            else:
                return []
        except Exception as e:
            logging.error(f"Error reading audit logs: {e}")
            return []
    
    async def _save_audit_json(self, audit_entry: Dict[str, Any]):
        """Save audit log to JSON file"""
        try:
            logs = await self._get_audit_json(1000)  # Keep last 1000 logs
            logs.insert(0, audit_entry)  # Add new entry at beginning
            
            async with aiofiles.open(self.audit_file, 'w') as f:
                await f.write(json.dumps(logs[:1000], indent=2, default=str))  # Keep only last 1000
        except Exception as e:
            logging.error(f"Error saving audit log: {e}")
    
    async def _get_audit_mongo(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get audit logs from MongoDB"""
        try:
            db = self.mongo_client[self.db_name]
            cursor = db.content_audit.find().sort('timestamp', -1).limit(limit)
            logs = await cursor.to_list(length=limit)
            
            for log in logs:
                log.pop('_id', None)  # Remove MongoDB _id field
            
            return logs
        except Exception as e:
            logging.error(f"Error reading audit logs from MongoDB: {e}")
            return []
    
    async def _save_audit_mongo(self, audit_entry: Dict[str, Any]):
        """Save audit log to MongoDB"""
        try:
            db = self.mongo_client[self.db_name]
            await db.content_audit.insert_one(audit_entry)
            
            # Keep only last 1000 audit logs
            count = await db.content_audit.count_documents({})
            if count > 1000:
                oldest_docs = db.content_audit.find().sort('timestamp', 1).limit(count - 1000)
                oldest_ids = [doc['_id'] async for doc in oldest_docs]
                if oldest_ids:
                    await db.content_audit.delete_many({'_id': {'$in': oldest_ids}})
                    
        except Exception as e:
            logging.error(f"Error saving audit log to MongoDB: {e}")
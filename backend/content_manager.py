import os
import json
import aiofiles
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import logging

class ContentManager:
    def __init__(self, storage_type: str = "json", mongo_client=None, db_name: str = "grras_database"):
        self.storage_type = storage_type
        self.mongo_client = mongo_client
        self.db_name = db_name
        self.json_file = '/app/backend/data/content.json'
        self.audit_file = '/app/backend/data/content_audit.json'
        
        # Ensure data directory exists
        os.makedirs('/app/backend/data', exist_ok=True)
    
import os
import json
import aiofiles
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import uuid
import shutil

class ContentManager:
    def __init__(self, storage_type: str = "json", mongo_client=None, db_name: str = "grras_database"):
        self.storage_type = storage_type
        self.mongo_client = mongo_client
        self.db_name = db_name
        self.json_file = '/app/backend/data/content.json'
        self.audit_file = '/app/backend/data/content_audit.json'
        self.versions_dir = '/app/backend/data/versions'
        self.media_dir = '/app/backend/data/media'
        self.backups_dir = '/app/backend/data/backups'
        
        # Ensure data directories exist
        for dir_path in ['/app/backend/data', self.versions_dir, self.media_dir, self.backups_dir]:
            os.makedirs(dir_path, exist_ok=True)
    
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
        """Get content from storage"""
        if self.storage_type == "mongo" and self.mongo_client:
            return await self._get_content_mongo()
        else:
            return await self._get_content_json()
    
    async def save_content(self, content: Dict[str, Any], user: str = "admin") -> Dict[str, Any]:
        """Save content to storage and create audit log"""
        # Update lastUpdated timestamp
        content["settings"]["lastUpdated"] = datetime.now(timezone.utc).isoformat()
        
        # Get current content for audit
        current_content = await self.get_content()
        
        # Save content
        if self.storage_type == "mongo" and self.mongo_client:
            result = await self._save_content_mongo(content)
        else:
            result = await self._save_content_json(content)
        
        # Create audit log
        await self._create_audit_log(user, current_content, content)
        
        return result
    
    async def get_audit_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get audit logs"""
        if self.storage_type == "mongo" and self.mongo_client:
            return await self._get_audit_mongo(limit)
        else:
            return await self._get_audit_json(limit)
    
    async def _get_content_json(self) -> Dict[str, Any]:
        """Get content from JSON file"""
        try:
            if os.path.exists(self.json_file):
                async with aiofiles.open(self.json_file, 'r') as f:
                    content = json.loads(await f.read())
                return content
            else:
                # Return default content and save it
                default_content = self.get_default_content()
                await self._save_content_json(default_content)
                return default_content
        except Exception as e:
            logging.error(f"Error reading content JSON: {e}")
            return self.get_default_content()
    
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
    
    async def _create_audit_log(self, user: str, old_content: Dict[str, Any], new_content: Dict[str, Any]):
        """Create audit log entry"""
        audit_entry = {
            "user": user,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "changedKeys": self._get_changed_keys(old_content, new_content),
            "diffSummary": self._get_diff_summary(old_content, new_content)
        }
        
        if self.storage_type == "mongo" and self.mongo_client:
            await self._save_audit_mongo(audit_entry)
        else:
            await self._save_audit_json(audit_entry)
    
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
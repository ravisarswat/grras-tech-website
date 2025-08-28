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
    
    def get_default_content(self) -> Dict[str, Any]:
        """Return the default content structure"""
        return {
            "branding": {
                "logoUrl": "https://customer-assets.emergentagent.com/job_training-hub-29/artifacts/gl3ldkmg_white%20logo.png",
                "colors": {
                    "primary": "#DC2626",
                    "secondary": "#EA580C", 
                    "accent": "#16A34A",
                    "dark": "#1F2937",
                    "light": "#F3F4F6"
                }
            },
            "institute": {
                "name": "GRRAS Solutions Training Institute",
                "address": "A-81, Singh Bhoomi Khatipura Rd, behind Marudhar Hospital, Jaipur, Rajasthan 302012",
                "phone": "090019 91227",
                "email": "info@grrassolutions.com",
                "social": {
                    "whatsapp": "https://wa.me/919001991227",
                    "instagram": "#",
                    "youtube": "#"
                }
            },
            "home": {
                "heroHeadline": "Empowering Students with World-Class IT & Cloud Education",
                "heroSubtext": "From Degree Programs to Cutting-Edge Certifications",
                "ctaPrimaryLabel": "Explore Courses",
                "ctaPrimaryHref": "/courses",
                "ctaSecondaryLabel": "Apply Now", 
                "ctaSecondaryHref": "/admissions"
            },
            "about": {
                "headline": "About GRRAS Solutions",
                "mission": "To provide world-class IT education and training that bridges the gap between academic learning and industry requirements.",
                "vision": "To be the leading IT training institute in India, recognized for excellence in education, innovation in teaching methodologies, and success in producing industry-ready professionals.",
                "body": "GRRAS Solutions Training Institute has been empowering students with world-class IT education since 2014. We offer industry-relevant courses, recognized degrees, and guaranteed placement assistance."
            },
            "courses": [
                {
                    "slug": "devops-training",
                    "title": "DevOps Training", 
                    "oneLiner": "Master Modern DevOps Practices & Cloud Technologies",
                    "duration": "6 Months",
                    "fees": "₹45,000 (EMI Available)",
                    "tools": ["Linux (RHCSA)", "Linux Server Administration", "Ansible", "AWS", "Terraform", "Docker", "Kubernetes", "Jenkins", "GitHub"],
                    "visible": True,
                    "order": 1,
                    "thumbnailUrl": "",
                    "category": "cloud",
                    "level": "Intermediate"
                },
                {
                    "slug": "bca-degree",
                    "title": "BCA Degree Program",
                    "oneLiner": "Industry-Integrated Bachelor Degree Program", 
                    "duration": "3 Years",
                    "fees": "Contact for Details",
                    "tools": ["Programming in C", "Java", "DBMS", "Web Technologies", "Cloud & DevOps Basics", "AI/ML Basics"],
                    "visible": True,
                    "order": 2,
                    "thumbnailUrl": "",
                    "category": "degree",
                    "level": "Beginner to Advanced"
                },
                {
                    "slug": "redhat-certifications", 
                    "title": "Red Hat Certifications",
                    "oneLiner": "Official Red Hat Training & Certification Programs",
                    "duration": "4-6 Months",
                    "fees": "₹35,000 - ₹65,000 (Per Certification)",
                    "tools": ["RHCSA", "RHCE", "DO188 (OpenShift Dev)", "DO280 (OpenShift Admin)", "OpenShift with AI"],
                    "visible": True,
                    "order": 3,
                    "thumbnailUrl": "",
                    "category": "certification",
                    "level": "Intermediate"
                },
                {
                    "slug": "data-science-machine-learning",
                    "title": "Data Science & Machine Learning", 
                    "oneLiner": "Complete Data Science & Machine Learning Program",
                    "duration": "8 Months",
                    "fees": "₹55,000 (EMI Available)",
                    "tools": ["Python", "Statistics", "Pandas & NumPy", "Scikit-learn", "TensorFlow/Keras"],
                    "visible": True,
                    "order": 4,
                    "thumbnailUrl": "",
                    "category": "programming",
                    "level": "Beginner to Advanced"
                },
                {
                    "slug": "java-salesforce",
                    "title": "Java & Salesforce",
                    "oneLiner": "Enterprise Java & Salesforce Development", 
                    "duration": "6 Months",
                    "fees": "₹40,000 (EMI Available)",
                    "tools": ["Core Java", "Advanced Java", "Salesforce Admin", "Salesforce Developer"],
                    "visible": True,
                    "order": 5,
                    "thumbnailUrl": "",
                    "category": "programming",
                    "level": "Intermediate"
                },
                {
                    "slug": "python",
                    "title": "Python",
                    "oneLiner": "Complete Python Programming & Web Development",
                    "duration": "4 Months", 
                    "fees": "₹25,000 (EMI Available)",
                    "tools": ["Python Core", "OOP in Python", "NumPy", "Pandas", "Flask/Django Basics"],
                    "visible": True,
                    "order": 6,
                    "thumbnailUrl": "",
                    "category": "programming",
                    "level": "Beginner to Intermediate"
                },
                {
                    "slug": "c-cpp-dsa",
                    "title": "C/C++ & DSA",
                    "oneLiner": "Foundation Programming with C/C++ & Data Structures", 
                    "duration": "5 Months",
                    "fees": "₹20,000 (EMI Available)",
                    "tools": ["C", "C++ (OOP)", "Data Structures", "Algorithms", "Problem Solving"],
                    "visible": True,
                    "order": 7,
                    "thumbnailUrl": "",
                    "category": "programming", 
                    "level": "Beginner"
                }
            ],
            "faqs": [
                {
                    "id": "faq1",
                    "question": "Do you provide placement assistance?",
                    "answer": "Yes, we provide 100% placement assistance with our network of 100+ hiring partners including top IT companies.",
                    "category": "placement",
                    "order": 1
                },
                {
                    "id": "faq2", 
                    "question": "What are the admission requirements?",
                    "answer": "For our degree programs, you need 12th pass. For professional courses, basic computer knowledge is preferred but not mandatory.",
                    "category": "admissions",
                    "order": 2
                },
                {
                    "id": "faq3",
                    "question": "Do you offer EMI options?", 
                    "answer": "Yes, we provide flexible EMI options for all our courses. Contact our admission team for details.",
                    "category": "fees",
                    "order": 3
                }
            ],
            "testimonials": [
                {
                    "id": "test1",
                    "name": "Priya Sharma",
                    "role": "DevOps Engineer at TCS",
                    "course": "DevOps Training",
                    "text": "GRRAS transformed my career! The DevOps training was comprehensive and the placement support was excellent.",
                    "rating": 5,
                    "order": 1,
                    "featured": True
                },
                {
                    "id": "test2",
                    "name": "Rahul Agrawal", 
                    "role": "Data Scientist at Infosys",
                    "course": "Data Science & ML",
                    "text": "Best decision I made was joining GRRAS for Data Science. The practical approach and mentorship were outstanding.",
                    "rating": 5,
                    "order": 2,
                    "featured": True
                },
                {
                    "id": "test3",
                    "name": "Sneha Patel",
                    "role": "Software Developer at Wipro", 
                    "course": "BCA Degree Program",
                    "text": "The BCA program at GRRAS gave me both degree and industry skills. Highly recommend!",
                    "rating": 5,
                    "order": 3,
                    "featured": True
                }
            ],
            "settings": {
                "seoTitle": "GRRAS Solutions Training Institute - IT & Cloud Education in Jaipur",
                "seoDescription": "Premier IT training institute in Jaipur offering BCA degree, DevOps, Red Hat certifications, Data Science, Python, Java & Salesforce courses with placement assistance.",
                "seoKeywords": "IT training Jaipur, BCA degree, DevOps training, Red Hat certification, Data Science course, Python training, Java Salesforce",
                "lastUpdated": datetime.now(timezone.utc).isoformat()
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
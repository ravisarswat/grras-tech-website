import os
import json
import aiofiles
import logging
from typing import Dict, List, Optional
import motor.motor_asyncio
from datetime import datetime

class ContentManager:
    def __init__(self, mongo_client=None, db_name=None):
        self.mongo_client = mongo_client
        self.db_name = db_name or os.environ.get('DB_NAME', 'grras_database')
        
        if not self.mongo_client:
            raise ValueError("MongoDB client is required. No JSON fallbacks allowed for production.")
    
    async def get_content(self) -> Dict:
        """Get content from MongoDB ONLY - Single Source of Truth"""
        try:
            # Always fetch fresh data from MongoDB
            content = await self._get_content_mongo()
            if content:
                categories_count = len(content.get('courseCategories', {}))
                courses_count = len(content.get('courses', []))
                logging.info(f"✅ Fresh content from MongoDB - {categories_count} categories, {courses_count} courses")
                return content
            else:
                logging.error("❌ No content found in MongoDB")
                # Return minimal structure instead of template
                return {
                    "courses": [],
                    "courseCategories": {},
                    "institute": {
                        "name": "GRRAS Solutions",
                        "tagline": "Transform Your Career with Industry-Ready Skills"
                    },
                    "learningPaths": []
                }
        except Exception as e:
            logging.error(f"❌ Error in get_content: {e}")
            return {
                "courses": [],
                "courseCategories": {},
                "institute": {"name": "GRRAS Solutions"},
                "learningPaths": []
            }

    async def _get_content_mongo(self) -> Optional[Dict]:
        """Get content from MongoDB"""
        try:
            db = self.mongo_client[self.db_name]
            
            # Find the latest content document
            content_doc = await db.content.find_one(
                {"type": "site_content"},
                sort=[("updated_at", -1)]
            )
            
            if content_doc:
                # Remove MongoDB-specific fields
                content_doc.pop('_id', None)
                content_doc.pop('type', None)
                
                logging.info(f"✅ MongoDB content loaded - {len(content_doc.get('courseCategories', {}))} categories")
                return content_doc
            else:
                logging.warning("⚠️ No site_content document found in MongoDB")
                return None
                
        except Exception as e:
            logging.error(f"❌ Error getting content from MongoDB: {e}")
            raise e

    async def save_content(self, content: Dict, user: str = "admin", is_draft: bool = False) -> bool:
        """Save content to MongoDB"""
        try:
            db = self.mongo_client[self.db_name]
            
            # Prepare document for MongoDB
            content_doc = {
                "type": "site_content",
                **content,
                "updated_at": datetime.utcnow(),
                "user": user,
                "is_draft": is_draft
            }
            
            # Replace existing document
            result = await db.content.replace_one(
                {"type": "site_content"},
                content_doc,
                upsert=True
            )
            
            if result.upserted_id or result.modified_count > 0:
                logging.info(f"✅ Content saved to MongoDB by {user}")
                return True
            else:
                logging.warning("⚠️ No changes made to MongoDB content")
                return False
                
        except Exception as e:
            logging.error(f"❌ Error saving content to MongoDB: {e}")
            return False

    async def get_audit_logs(self, limit: int = 100) -> List[Dict]:
        """Get audit logs from MongoDB"""
        try:
            db = self.mongo_client[self.db_name]
            
            logs = []
            async for log in db.audit_logs.find().sort("timestamp", -1).limit(limit):
                log.pop('_id', None)
                logs.append(log)
            
            return logs
        except Exception as e:
            logging.error(f"Error getting audit logs: {e}")
            return []

    async def add_audit_log(self, action: str, user: str, details: Dict = None) -> bool:
        """Add audit log entry"""
        try:
            db = self.mongo_client[self.db_name]
            
            log_entry = {
                "timestamp": datetime.utcnow(),
                "action": action,
                "user": user,
                "details": details or {}
            }
            
            await db.audit_logs.insert_one(log_entry)
            return True
        except Exception as e:
            logging.error(f"Error adding audit log: {e}")
            return False
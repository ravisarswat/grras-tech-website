#!/usr/bin/env python3
"""
Diagnose Backend Database Connection
Check which database the backend is actually connecting to
"""

import asyncio
import requests
import json
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Production database credentials
PRODUCTION_MONGO_URL = "mongodb+srv://ravisarswat_db_user:eackhKxcUXVYpR34@cluster0.bsofcav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "grras_database"
COLLECTION_NAME = "content"

# Backend API URL
BACKEND_URL = "https://grras-seo-optimize.preview.emergentagent.com"
ADMIN_PASSWORD = "grras-admin"

class DatabaseDiagnostic:
    def __init__(self):
        self.production_client = None
        self.local_client = None
        
    async def connect_to_production(self):
        """Connect to production MongoDB"""
        try:
            logger.info("🔗 Connecting to PRODUCTION MongoDB...")
            self.production_client = AsyncIOMotorClient(PRODUCTION_MONGO_URL)
            await self.production_client.admin.command('ping')
            logger.info("✅ Connected to production MongoDB")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to production: {e}")
            return False
    
    async def connect_to_local(self):
        """Connect to local MongoDB"""
        try:
            logger.info("🔗 Connecting to LOCAL MongoDB...")
            local_url = "mongodb://localhost:27017"
            self.local_client = AsyncIOMotorClient(local_url)
            await self.local_client.admin.command('ping')
            logger.info("✅ Connected to local MongoDB")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to local: {e}")
            return False
    
    async def check_database_content(self, client, db_name, label):
        """Check content in a specific database"""
        try:
            logger.info(f"🔍 Checking {label} database content...")
            
            db = client[db_name]
            collection = db[COLLECTION_NAME]
            
            content_doc = await collection.find_one({})
            if not content_doc:
                logger.warning(f"⚠️ No content document found in {label}")
                return None
            
            course_categories = content_doc.get('courseCategories', {})
            cleanup_timestamp = content_doc.get('lastCategoriesCleanup')
            
            logger.info(f"📊 {label} Database Results:")
            logger.info(f"   Document ID: {content_doc.get('_id')}")
            logger.info(f"   Total categories: {len(course_categories)}")
            logger.info(f"   Categories: {list(course_categories.keys())}")
            logger.info(f"   Cleanup timestamp: {cleanup_timestamp}")
            
            # Check for old categories
            old_categories = ["general", "cloud", "security", "certification"]
            found_old = [cat for cat in old_categories if cat in course_categories]
            
            if found_old:
                logger.warning(f"⚠️ {label} has old categories: {found_old}")
            else:
                logger.info(f"✅ {label} has no old categories")
            
            return {
                "document_id": str(content_doc.get('_id')),
                "total_categories": len(course_categories),
                "categories": list(course_categories.keys()),
                "cleanup_timestamp": cleanup_timestamp,
                "has_old_categories": len(found_old) > 0,
                "old_categories": found_old
            }
            
        except Exception as e:
            logger.error(f"❌ Error checking {label} database: {e}")
            return None
    
    def check_backend_api_content(self):
        """Check what the backend API returns"""
        try:
            logger.info("🌐 Checking backend API content...")
            
            response = requests.get(f"{BACKEND_URL}/api/content", timeout=10)
            
            if response.status_code == 200:
                content_data = response.json()
                content = content_data.get("content", {})
                course_categories = content.get("courseCategories", {})
                
                logger.info(f"📊 Backend API Results:")
                logger.info(f"   Total categories: {len(course_categories)}")
                logger.info(f"   Categories: {list(course_categories.keys())}")
                
                # Check for old categories
                old_categories = ["general", "cloud", "security", "certification"]
                found_old = [cat for cat in old_categories if cat in course_categories]
                
                if found_old:
                    logger.warning(f"⚠️ Backend API has old categories: {found_old}")
                else:
                    logger.info("✅ Backend API has no old categories")
                
                return {
                    "total_categories": len(course_categories),
                    "categories": list(course_categories.keys()),
                    "has_old_categories": len(found_old) > 0,
                    "old_categories": found_old
                }
                
            else:
                logger.error(f"❌ Backend API failed: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"❌ Backend API check failed: {e}")
            return None
    
    async def close_connections(self):
        """Close all database connections"""
        if self.production_client:
            self.production_client.close()
        if self.local_client:
            self.local_client.close()
        logger.info("🔌 All database connections closed")

async def main():
    """Main diagnostic process"""
    diagnostic = DatabaseDiagnostic()
    
    try:
        logger.info("🚀 STARTING DATABASE DIAGNOSTIC")
        logger.info("=" * 60)
        
        # Check backend API first
        logger.info("1️⃣ Checking Backend API Content...")
        api_result = diagnostic.check_backend_api_content()
        
        # Check production database
        logger.info("\n2️⃣ Checking Production Database...")
        production_connected = await diagnostic.connect_to_production()
        production_result = None
        if production_connected:
            production_result = await diagnostic.check_database_content(
                diagnostic.production_client, DATABASE_NAME, "PRODUCTION"
            )
        
        # Check local database
        logger.info("\n3️⃣ Checking Local Database...")
        local_connected = await diagnostic.connect_to_local()
        local_result = None
        if local_connected:
            local_result = await diagnostic.check_database_content(
                diagnostic.local_client, DATABASE_NAME, "LOCAL"
            )
        
        # Analysis
        logger.info("\n" + "=" * 60)
        logger.info("🔍 DIAGNOSTIC ANALYSIS:")
        
        if api_result and production_result and local_result:
            logger.info("📊 COMPARISON RESULTS:")
            logger.info(f"   Backend API categories: {api_result['categories']}")
            logger.info(f"   Production DB categories: {production_result['categories']}")
            logger.info(f"   Local DB categories: {local_result['categories']}")
            
            # Determine which database the backend is using
            if api_result['categories'] == production_result['categories']:
                logger.info("🎯 CONCLUSION: Backend is connected to PRODUCTION database")
            elif api_result['categories'] == local_result['categories']:
                logger.info("🎯 CONCLUSION: Backend is connected to LOCAL database")
            else:
                logger.warning("⚠️ CONCLUSION: Backend is connected to UNKNOWN database")
            
            # Check cleanup status
            if production_result['has_old_categories']:
                logger.error("❌ Production database still has old categories!")
            else:
                logger.info("✅ Production database is clean")
            
            if api_result['has_old_categories']:
                logger.error("❌ Backend API still returns old categories!")
            else:
                logger.info("✅ Backend API returns clean categories")
        
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ CRITICAL ERROR during diagnostic: {e}")
        return False
    
    finally:
        await diagnostic.close_connections()

if __name__ == "__main__":
    success = asyncio.run(main())
    
    if success:
        print("\n🎯 DIAGNOSTIC COMPLETED")
        print("Check the analysis above to understand the database connections")
    else:
        print("\n❌ DIAGNOSTIC FAILED")
        print("Check logs above for details")
#!/usr/bin/env python3
"""
PRODUCTION DATABASE VERIFICATION TEST
Verify that the courseCategories cleanup was successful and test backend API
"""

import asyncio
import requests
import json
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Production database credentials
PRODUCTION_MONGO_URL = "mongodb+srv://ravisarswat_db_user:eackhKxcUXVYpR34@cluster0.bsofcav.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "grras_database"
COLLECTION_NAME = "content"

# Backend API URL (from frontend .env)
BACKEND_URL = "https://grras-web-revamp.preview.emergentagent.com"
ADMIN_PASSWORD = "grras-admin"

class ProductionVerificationTest:
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None
        self.admin_token = None
        self.test_results = {
            "timestamp": datetime.utcnow().isoformat(),
            "tests": {},
            "summary": {}
        }
        
    async def connect_to_production_db(self):
        """Connect to production MongoDB"""
        try:
            logger.info("🔗 Connecting to production MongoDB...")
            self.client = AsyncIOMotorClient(PRODUCTION_MONGO_URL)
            await self.client.admin.command('ping')
            
            self.db = self.client[DATABASE_NAME]
            self.collection = self.db[COLLECTION_NAME]
            
            logger.info("✅ Connected to production MongoDB")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to production MongoDB: {e}")
            return False
    
    def test_backend_api_health(self):
        """Test backend API health"""
        try:
            logger.info("🏥 Testing backend API health...")
            
            response = requests.get(f"{BACKEND_URL}/api/health", timeout=10)
            
            if response.status_code == 200:
                health_data = response.json()
                logger.info(f"✅ Backend API healthy: {health_data}")
                
                self.test_results["tests"]["api_health"] = {
                    "status": "PASS",
                    "response": health_data,
                    "response_time_ms": response.elapsed.total_seconds() * 1000
                }
                return True
            else:
                logger.error(f"❌ Backend API unhealthy: {response.status_code}")
                self.test_results["tests"]["api_health"] = {
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}",
                    "response": response.text
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Backend API health test failed: {e}")
            self.test_results["tests"]["api_health"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    def test_admin_authentication(self):
        """Test admin authentication"""
        try:
            logger.info("🔐 Testing admin authentication...")
            
            response = requests.post(
                f"{BACKEND_URL}/api/admin/login",
                json={"password": ADMIN_PASSWORD},
                timeout=10
            )
            
            if response.status_code == 200:
                auth_data = response.json()
                self.admin_token = auth_data.get("token")
                logger.info("✅ Admin authentication successful")
                
                self.test_results["tests"]["admin_auth"] = {
                    "status": "PASS",
                    "message": auth_data.get("message"),
                    "token_received": bool(self.admin_token)
                }
                return True
            else:
                logger.error(f"❌ Admin authentication failed: {response.status_code}")
                self.test_results["tests"]["admin_auth"] = {
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}",
                    "response": response.text
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Admin authentication test failed: {e}")
            self.test_results["tests"]["admin_auth"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    def test_content_api_categories(self):
        """Test content API and verify courseCategories"""
        try:
            logger.info("📋 Testing content API and courseCategories...")
            
            response = requests.get(f"{BACKEND_URL}/api/content", timeout=10)
            
            if response.status_code == 200:
                content_data = response.json()
                content = content_data.get("content", {})
                course_categories = content.get("courseCategories", {})
                
                logger.info(f"✅ Content API working - courseCategories count: {len(course_categories)}")
                
                # Check for old categories that should have been removed
                old_categories = ["general", "cloud", "security", "certification"]
                found_old_categories = []
                
                for old_cat in old_categories:
                    if old_cat in course_categories:
                        found_old_categories.append(old_cat)
                
                if found_old_categories:
                    logger.error(f"❌ Old categories still present: {found_old_categories}")
                    self.test_results["tests"]["content_api"] = {
                        "status": "FAIL",
                        "error": f"Old categories found: {found_old_categories}",
                        "total_categories": len(course_categories),
                        "categories": list(course_categories.keys())
                    }
                    return False
                else:
                    logger.info("✅ No old categories found - cleanup successful!")
                    
                    # Log current categories
                    logger.info("📋 Current categories:")
                    for key, value in course_categories.items():
                        logger.info(f"   - {key}: {value.get('name', 'No name')}")
                    
                    self.test_results["tests"]["content_api"] = {
                        "status": "PASS",
                        "total_categories": len(course_categories),
                        "categories": list(course_categories.keys()),
                        "old_categories_removed": True,
                        "cleanup_verified": True
                    }
                    return True
                    
            else:
                logger.error(f"❌ Content API failed: {response.status_code}")
                self.test_results["tests"]["content_api"] = {
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}",
                    "response": response.text
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Content API test failed: {e}")
            self.test_results["tests"]["content_api"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def verify_database_cleanup(self):
        """Verify database cleanup directly"""
        try:
            logger.info("🔍 Verifying database cleanup directly...")
            
            content_doc = await self.collection.find_one({})
            if not content_doc:
                logger.error("❌ No content document found")
                self.test_results["tests"]["database_verification"] = {
                    "status": "FAIL",
                    "error": "No content document found"
                }
                return False
            
            course_categories = content_doc.get('courseCategories', {})
            cleanup_timestamp = content_doc.get('lastCategoriesCleanup')
            
            # Check for old categories
            old_categories = ["general", "cloud", "security", "certification"]
            found_old_categories = []
            
            for old_cat in old_categories:
                if old_cat in course_categories:
                    found_old_categories.append(old_cat)
            
            if found_old_categories:
                logger.error(f"❌ Database still contains old categories: {found_old_categories}")
                self.test_results["tests"]["database_verification"] = {
                    "status": "FAIL",
                    "error": f"Old categories found: {found_old_categories}",
                    "total_categories": len(course_categories),
                    "cleanup_timestamp": cleanup_timestamp
                }
                return False
            else:
                logger.info("✅ Database cleanup verified - no old categories found!")
                logger.info(f"📅 Cleanup timestamp: {cleanup_timestamp}")
                
                self.test_results["tests"]["database_verification"] = {
                    "status": "PASS",
                    "total_categories": len(course_categories),
                    "categories": list(course_categories.keys()),
                    "cleanup_timestamp": cleanup_timestamp,
                    "old_categories_removed": True
                }
                return True
                
        except Exception as e:
            logger.error(f"❌ Database verification failed: {e}")
            self.test_results["tests"]["database_verification"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    def test_frontend_impact_simulation(self):
        """Simulate frontend CategoryManager behavior"""
        try:
            logger.info("🌐 Testing frontend impact simulation...")
            
            # Get content as frontend would
            response = requests.get(f"{BACKEND_URL}/api/content", timeout=10)
            
            if response.status_code == 200:
                content_data = response.json()
                content = content_data.get("content", {})
                course_categories = content.get("courseCategories", {})
                
                # Simulate CategoryManager behavior
                visible_categories = {
                    k: v for k, v in course_categories.items() 
                    if v.get("visible", True)
                }
                
                logger.info(f"🎯 Frontend simulation results:")
                logger.info(f"   Total categories: {len(course_categories)}")
                logger.info(f"   Visible categories: {len(visible_categories)}")
                logger.info(f"   CategoryManager will show: {len(visible_categories)} categories")
                
                if len(course_categories) == 0:
                    logger.info("✅ Frontend will show empty categories list")
                    logger.info("✅ Delete functions will work without interference")
                else:
                    logger.info(f"ℹ️ Frontend will show {len(visible_categories)} user-created categories")
                
                self.test_results["tests"]["frontend_simulation"] = {
                    "status": "PASS",
                    "total_categories": len(course_categories),
                    "visible_categories": len(visible_categories),
                    "category_names": list(visible_categories.keys()),
                    "empty_state": len(course_categories) == 0
                }
                return True
                
            else:
                logger.error(f"❌ Frontend simulation failed: {response.status_code}")
                self.test_results["tests"]["frontend_simulation"] = {
                    "status": "FAIL",
                    "error": f"HTTP {response.status_code}"
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Frontend simulation failed: {e}")
            self.test_results["tests"]["frontend_simulation"] = {
                "status": "FAIL",
                "error": str(e)
            }
            return False
    
    async def close_connection(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("🔌 Database connection closed")
    
    def generate_summary(self):
        """Generate test summary"""
        total_tests = len(self.test_results["tests"])
        passed_tests = sum(1 for test in self.test_results["tests"].values() if test["status"] == "PASS")
        
        self.test_results["summary"] = {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": total_tests - passed_tests,
            "success_rate": f"{(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "0%",
            "overall_status": "PASS" if passed_tests == total_tests else "FAIL"
        }
        
        logger.info("📊 TEST SUMMARY:")
        logger.info(f"   Total tests: {total_tests}")
        logger.info(f"   Passed: {passed_tests}")
        logger.info(f"   Failed: {total_tests - passed_tests}")
        logger.info(f"   Success rate: {self.test_results['summary']['success_rate']}")
        logger.info(f"   Overall status: {self.test_results['summary']['overall_status']}")

async def main():
    """Main verification process"""
    tester = ProductionVerificationTest()
    
    try:
        logger.info("🚀 STARTING PRODUCTION VERIFICATION TEST")
        logger.info("=" * 60)
        
        # Test 1: Backend API Health
        api_health_ok = tester.test_backend_api_health()
        
        # Test 2: Admin Authentication
        admin_auth_ok = tester.test_admin_authentication()
        
        # Test 3: Content API and Categories
        content_api_ok = tester.test_content_api_categories()
        
        # Test 4: Connect to production database
        if await tester.connect_to_production_db():
            # Test 5: Database verification
            db_verification_ok = await tester.verify_database_cleanup()
        else:
            db_verification_ok = False
        
        # Test 6: Frontend impact simulation
        frontend_simulation_ok = tester.test_frontend_impact_simulation()
        
        # Generate summary
        tester.generate_summary()
        
        logger.info("=" * 60)
        
        if tester.test_results["summary"]["overall_status"] == "PASS":
            logger.info("🎉 PRODUCTION VERIFICATION COMPLETED SUCCESSFULLY!")
            logger.info("✅ courseCategories cleanup verified")
            logger.info("✅ Backend API working correctly")
            logger.info("✅ Frontend will reflect cleaned state")
        else:
            logger.error("❌ PRODUCTION VERIFICATION FAILED!")
            logger.error("❌ Some tests failed - check results above")
        
        # Save results to file
        results_filename = f"/app/production_verification_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_filename, 'w') as f:
            json.dump(tester.test_results, f, indent=2)
        
        logger.info(f"📄 Results saved to: {results_filename}")
        
        return tester.test_results["summary"]["overall_status"] == "PASS"
        
    except Exception as e:
        logger.error(f"❌ CRITICAL ERROR during verification: {e}")
        return False
    
    finally:
        await tester.close_connection()

if __name__ == "__main__":
    # Run the verification test
    success = asyncio.run(main())
    
    if success:
        print("\n🎯 VERIFICATION SUMMARY:")
        print("✅ Production database cleanup verified")
        print("✅ Backend API working correctly")
        print("✅ Frontend CategoryManager will show clean state")
        print("✅ Old categories successfully removed")
    else:
        print("\n❌ VERIFICATION FAILED:")
        print("❌ Production verification encountered errors")
        print("❌ Check logs above for details")
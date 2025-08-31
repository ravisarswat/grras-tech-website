#!/usr/bin/env python3
"""
Enhanced Leads Management Testing - Focus on Deletion Functionality
Tests single and bulk lead deletion endpoints with proper authentication
"""

import asyncio
import aiohttp
import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LeadsDeletionTester:
    def __init__(self):
        # Get backend URL from frontend .env file
        self.frontend_env_path = "/app/frontend/.env"
        self.backend_url = self._get_backend_url()
        self.api_base = f"{self.backend_url}/api"
        self.session = None
        self.admin_token = None
        
        # Test results
        self.test_results = {
            "admin_authentication": False,
            "leads_list_access": False,
            "single_lead_deletion": False,
            "bulk_lead_deletion": False,
            "invalid_lead_id_handling": False,
            "non_existent_lead_handling": False,
            "mongodb_data_verification": False
        }
        
        self.errors = []
        self.created_lead_ids = []  # Track leads we create for testing
        
    def _get_backend_url(self) -> str:
        """Get backend URL from frontend .env file"""
        try:
            with open(self.frontend_env_path, 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        url = line.split('=', 1)[1].strip()
                        logger.info(f"✅ Found backend URL: {url}")
                        return url
            
            # Fallback
            logger.warning("⚠️ REACT_APP_BACKEND_URL not found, using fallback")
            return "http://localhost:8001"
        except Exception as e:
            logger.error(f"❌ Error reading frontend .env: {e}")
            return "http://localhost:8001"
    
    async def setup_session(self):
        """Setup HTTP session"""
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout
        )
        logger.info("✅ HTTP session initialized")
    
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            logger.info("✅ HTTP session closed")
    
    async def test_admin_authentication(self) -> bool:
        """Test admin authentication to get token"""
        logger.info("🔍 Testing admin authentication...")
        try:
            login_data = {"password": "grras@admin2024"}
            
            async with self.session.post(f"{self.api_base}/admin/login", json=login_data) as response:
                if response.status == 200:
                    data = await response.json()
                    self.admin_token = data.get("token")
                    
                    if self.admin_token:
                        logger.info("✅ Admin authentication successful")
                        self.test_results["admin_authentication"] = True
                        return True
                    else:
                        self.errors.append("Admin login successful but no token received")
                        return False
                else:
                    self.errors.append(f"Admin login failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Admin authentication failed: {str(e)}")
            logger.error(f"❌ Admin authentication failed: {e}")
            return False
    
    async def create_test_leads(self) -> List[str]:
        """Create test leads for deletion testing"""
        logger.info("🔍 Creating test leads for deletion testing...")
        created_ids = []
        
        try:
            # Create multiple test leads
            test_leads = [
                {
                    "name": "Arjun Patel",
                    "email": "arjun.patel@example.com", 
                    "phone": "9876543210",
                    "course": "DevOps Training",
                    "message": "Test lead for deletion testing"
                },
                {
                    "name": "Sneha Gupta",
                    "email": "sneha.gupta@example.com",
                    "phone": "9876543211", 
                    "course": "Data Science & Machine Learning",
                    "message": "Another test lead for bulk deletion"
                },
                {
                    "name": "Vikram Singh",
                    "email": "vikram.singh@example.com",
                    "phone": "9876543212",
                    "course": "Cyber Security",
                    "message": "Third test lead for bulk deletion"
                }
            ]
            
            for lead_data in test_leads:
                async with self.session.post(f"{self.api_base}/contact", json=lead_data) as response:
                    if response.status == 200:
                        logger.info(f"✅ Created test lead: {lead_data['name']}")
                    else:
                        logger.warning(f"⚠️ Failed to create test lead: {lead_data['name']}")
            
            # Get the created leads by fetching all leads and finding our test leads
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            async with self.session.get(f"{self.api_base}/leads", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    leads = data.get("leads", [])
                    
                    # Find our test leads (created in last few seconds)
                    test_emails = [lead["email"] for lead in test_leads]
                    for lead in leads:
                        if lead.get("email") in test_emails:
                            created_ids.append(lead["_id"])
                    
                    logger.info(f"✅ Found {len(created_ids)} test leads for deletion testing")
                    self.created_lead_ids = created_ids
                    return created_ids
                else:
                    self.errors.append("Failed to retrieve leads after creation")
                    return []
                    
        except Exception as e:
            self.errors.append(f"Failed to create test leads: {str(e)}")
            logger.error(f"❌ Failed to create test leads: {e}")
            return []
    
    async def test_leads_list_access(self) -> bool:
        """Test leads list access with admin token"""
        logger.info("🔍 Testing leads list access...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            async with self.session.get(f"{self.api_base}/leads", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    leads = data.get("leads", [])
                    logger.info(f"✅ Leads list access working - Found {len(leads)} leads")
                    self.test_results["leads_list_access"] = True
                    return True
                else:
                    self.errors.append(f"Leads list access failed with status {response.status}")
                    return False
        except Exception as e:
            self.errors.append(f"Leads list access failed: {str(e)}")
            logger.error(f"❌ Leads list access failed: {e}")
            return False
    
    async def test_single_lead_deletion(self) -> bool:
        """Test DELETE /api/leads/{lead_id} endpoint"""
        logger.info("🔍 Testing single lead deletion...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available")
            return False
        
        if not self.created_lead_ids:
            logger.warning("⚠️ No test leads available for deletion")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            test_lead_id = self.created_lead_ids[0]  # Use first test lead
            
            # Delete the lead
            async with self.session.delete(f"{self.api_base}/leads/{test_lead_id}", headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Single lead deletion successful: {data}")
                    
                    # Verify lead is actually deleted from database
                    async with self.session.get(f"{self.api_base}/leads", headers=headers) as verify_response:
                        if verify_response.status == 200:
                            verify_data = await verify_response.json()
                            remaining_leads = verify_data.get("leads", [])
                            
                            # Check if deleted lead is still in the list
                            deleted_lead_exists = any(lead["_id"] == test_lead_id for lead in remaining_leads)
                            
                            if not deleted_lead_exists:
                                logger.info("✅ Lead successfully removed from MongoDB")
                                self.test_results["single_lead_deletion"] = True
                                self.test_results["mongodb_data_verification"] = True
                                # Remove from our tracking list
                                self.created_lead_ids.remove(test_lead_id)
                                return True
                            else:
                                self.errors.append("Lead still exists in database after deletion")
                                return False
                        else:
                            self.errors.append("Failed to verify lead deletion in database")
                            return False
                else:
                    response_text = await response.text()
                    self.errors.append(f"Single lead deletion failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Single lead deletion test failed: {str(e)}")
            logger.error(f"❌ Single lead deletion test failed: {e}")
            return False
    
    async def test_bulk_lead_deletion(self) -> bool:
        """Test DELETE /api/leads/bulk endpoint with BulkDeleteRequest format"""
        logger.info("🔍 Testing bulk lead deletion...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available")
            return False
        
        if len(self.created_lead_ids) < 2:
            logger.warning("⚠️ Need at least 2 test leads for bulk deletion test")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Use remaining test leads for bulk deletion
            bulk_delete_ids = self.created_lead_ids[:2]  # Take first 2 remaining leads
            
            # Test the new BulkDeleteRequest format: {"lead_ids": ["id1", "id2"]}
            bulk_request = {"lead_ids": bulk_delete_ids}
            
            logger.info(f"🔍 Attempting bulk deletion of {len(bulk_delete_ids)} leads")
            logger.info(f"Request format: {bulk_request}")
            
            async with self.session.delete(f"{self.api_base}/leads/bulk", json=bulk_request, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"✅ Bulk lead deletion successful: {data}")
                    
                    # Verify the response format
                    expected_fields = ["message", "deleted_count", "requested_count"]
                    missing_fields = [field for field in expected_fields if field not in data]
                    
                    if missing_fields:
                        self.errors.append(f"Bulk deletion response missing fields: {missing_fields}")
                        return False
                    
                    # Check if deleted count matches requested count
                    if data["deleted_count"] != len(bulk_delete_ids):
                        logger.warning(f"⚠️ Deleted count ({data['deleted_count']}) != requested count ({len(bulk_delete_ids)})")
                    
                    # Verify leads are actually deleted from database
                    async with self.session.get(f"{self.api_base}/leads", headers=headers) as verify_response:
                        if verify_response.status == 200:
                            verify_data = await verify_response.json()
                            remaining_leads = verify_data.get("leads", [])
                            
                            # Check if any of the deleted leads still exist
                            still_existing = []
                            for lead_id in bulk_delete_ids:
                                if any(lead["_id"] == lead_id for lead in remaining_leads):
                                    still_existing.append(lead_id)
                            
                            if not still_existing:
                                logger.info("✅ All leads successfully removed from MongoDB via bulk deletion")
                                self.test_results["bulk_lead_deletion"] = True
                                # Remove from our tracking list
                                for lead_id in bulk_delete_ids:
                                    if lead_id in self.created_lead_ids:
                                        self.created_lead_ids.remove(lead_id)
                                return True
                            else:
                                self.errors.append(f"Some leads still exist after bulk deletion: {still_existing}")
                                return False
                        else:
                            self.errors.append("Failed to verify bulk deletion in database")
                            return False
                else:
                    response_text = await response.text()
                    self.errors.append(f"Bulk lead deletion failed with status {response.status}: {response_text}")
                    return False
        except Exception as e:
            self.errors.append(f"Bulk lead deletion test failed: {str(e)}")
            logger.error(f"❌ Bulk lead deletion test failed: {e}")
            return False
    
    async def test_invalid_lead_id_handling(self) -> bool:
        """Test error handling for invalid lead ID formats"""
        logger.info("🔍 Testing invalid lead ID handling...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Test invalid ObjectId format
            invalid_ids = ["invalid-id", "123", "not-an-objectid", ""]
            
            for invalid_id in invalid_ids:
                async with self.session.delete(f"{self.api_base}/leads/{invalid_id}", headers=headers) as response:
                    if response.status == 400:
                        data = await response.json()
                        logger.info(f"✅ Correctly rejected invalid ID '{invalid_id}': {data}")
                    else:
                        self.errors.append(f"Invalid ID '{invalid_id}' should return 400, got {response.status}")
                        return False
            
            # Test bulk deletion with invalid IDs
            bulk_request = {"lead_ids": ["invalid-id", "another-invalid"]}
            
            async with self.session.delete(f"{self.api_base}/leads/bulk", json=bulk_request, headers=headers) as response:
                if response.status == 400:
                    data = await response.json()
                    logger.info(f"✅ Bulk deletion correctly rejected invalid IDs: {data}")
                    self.test_results["invalid_lead_id_handling"] = True
                    return True
                else:
                    self.errors.append(f"Bulk deletion with invalid IDs should return 400, got {response.status}")
                    return False
                    
        except Exception as e:
            self.errors.append(f"Invalid lead ID handling test failed: {str(e)}")
            logger.error(f"❌ Invalid lead ID handling test failed: {e}")
            return False
    
    async def test_non_existent_lead_handling(self) -> bool:
        """Test error handling for non-existent leads"""
        logger.info("🔍 Testing non-existent lead handling...")
        
        if not self.admin_token:
            logger.warning("⚠️ No admin token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            
            # Use valid ObjectId format but non-existent ID
            non_existent_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format
            
            # Test single deletion
            async with self.session.delete(f"{self.api_base}/leads/{non_existent_id}", headers=headers) as response:
                if response.status == 404:
                    data = await response.json()
                    logger.info(f"✅ Correctly handled non-existent lead: {data}")
                else:
                    self.errors.append(f"Non-existent lead should return 404, got {response.status}")
                    return False
            
            # Test bulk deletion with non-existent IDs
            bulk_request = {"lead_ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]}
            
            async with self.session.delete(f"{self.api_base}/leads/bulk", json=bulk_request, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    # Bulk deletion should succeed but with 0 deleted count
                    if data.get("deleted_count") == 0:
                        logger.info(f"✅ Bulk deletion correctly handled non-existent leads: {data}")
                        self.test_results["non_existent_lead_handling"] = True
                        return True
                    else:
                        self.errors.append(f"Bulk deletion of non-existent leads should have 0 deleted_count")
                        return False
                else:
                    self.errors.append(f"Bulk deletion with non-existent IDs failed with status {response.status}")
                    return False
                    
        except Exception as e:
            self.errors.append(f"Non-existent lead handling test failed: {str(e)}")
            logger.error(f"❌ Non-existent lead handling test failed: {e}")
            return False
    
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all leads deletion tests"""
        logger.info("🚀 Starting enhanced leads management deletion testing...")
        
        await self.setup_session()
        
        try:
            # Test sequence
            tests = [
                ("Admin Authentication", self.test_admin_authentication),
                ("Leads List Access", self.test_leads_list_access),
                ("Create Test Leads", self.create_test_leads),
                ("Single Lead Deletion", self.test_single_lead_deletion),
                ("Bulk Lead Deletion", self.test_bulk_lead_deletion),
                ("Invalid Lead ID Handling", self.test_invalid_lead_id_handling),
                ("Non-existent Lead Handling", self.test_non_existent_lead_handling),
            ]
            
            passed_tests = 0
            total_tests = len(tests) - 1  # Don't count create_test_leads as a test
            
            for test_name, test_func in tests:
                logger.info(f"\n{'='*50}")
                logger.info(f"Running: {test_name}")
                logger.info(f"{'='*50}")
                
                try:
                    if test_name == "Create Test Leads":
                        # Special handling for test data creation
                        result = await test_func()
                        if not result:
                            logger.error("❌ Failed to create test leads - cannot continue")
                            break
                        continue
                    
                    result = await test_func()
                    if result:
                        passed_tests += 1
                        logger.info(f"✅ {test_name}: PASSED")
                    else:
                        logger.error(f"❌ {test_name}: FAILED")
                except Exception as e:
                    logger.error(f"❌ {test_name}: ERROR - {e}")
                    self.errors.append(f"{test_name}: {str(e)}")
            
            # Generate summary
            success_rate = (passed_tests / total_tests) * 100 if total_tests > 0 else 0
            
            summary = {
                "timestamp": datetime.now().isoformat(),
                "backend_url": self.backend_url,
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": total_tests - passed_tests,
                "success_rate": f"{success_rate:.1f}%",
                "test_results": self.test_results,
                "errors": self.errors,
                "critical_issues": self._identify_critical_issues()
            }
            
            return summary
            
        finally:
            await self.cleanup_session()
    
    def _identify_critical_issues(self) -> List[str]:
        """Identify critical issues that block functionality"""
        critical_issues = []
        
        if not self.test_results["admin_authentication"]:
            critical_issues.append("Admin authentication failed - cannot access protected endpoints")
        
        if not self.test_results["single_lead_deletion"]:
            critical_issues.append("Single lead deletion is not working")
        
        if not self.test_results["bulk_lead_deletion"]:
            critical_issues.append("Bulk lead deletion is not working")
        
        if not self.test_results["mongodb_data_verification"]:
            critical_issues.append("MongoDB data deletion verification failed")
        
        return critical_issues
    
    def print_summary(self, summary: Dict[str, Any]):
        """Print test summary"""
        print(f"\n{'='*60}")
        print("🎯 ENHANCED LEADS DELETION TESTING SUMMARY")
        print(f"{'='*60}")
        print(f"Backend URL: {summary['backend_url']}")
        print(f"Test Time: {summary['timestamp']}")
        print(f"Success Rate: {summary['success_rate']}")
        print(f"Tests Passed: {summary['passed_tests']}/{summary['total_tests']}")
        
        print(f"\n📊 DETAILED RESULTS:")
        for test_name, result in summary['test_results'].items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"  {test_name}: {status}")
        
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES:")
            for issue in summary['critical_issues']:
                print(f"  • {issue}")
        
        if summary['errors']:
            print(f"\n❌ ERRORS ENCOUNTERED:")
            for error in summary['errors']:
                print(f"  • {error}")
        
        print(f"\n🎯 LEADS DELETION FUNCTIONALITY STATUS:")
        if self.test_results["single_lead_deletion"] and self.test_results["bulk_lead_deletion"]:
            print("  ✅ Enhanced leads deletion functionality: WORKING")
            print("  ✅ Single and bulk deletion endpoints operational")
            print("  ✅ MongoDB data integrity maintained")
        else:
            print("  ❌ Enhanced leads deletion functionality: NOT WORKING")
            print("  ❌ Critical deletion endpoints have issues")
        
        print(f"\n{'='*60}")

async def main():
    """Main test execution"""
    tester = LeadsDeletionTester()
    
    try:
        summary = await tester.run_all_tests()
        tester.print_summary(summary)
        
        # Save results to file
        with open('/app/leads_deletion_test_results.json', 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n💾 Test results saved to: /app/leads_deletion_test_results.json")
        
        # Exit with appropriate code
        if summary['critical_issues']:
            print(f"\n🚨 CRITICAL ISSUES DETECTED - Leads deletion needs attention!")
            sys.exit(1)
        elif summary['success_rate'] == "100.0%":
            print(f"\n🎉 ALL TESTS PASSED - Enhanced leads deletion is fully functional!")
            sys.exit(0)
        else:
            print(f"\n⚠️ SOME TESTS FAILED - Leads deletion has issues")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"❌ Test execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
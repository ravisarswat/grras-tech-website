#!/usr/bin/env python3
"""
Debug script to test bulk deletion endpoint directly
"""

import asyncio
import aiohttp
import json

async def debug_bulk_delete():
    backend_url = 'https://react-cms-fix.preview.emergentagent.com'
    
    async with aiohttp.ClientSession() as session:
        # Get admin token
        login_data = {'password': 'grras@admin2024'}
        async with session.post(f'{backend_url}/api/admin/login', json=login_data) as response:
            data = await response.json()
            token = data.get('token')
            print(f"✅ Got admin token: {token[:20]}...")
        
        headers = {'Authorization': f'Bearer {token}'}
        
        # First, create a test lead
        contact_data = {
            "name": "Debug Test User",
            "email": "debug.test@example.com", 
            "phone": "9999999999",
            "course": "Debug Course",
            "message": "Debug test lead"
        }
        
        async with session.post(f'{backend_url}/api/contact', json=contact_data) as response:
            if response.status == 200:
                print("✅ Created debug test lead")
            else:
                print(f"❌ Failed to create test lead: {response.status}")
        
        # Get leads to find our test lead
        async with session.get(f'{backend_url}/api/leads', headers=headers) as response:
            data = await response.json()
            leads = data.get('leads', [])
            
            # Find our debug test lead
            debug_lead = None
            for lead in leads:
                if lead.get('email') == 'debug.test@example.com':
                    debug_lead = lead
                    break
            
            if not debug_lead:
                print("❌ Could not find debug test lead")
                return
            
            debug_lead_id = debug_lead['_id']
            print(f"✅ Found debug test lead ID: {debug_lead_id}")
            
            # Test single deletion first (this should work)
            print("\n🔍 Testing single deletion...")
            async with session.delete(f'{backend_url}/api/leads/{debug_lead_id}', headers=headers) as response:
                print(f"Single deletion status: {response.status}")
                if response.status == 200:
                    response_data = await response.json()
                    print(f"Single deletion response: {response_data}")
                else:
                    response_text = await response.text()
                    print(f"Single deletion error: {response_text}")
            
            # Create another test lead for bulk deletion
            contact_data2 = {
                "name": "Debug Test User 2",
                "email": "debug.test2@example.com", 
                "phone": "9999999998",
                "course": "Debug Course 2",
                "message": "Debug test lead 2"
            }
            
            async with session.post(f'{backend_url}/api/contact', json=contact_data2) as response:
                if response.status == 200:
                    print("✅ Created second debug test lead")
                else:
                    print(f"❌ Failed to create second test lead: {response.status}")
            
            # Get leads again to find both test leads
            async with session.get(f'{backend_url}/api/leads', headers=headers) as response:
                data = await response.json()
                leads = data.get('leads', [])
                
                # Find our test leads
                test_lead_ids = []
                for lead in leads:
                    if lead.get('email') in ['debug.test@example.com', 'debug.test2@example.com']:
                        test_lead_ids.append(lead['_id'])
                
                print(f"✅ Found {len(test_lead_ids)} test leads for bulk deletion: {test_lead_ids}")
                
                if len(test_lead_ids) >= 1:
                    # Test bulk deletion
                    print("\n🔍 Testing bulk deletion...")
                    bulk_request = {'lead_ids': test_lead_ids}
                    print(f"Bulk request: {json.dumps(bulk_request, indent=2)}")
                    
                    async with session.delete(f'{backend_url}/api/leads/bulk', json=bulk_request, headers=headers) as response:
                        print(f"Bulk deletion status: {response.status}")
                        response_text = await response.text()
                        print(f"Bulk deletion response: {response_text}")
                        
                        if response.status == 200:
                            print("✅ Bulk deletion successful!")
                        else:
                            print("❌ Bulk deletion failed!")
                            
                            # Let's try to understand why
                            print("\n🔍 Debugging bulk deletion failure...")
                            
                            # Check if it's a request format issue
                            print("Testing different request formats...")
                            
                            # Try with just one ID
                            single_bulk_request = {'lead_ids': [test_lead_ids[0]]}
                            async with session.delete(f'{backend_url}/api/leads/bulk', json=single_bulk_request, headers=headers) as response:
                                print(f"Single ID bulk deletion status: {response.status}")
                                response_text = await response.text()
                                print(f"Single ID bulk deletion response: {response_text}")

if __name__ == "__main__":
    asyncio.run(debug_bulk_delete())
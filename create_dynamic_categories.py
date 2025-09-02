#!/usr/bin/env python3
"""
Create dynamic categories via admin API - same as admin panel
This will create proper dynamic categories that show up in database and admin panel
"""

import asyncio
import aiohttp
import json
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO)

async def create_dynamic_categories():
    """Create dynamic categories via admin API"""
    
    # Production backend URL - Railway deployment
    backend_url = "https://grras-tech-website-production.up.railway.app"
    api_base = f"{backend_url}/api"
    
    # Categories to create (same as before but dynamic)
    categories_to_create = [
        {
            "name": "Red Hat Technologies",
            "slug": "redhat",
            "description": "Industry-leading Linux and OpenShift certifications with hands-on labs",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg",
            "icon": "server",
            "color": "#EE0000",
            "order": 1,
            "visible": True
        },
        {
            "name": "AWS Cloud Platform", 
            "slug": "aws",
            "description": "Amazon Web Services cloud computing certifications and solutions architect training",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
            "icon": "cloud",
            "color": "#FF9900",
            "order": 2,
            "visible": True
        },
        {
            "name": "Kubernetes Ecosystem",
            "slug": "kubernetes", 
            "description": "Container orchestration and cloud-native technologies including CKA, CKAD certifications",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/6/67/Kubernetes_logo.svg",
            "icon": "container",
            "color": "#326CE5",
            "order": 3,
            "visible": True
        },
        {
            "name": "DevOps Engineering",
            "slug": "devops",
            "description": "DevOps, MLOps, SecOps and automation technologies with CI/CD pipelines",
            "logo_url": "https://cdn.worldvectorlogo.com/logos/devops-2.svg",
            "icon": "terminal",
            "color": "#2ECC71",
            "order": 4,
            "visible": True
        },
        {
            "name": "Cybersecurity & Ethical Hacking",
            "slug": "cybersecurity",
            "description": "Cybersecurity, ethical hacking, penetration testing and security analysis",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Kali_Linux_2.0_wordmark.svg",
            "icon": "shield",
            "color": "#34495E",
            "order": 5,
            "visible": True
        },
        {
            "name": "Programming & Development",
            "slug": "programming",
            "description": "Programming languages and software development skills including Java, Python, C++",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg",
            "icon": "code",
            "color": "#9B59B6",
            "order": 6,
            "visible": True
        },
        {
            "name": "Degree Programs", 
            "slug": "degree",
            "description": "Comprehensive degree and diploma programs including BCA with specializations",
            "logo_url": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Graduation_hat.svg",
            "icon": "graduation-cap",
            "color": "#3498DB",
            "order": 7,
            "visible": True
        }
    ]
    
    try:
        connector = aiohttp.TCPConnector(limit=10, limit_per_host=10)
        timeout = aiohttp.ClientTimeout(total=60)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            
            # Step 1: Admin authentication
            logging.info("🔐 Authenticating as admin...")
            login_data = {"password": "grras-admin"}
            
            async with session.post(f"{api_base}/admin/login", json=login_data) as response:
                if response.status != 200:
                    logging.error("❌ Admin authentication failed")
                    return
                
                auth_data = await response.json()
                admin_token = auth_data.get("token")
                
                if not admin_token:
                    logging.error("❌ No admin token received")
                    return
                
                logging.info("✅ Admin authentication successful")
            
            # Step 2: Get current content
            async with session.get(f"{api_base}/content") as response:
                if response.status != 200:
                    logging.error(f"❌ Failed to fetch content: {response.status}")
                    return
                
                content_response = await response.json()
                content = content_response.get("content", {})
                logging.info("✅ Current content fetched")
            
            # Step 3: Add categories to content
            logging.info(f"📝 Creating {len(categories_to_create)} dynamic categories...")
            
            if "courseCategories" not in content:
                content["courseCategories"] = {}
            
            for category in categories_to_create:
                slug = category["slug"]
                content["courseCategories"][slug] = {
                    "name": category["name"],
                    "title": category["name"],  # Some components use title
                    "slug": slug,
                    "description": category["description"],
                    "logo_url": category["logo_url"],
                    "logo": category["logo_url"],  # Fallback field
                    "icon": category["icon"],
                    "color": category["color"],
                    "order": category["order"],
                    "visible": category["visible"],
                    "courses": [],  # Start with empty courses array
                    "featured": True,  # Make all categories featured for homepage
                    "createdAt": datetime.now().isoformat(),
                    "createdBy": "dynamic-category-creator"
                }
                
                logging.info(f"✅ Added category: {category['name']} (slug: {slug})")
            
            # Step 4: Update metadata
            content["meta"] = content.get("meta", {})
            content["meta"]["lastModified"] = datetime.now().isoformat()
            content["meta"]["modifiedBy"] = "dynamic-category-creator"
            content["meta"]["categoriesCreated"] = len(categories_to_create)
            content["meta"]["categoryCreationDate"] = datetime.now().isoformat()
            
            # Step 5: Save via admin API
            logging.info("💾 Saving dynamic categories to database...")
            
            headers = {
                'Authorization': f'Bearer {admin_token}',
                'Content-Type': 'application/json'
            }
            
            save_data = {
                "content": content,
                "isDraft": False
            }
            
            async with session.post(f"{api_base}/content", json=save_data, headers=headers) as response:
                if response.status == 200:
                    logging.info("✅ Successfully saved dynamic categories")
                    
                    # Step 6: Verify creation
                    async with session.get(f"{api_base}/content") as verify_response:
                        if verify_response.status == 200:
                            verify_data = await verify_response.json()
                            created_categories = verify_data.get("content", {}).get("courseCategories", {})
                            
                            logging.info(f"🔍 Verification: {len(created_categories)} categories created")
                            
                            for slug, category in created_categories.items():
                                logging.info(f"   ✅ {category.get('name', slug)} (order: {category.get('order', 'N/A')})")
                        
                else:
                    logging.error(f"❌ Failed to save categories: {response.status}")
                    error_text = await response.text()
                    logging.error(f"Error: {error_text}")
    
    except Exception as e:
        logging.error(f"❌ Error creating dynamic categories: {e}")
        raise

if __name__ == "__main__":
    print("🚀 Dynamic Category Creator")
    print("=" * 50)
    print("Creating dynamic categories via admin API")
    print("Same as creating via admin panel - fully dynamic")
    print("=" * 50)
    
    asyncio.run(create_dynamic_categories())
    
    print("\n🎉 Dynamic categories created successfully!")
    print("✅ Categories are now available in:")
    print("   - Admin panel (/admin/content)")
    print("   - Database (courseCategories)")
    print("   - Frontend (header dropdown, courses page)")
    print("   - Homepage (category grid)")
    print("\n📝 You can now assign courses to these categories via admin panel")
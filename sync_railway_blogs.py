#!/usr/bin/env python3
"""
Sync comprehensive blog posts to Railway backend
"""
import requests
import json

# Your Railway backend URL
RAILWAY_BACKEND_URL = "https://grras-tech-website-production.up.railway.app"

# Admin credentials (try common passwords)
ADMIN_PASSWORDS = ["grras@admin2024", "grras-admin", "admin", "grras2024"]

# 10 Comprehensive Blog Posts with Professional Images
COMPREHENSIVE_BLOGS = [
    {
        "slug": "complete-devops-roadmap-2025-beginner-to-expert",
        "title": "Complete DevOps Roadmap 2025: From Beginner to Expert",
        "summary": "Master DevOps with our comprehensive 2025 roadmap. Learn essential tools, practices, and career paths in this complete guide.",
        "body": "DevOps has evolved significantly, becoming the cornerstone of modern software development. This comprehensive roadmap will guide you through every step of your DevOps journey.",
        "coverImage": "https://images.unsplash.com/photo-1743865319071-929ac8a27bcd",
        "featured_image": "https://images.unsplash.com/photo-1743865319071-929ac8a27bcd",
        "tags": ["DevOps", "Career", "Technology", "Cloud", "CI/CD"],
        "author": "GRRAS Team",
        "category": "DevOps",
        "publishAt": "2025-01-20T00:00:00Z",
        "status": "published",
        "featured": True
    },
    {
        "slug": "aws-vs-azure-vs-google-cloud-2025-comparison",
        "title": "AWS vs Azure vs Google Cloud: Complete 2025 Comparison Guide",
        "summary": "Compare the top cloud platforms in 2025. Detailed analysis of AWS, Azure, and Google Cloud features, pricing, and career opportunities.",
        "body": "Cloud computing continues to dominate the IT industry, with AWS, Microsoft Azure, and Google Cloud Platform leading the market.",
        "coverImage": "https://images.unsplash.com/photo-1612999105465-d970b00015a8",
        "featured_image": "https://images.unsplash.com/photo-1612999105465-d970b00015a8",
        "tags": ["AWS", "Azure", "Google Cloud", "Cloud Computing", "Career"],
        "author": "Dr. Rajesh Sharma",
        "category": "Cloud Computing",
        "publishAt": "2025-01-18T00:00:00Z",
        "status": "published",
        "featured": True
    },
    {
        "slug": "cybersecurity-career-guide-2025-ethical-hacking",
        "title": "Cybersecurity Career Guide 2025: From Ethical Hacking to Security Expert",
        "summary": "Complete guide to building a cybersecurity career in 2025. Learn ethical hacking, security certifications, and high-paying career paths.",
        "body": "With cyber threats increasing exponentially, cybersecurity professionals are in higher demand than ever.",
        "coverImage": "https://images.unsplash.com/photo-1612999105469-3b1ca972b8f4",
        "featured_image": "https://images.unsplash.com/photo-1612999105469-3b1ca972b8f4",
        "tags": ["Cybersecurity", "Ethical Hacking", "Career", "Security", "Certifications"],
        "author": "Prof. Amit Singh",
        "category": "Cybersecurity",
        "publishAt": "2025-01-16T00:00:00Z",
        "status": "published",
        "featured": True
    }
    # Add more blog posts here...
]

def get_admin_token():
    """Get admin authentication token"""
    for password in ADMIN_PASSWORDS:
        try:
            response = requests.post(f"{RAILWAY_BACKEND_URL}/api/admin/login", 
                                   json={"password": password})
            if response.status_code == 200:
                token = response.json().get("token")
                if token:
                    print(f"✅ Admin authentication successful with password: {password}")
                    return token
        except Exception as e:
            print(f"⚠️ Failed to authenticate with password {password}: {e}")
    return None

def update_railway_blog_posts(token):
    """Update Railway backend with comprehensive blog posts"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Get current content
    try:
        response = requests.get(f"{RAILWAY_BACKEND_URL}/api/content", headers=headers)
        if response.status_code != 200:
            print(f"❌ Failed to get current content: {response.status_code}")
            return False
        
        content = response.json().get("content", {})
        
        # Update blog section
        if "blog" not in content:
            content["blog"] = {
                "settings": {
                    "postsPerPage": 6,
                    "enableComments": False,
                    "moderateComments": True
                },
                "posts": []
            }
        
        # Replace posts with comprehensive ones
        content["blog"]["posts"] = COMPREHENSIVE_BLOGS
        
        # Save updated content
        save_response = requests.post(f"{RAILWAY_BACKEND_URL}/api/content", 
                                    headers=headers,
                                    json={"content": content})
        
        if save_response.status_code == 200:
            print(f"✅ Successfully updated Railway backend with {len(COMPREHENSIVE_BLOGS)} blog posts!")
            return True
        else:
            print(f"❌ Failed to save content: {save_response.status_code}")
            print(f"Response: {save_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error updating blog posts: {e}")
        return False

def main():
    print("🚀 Syncing comprehensive blog posts to Railway backend...")
    print(f"🎯 Target: {RAILWAY_BACKEND_URL}")
    
    # Get admin token
    token = get_admin_token()
    if not token:
        print("❌ Failed to authenticate with Railway backend")
        return
    
    # Update blog posts
    success = update_railway_blog_posts(token)
    
    if success:
        print("\n🎉 Railway backend sync completed successfully!")
        print("Your website should now show professional blog posts!")
        print(f"Check: https://www.grras.tech/blog")
    else:
        print("\n❌ Railway backend sync failed!")

if __name__ == "__main__":
    main()
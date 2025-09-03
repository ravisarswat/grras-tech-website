#!/usr/bin/env python3
"""
Update blog posts in CMS to replace emojis with professional images
"""
import requests
import json

# Backend URL
BACKEND_URL = "https://training-portal-10.preview.emergentagent.com"

# Admin credentials
ADMIN_PASSWORD = "grras@admin2024"

# Professional images mapping
BLOG_IMAGES = {
    "what-is-devops-beginners-guide-2025": "https://images.pexels.com/photos/8728559/pexels-photo-8728559.jpeg",
    "why-bca-industry-training-future": "https://images.pexels.com/photos/7789851/pexels-photo-7789851.jpeg", 
    "top-5-skills-data-science-careers-india": "https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg",
    "aws-cloud-computing-career-guide-2025": "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1NzZ8MHwxfHNlYXJjaHwyfHxjbG91ZCUyMHRlY2hub2xvZ3l8ZW58MHx8fGJsdWV8MTc1NjcwMzk5OXww&ixlib=rb-4.1.0&q=85",
    "cybersecurity-certification-roadmap-2025": "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg"
}

def get_admin_token():
    """Get admin authentication token"""
    try:
        response = requests.post(f"{BACKEND_URL}/api/admin/login", 
                               json={"password": ADMIN_PASSWORD})
        if response.status_code == 200:
            return response.json().get("token")
        else:
            # Try fallback password
            response = requests.post(f"{BACKEND_URL}/api/admin/login", 
                                   json={"password": "grras-admin"})
            if response.status_code == 200:
                return response.json().get("token")
    except Exception as e:
        print(f"Error getting admin token: {e}")
    return None

def get_current_content(token):
    """Get current CMS content"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BACKEND_URL}/api/content", headers=headers)
        if response.status_code == 200:
            return response.json().get("content", {})
    except Exception as e:
        print(f"Error getting content: {e}")
    return {}

def update_blog_images(token):
    """Update blog posts with professional images"""
    print("🔄 Getting current content...")
    content = get_current_content(token)
    
    if not content or "blog" not in content:
        print("❌ No blog content found")
        return False
    
    blog_section = content["blog"]
    if "posts" not in blog_section:
        print("❌ No posts found in blog section")
        return False
    
    print(f"📝 Found {len(blog_section['posts'])} blog posts")
    
    # Update posts with new images
    updated_posts = []
    for post in blog_section["posts"]:
        slug = post.get("slug", "")
        
        if slug in BLOG_IMAGES:
            post["coverImage"] = BLOG_IMAGES[slug]
            post["featured_image"] = BLOG_IMAGES[slug]  # Add both fields for compatibility
            print(f"✅ Updated image for: {post.get('title', slug)}")
        else:
            # Use default professional image
            post["coverImage"] = "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg"
            post["featured_image"] = "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg"
            print(f"🔧 Added default image for: {post.get('title', slug)}")
        
        updated_posts.append(post)
    
    # Update the blog section
    content["blog"]["posts"] = updated_posts
    
    # Save updated content
    print("💾 Saving updated content...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(f"{BACKEND_URL}/api/content", 
                           headers=headers, 
                           json={"content": content})
    
    if response.status_code == 200:
        print("✅ Successfully updated blog images!")
        return True
    else:
        print(f"❌ Failed to update content: {response.status_code}")
        if response.text:
            print(f"Response: {response.text}")
        return False

def main():
    print("🚀 Starting blog image update process...")
    
    # Get admin token
    token = get_admin_token()
    if not token:
        print("❌ Failed to get admin token")
        return
    
    print("✅ Admin authentication successful")
    
    # Update blog images
    success = update_blog_images(token)
    
    if success:
        print("\n🎉 Blog image update completed successfully!")
        print("All blog posts now use professional images instead of emojis.")
    else:
        print("\n❌ Blog image update failed!")

if __name__ == "__main__":
    main()
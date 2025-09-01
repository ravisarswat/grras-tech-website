#!/usr/bin/env python3
"""
Create comprehensive blog posts for GRRAS Solutions
Professional content with high-quality images for different technology fields
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "https://responsive-edu-site.preview.emergentagent.com/api"

def get_admin_token():
    """Get admin authentication token"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login", 
            json={"password": "grras@admin2024"}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get('token')
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error logging in: {e}")
        return None

def create_blog_post(token, post_data):
    """Create a blog post"""
    try:
        response = requests.post(
            f"{BASE_URL}/admin/blog",
            headers={
                'Authorization': f'Bearer {token}',
                'Content-Type': 'application/json'
            },
            json=post_data
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"✅ Created blog post: {post_data['title']}")
            return True
        else:
            print(f"❌ Failed to create post '{post_data['title']}': {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Error creating post '{post_data['title']}': {e}")
        return False

def get_blog_posts():
    """Get list of comprehensive blog posts"""
    return [
        {
            "title": "Data Science Career Guide 2025: From Zero to Data Scientist",
            "slug": "data-science-career-guide-2025-zero-to-data-scientist",
            "content": """
                <h2>Why Data Science is the Most In-Demand Career of 2025</h2>
                
                <p>Data Science has emerged as the "sexiest job of the 21st century" with unprecedented demand across industries. With average salaries ranging from ₹8-45 lakhs per annum in India, data scientists are among the highest-paid professionals in the technology sector.</p>
                
                <h2>Complete Learning Roadmap</h2>
                
                <h3>Phase 1: Foundation Skills (Months 1-3)</h3>
                
                <h4>Mathematics & Statistics</h4>
                <ul>
                    <li><strong>Linear Algebra:</strong> Vectors, matrices, eigenvalues, and eigenvectors</li>
                    <li><strong>Calculus:</strong> Derivatives, gradients, and optimization</li>
                    <li><strong>Statistics:</strong> Descriptive statistics, probability distributions, hypothesis testing</li>
                    <li><strong>Probability:</strong> Bayes' theorem, conditional probability</li>
                </ul>
                
                <h4>Programming Fundamentals</h4>
                <ul>
                    <li><strong>Python:</strong> Data types, control structures, functions, OOP</li>
                    <li><strong>SQL:</strong> Database queries, joins, aggregations, window functions</li>
                    <li><strong>R (Optional):</strong> Statistical computing and graphics</li>
                </ul>
                
                <h3>Phase 2: Data Manipulation & Analysis (Months 4-6)</h3>
                
                <h4>Python Libraries</h4>
                <ul>
                    <li><strong>Pandas:</strong> Data manipulation and analysis</li>
                    <li><strong>NumPy:</strong> Numerical computing</li>
                    <li><strong>Matplotlib/Seaborn:</strong> Data visualization</li>
                    <li><strong>Plotly:</strong> Interactive visualizations</li>
                </ul>
                
                <h2>Career Paths & Salary Ranges</h2>
                
                <h3>Entry Level (0-2 years)</h3>
                <ul>
                    <li><strong>Data Analyst:</strong> ₹4-8 lakhs per annum</li>
                    <li><strong>Junior Data Scientist:</strong> ₹6-12 lakhs per annum</li>
                    <li><strong>Business Analyst:</strong> ₹5-10 lakhs per annum</li>
                </ul>
                
                <h3>Mid Level (2-5 years)</h3>
                <ul>
                    <li><strong>Data Scientist:</strong> ₹12-25 lakhs per annum</li>
                    <li><strong>Machine Learning Engineer:</strong> ₹15-28 lakhs per annum</li>
                    <li><strong>Data Engineer:</strong> ₹10-22 lakhs per annum</li>
                </ul>
                
                <h3>Senior Level (5+ years)</h3>
                <ul>
                    <li><strong>Senior Data Scientist:</strong> ₹25-45 lakhs per annum</li>
                    <li><strong>Principal Data Scientist:</strong> ₹35-60 lakhs per annum</li>
                    <li><strong>Head of Data Science:</strong> ₹40-80 lakhs per annum</li>
                </ul>
                
                <h2>Start Your Data Science Journey Today</h2>
                
                <p>Ready to become a data scientist? GRRAS Solutions offers comprehensive data science training with hands-on projects, industry-expert instructors, and 100% placement assistance.</p>
                
                <p><strong>Transform your career with data science:</strong> <a href="/courses/data-science-machine-learning">Explore our Data Science & Machine Learning Program</a></p>
            """,
            "excerpt": "Complete roadmap to become a data scientist in 2025. Master Python, ML, statistics, and deployment. 12-month structured learning path with ₹8-45L salary potential.",
            "featured_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&auto=format",
            "category": "data-science",
            "tags": ["data-science", "machine-learning", "python", "career-guidance", "artificial-intelligence", "big-data", "analytics"],
            "author": "GRRAS Data Science Team",
            "published": True,
            "meta_title": "Data Science Career Guide 2025: Complete Roadmap from Zero to Expert",
            "meta_description": "Complete data science career guide for 2025. Learn Python, ML, statistics, and deployment. Structured 12-month roadmap with ₹8-45L salary potential.",
            "meta_keywords": "data science career 2025, machine learning course, python data science, data analyst jobs, big data training, artificial intelligence course"
        }
    ]

def main():
    print("🚀 Creating Comprehensive Blog Posts for GRRAS Solutions")
    print("=" * 70)
    
    token = get_admin_token()
    if not token:
        print("❌ Cannot proceed without admin token")
        return
    
    blog_posts = get_blog_posts()
    
    success_count = 0
    for post in blog_posts:
        if create_blog_post(token, post):
            success_count += 1
    
    print(f"\n🎉 Blog Creation Summary:")
    print(f"✅ Successfully created: {success_count}/{len(blog_posts)} blog posts")
    print(f"🌐 Blog Page: https://responsive-edu-site.preview.emergentagent.com/blog")

if __name__ == "__main__":
    main()
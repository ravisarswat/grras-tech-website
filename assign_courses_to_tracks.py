#!/usr/bin/env python3
"""
Assign Existing Courses to Technology Tracks
"""

import asyncio
import json
import sys
import os
from datetime import datetime
import motor.motor_asyncio

# MongoDB configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'grras_database')

# MongoDB client setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Course assignment mapping based on title/content analysis
COURSE_ASSIGNMENTS = {
    # Red Hat Technologies courses
    "red hat": "red-hat-technologies",
    "rhcsa": "red-hat-technologies", 
    "rhce": "red-hat-technologies",
    "linux": "red-hat-technologies",
    "enterprise linux": "red-hat-technologies",
    
    # AWS Cloud Platform courses
    "aws": "aws-cloud-platform",
    "amazon": "aws-cloud-platform", 
    "cloud": "aws-cloud-platform",
    "ec2": "aws-cloud-platform",
    "s3": "aws-cloud-platform",
    "solutions architect": "aws-cloud-platform",
    
    # Kubernetes & Containers courses  
    "kubernetes": "kubernetes-containers",
    "k8s": "kubernetes-containers",
    "docker": "kubernetes-containers",
    "container": "kubernetes-containers",
    "openshift": "kubernetes-containers",
    "cka": "kubernetes-containers",
    "cks": "kubernetes-containers",
    "ckad": "kubernetes-containers",
    
    # DevOps Engineering courses (strict automation focus)
    "devops": "devops-engineering",
    "jenkins": "devops-engineering", 
    "ansible": "devops-engineering",
    "terraform": "devops-engineering",
    "gitlab": "devops-engineering",
    "cicd": "devops-engineering",
    "ci/cd": "devops-engineering",
    "mlops": "devops-engineering", 
    "secops": "devops-engineering",
    "automation": "devops-engineering",
    "pipeline": "devops-engineering",
    
    # Cybersecurity & Ethical Hacking courses
    "cyber": "cybersecurity-ethical-hacking",
    "security": "cybersecurity-ethical-hacking",
    "ethical": "cybersecurity-ethical-hacking", 
    "hacking": "cybersecurity-ethical-hacking",
    "penetration": "cybersecurity-ethical-hacking",
    "ceh": "cybersecurity-ethical-hacking",
    "cissp": "cybersecurity-ethical-hacking",
    
    # Programming & Development courses
    "programming": "programming-development",
    "development": "programming-development",
    "python": "programming-development",
    "java": "programming-development", 
    "javascript": "programming-development",
    "react": "programming-development", 
    "node": "programming-development",
    "web": "programming-development",
    "full stack": "programming-development",
    "data science": "programming-development",
    "machine learning": "programming-development",
    "coding": "programming-development",
    
    # Degree Programs courses
    "bca": "degree-programs",
    "mca": "degree-programs", 
    "degree": "degree-programs",
    "bachelor": "degree-programs",
    "master": "degree-programs",
    "graduation": "degree-programs",
    
    # Server Administration & Networking courses
    "server": "server-administration-networking",
    "administration": "server-administration-networking",
    "networking": "server-administration-networking", 
    "network": "server-administration-networking",
    "infrastructure": "server-administration-networking",
    "system admin": "server-administration-networking",
    "windows server": "server-administration-networking",
    "tcp": "server-administration-networking",
    "routing": "server-administration-networking"
}

async def get_content():
    """Get current content from MongoDB"""
    try:
        content_doc = await db.content.find_one({"type": "main"})
        if content_doc:
            return content_doc.get("data", {})
        return {}
    except Exception as e:
        print(f"Error getting content: {e}")
        return {}

async def save_content(content_data):
    """Save content to MongoDB"""
    try:
        await db.content.update_one(
            {"type": "main"},
            {
                "$set": {
                    "data": content_data,
                    "updated_at": datetime.utcnow(),
                    "user": "course_assignment",
                    "is_draft": False
                }
            },
            upsert=True
        )
        return True
    except Exception as e:
        print(f"Error saving content: {e}")
        return False

async def assign_courses_to_technology_tracks():
    """Assign existing courses to technology track categories"""
    try:
        print("🚀 Assigning Courses to Technology Tracks...")
        
        # Get current content
        content = await get_content()
        courses = content.get("courses", [])
        categories = content.get("courseCategories", {})
        
        print(f"📊 Found {len(courses)} courses")
        print(f"📊 Found {len(categories)} categories")
        
        if not courses:
            print("❌ No courses found to assign")
            return False
        
        # Assignment statistics
        assignment_stats = {}
        unassigned_courses = []
        
        # Clear existing categories from all courses
        for course in courses:
            course["categories"] = []
        
        # Smart assignment based on course title and description
        for course in courses:
            course_title = course.get("title", "").lower()
            course_description = course.get("description", "").lower()
            course_overview = course.get("overview", "").lower()
            course_content = f"{course_title} {course_description} {course_overview}"
            
            assigned_categories = []
            category_scores = {}
            
            # Calculate score for each potential category
            for keyword, category_slug in COURSE_ASSIGNMENTS.items():
                if keyword in course_content:
                    if category_slug not in category_scores:
                        category_scores[category_slug] = 0
                    category_scores[category_slug] += 1
            
            # Assign to categories with highest scores
            if category_scores:
                # Sort by score and assign top matches
                sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
                
                for category_slug, score in sorted_categories:
                    if score >= 1:  # Minimum threshold
                        course["categories"].append(category_slug)
                        assigned_categories.append(categories.get(category_slug, {}).get("name", category_slug))
                        
                        # Track assignment stats
                        if category_slug not in assignment_stats:
                            assignment_stats[category_slug] = []
                        assignment_stats[category_slug].append({
                            "title": course.get("title", "Unknown"),
                            "score": score
                        })
                
                print(f"✅ Assigned '{course.get('title')}' to: {', '.join(assigned_categories)} (scores: {dict(sorted_categories)})")
            else:
                unassigned_courses.append(course.get("title", "Unknown"))
                print(f"⚠️ No category assigned to '{course.get('title')}'")
        
        # Special handling: Remove courses from DevOps if they're better suited for Server Administration
        for course in courses:
            if "devops-engineering" in course["categories"] and "server-administration-networking" in course["categories"]:
                course_content = f"{course.get('title', '')} {course.get('description', '')}"
                
                # Check for server-specific keywords vs DevOps-specific keywords
                server_keywords = ["server", "administration", "networking", "network", "infrastructure", "windows"]
                devops_keywords = ["jenkins", "ansible", "terraform", "cicd", "automation", "pipeline"]
                
                server_score = sum(1 for keyword in server_keywords if keyword in course_content.lower())
                devops_score = sum(1 for keyword in devops_keywords if keyword in course_content.lower())
                
                if server_score > devops_score:
                    course["categories"].remove("devops-engineering")
                    print(f"🖥️ Moved '{course.get('title')}' from DevOps to Server Administration (better fit)")
                elif devops_score > server_score:
                    course["categories"].remove("server-administration-networking")
                    print(f"🔧 Kept '{course.get('title')}' in DevOps (automation focus)")
        
        # Update content with new course assignments
        content["courses"] = courses
        
        # Save updated content
        await save_content(content)
        
        # Print assignment statistics
        print("\n📊 COURSE ASSIGNMENT STATISTICS:")
        print("=" * 60)
        
        total_assignments = 0
        for category_slug, assigned_courses in assignment_stats.items():
            category_name = categories.get(category_slug, {}).get("name", category_slug)
            print(f"\n✅ {category_name} ({len(assigned_courses)} courses):")
            for course_info in assigned_courses:
                print(f"      • {course_info['title']} (score: {course_info['score']})")
            total_assignments += len(assigned_courses)
        
        if unassigned_courses:
            print(f"\n⚠️ UNASSIGNED COURSES ({len(unassigned_courses)}):")
            for course_title in unassigned_courses:
                print(f"      • {course_title}")
        
        print(f"\n🎉 Course assignment completed!")
        print(f"📊 Total courses: {len(courses)}")
        print(f"📊 Total assignments: {total_assignments}")
        print(f"📊 Unassigned courses: {len(unassigned_courses)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Assignment failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def verify_assignments():
    """Verify course assignments"""
    try:
        print("\n🔍 Verifying Course Assignments...")
        
        content = await get_content()
        categories = content.get("courseCategories", {})
        courses = content.get("courses", [])
        
        for category_slug, category in categories.items():
            category_courses = [c for c in courses if category_slug in c.get("categories", [])]
            print(f"📊 {category['name']}: {len(category_courses)} courses")
            
            if category_courses:
                for course in category_courses[:3]:  # Show first 3 courses
                    print(f"      • {course['title']}")
                if len(category_courses) > 3:
                    print(f"      • ... and {len(category_courses) - 3} more")
        
        return True
        
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

if __name__ == "__main__":
    async def main():
        success = await assign_courses_to_technology_tracks()
        if success:
            await verify_assignments()
        return success

    result = asyncio.run(main())
    sys.exit(0 if result else 1)
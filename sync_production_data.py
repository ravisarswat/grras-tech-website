#!/usr/bin/env python3
"""
Production Data Synchronization Script for GRRAS Solutions
This script adds the missing C/C++/DSA course and other course data to production MongoDB
"""

import requests
import json

PRODUCTION_URL = "https://grras-training-institute-production.up.railway.app"

def login_admin():
    """Login to admin and get auth token"""
    try:
        response = requests.post(
            f"{PRODUCTION_URL}/api/admin/login",
            json={"password": "grras@admin2024"},  # Default admin password
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            token = result.get('token')
            print(f"✅ Admin login successful")
            return token
        else:
            print(f"❌ Admin login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def get_current_courses(token):
    """Get current courses from production"""
    try:
        headers = {"Authorization": f"Bearer {token}"} if token else {}
        response = requests.get(f"{PRODUCTION_URL}/api/courses", headers=headers, timeout=30)
        
        if response.status_code == 200:
            courses = response.json().get('courses', [])
            print(f"📊 Current courses in production: {len(courses)}")
            for course in courses:
                print(f"  - {course.get('title', 'Unknown')} ({course.get('slug', 'no-slug')})")
            return courses
        else:
            print(f"❌ Failed to get courses: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Error getting courses: {e}")
        return []

def create_cpp_course(token):
    """Create the C/C++/DSA course in production"""
    
    cpp_course_data = {
        "content": {
            "courses": [
                {
                    'slug': 'bca-degree',
                    'title': 'BCA Degree Program',
                    'oneLiner': 'Industry-Integrated Bachelor Degree Program with cloud computing and AI/ML specializations.',
                    'duration': '3 Years',
                    'fees': 'Contact for Details',
                    'category': 'degree',
                    'level': 'Beginner to Advanced',
                    'order': 1,
                    'visible': True,
                    'featured': True,
                    'tools': ['Java', 'Python', 'AWS', 'Docker', 'React', 'MySQL'],
                    'highlights': ['UGC Recognized Degree', 'Industry Projects', 'Placement Assistance', '100+ Hiring Partners'],
                    'learningOutcomes': ['Programming fundamentals', 'Cloud computing skills', 'Industry-ready development'],
                    'careerRoles': ['Software Developer', 'Cloud Engineer', 'System Administrator'],
                    'overview': 'Comprehensive BCA program with modern technology integration.',
                    'certificateInfo': 'UGC recognized degree certificate.',
                    'batchesInfo': 'Annual admissions with semester system.',
                    'eligibility': 'Higher secondary (12th) pass with mathematics.',
                    'mode': ['Classroom'],
                    'seo': {'title': 'BCA Degree Program - GRRAS Solutions', 'description': 'Industry-integrated BCA program', 'keywords': 'bca, degree, grras'}
                },
                {
                    'slug': 'devops-training',
                    'title': 'DevOps Training',
                    'oneLiner': 'Master Modern DevOps Practices & Cloud Technologies with hands-on AWS labs.',
                    'duration': '6 Months',
                    'fees': '₹35,000 (EMI Available)',
                    'category': 'cloud',
                    'level': 'Intermediate',
                    'order': 2,
                    'visible': True,
                    'featured': True,
                    'tools': ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible'],
                    'highlights': ['Hands-on AWS Labs', 'Real Projects', 'Industry Mentorship', 'Certification Prep'],
                    'learningOutcomes': ['AWS cloud mastery', 'CI/CD pipeline implementation', 'Container orchestration'],
                    'careerRoles': ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer'],
                    'overview': 'Comprehensive DevOps training with cloud focus.',
                    'certificateInfo': 'Industry-recognized DevOps certification.',
                    'batchesInfo': 'Monthly batches with flexible timing.',
                    'eligibility': 'Basic IT knowledge and Linux familiarity preferred.',
                    'mode': ['Classroom', 'Online'],
                    'seo': {'title': 'DevOps Training Course - GRRAS Solutions', 'description': 'DevOps training with AWS', 'keywords': 'devops, aws, cloud'}
                },
                {
                    'slug': 'redhat-certifications',
                    'title': 'Red Hat Certifications',
                    'oneLiner': 'Official Red Hat Training & Certification Programs (RHCSA, RHCE, OpenShift).',
                    'duration': '4 Months',
                    'fees': '₹40,000 (EMI Available)',
                    'category': 'certification',
                    'level': 'Intermediate',
                    'order': 3,
                    'visible': True,
                    'featured': False,
                    'tools': ['Red Hat Linux', 'OpenShift', 'Ansible', 'Podman'],
                    'highlights': ['Official Red Hat Training', 'Certified Instructors', 'Exam Guarantee', 'Hands-on Labs'],
                    'learningOutcomes': ['Linux system administration', 'Enterprise automation', 'Container management'],
                    'careerRoles': ['Linux Administrator', 'Red Hat Engineer', 'OpenShift Administrator'],
                    'overview': 'Official Red Hat training for enterprise Linux skills.',
                    'certificateInfo': 'Official Red Hat certification upon completion.',
                    'batchesInfo': 'Monthly batches available.',
                    'eligibility': 'Basic Linux knowledge required.',
                    'mode': ['Classroom'],
                    'seo': {'title': 'Red Hat Certification Training - GRRAS', 'description': 'Official Red Hat training', 'keywords': 'redhat, linux, certification'}
                },
                {
                    'slug': 'data-science-machine-learning',
                    'title': 'Data Science & Machine Learning',
                    'oneLiner': 'Complete Data Science program with Python, statistics, and machine learning algorithms.',
                    'duration': '8 Months',
                    'fees': '₹45,000 (EMI Available)',
                    'category': 'programming',
                    'level': 'Beginner to Advanced',
                    'order': 4,
                    'visible': True,
                    'featured': True,
                    'tools': ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'Jupyter'],
                    'highlights': ['Real Dataset Projects', 'Industry Mentorship', 'Portfolio Development', 'Career Support'],
                    'learningOutcomes': ['Python for data science', 'Machine learning implementation', 'Statistical analysis'],
                    'careerRoles': ['Data Scientist', 'ML Engineer', 'Data Analyst', 'AI Specialist'],
                    'overview': 'Comprehensive data science program from basics to advanced ML.',
                    'certificateInfo': 'Industry-recognized data science certificate.',
                    'batchesInfo': 'Weekend and evening batches available.',
                    'eligibility': 'Basic mathematics and programming knowledge.',
                    'mode': ['Classroom', 'Online'],
                    'seo': {'title': 'Data Science Course - GRRAS Solutions', 'description': 'Data science and ML training', 'keywords': 'data science, machine learning, python'}
                },
                {
                    'slug': 'java-salesforce',
                    'title': 'Java & Salesforce',
                    'oneLiner': 'Enterprise Java & Salesforce Development for business applications.',
                    'duration': '6 Months',
                    'fees': '₹30,000 (EMI Available)',
                    'category': 'programming',
                    'level': 'Intermediate',
                    'order': 5,
                    'visible': True,
                    'featured': False,
                    'tools': ['Java', 'Spring Framework', 'Salesforce', 'Apex', 'Lightning'],
                    'highlights': ['Enterprise Projects', 'Salesforce Certification', 'Industry Practices', 'Placement Support'],
                    'learningOutcomes': ['Java enterprise development', 'Salesforce platform mastery', 'Business application development'],
                    'careerRoles': ['Java Developer', 'Salesforce Developer', 'Enterprise Developer'],
                    'overview': 'Combined Java and Salesforce training for enterprise development.',
                    'certificateInfo': 'Java and Salesforce completion certificates.',
                    'batchesInfo': 'Weekday and weekend options available.',
                    'eligibility': 'Basic programming knowledge required.',
                    'mode': ['Classroom', 'Online'],
                    'seo': {'title': 'Java Salesforce Course - GRRAS', 'description': 'Java and Salesforce development', 'keywords': 'java, salesforce, enterprise'}
                },
                {
                    'slug': 'python',
                    'title': 'Python',
                    'oneLiner': 'Complete Python Programming & Web Development with Django/Flask frameworks.',
                    'duration': '4 Months',
                    'fees': '₹25,000 (EMI Available)',
                    'category': 'programming',
                    'level': 'Beginner to Intermediate',
                    'order': 6,
                    'visible': True,
                    'featured': False,
                    'tools': ['Python', 'Django', 'Flask', 'SQLite', 'Git', 'VS Code'],
                    'highlights': ['Web Development', 'Automation Scripting', 'Database Integration', 'Career Guidance'],
                    'learningOutcomes': ['Python programming mastery', 'Web application development', 'Automation skills'],
                    'careerRoles': ['Python Developer', 'Web Developer', 'Automation Engineer'],
                    'overview': 'Comprehensive Python programming from basics to web development.',
                    'certificateInfo': 'Python programming completion certificate.',
                    'batchesInfo': 'Flexible timing available.',
                    'eligibility': 'No prior programming experience required.',
                    'mode': ['Classroom', 'Online', 'Hybrid'],
                    'seo': {'title': 'Python Course - GRRAS Solutions', 'description': 'Python programming course', 'keywords': 'python, programming, web development'}
                },
                {
                    'slug': 'c-cpp-dsa',
                    'title': 'C / C++ & Data Structures',
                    'oneLiner': 'Master C, C++ (OOP), and Data Structures & Algorithms for strong problem-solving and interview readiness.',
                    'duration': '3 months',
                    'fees': '₹15,000 (EMI Available)',
                    'category': 'programming',
                    'level': 'Beginner to Intermediate',
                    'order': 7,
                    'visible': True,
                    'featured': False,
                    'thumbnailUrl': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
                    'overview': '''Focused track covering C fundamentals, OOP with C++, STL, problem-solving patterns, and complexity analysis with hands-on coding.

This comprehensive course provides a structured approach to mastering programming fundamentals through C and C++, while building strong problem-solving skills with Data Structures and Algorithms. Perfect for students preparing for technical interviews or looking to strengthen their programming foundation.

The curriculum is designed to take you from basic C programming concepts to advanced C++ features and algorithmic thinking, ensuring you develop both theoretical knowledge and practical coding skills.''',
                    'tools': [
                        'C Programming',
                        'C++ Programming', 
                        'GCC/Clang Compiler',
                        'STL (Standard Template Library)',
                        'Git/GitHub',
                        'VS Code',
                        'Online Judges',
                        'Data Structures',
                        'Algorithms'
                    ],
                    'highlights': [
                        'Structured roadmap for interviews',
                        'Daily coding practice & contests',
                        'Time & space complexity mastery',
                        'Patterns: two-pointer, sliding window, DP, graphs',
                        'Industry-standard coding practices',
                        'Problem-solving methodology',
                        'Hands-on project work',
                        'Competitive programming preparation'
                    ],
                    'learningOutcomes': [
                        'Write efficient C/C++ programs using OOP & STL',
                        'Analyze algorithm complexity and optimize solutions',
                        'Implement core DSA (arrays, strings, stacks/queues, linked lists, trees, graphs, heaps)',
                        'Solve standard interview problems end-to-end',
                        'Apply design patterns and best practices',
                        'Debug and optimize code effectively',
                        'Understand memory management and pointers',
                        'Build complex data structures from scratch'
                    ],
                    'careerRoles': [
                        'Software Engineer',
                        'C++ Developer', 
                        'Competitive Programmer',
                        'Systems Programmer',
                        'Backend Developer',
                        'Technical Lead',
                        'Software Architect',
                        'Game Developer'
                    ],
                    'certificateInfo': 'Certificate of completion with placement guidance and interview preparation support.',
                    'batchesInfo': 'Monthly intakes with weekday/weekend options. Flexible timing available for working professionals.',
                    'eligibility': '12th Pass/Graduate; basic computer knowledge preferred but not mandatory.',
                    'mode': ['Classroom', 'Online', 'Hybrid'],
                    'seo': {
                        'title': 'C / C++ & DSA Course in Jaipur – GRRAS Solutions',
                        'description': 'Learn C, C++ (OOP), and Data Structures & Algorithms with hands-on coding, STL, and interview prep. Monthly intakes with placement guidance.',
                        'keywords': 'c training, c++ course, dsa course jaipur, data structures algorithms, grras programming',
                        'ogImage': ''
                    }
                },
                {
                    'slug': 'cyber-security',
                    'title': 'Cyber Security',
                    'oneLiner': 'Master Cyber Security & Ethical Hacking with hands-on penetration testing experience.',
                    'duration': '6 Months',
                    'fees': '₹30,000 (EMI Available)',
                    'category': 'security',
                    'level': 'Intermediate to Advanced',
                    'order': 8,
                    'visible': True,
                    'featured': True,
                    'tools': ['Kali Linux', 'Wireshark', 'Metasploit', 'Nmap', 'Burp Suite'],
                    'highlights': ['Ethical Hacking', 'Penetration Testing', 'Security Assessment', 'Certification Prep'],
                    'learningOutcomes': ['Security fundamentals', 'Penetration testing skills', 'Vulnerability assessment'],
                    'careerRoles': ['Security Analyst', 'Ethical Hacker', 'Penetration Tester'],
                    'overview': 'Comprehensive cyber security training with ethical hacking focus.',
                    'certificateInfo': 'Industry-recognized security certificate.',
                    'batchesInfo': 'Monthly batches available.',
                    'eligibility': 'Basic networking and computer knowledge.',
                    'mode': ['Classroom', 'Online'],
                    'seo': {'title': 'Cyber Security Course - GRRAS', 'description': 'Cyber security and ethical hacking', 'keywords': 'cyber security, ethical hacking, penetration testing'}
                }
            ]
        }
    }
    
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        response = requests.post(
            f"{PRODUCTION_URL}/api/content",
            headers=headers,
            json=cpp_course_data,
            timeout=60
        )
        
        if response.status_code == 200:
            print(f"✅ All courses (including C/C++/DSA) added successfully to production!")
            return True
        else:
            print(f"❌ Failed to add courses: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error adding courses: {e}")
        return False

def main():
    print("🚀 GRRAS Production Data Sync Starting...")
    print("=" * 50)
    
    # Step 1: Login
    token = login_admin()
    if not token:
        print("❌ Cannot proceed without admin access")
        return
    
    # Step 2: Check current courses
    print("\n📊 Checking current production courses...")
    current_courses = get_current_courses(token)
    
    # Step 3: Add missing course data
    if len(current_courses) < 8:
        print(f"\n📝 Adding missing courses to production (current: {len(current_courses)}, expected: 8)...")
        success = create_cpp_course(token)
        
        if success:
            print("\n✅ Verifying courses after sync...")
            final_courses = get_current_courses(token)
            print(f"🎉 Production sync completed! Total courses: {len(final_courses)}")
        else:
            print("\n❌ Course sync failed")
    else:
        print(f"\n✅ All courses already exist in production ({len(current_courses)} courses)")
    
    print("\n" + "=" * 50)
    print("🎯 Production data sync completed!")

if __name__ == "__main__":
    main()
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, 
  Users, 
  Award, 
  BookOpen, 
  Download, 
  ArrowLeft,
  CheckCircle,
  Star,
  Target,
  Briefcase,
  Info
} from 'lucide-react';
import EnhancedSEO from '../components/EnhancedSEO';
import SyllabusModal from '../components/SyllabusModal';
import { courses } from '../data/courses';

// Initialize course data synchronously for SSR compatibility
const initializeCourseData = (slug) => {
  try {
    // Find course in static data
    const foundCourse = courses.find(c => c.slug === slug);
    
    if (!foundCourse) {
      return { course: null, error: 'Course not found' };
    }
    
    // Prepare course data with defaults
    const courseWithDefaults = {
      ...foundCourse,
      // Ensure arrays exist
      highlights: foundCourse.highlights || [],
      learningOutcomes: foundCourse.learningOutcomes || [],
      careerRoles: foundCourse.careerRoles || [],
      tools: foundCourse.tools || [],
      mode: Array.isArray(foundCourse.mode) ? foundCourse.mode : foundCourse.mode ? foundCourse.mode.split(', ') : [],
      // Set defaults for missing optional fields
      overview: foundCourse.overview || foundCourse.description || '',
      certificateInfo: foundCourse.certificateInfo || '',
      batchesInfo: foundCourse.batchesInfo || '',
      eligibility: foundCourse.eligibility || 'Contact for details',
      level: foundCourse.level || 'All Levels',
      category: foundCourse.category || 'Training',
      fees: foundCourse.fees || foundCourse.price || 'Contact for Details'
    };
    
    return { course: courseWithDefaults, error: null };
  } catch (error) {
    console.error('Error initializing course data:', error);
    return { course: null, error: 'Course not found' };
  }
};

// Get course-specific SEO data
const getCourseSEO = (slug) => {
  const courseSEOData = {
    'rhcsa-red-hat-certified-system-administrator': {
      title: 'RHCSA Certification Training in Jaipur | Red Hat Partner – GRRAS',
      description: 'Become a Red Hat Certified System Administrator with official RHCSA training at GRRAS Jaipur. 100% practical labs & exam support.',
      h1: 'RHCSA Certification Training – Red Hat Partner Jaipur',
      h2Sections: [
        { title: 'Why Choose RHCSA?', content: 'RHCSA certification is globally recognized and validates your Linux system administration skills.' },
        { title: 'RHCSA Course Modules', content: 'Comprehensive modules covering Linux fundamentals, user management, networking, and security.' },
        { title: 'Exam Preparation & Support', content: 'Extensive hands-on labs and mock exams to ensure certification success.' },
        { title: 'Career Opportunities', content: 'Open doors to Linux Administrator, DevOps Engineer, and Cloud Administrator roles.' }
      ],
      faqs: [
        {
          question: 'What is the duration of RHCSA training?',
          answer: 'RHCSA training typically takes 4-6 weeks with intensive hands-on labs and practical sessions to ensure certification success.'
        },
        {
          question: 'Does GRRAS provide Red Hat exam vouchers?',
          answer: 'Yes, we provide Red Hat exam vouchers as part of our certification packages along with extensive lab access and practice tests.'
        },
        {
          question: 'Is RHCSA certification valid globally?',
          answer: 'Yes, RHCSA certification is globally recognized by Red Hat and validates your Linux system administration skills worldwide.'
        }
      ],
      imageAlts: {
        logo: 'RHCSA Training and Certification at GRRAS Jaipur',
        lab: 'Hands-on RHCSA Labs at GRRAS Solutions'
      }
    },
    'rhce-red-hat-certified-engineer': {
      title: 'RHCE Certification Training in Jaipur | Red Hat Partner – GRRAS',
      description: 'Advance your Linux career with RHCE certification at GRRAS Jaipur. Red Hat official training partner with expert instructors & labs.',
      h1: 'RHCE Certification Training – Red Hat Partner Jaipur',
      h2Sections: [
        { title: 'Why RHCE Matters', content: 'RHCE certification demonstrates advanced automation and configuration management skills.' },
        { title: 'RHCE Course Modules', content: 'Advanced modules covering Ansible automation, network services, and system optimization.' },
        { title: 'Hands-on Lab Exercises', content: 'Extensive practical sessions with real-world scenarios and automation projects.' },
        { title: 'Career Scope', content: 'Advanced roles as Senior Linux Administrator, DevOps Engineer, and Infrastructure Architect.' }
      ],
      faqs: [
        {
          question: 'What is the difference between RHCSA and RHCE?',
          answer: 'RHCSA covers Linux fundamentals while RHCE focuses on advanced automation, configuration management, and system optimization using Ansible.'
        },
        {
          question: 'Can I directly appear for RHCE exam?',
          answer: 'Yes, you can directly appear for RHCE exam, but RHCSA knowledge is recommended as foundation for better understanding.'
        },
        {
          question: 'Does GRRAS provide RHCE exam support?',
          answer: 'Yes, we provide comprehensive RHCE exam preparation including practice labs, mock tests, and expert guidance.'
        }
      ],
      imageAlts: {
        logo: 'RHCE Training Jaipur – Red Hat Certified Engineer',
        lab: 'Linux Training at GRRAS Jaipur'
      }
    },
    'do188-red-hat-openshift-development-i': {
      title: 'DO188 Red Hat OpenShift Development I Training | GRRAS Jaipur',
      description: 'Learn Red Hat OpenShift Development with DO188 official course at GRRAS Jaipur. Hands-on container app development training.',
      h1: 'Red Hat OpenShift Development I (DO188) Training',
      h2Sections: [
        { title: 'Course Overview', content: 'Learn to build, deploy, and manage containerized applications on OpenShift platform.' },
        { title: 'OpenShift Development Modules', content: 'Comprehensive modules covering container development, deployment strategies, and application management.' },
        { title: 'Practical Labs', content: 'Hands-on experience with OpenShift console, CLI tools, and development workflows.' },
        { title: 'Career Path', content: 'OpenShift Developer, Container Application Developer, and Cloud Application Architect roles.' }
      ],
      faqs: [
        {
          question: 'What is DO188 course about?',
          answer: 'DO188 teaches container application development and deployment on Red Hat OpenShift platform using modern DevOps practices.'
        },
        {
          question: 'Do I need Kubernetes knowledge before DO188?',
          answer: 'Basic containerization knowledge is helpful, but the course covers OpenShift fundamentals from the beginning.'
        },
        {
          question: 'Does GRRAS provide Red Hat DO188 exam prep?',
          answer: 'Yes, we provide comprehensive exam preparation including hands-on labs and practice exercises for DO188 certification.'
        }
      ],
      imageAlts: {
        logo: 'Red Hat OpenShift DO188 Training Jaipur',
        lab: 'Hands-on OpenShift Development Lab Jaipur'
      }
    },
    'aws-solutions-architect-associate': {
      title: 'AWS Solutions Architect Associate Training | GRRAS Jaipur',
      description: 'Become AWS Solutions Architect Associate with official AWS training at GRRAS Jaipur. Practical cloud labs & certification prep.',
      h1: 'AWS Solutions Architect Associate Training',
      h2Sections: [
        { title: 'Why AWS Solutions Architect?', content: 'High-demand certification for designing scalable and resilient cloud architectures on AWS.' },
        { title: 'Course Modules', content: 'Comprehensive coverage of AWS services, architecture patterns, and best practices.' },
        { title: 'Hands-on AWS Labs', content: 'Practical experience with real AWS services and architecture design scenarios.' },
        { title: 'Career Opportunities', content: 'Solutions Architect, Cloud Architect, and Technical Consultant roles with excellent packages.' }
      ],
      faqs: [
        {
          question: 'Is AWS Solutions Architect good for beginners?',
          answer: 'This course is designed for those with basic cloud knowledge. We provide foundation modules for complete beginners.'
        },
        {
          question: 'Does GRRAS provide AWS certification exam prep?',
          answer: 'Yes, we provide comprehensive exam preparation including practice tests, labs, and expert guidance for AWS certification.'
        },
        {
          question: 'What jobs can I apply for after this course?',
          answer: 'You can apply for Solutions Architect, Cloud Architect, Technical Consultant, and Cloud Engineer roles with excellent salary packages.'
        }
      ],
      imageAlts: {
        logo: 'AWS Solutions Architect Training Jaipur',
        lab: 'AWS Cloud Architecture Training'
      }
    },
    'aws-sysops-administrator-associate': {
      title: 'AWS SysOps Administrator Associate Training | GRRAS Jaipur',
      description: 'Master AWS SysOps Administration with GRRAS Jaipur. Learn cloud operations, automation & monitoring with hands-on labs.',
      h1: 'AWS SysOps Administrator Associate Training',
      h2Sections: [
        { title: 'Course Overview', content: 'Learn AWS systems operations, monitoring, automation, and troubleshooting.' },
        { title: 'SysOps Administration Modules', content: 'Comprehensive modules covering AWS monitoring, automation, security, and cost optimization.' },
        { title: 'Labs & Hands-on Practice', content: 'Practical experience with AWS CloudWatch, Systems Manager, and automation tools.' },
        { title: 'Job Roles After Training', content: 'SysOps Administrator, Cloud Operations Engineer, and DevOps Engineer roles.' }
      ],
      faqs: [
        {
          question: 'What is AWS SysOps role?',
          answer: 'AWS SysOps Administrator manages AWS infrastructure, monitoring, automation, and ensures optimal cloud operations.'
        },
        {
          question: 'Does this course include real-world projects?',
          answer: 'Yes, the course includes hands-on projects with real AWS services and practical automation scenarios.'
        },
        {
          question: 'Is SysOps certification in demand?',
          answer: 'Yes, AWS SysOps certification is highly in demand with excellent career opportunities and salary packages.'
        }
      ],
      imageAlts: {
        logo: 'AWS SysOps Administrator Training Jaipur',
        lab: 'AWS SysOps Cloud Monitoring Lab Jaipur'
      }
    },
    'aws-developer-associate': {
      title: 'AWS Developer Associate Training | GRRAS Jaipur',
      description: 'Learn AWS Developer Associate course at GRRAS Jaipur. Build, deploy & optimize applications on AWS with certification prep.',
      h1: 'AWS Developer Associate Training',
      h2Sections: [
        { title: 'Why AWS Developer Certification?', content: 'Validate your ability to develop and maintain AWS applications with modern development practices.' },
        { title: 'Course Curriculum', content: 'Comprehensive coverage of AWS developer services, SDKs, and application deployment strategies.' },
        { title: 'Project Work', content: 'Build real AWS applications using Lambda, API Gateway, DynamoDB, and other developer services.' },
        { title: 'Certification & Jobs', content: 'Prepare for AWS Developer certification and pursue cloud developer career opportunities.' }
      ],
      faqs: [
        {
          question: 'What skills will I learn in AWS Developer course?',
          answer: 'You will learn AWS SDKs, Lambda functions, API Gateway, DynamoDB, application deployment, and cloud development best practices.'
        },
        {
          question: 'Do I need prior coding knowledge?',
          answer: 'Basic programming knowledge is recommended. We provide foundational modules for developers new to cloud development.'
        },
        {
          question: 'Does GRRAS provide AWS Developer certification support?',
          answer: 'Yes, we provide comprehensive certification preparation including practice tests, labs, and expert guidance for AWS Developer exam.'
        }
      ],
      imageAlts: {
        logo: 'AWS Developer Associate Training Jaipur',
        lab: 'AWS Cloud Application Development Lab'
      }
    },
    'devops-training': {
      title: 'DevOps Training in Jaipur | Certification & Placement – GRRAS',
      description: 'Learn DevOps with Docker, Kubernetes, Jenkins & CI/CD pipelines at GRRAS Jaipur. Hands-on training with projects & job placement.',
      h1: 'DevOps Training in Jaipur – Master CI/CD, Docker & Kubernetes',
      h2Sections: [
        { title: 'Why Learn DevOps?', content: 'DevOps bridges development and operations for faster, more reliable software delivery and deployment.' },
        { title: 'GRRAS DevOps Course Highlights', content: 'Comprehensive training covering the entire DevOps toolchain with industry best practices.' },
        { title: 'Detailed DevOps Curriculum', content: 'In-depth modules on Docker, Kubernetes, Jenkins, Git, Terraform, and cloud platforms.' },
        { title: 'Career Opportunities', content: 'High-demand roles as DevOps Engineer, Site Reliability Engineer, and Cloud Automation Specialist.' }
      ],
      faqs: [
        {
          question: 'What is the duration of DevOps training?',
          answer: 'DevOps training is typically 3-4 months with intensive hands-on labs, projects, and practical assignments.'
        },
        {
          question: 'Will I get hands-on labs and projects?',
          answer: 'Yes, our DevOps course includes extensive hands-on labs, real-world projects, and CI/CD pipeline implementations.'
        },
        {
          question: 'Does GRRAS provide DevOps certification?',
          answer: 'Yes, we provide course completion certificate and prepare you for industry-recognized DevOps certifications.'
        }
      ],
      imageAlts: {
        logo: 'DevOps Training Jaipur – CI/CD Docker Kubernetes',
        lab: 'Hands-on Jenkins CI/CD Training Jaipur'
      }
    },
    'kubernetes-administrator-cka': {
      title: 'Kubernetes Administrator (CKA) Training in Jaipur | GRRAS',
      description: 'Prepare for Kubernetes Administrator (CKA) exam with GRRAS Jaipur. Hands-on Kubernetes labs & certification guidance.',
      h1: 'Kubernetes Administrator (CKA) Training',
      h2Sections: [
        { title: 'Why Kubernetes Certification?', content: 'CKA certification validates your expertise in Kubernetes cluster administration and management.' },
        { title: 'Kubernetes Training Modules', content: 'Comprehensive modules covering cluster setup, networking, security, troubleshooting, and maintenance.' },
        { title: 'Hands-on Labs', content: 'Extensive practical sessions with real Kubernetes clusters and production scenarios.' },
        { title: 'Career Benefits', content: 'High-demand roles as Kubernetes Administrator, Container Platform Engineer, and Cloud Infrastructure Specialist.' }
      ],
      faqs: [
        {
          question: 'What is the scope of Kubernetes certification?',
          answer: 'CKA certification covers cluster architecture, installation, configuration, networking, security, and troubleshooting of Kubernetes clusters.'
        },
        {
          question: 'Does GRRAS provide CKA exam prep?',
          answer: 'Yes, we provide comprehensive CKA exam preparation including hands-on labs, mock tests, and expert guidance.'
        },
        {
          question: 'Is Kubernetes training practical-based?',
          answer: 'Yes, our Kubernetes training is highly practical with real cluster setups, troubleshooting scenarios, and hands-on exercises.'
        }
      ],
      imageAlts: {
        logo: 'Kubernetes Administrator CKA Training Jaipur',
        lab: 'Kubernetes Cluster Hands-on Lab'
      }
    },
    'docker-containerization': {
      title: 'Docker & Containerization Training in Jaipur | GRRAS',
      description: 'Learn Docker & containerization at GRRAS Jaipur. Hands-on labs to build, run & manage containers for DevOps & Cloud careers.',
      h1: 'Docker & Containerization Training',
      h2Sections: [
        { title: 'Why Learn Docker?', content: 'Docker containerization is essential for modern application deployment and DevOps workflows.' },
        { title: 'Docker Training Curriculum', content: 'Comprehensive modules covering Docker fundamentals, images, containers, networking, and orchestration.' },
        { title: 'Hands-on Docker Projects', content: 'Practical experience with container building, multi-container applications, and Docker Compose.' },
        { title: 'Career Opportunities', content: 'Gateway to DevOps Engineer, Container Developer, and Cloud Engineer career paths.' }
      ],
      faqs: [
        {
          question: 'What is Docker used for?',
          answer: 'Docker is used for containerizing applications, ensuring consistent deployment across different environments, and enabling microservices architecture.'
        },
        {
          question: 'Do I need DevOps knowledge before Docker training?',
          answer: 'No, our Docker course starts from basics and includes foundational concepts suitable for beginners.'
        },
        {
          question: 'Does GRRAS provide Docker certification prep?',
          answer: 'Yes, we prepare you for Docker certification exams and provide hands-on experience with container technologies.'
        }
      ],
      imageAlts: {
        logo: 'Docker Training and Containerization Course Jaipur',
        lab: 'Docker Container Hands-on Lab GRRAS'
      }
    },
    'azure-fundamentals-az-900': {
      title: 'Microsoft Azure Fundamentals (AZ-900) Training | GRRAS Jaipur',
      description: 'Learn Azure cloud basics with AZ-900 training at GRRAS Jaipur. Beginner-friendly Microsoft Azure certification prep course.',
      h1: 'Microsoft Azure Fundamentals (AZ-900) Training',
      h2Sections: [
        { title: 'Course Overview', content: 'Introduction to Microsoft Azure cloud services, concepts, and fundamental cloud computing principles.' },
        { title: 'Azure Cloud Basics', content: 'Core Azure services, security, privacy, compliance, and Azure pricing and support models.' },
        { title: 'Certification Support', content: 'Comprehensive preparation for AZ-900 exam with practice tests and study materials.' },
        { title: 'Job Roles', content: 'Foundation for Azure Administrator, Azure Developer, and cloud-related career paths.' }
      ],
      faqs: [
        {
          question: 'Is AZ-900 good for beginners?',
          answer: 'Yes, AZ-900 is designed for beginners with no prior Azure experience and serves as an excellent introduction to cloud computing.'
        },
        {
          question: 'How long is the AZ-900 course?',
          answer: 'AZ-900 course typically takes 2-3 weeks with flexible scheduling options for working professionals.'
        },
        {
          question: 'Does GRRAS provide Azure certification exam guidance?',
          answer: 'Yes, we provide comprehensive exam preparation including study materials, practice tests, and expert guidance for AZ-900 certification.'
        }
      ],
      imageAlts: {
        logo: 'Microsoft Azure Fundamentals Training Jaipur',
        lab: 'Microsoft Azure Basics Training Lab'
      }
    },
    'azure-administrator-az-104': {
      title: 'Microsoft Azure Administrator (AZ-104) Training | GRRAS Jaipur',
      description: 'Become a certified Azure Administrator with AZ-104 training at GRRAS Jaipur. Hands-on labs & certification guidance included.',
      h1: 'Microsoft Azure Administrator (AZ-104) Training',
      h2Sections: [
        { title: 'Why Azure Administrator?', content: 'Azure Administrators are in high demand for managing cloud infrastructure and Azure services.' },
        { title: 'Training Modules', content: 'Comprehensive modules covering Azure identities, governance, storage, compute resources, and networking.' },
        { title: 'Hands-on Azure Labs', content: 'Practical experience with Azure portal, PowerShell, CLI, and real Azure resource management.' },
        { title: 'Career Scope', content: 'Azure Administrator, Cloud Infrastructure Engineer, and Azure Solutions Architect career paths.' }
      ],
      faqs: [
        {
          question: 'What is the role of an Azure Administrator?',
          answer: 'Azure Administrator manages Azure subscriptions, implements storage solutions, manages identities, and configures virtual networks.'
        },
        {
          question: 'Do I need AZ-900 before AZ-104?',
          answer: 'AZ-900 is recommended but not mandatory. We provide foundational modules for those without Azure fundamentals background.'
        },
        {
          question: 'Does GRRAS provide Azure Administrator certification support?',
          answer: 'Yes, we provide comprehensive AZ-104 exam preparation including hands-on labs, practice tests, and expert guidance.'
        }
      ],
      imageAlts: {
        logo: 'Microsoft Azure Administrator Training Jaipur',
        lab: 'Azure Cloud Portal Lab at GRRAS'
      }
    },
    'python-data-science': {
      title: 'Python for Data Science Training in Jaipur | GRRAS',
      description: 'Learn Python for Data Science at GRRAS Jaipur. Master data analysis, visualization & machine learning foundations.',
      h1: 'Python for Data Science Training',
      h2Sections: [
        { title: 'Why Python for Data Science?', content: 'Python is the most popular language for data science with rich libraries and community support.' },
        { title: 'Course Modules', content: 'Comprehensive modules covering Python fundamentals, NumPy, Pandas, Matplotlib, and data analysis techniques.' },
        { title: 'Hands-on Data Labs', content: 'Practical experience with real datasets, data cleaning, visualization, and statistical analysis.' },
        { title: 'Career Paths', content: 'Data Analyst, Data Scientist, Business Intelligence Analyst, and Research Analyst roles.' }
      ],
      faqs: [
        {
          question: 'Do I need coding knowledge before Python for DS?',
          answer: 'No, our course starts from Python basics and progresses to advanced data science concepts suitable for beginners.'
        },
        {
          question: 'Is this course beginner-friendly?',
          answer: 'Yes, the course is designed for beginners with step-by-step learning approach and practical examples.'
        },
        {
          question: 'What projects will I work on?',
          answer: 'You will work on real-world data analysis projects including sales analysis, customer segmentation, and predictive modeling.'
        }
      ],
      imageAlts: {
        logo: 'Python for Data Science Training Jaipur',
        lab: 'Data Science Visualization Project'
      }
    },
    'machine-learning-artificial-intelligence': {
      title: 'Machine Learning & AI Training in Jaipur | GRRAS',
      description: 'Learn Machine Learning & Artificial Intelligence with GRRAS Jaipur. Hands-on ML/AI projects & career-focused training.',
      h1: 'Machine Learning & AI Training',
      h2Sections: [
        { title: 'Why Learn ML & AI?', content: 'ML and AI are transforming industries with high-demand career opportunities and excellent growth prospects.' },
        { title: 'Training Modules', content: 'Comprehensive modules covering supervised/unsupervised learning, neural networks, deep learning, and AI frameworks.' },
        { title: 'AI Project Work', content: 'Hands-on projects with real datasets including image recognition, natural language processing, and predictive modeling.' },
        { title: 'Career Scope', content: 'ML Engineer, AI Specialist, Data Scientist, and Research Scientist roles with excellent packages.' }
      ],
      faqs: [
        {
          question: 'Do I need Math background for ML/AI?',
          answer: 'Basic mathematics helps, but we provide foundational math concepts as part of the course curriculum.'
        },
        {
          question: 'What projects are included in ML/AI training?',
          answer: 'Projects include image classification, sentiment analysis, recommendation systems, and chatbot development using real datasets.'
        },
        {
          question: 'Is ML/AI in demand?',
          answer: 'Yes, ML/AI professionals are in extremely high demand across industries with excellent salary packages and growth opportunities.'
        }
      ],
      imageAlts: {
        logo: 'Machine Learning and AI Training Jaipur',
        lab: 'AI Project Lab GRRAS Jaipur'
      }
    },
    'full-stack-web-development': {
      title: 'Full Stack Web Development Training in Jaipur | GRRAS',
      description: 'Learn Full Stack Web Development at GRRAS Jaipur. Master frontend, backend & databases with industry projects.',
      h1: 'Full Stack Web Development Training',
      h2Sections: [
        { title: 'Why Choose Full Stack?', content: 'Full Stack developers are versatile professionals capable of building complete web applications from frontend to backend.' },
        { title: 'Frontend Development Modules', content: 'HTML5, CSS3, JavaScript, React.js, and responsive web design with modern frameworks.' },
        { title: 'Backend Development Modules', content: 'Node.js, Express.js, databases, API development, and server-side programming.' },
        { title: 'Career Opportunities', content: 'Full Stack Developer, Web Developer, Frontend Developer, and Backend Developer roles.' }
      ],
      faqs: [
        {
          question: 'What skills will I learn in Full Stack course?',
          answer: 'You will learn HTML/CSS, JavaScript, React.js, Node.js, databases, API development, and complete web application development.'
        },
        {
          question: 'Do I need coding knowledge?',
          answer: 'No, our course starts from programming basics and progresses to advanced full stack development concepts.'
        },
        {
          question: 'What jobs can I apply for?',
          answer: 'You can apply for Full Stack Developer, Web Developer, Frontend/Backend Developer, and Software Engineer positions.'
        }
      ],
      imageAlts: {
        logo: 'Full Stack Web Development Course Jaipur',
        lab: 'Full Stack Project Work GRRAS'
      }
    },
    'java-programming-enterprise': {
      title: 'Java Programming & Enterprise Development Training | GRRAS Jaipur',
      description: 'Learn Java programming & enterprise app development at GRRAS Jaipur. Build strong coding foundation with projects.',
      h1: 'Java Programming & Enterprise Development',
      h2Sections: [
        { title: 'Why Learn Java?', content: 'Java is one of the most popular programming languages with excellent career opportunities and platform independence.' },
        { title: 'Java Programming Modules', content: 'Core Java, OOP concepts, collections, multithreading, and advanced Java enterprise frameworks.' },
        { title: 'Project-Based Learning', content: 'Hands-on projects including web applications, enterprise systems, and database integration.' },
        { title: 'Career Opportunities', content: 'Java Developer, Software Engineer, Backend Developer, and Enterprise Application Developer roles.' }
      ],
      faqs: [
        {
          question: 'Is Java still in demand?',
          answer: 'Yes, Java remains one of the most in-demand programming languages with excellent career opportunities across industries.'
        },
        {
          question: 'Do I need prior coding knowledge?',
          answer: 'No, our Java course starts from programming fundamentals and progresses to advanced enterprise development concepts.'
        },
        {
          question: 'What projects are included in Java course?',
          answer: 'Projects include web applications, database management systems, REST APIs, and enterprise-level applications.'
        }
      ],
      imageAlts: {
        logo: 'Java Programming Training Jaipur',
        lab: 'Java Coding Lab GRRAS'
      }
    },
    'ethical-hacking-penetration-testing': {
      title: 'Ethical Hacking & Penetration Testing Training | GRRAS Jaipur',
      description: 'Learn ethical hacking & penetration testing with GRRAS Jaipur. Hands-on cyber security labs & certification support.',
      h1: 'Ethical Hacking & Penetration Testing Training',
      h2Sections: [
        { title: 'Why Learn Ethical Hacking?', content: 'Ethical hackers are in high demand to protect organizations from cyber threats and security vulnerabilities.' },
        { title: 'Training Modules', content: 'Comprehensive modules covering reconnaissance, scanning, enumeration, system hacking, and penetration testing methodologies.' },
        { title: 'Lab Work', content: 'Hands-on labs with real hacking tools, vulnerable systems, and practical penetration testing scenarios.' },
        { title: 'Career Roles', content: 'Ethical Hacker, Penetration Tester, Security Analyst, and Cybersecurity Consultant positions.' }
      ],
      faqs: [
        {
          question: 'Do I need coding knowledge for ethical hacking?',
          answer: 'Basic programming knowledge helps, but we provide foundational concepts as part of the ethical hacking curriculum.'
        },
        {
          question: 'Is CEH certification included?',
          answer: 'We prepare you for CEH certification exam with comprehensive training and practice labs.'
        },
        {
          question: 'What jobs can I get after this course?',
          answer: 'You can work as Ethical Hacker, Penetration Tester, Security Analyst, or Cybersecurity Consultant with excellent packages.'
        }
      ],
      imageAlts: {
        logo: 'Ethical Hacking Training Jaipur',
        lab: 'Penetration Testing Lab GRRAS'
      }
    },
    'cybersecurity-fundamentals': {
      title: 'Cyber Security Fundamentals Training in Jaipur | GRRAS',
      description: 'Learn Cyber Security Fundamentals at GRRAS Jaipur. Beginner-friendly course for IT security careers.',
      h1: 'Cyber Security Fundamentals Training',
      h2Sections: [
        { title: 'Why Cyber Security?', content: 'Cybersecurity is critical for protecting digital assets with growing demand for security professionals.' },
        { title: 'Course Curriculum', content: 'Fundamentals of cybersecurity, network security, cryptography, risk management, and security frameworks.' },
        { title: 'Practical Labs', content: 'Hands-on experience with security tools, vulnerability assessment, and security implementation.' },
        { title: 'Career Benefits', content: 'Entry into cybersecurity field with roles as Security Analyst, SOC Analyst, and Security Specialist.' }
      ],
      faqs: [
        {
          question: 'Is this course beginner-friendly?',
          answer: 'Yes, Cybersecurity Fundamentals is designed for beginners with no prior security knowledge.'
        },
        {
          question: 'Do I need prior IT knowledge?',
          answer: 'Basic IT knowledge is helpful, but we provide foundational IT concepts as part of the course.'
        },
        {
          question: 'Does GRRAS provide certification?',
          answer: 'Yes, we provide course completion certificate and prepare you for industry-recognized cybersecurity certifications.'
        }
      ],
      imageAlts: {
        logo: 'Cyber Security Fundamentals Course Jaipur',
        lab: 'Cyber Security Training Jaipur'
      }
    },
    'bachelor-computer-applications-bca': {
      title: 'BCA Degree Program with Internship & Stipend | GRRAS Jaipur',
      description: 'UGC-approved BCA degree with live IT training, internship & stipend. Become industry-ready with GRRAS Jaipur.',
      h1: 'BCA Degree Program with Internship & Stipend',
      h2Sections: [
        { title: 'Why Choose BCA at GRRAS?', content: 'UGC-approved degree with industry integration, live training, and guaranteed internship opportunities.' },
        { title: 'Program Structure', content: 'Comprehensive 3-year program with theoretical foundation and practical IT skills development.' },
        { title: 'Internship & Stipend Opportunities', content: 'Guaranteed internship with stipend ranging from ₹5,000 to ₹15,000 during the program.' },
        { title: 'Career Scope', content: 'Software Developer, System Analyst, Web Developer, and IT Consultant career opportunities.' }
      ],
      faqs: [
        {
          question: 'Is the BCA degree UGC approved?',
          answer: 'Yes, our BCA degree program is UGC-approved and recognized, providing you with a valid graduate degree.'
        },
        {
          question: 'Do students get internships during BCA?',
          answer: 'Yes, all BCA students get guaranteed internship opportunities with industry exposure and practical experience.'
        },
        {
          question: 'What is the stipend structure?',
          answer: 'Students receive monthly stipends during internship periods, ranging from ₹5,000 to ₹15,000 based on performance.'
        }
      ],
      imageAlts: {
        logo: 'BCA Degree Program Jaipur with Internship',
        lab: 'BCA Students Training GRRAS Jaipur'
      }
    },
    'master-computer-applications-mca': {
      title: 'MCA Degree Program with Internship | GRRAS Jaipur',
      description: 'UGC-approved MCA degree with live projects & internships at GRRAS Jaipur. Industry-focused career program.',
      h1: 'MCA Degree Program with Internship',
      h2Sections: [
        { title: 'Why MCA at GRRAS?', content: 'Advanced degree program with industry-relevant curriculum and guaranteed placement assistance.' },
        { title: 'Program Structure', content: 'Comprehensive 2-year program with advanced topics in software development and computer applications.' },
        { title: 'Internship Opportunities', content: 'Guaranteed internship with live projects and industry mentorship for practical experience.' },
        { title: 'Career Benefits', content: 'Senior Software Developer, IT Manager, Systems Architect, and Technical Lead positions.' }
      ],
      faqs: [
        {
          question: 'Is MCA at GRRAS UGC-approved?',
          answer: 'Yes, our MCA degree program is UGC-approved and provides you with a recognized postgraduate degree.'
        },
        {
          question: 'Do MCA students also get internships?',
          answer: 'Yes, all MCA students get guaranteed internship opportunities with live projects and industry exposure.'
        },
        {
          question: 'What jobs can I apply for after MCA?',
          answer: 'You can apply for senior developer roles, IT management positions, systems architect, and technical lead positions.'
        }
      ],
      imageAlts: {
        logo: 'MCA Degree Program Jaipur',
        lab: 'MCA Students Working on Live Projects'
      }
    }
  };

  return courseSEOData[slug] || null;
};

const CourseDetail = () => {
  const { slug } = useParams();
  
  // Initialize data for SSR compatibility
  const initialCourseData = slug ? initializeCourseData(slug) : { course: null, error: 'No course slug provided' };
  
  const [course, setCourse] = useState(initialCourseData.course);
  const [loading, setLoading] = useState(false); // Start with false since data is pre-loaded
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [error, setError] = useState(initialCourseData.error);
  
  // Get SEO data for current course
  const courseSEO = slug ? getCourseSEO(slug) : null;

  useEffect(() => {
    // Only fetch if course data is missing or slug changed
    if (!course && slug) {
      const freshData = initializeCourseData(slug);
      setCourse(freshData.course);
      setError(freshData.error);
    } else if (course && course.slug !== slug) {
      // Slug changed, fetch new course data
      const freshData = initializeCourseData(slug);
      setCourse(freshData.course);
      setError(freshData.error);
    }
  }, [slug, course]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses" className="btn-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <EnhancedSEO
        title={`${course.title} | GRRAS Solutions Training Institute`}
        description={course.description}
        canonical={`https://www.grras.tech/courses/${course.slug}`}
        type="article"
        course={course}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className={`py-20 bg-gradient-to-br ${course.color || 'from-red-500 to-pink-600'} text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Course Info */}
              <div className="animate-fade-in-up">
                <Link 
                  to={course.categories && course.categories.length > 0 
                    ? `/courses?tab=${course.categories[0]}` 
                    : "/courses"
                  }
                  className="inline-flex items-center text-white hover:text-gray-200 mb-6 transition-colors group"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
                  <span>Back to {course.categories && course.categories.length > 0 ? `${course.categories[0].charAt(0).toUpperCase() + course.categories[0].slice(1)} Courses` : 'All Courses'}</span>
                </Link>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-6xl">{course.icon || '📚'}</div>
                  <div>
                    <span className="text-lg font-medium opacity-90">{course.category || 'Training'}</span>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {course.title || course.name}
                </h1>
                
                <p className="text-xl text-gray-100 mb-6">
                  {course.oneLiner || course.tagline}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm mb-8">
                  {course.duration && (
                    <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  
                  {course.level && (
                    <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                      <Users className="h-4 w-4" />
                      <span>{course.level}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-2 rounded-lg">
                    <Award className="h-4 w-4" />
                    <span>Certificate Included</span>
                  </div>
                </div>
              </div>
              
              {/* CTA Card */}
              <div className="animate-fade-in-right">
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Download Detailed Syllabus
                    </h3>
                    <p className="text-gray-600">
                      Get complete curriculum, tools, and course structure
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setShowSyllabusModal(true)}
                    className="btn-primary w-full text-center mb-4"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download Syllabus (PDF)
                  </button>
                  
                  <div className="text-center text-sm text-gray-500 mb-4">
                    Free download • No spam • Instant access
                  </div>
                  
                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-600 font-medium">Course Fee:</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {course.fees || 'Contact for Details'}
                      </span>
                    </div>
                    
                    {course.batchesInfo && (
                      <div className="flex justify-between items-start text-sm">
                        <span className="text-gray-600 font-medium">Batches:</span>
                        <span className="font-semibold text-gray-900 text-right max-w-xs">
                          {course.batchesInfo.split('\n')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Details */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Description/Overview */}
                {course.overview && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Course Overview
                    </h2>
                    <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {course.overview}
                    </div>
                  </div>
                )}

                {/* Tools & Technologies */}
                {course.tools && course.tools.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Tools & Technologies You'll Master
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {course.tools.map((tool, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700 font-medium">{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Outcomes */}
                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      What You'll Learn
                    </h2>
                    <div className="space-y-3">
                      {course.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-700">{outcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Career Opportunities */}
                {course.careerRoles && course.careerRoles.length > 0 && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Career Opportunities
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.careerRoles.map((career, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg"
                        >
                          <Briefcase className="h-5 w-5 text-green-600" />
                          <span className="text-gray-700 font-medium">{career}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certificate Information */}
                {course.certificateInfo && (
                  <div className="bg-white rounded-xl p-8 shadow-lg mb-8 animate-fade-in-up">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">🎓</div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-3">
                            Certificate of Completion
                          </h2>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {course.certificateInfo}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Batch Information */}
                {course.batchesInfo && (
                  <div className="bg-white rounded-xl p-8 shadow-lg animate-fade-in-up">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">📅</div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 mb-3">
                            Batch Information
                          </h2>
                          <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {course.batchesInfo}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Course Highlights */}
                {course.highlights && course.highlights.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Course Highlights
                    </h3>
                    <div className="space-y-3">
                      {course.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 text-sm leading-relaxed">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Details */}
                <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-500" />
                    Course Details
                  </h3>
                  <div className="space-y-4">
                    {course.level && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Level:</span>
                        <span className="font-medium text-gray-900 text-right">{course.level}</span>
                      </div>
                    )}
                    
                    {course.mode && course.mode.length > 0 && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Mode:</span>
                        <span className="font-medium text-gray-900 text-right">{course.mode.join(', ')}</span>
                      </div>
                    )}
                    
                    {course.eligibility && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Eligibility:</span>
                        <span className="font-medium text-gray-900 text-right max-w-xs">{course.eligibility}</span>
                      </div>
                    )}
                    
                    {course.category && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">Category:</span>
                        <span className="font-medium text-gray-900 text-right capitalize">{course.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-lg animate-fade-in-up">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-red-500" />
                    Get Started Today
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowSyllabusModal(true)}
                      className="btn-primary w-full text-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Syllabus
                    </button>
                    
                    <Link
                      to="/admissions"
                      className="btn-secondary w-full text-center"
                    >
                      Apply for Admission
                    </Link>
                    
                    <Link
                      to="/contact"
                      className="btn-outline w-full text-center"
                    >
                      Talk to Counselor
                    </Link>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Need More Information?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Speak with our admission counselors for personalized guidance.
                  </p>
                  <div className="space-y-2">
                    <a 
                      href="tel:+919001991227"
                      className="block text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      📞 090019 91227
                    </a>
                    <a 
                      href="https://wa.me/919001991227"
                      className="block text-sm text-green-600 hover:text-green-700 font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💬 WhatsApp Chat
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Syllabus Modal */}
      <SyllabusModal
        isOpen={showSyllabusModal}
        onClose={() => setShowSyllabusModal(false)}
        courseSlug={course.slug}
        courseName={course.title || course.name || 'Course'}
      />
    </>
  );
};

export default CourseDetail;
// Static Courses Data - Extracted from Production DB
export const courses = [
  {
    "slug": "devops-training",
    "title": "DevOps Training",
    "oneLiner": "Master Modern DevOps Practices & Cloud Technologies",
    "description": "Comprehensive DevOps training covering the complete DevOps lifecycle, cloud platforms, containerization, orchestration, and automation tools used in modern software development.",
    "duration": "5 Months",
    "fees": "₹20,000 (EMI Available)",
    "price": "₹20,000",
    "tools": [
      "Linux (RHCSA)",
      "Linux Server Administration", 
      "Ansible",
      "AWS",
      "Terraform",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "GitHub"
    ],
    "visible": true,
    "featured": true,
    "order": 1,
    "thumbnailUrl": "",
    "category": "devops-engineering",
    "categories": ["devops-engineering"],
    "level": "Professional Level",
    "mode": "Classroom, Online, Hybrid",
    "highlights": [
      "Real-time Projects",
      "Industry Mentorship", 
      "DevOps Certification Prep",
      "Hands-on training with real-time DevOps projects",
      "Learn cloud-native DevOps with AWS",
      "Containerization and orchestration with Docker & Kubernetes",
      "CI/CD pipeline automation using Jenkins & GitHub",
      "Infrastructure as Code with Terraform & Ansible",
      "Mentorship from industry DevOps experts"
    ],
    "learningOutcomes": [
      "Master AWS cloud services and deployment strategies",
      "Implement CI/CD pipelines using Jenkins and GitLab", 
      "Container orchestration with Docker and Kubernetes",
      "Infrastructure as Code with Terraform and Ansible"
    ],
    "careerRoles": [
      "DevOps Engineer",
      "Cloud Engineer",
      "Site Reliability Engineer",
      "Infrastructure Engineer"
    ],
    "eligibility": "12th Pass/Graduate Basic IT Knowledge",
    "intake": "Monthly Batches",
    "certificationIncluded": true,
    "overview": "Complete DevOps training with hands-on experience in modern automation tools and cloud platforms."
  },
  {
    "slug": "rhcsa-red-hat-certified-system-administrator",
    "title": "RHCSA - Red Hat Certified System Administrator",
    "oneLiner": "Professional Red Hat system administrator certification training with hands-on labs",
    "description": "RHCSA (Red Hat Certified System Administrator) is a foundational certification that validates skills in managing Red Hat Enterprise Linux systems.",
    "duration": "6-8 Weeks",
    "fees": "₹30,000 (Including Exam)",
    "price": "₹30,000",
    "tools": [
      "Red Hat Enterprise Linux",
      "System Administration",
      "Command Line Tools",
      "File Systems",
      "User Management"
    ],
    "visible": true,
    "featured": true,
    "order": 2,
    "thumbnailUrl": "",
    "category": "red-hat-technologies",
    "categories": ["red-hat-technologies"],
    "level": "Professional Level",
    "mode": "Classroom, Online, Hybrid",
    "highlights": [
      "User & group management",
      "Storage & networking basics", 
      "System services",
      "SELinux & firewalld",
      "Performance monitoring & tuning",
      "Exam preparation & practice labs"
    ],
    "learningOutcomes": [
      "Manage RHEL systems and users",
      "Configure local storage and file systems", 
      "Control services processes and boot sequence",
      "Monitor and troubleshoot Red Hat Enterprise Linux"
    ],
    "careerRoles": [
      "Linux System Administrator",
      "Junior DevOps Engineer", 
      "Support Engineer",
      "Infrastructure Technician"
    ],
    "eligibility": "12th Pass/Graduate with basic computer knowledge",
    "intake": "Monthly Batches",
    "certificationIncluded": true,
    "overview": "Industry-standard Linux system administration certification with comprehensive hands-on training."
  },
  {
    "slug": "rhce-red-hat-certified-engineer",
    "title": "RHCE - Red Hat Certified Engineer",
    "oneLiner": "Advanced Red Hat engineering certification with automation focus",
    "description": "RHCE (Red Hat Certified Engineer) certification validates advanced system administration skills including automation with Ansible.",
    "duration": "8-10 Weeks",
    "fees": "₹45,000 (Including Exam)",
    "price": "₹45,000",
    "tools": [
      "Red Hat Enterprise Linux",
      "Ansible",
      "System Services",
      "Network Services",
      "Security"
    ],
    "visible": true,
    "featured": true,
    "order": 3,
    "thumbnailUrl": "",
    "category": "red-hat-technologies",
    "categories": ["red-hat-technologies"],
    "level": "Advanced",
    "mode": "Classroom, Online, Hybrid",
    "highlights": [
      "Advanced system administration",
      "Ansible automation",
      "Network services configuration",
      "Security implementation",
      "System optimization",
      "Real-world scenarios"
    ],
    "learningOutcomes": [
      "Automate tasks with Ansible",
      "Configure advanced network services",
      "Implement security policies",
      "Manage complex RHEL environments"
    ],
    "careerRoles": [
      "Red Hat Certified Engineer",
      "Senior Linux Administrator",
      "DevOps Engineer",
      "Infrastructure Architect"
    ],
    "eligibility": "RHCSA certification required",
    "intake": "Monthly Batches",
    "certificationIncluded": true,
    "overview": "Advanced Red Hat certification focusing on automation and complex system management."
  },
  {
    "slug": "do188-red-hat-openshift-development",
    "title": "DO188 - Red Hat OpenShift Development I",
    "oneLiner": "Container application development with OpenShift",
    "description": "DO188 teaches developers how to containerize applications and deploy them on Red Hat OpenShift Container Platform.",
    "duration": "5 Days (40 Hours)",
    "fees": "₹35,000 (Including Materials)",
    "price": "₹35,000",
    "tools": [
      "Red Hat OpenShift",
      "Docker",
      "Podman",
      "Kubernetes",
      "Container Registry"
    ],
    "visible": true,
    "featured": true,
    "order": 4,
    "thumbnailUrl": "",
    "category": "red-hat-technologies",
    "categories": ["red-hat-technologies"],
    "level": "Intermediate",
    "mode": "Classroom, Online, Hybrid",
    "highlights": [
      "Container development",
      "OpenShift deployment",
      "Application lifecycle",
      "CI/CD pipelines",
      "Container registries",
      "Hands-on labs"
    ],
    "learningOutcomes": [
      "Containerize applications with Podman",
      "Deploy apps on OpenShift",
      "Manage application lifecycle",
      "Implement CI/CD workflows"
    ],
    "careerRoles": [
      "OpenShift Developer",
      "Container Developer",
      "DevOps Engineer",
      "Application Developer"
    ],
    "eligibility": "Basic Linux and development knowledge",
    "intake": "Monthly Batches",
    "certificationIncluded": true,
    "overview": "Comprehensive OpenShift development training for containerized applications."
  },
  {
    "slug": "do280-red-hat-openshift-administration",
    "title": "DO280 - Red Hat OpenShift Administration I",
    "oneLiner": "OpenShift cluster administration and management",
    "description": "DO280 provides system administrators with the skills to manage Red Hat OpenShift Container Platform clusters.",
    "duration": "5 Days (40 Hours)",
    "fees": "₹40,000 (Including Materials)",
    "price": "₹40,000",
    "tools": [
      "Red Hat OpenShift",
      "Kubernetes",
      "CLI Tools",
      "Web Console",
      "Cluster Management"
    ],
    "visible": true,
    "featured": true,
    "order": 5,
    "thumbnailUrl": "",
    "category": "red-hat-technologies",
    "categories": ["red-hat-technologies"],
    "level": "Advanced",
    "mode": "Classroom, Online, Hybrid",
    "highlights": [
      "Cluster administration",
      "User and project management",
      "Network and storage config",
      "Security policies",
      "Monitoring and logging",
      "Troubleshooting"
    ],
    "learningOutcomes": [
      "Install and configure OpenShift clusters",
      "Manage users and projects",
      "Configure networking and storage",
      "Monitor cluster health and performance"
    ],
    "careerRoles": [
      "OpenShift Administrator",
      "Kubernetes Administrator",
      "Platform Engineer",
      "Cloud Infrastructure Engineer"
    ],
    "eligibility": "RHCSA and container experience recommended",
    "intake": "Monthly Batches",
    "certificationIncluded": true,
    "overview": "Professional OpenShift administration training for enterprise environments."
  },
  {
    "slug": "aws-solutions-architect-associate",
    "title": "AWS Solutions Architect Associate",
    "oneLiner": "Design and deploy scalable AWS cloud solutions", 
    "description": "AWS Solutions Architect Associate certification training covering cloud architecture, design patterns, and AWS services implementation.",
    "duration": "6-8 Weeks",
    "fees": "₹25,000 (Including Study Materials)",
    "price": "₹25,000",
    "tools": [
      "AWS EC2",
      "AWS S3",
      "AWS VPC", 
      "AWS IAM",
      "AWS Lambda",
      "AWS RDS",
      "AWS CloudFormation"
    ],
    "visible": true,
    "featured": true,
    "order": 6,
    "thumbnailUrl": "",
    "category": "aws-cloud-platform",
    "categories": ["aws-cloud-platform"],
    "level": "Intermediate",
    "mode": "Classroom, Online, Hybrid",
    "highlights": [
      "AWS Core Services",
      "Cloud Architecture Design",
      "Security & Compliance",
      "Cost Optimization",
      "High Availability Solutions",
      "Real-world Project Implementation"
    ],
    "learningOutcomes": [
      "Design secure and scalable AWS architectures",
      "Implement cost-effective cloud solutions",
      "Configure AWS networking and security",
      "Deploy applications using AWS services"
    ],
    "careerRoles": [
      "AWS Solutions Architect",
      "Cloud Engineer",
      "DevOps Engineer", 
      "Cloud Consultant"
    ],
    "eligibility": "Basic IT knowledge and cloud fundamentals",
    "intake": "Monthly Batches",
    "certificationIncluded": true,
    "overview": "Comprehensive AWS cloud architecture training with hands-on labs and real-world scenarios."
  },
  {
    "slug": "kubernetes-administrator-cka",
    "title": "Kubernetes Administrator (CKA)",
    "oneLiner": "Master container orchestration with Kubernetes",
    "description": "Certified Kubernetes Administrator (CKA) training covering cluster management, networking, security, and troubleshooting.",
    "duration": "4-6 Weeks", 
    "fees": "₹35,000 (Including Exam Voucher)",
    "price": "₹35,000",
    "tools": [
      "Kubernetes",
      "Docker",
      "kubectl",
      "etcd",
      "Container Runtime",
      "Helm"
    ],
    "visible": true,
    "featured": true,
    "order": 7,
    "thumbnailUrl": "",
    "category": "devops-engineering",
    "categories": ["devops-engineering"],
    "level": "Advanced",
    "mode": "Classroom, Online, Hybrid",
    "highlights": [
      "Cluster Architecture & Installation",
      "Workloads & Scheduling",
      "Services & Networking",
      "Storage Management", 
      "Security & RBAC",
      "Troubleshooting & Monitoring"
    ],
    "learningOutcomes": [
      "Install and configure Kubernetes clusters",
      "Manage workloads and scheduling",
      "Implement networking and security policies",
      "Troubleshoot cluster issues effectively"
    ],
    "careerRoles": [
      "Kubernetes Administrator",
      "DevOps Engineer",
      "Platform Engineer",
      "Site Reliability Engineer"
    ],
    "eligibility": "Linux and Docker experience required",
    "intake": "Monthly Batches",
    "certificationIncluded": true,
    "overview": "Advanced Kubernetes administration training with hands-on cluster management experience."
  },
  {
    "slug": "python-programming-data-science",
    "title": "Python Programming for Data Science",
    "oneLiner": "Learn Python programming and data analysis fundamentals",
    "description": "Comprehensive Python programming course focused on data science applications, covering libraries like NumPy, Pandas, and Matplotlib.",
    "duration": "3-4 Months",
    "fees": "₹18,000 (EMI Available)",
    "price": "₹18,000",
    "tools": [
      "Python",
      "NumPy",
      "Pandas", 
      "Matplotlib",
      "Seaborn",
      "Jupyter Notebook",
      "Scikit-learn"
    ],
    "visible": true,
    "featured": true,
    "order": 8,
    "thumbnailUrl": "",
    "category": "data-science-ai",
    "categories": ["data-science-ai"],
    "level": "Beginner",
    "mode": "Classroom, Online, Hybrid",
    "highlights": [
      "Python Fundamentals",
      "Data Manipulation with Pandas",
      "Data Visualization",
      "Statistical Analysis",
      "Machine Learning Basics",
      "Real-world Projects"
    ],
    "learningOutcomes": [
      "Master Python programming fundamentals",
      "Perform data analysis and visualization",
      "Build basic machine learning models",
      "Work with data science libraries effectively"
    ],
    "careerRoles": [
      "Data Analyst",
      "Python Developer",
      "Junior Data Scientist",
      "Business Analyst"
    ],
    "eligibility": "12th Pass with basic mathematics knowledge",
    "intake": "Monthly Batches",
    "certificationIncluded": true,
    "overview": "Complete Python training focused on data science applications with hands-on projects."
  }
];

export default courses;
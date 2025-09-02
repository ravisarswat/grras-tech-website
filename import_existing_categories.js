// Script to import existing hardcoded categories to admin panel
// Run this once to migrate existing categories to CMS

const existingCategories = {
  "red-hat": {
    name: 'Red Hat Technologies',
    slug: 'red-hat',
    description: 'Industry-leading Linux and OpenShift certifications',
    icon: 'server',
    color: '#EE0000',
    gradient: 'from-red-500 to-red-700',
    featured: true,
    visible: true,
    order: 1,
    seo: {
      title: 'Red Hat Certification Training - RHCSA, RHCE - GRRAS Jaipur',
      description: 'Red Hat authorized training center in Jaipur. RHCSA, RHCE certification courses.',
      keywords: 'red hat training, rhcsa certification, rhce course, linux training'
    }
  },
  "aws": {
    name: 'AWS Cloud Platform',
    slug: 'aws',
    description: 'Amazon Web Services cloud computing certifications',
    icon: 'cloud',
    color: '#FF9900',
    gradient: 'from-orange-400 to-orange-600',
    featured: true,
    visible: true,
    order: 2,
    seo: {
      title: 'AWS Cloud Training & Certification - Solutions Architect Jaipur',
      description: 'Professional AWS training in Jaipur. AWS Solutions Architect, Developer certifications.',
      keywords: 'aws training, aws certification, cloud computing, aws solutions architect'
    }
  },
  "kubernetes": {
    name: 'Kubernetes Ecosystem',
    slug: 'kubernetes',
    description: 'Container orchestration and cloud-native technologies',
    icon: 'container',
    color: '#326CE5',
    gradient: 'from-blue-500 to-blue-700',
    featured: true,
    visible: true,
    order: 3,
    seo: {
      title: 'Kubernetes Training - CKA, CKS Certification Jaipur',
      description: 'Master Kubernetes with CKA, CKS, CKAD certifications.',
      keywords: 'kubernetes training, cka certification, container orchestration'
    }
  },
  "devops": {
    name: 'DevOps Engineering',
    slug: 'devops',
    description: 'DevOps practices, CI/CD pipelines, automation',
    icon: 'terminal',
    color: '#10B981',
    gradient: 'from-green-500 to-green-700',
    featured: true,
    visible: true,
    order: 4,
    seo: {
      title: 'DevOps Training - CI/CD, Jenkins, Ansible Jaipur',
      description: 'Master DevOps with Jenkins, Ansible, Terraform training.',
      keywords: 'devops training, jenkins course, ansible certification'
    }
  },
  "cybersecurity": {
    name: 'Cybersecurity & Ethical Hacking',
    slug: 'cybersecurity',
    description: 'Ethical hacking, penetration testing, security analysis',
    icon: 'shield',
    color: '#8B5CF6',
    gradient: 'from-purple-500 to-purple-700',
    featured: true,
    visible: true,
    order: 5,
    seo: {
      title: 'Cybersecurity & Ethical Hacking Training - GRRAS Jaipur',
      description: 'Professional cybersecurity training. Learn ethical hacking, penetration testing.',
      keywords: 'cybersecurity training, ethical hacking course, penetration testing'
    }
  },
  "programming": {
    name: 'Programming & Development',
    slug: 'programming',
    description: 'Programming languages, software development',
    icon: 'code',
    color: '#6366F1',
    gradient: 'from-indigo-500 to-indigo-700',
    featured: true,
    visible: true,
    order: 6,
    seo: {
      title: 'Programming & Software Development Training - GRRAS Jaipur',
      description: 'Learn programming languages, data structures, algorithms.',
      keywords: 'programming courses, c++ training, python course, software development'
    }
  },
  "degree-programs": {
    name: 'Degree Programs',
    slug: 'degree-programs',
    description: 'Industry-integrated degree programs',
    icon: 'graduation-cap',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-amber-700',
    featured: true,
    visible: true,
    order: 7,
    seo: {
      title: 'IT Degree Programs - BCA, MCA - GRRAS Jaipur',
      description: 'Industry-integrated BCA, MCA degree programs.',
      keywords: 'bca degree, mca program, it degree courses'
    }
  }
};

console.log('Copy this to admin panel via API:');
console.log(JSON.stringify(existingCategories, null, 2));
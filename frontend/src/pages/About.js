import React from 'react';
import { useContent } from '../contexts/ContentContext';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Heart,
  CheckCircle,
  Star,
  ArrowRight
} from 'lucide-react';
import SEO from '../components/SEO';

const About = () => {
  const { content } = useContent();
  
  // Get years of excellence from CMS content
  const yearsOfExcellence = content?.institute?.stats?.yearsOfExcellence || '18+';
  
  const stats = [
    { number: yearsOfExcellence, label: 'Years of Excellence', icon: <Award className="h-8 w-8" /> },
    { number: '5000+', label: 'Students Trained', icon: <Users className="h-8 w-8" /> },
    { number: '95%', label: 'Placement Rate', icon: <TrendingUp className="h-8 w-8" /> },
    { number: '100+', label: 'Hiring Partners', icon: <Target className="h-8 w-8" /> }
  ];

  const values = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Quality Education',
      description: 'We provide world-class IT education with industry-relevant curriculum and hands-on experience.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Student Success',
      description: 'Our students success is our priority. We ensure every student gets proper guidance and support.'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Innovation',
      description: 'We continuously update our courses and teaching methods to match industry standards.'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Industry Focus',
      description: 'Our training programs are designed based on current market demands and industry requirements.'
    }
  ];

  const team = [
    {
      name: 'Dr. Rajesh Sharma',
      role: 'Director & Founder',
      experience: '15+ Years in IT Education',
      expertise: 'Computer Science, Educational Leadership',
      image: '👨‍💼'
    },
    {
      name: 'Prof. Priya Agarwal',
      role: 'Head of Academics',
      experience: '12+ Years Teaching Experience',
      expertise: 'Data Science, Machine Learning',
      image: '👩‍🏫'
    },
    {
      name: 'Mr. Amit Kumar',
      role: 'DevOps Lead Trainer',
      experience: '18+ Years Industry Experience',
      expertise: 'AWS, Docker, Kubernetes',
      image: '👨‍💻'
    },
    {
      name: 'Ms. Sneha Patel',
      role: 'Placement Head',
      experience: '8+ Years HR Experience',
      expertise: 'Career Counseling, Industry Relations',
      image: '👩‍💼'
    }
  ];

  const milestones = [
    {
      year: '2007',
      title: 'Red Hat Authorization',
      description: 'Became authorized Red Hat training partner for official certifications and established our foundation in enterprise Linux training.'
    },
    {
      year: '2014',
      title: 'Institute Expansion',
      description: 'GRRAS Solutions expanded with comprehensive IT education programs and modern infrastructure in Jaipur.'
    },
    {
      year: '2016',
      title: 'Industry Partnership',
      description: 'Partnered with leading IT companies for internships and placement opportunities.'
    },
    {
      year: '2018',
      title: 'BCA Program Launch',
      description: 'Launched industry-integrated BCA degree program with specializations.'
    },
    {
      year: '2022',
      title: 'Cloud Excellence',
      description: 'Established state-of-the-art cloud labs and DevOps training infrastructure.'
    },
    {
      year: '2024',
      title: 'AI/ML Integration',
      description: 'Integrated AI/ML modules across all programs to meet future technology needs.'
    }
  ];

  return (
    <>
      <SEO
        title="About GRRAS Solutions – IT Training & Certification Experts"
        description="Learn about GRRAS Solutions, an official Red Hat training partner and leading institute for IT, Cloud, and Data Science education in India."
        keywords="GRRAS Solutions, IT training institute Jaipur, computer education, about us, training center history"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="py-20 gradient-bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About GRRAS Solutions
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
                Empowering students with world-class IT education and industry-ready skills since 2014
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/courses" className="btn-secondary">
                  Explore Our Courses
                </Link>
                <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-red-600">
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </div>
                  <p className="text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Mission */}
              <div className="animate-fade-in-up">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="text-4xl mb-4">🎯</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission & Vision</h2>
                  <p className="text-gray-700 leading-relaxed">
                    To provide world-class IT education and training that bridges the gap between 
                    academic learning and industry requirements. We are committed to nurturing 
                    skilled professionals who can excel in the rapidly evolving technology landscape.
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Industry-relevant curriculum</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Hands-on practical training</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">100% placement assistance</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision */}
              <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <div className="text-4xl mb-4">🚀</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Expertise</h2>
                  <p className="text-gray-700 leading-relaxed">
                    To be the leading IT training institute in India, recognized for excellence 
                    in education, innovation in teaching methodologies, and success in producing 
                    industry-ready professionals who contribute to the global technology ecosystem.
                  </p>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="text-gray-700">Excellence in education</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="text-gray-700">Innovation in teaching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="text-gray-700">Global recognition</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Industry Partnerships
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide our approach to education and student success
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Meet Our Expert Team
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Industry experts and experienced educators dedicated to your success
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="text-6xl mb-4">{member.image}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-red-600 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {member.experience}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member.expertise}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Journey Timeline */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Journey
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A decade of excellence in IT education and student success
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-6 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {milestone.year}
                      </div>
                    </div>
                    
                    <div className="flex-grow bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-700">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Learn more about GRRAS Solutions and our training programs
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  When was GRRAS Solutions established?
                </h3>
                <p className="text-gray-600">
                  GRRAS Solutions was established in 2007 and has been providing world-class IT education for over 18 years, becoming a trusted name in technical training.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What makes GRRAS different from other institutes?
                </h3>
                <p className="text-gray-600">
                  We are an official Red Hat Training Partner with authorized labs, experienced industry trainers, hands-on practical training, and 95% placement success rate with top IT companies.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Does GRRAS have multiple branches?
                </h3>
                <p className="text-gray-600">
                  Our main campus is located in Jaipur with state-of-the-art infrastructure, modern labs, and all facilities. We focus on quality education at our primary location.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 gradient-bg-secondary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Join Our Success Story?
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                Be part of our growing community of successful IT professionals. 
                Start your journey with industry-leading education today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/admissions"
                  className="btn-primary bg-white text-green-600 hover:bg-gray-100"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                
                <Link
                  to="/courses"
                  className="btn-outline border-white text-white hover:bg-white hover:text-green-600"
                >
                  Explore Our Courses
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
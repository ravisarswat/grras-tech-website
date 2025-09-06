import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Users,
  Star,
  Briefcase,
  Filter,
  ChevronDown,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import SEO from '../components/SEO';

const Placements = () => {
  const [animatedStats, setAnimatedStats] = useState({
    totalPlacements: 0,
    averagePackage: 0,
    topCompanies: 0,
    placementRate: 0
  });

  // Real placement data - GRRAS Students
  const placementData = [
    {
      id: 1,
      name: "Kamlesh Choudhary",
      company: "Figment Global Solutions Pvt. Ltd.",
      position: "Software Engineer", 
      package: "₹12 LPA",
      course: "DevOps Engineering",
      photo: "https://customer-assets.emergentagent.com/job_grras-seo-optimize/artifacts/b2yyaj6d_Kamlesh%20Choudhary.jpeg",
      location: "Jaipur",
      year: "2024",
      companyLogo: "https://figmentglobal.com/wp-content/uploads/2021/09/figment-logo.png",
      testimonial: "GRRAS training helped me secure this amazing opportunity at Figment Global Solutions!"
    },
    {
      id: 2,
      name: "Piyush Sharma", 
      company: "Granicus",
      position: "Cloud Engineer",
      package: "₹15 LPA",
      course: "AWS Cloud Platform",
      photo: "https://customer-assets.emergentagent.com/job_grras-seo-optimize/artifacts/ur7tsori_Piyush%20Sharma.jpeg",
      location: "Bangalore", 
      year: "2024",
      companyLogo: "https://logo.clearbit.com/granicus.com",
      testimonial: "The hands-on AWS training helped me secure this amazing role!"
    },
    {
      id: 3,
      name: "Tushar Arora",
      company: "Insight",
      position: "Systems Engineer",
      package: "₹18 LPA", 
      course: "DevOps Engineering",
      photo: "https://customer-assets.emergentagent.com/job_grras-seo-optimize/artifacts/eux67kjm_Tushar%20Arora.jpeg",
      location: "Pune",
      year: "2024",
      companyLogo: "https://logo.clearbit.com/insightglobal.com",
      testimonial: "GRRAS training gave me the technical edge to succeed at Insight!"
    },
    {
      id: 4,
      name: "Akshat Mehra",
      company: "Emizen Tech",
      position: "Software Developer",
      package: "₹14 LPA",
      course: "Full Stack Development",
      photo: "https://customer-assets.emergentagent.com/job_grras-seo-optimize/artifacts/c7d2clp1_Akshat%20Mehra.jpeg",
      location: "Delhi",
      year: "2024", 
      companyLogo: "https://logo.clearbit.com/emizentech.com",
      testimonial: "Amazing hands-on training that prepared me for real-world challenges!"
    },
    {
      id: 5,
      name: "Aman Tiwari",
      company: "Backoffice IT Solutions",
      position: "IT Specialist",
      package: "₹10 LPA",
      course: "System Administration", 
      photo: "https://customer-assets.emergentagent.com/job_grras-seo-optimize/artifacts/8nfgkxsf_Aman%20Tiwari.jpeg",
      location: "Mumbai",
      year: "2024",
      companyLogo: "https://logo.clearbit.com/navbackoffice.com",
      testimonial: "GRRAS provided excellent practical training and placement support!"
    },
    {
      id: 6,
      name: "Shubham Koli",
      company: "i4Consulting Pvt. Ltd.",
      position: "Technical Consultant",
      package: "₹16 LPA", 
      course: "Cloud Computing",
      photo: "https://customer-assets.emergentagent.com/job_grras-seo-optimize/artifacts/ay4grwc9_%20Shubham%20Koli.jpeg",
      location: "Chennai",
      year: "2024",
      companyLogo: "https://logo.clearbit.com/i4consulting.com",
      testimonial: "From student to consultant - GRRAS made my career transformation possible!"
    },
    {
      id: 7,
      name: "Girish Juneja",
      company: "Omega Broadcast Private Limited",
      position: "Broadcast Engineer",
      package: "₹13 LPA",
      course: "Network & Systems",
      photo: "https://customer-assets.emergentagent.com/job_grras-seo-optimize/artifacts/ey7hqm9c_Girish%20Juneja.jpeg", 
      location: "Bangalore",
      year: "2024",
      companyLogo: "https://logo.clearbit.com/omegabrsl.com",
      testimonial: "GRRAS industry connections helped me land this specialized role!"
    },
    {
      id: 8,
      name: "Amit Kumar",
      company: "Wolfram Research",
      position: "Software Engineer", 
      package: "₹20 LPA",
      course: "Data Science & AI",
      photo: "https://customer-assets.emergentagent.com/job_grras-seo-optimize/artifacts/6l3x1s4o_Amit%20Kumar%20.png",
      location: "Bangalore",
      year: "2024", 
      companyLogo: "https://logo.clearbit.com/wolfram.com",
      testimonial: "GRRAS comprehensive training helped me secure this research role at Wolfram!"
    }
  ];

  const companies = [
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg", placements: 15 },
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", placements: 12 },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg", placements: 18 },
    { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg", placements: 10 },
    { name: "Red Hat", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Red_Hat_logo.svg", placements: 8 },
    { name: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg", placements: 25 },
    { name: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg", placements: 20 },
    { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg", placements: 14 }
  ];

  // Animate stats on page load
  useEffect(() => {
    const targetStats = {
      totalPlacements: 500,
      averagePackage: 22,
      topCompanies: 50,
      placementRate: 95
    };

    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const increment = duration / steps;
      
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        
        setAnimatedStats({
          totalPlacements: Math.floor(targetStats.totalPlacements * progress),
          averagePackage: Math.floor(targetStats.averagePackage * progress),
          topCompanies: Math.floor(targetStats.topCompanies * progress),
          placementRate: Math.floor(targetStats.placementRate * progress)
        });
        
        if (step >= steps) {
          clearInterval(timer);
          setAnimatedStats(targetStats);
        }
      }, increment);
    };

    const timer = setTimeout(animateStats, 500);
    return () => clearTimeout(timer);
  }, []);

  // Show all placements - no filtering needed

  return (
    <>
      <SEO 
        title="Student Placements - Success Stories | GRRAS Solutions"
        description="Discover the success stories of our students placed in top companies like Microsoft, Google, Amazon, IBM with excellent packages. 95% placement rate."
        keywords="student placements, job placements, career success, Microsoft jobs, Google jobs, AWS jobs, DevOps placements, cloud computing jobs"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
        
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-red-600 via-orange-600 to-red-700 overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-transparent rounded-full blur-3xl translate-x-48 translate-y-48"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              {/* Awards Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30">
                  <Award className="h-6 w-6 text-yellow-300" />
                  <span className="text-white font-bold">95% Placement Success Rate</span>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                Student 
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Success </span>
                Stories
              </h1>
              
              <p className="text-xl md:text-2xl text-red-100 mb-8 max-w-4xl mx-auto leading-relaxed">
                From learning to leading - Discover how our students transformed their careers with 
                <span className="font-bold text-white"> top tech companies</span>
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl md:text-4xl font-black text-white mb-2">
                    {animatedStats.totalPlacements}+
                  </div>
                  <p className="text-red-100 font-semibold">Students Placed</p>
                </div>
                
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl md:text-4xl font-black text-white mb-2">
                    ₹{animatedStats.averagePackage}L
                  </div>
                  <p className="text-red-100 font-semibold">Average Package</p>
                </div>
                
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl md:text-4xl font-black text-white mb-2">
                    {animatedStats.topCompanies}+
                  </div>
                  <p className="text-red-100 font-semibold">Top Companies</p>
                </div>
                
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl md:text-4xl font-black text-white mb-2">
                    {animatedStats.placementRate}%
                  </div>
                  <p className="text-red-100 font-semibold">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Companies Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Our Students Work At
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Leading global companies trust our graduates with their most important projects
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
              {companies.map((company, index) => (
                <div 
                  key={company.name}
                  className="group bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img 
                    src={company.logo} 
                    alt={`${company.name} logo`}
                    className="h-12 w-auto mx-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="text-center mt-3">
                    <div className="text-sm font-bold text-gray-700">{company.placements}</div>
                    <div className="text-xs text-gray-500">Placements</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Simple Section Header */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Our Recent Placements
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Meet our successful students who transformed their careers with GRRAS training
          </p>
        </div>

        {/* Placement Cards Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                Meet Our Success Stories
              </h2>
              <p className="text-xl text-gray-600">
                Real students, real success, real transformations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {placementData.map((placement, index) => (
                <div 
                  key={placement.id}
                  className="group bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    {/* Student Photo */}
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-gradient-to-r from-red-500 to-orange-500 shadow-lg">
                        <img 
                          src={placement.photo} 
                          alt={placement.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-black text-gray-900 mb-1">{placement.name}</h3>
                      <p className="text-red-600 font-bold text-lg mb-2">{placement.package}</p>
                      <p className="text-gray-600 font-semibold">{placement.position}</p>
                    </div>

                    {/* Company Info */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-4 group-hover:bg-white transition-colors duration-300">
                      <div className="flex items-center justify-center space-x-3">
                        {placement.companyLogo && (
                          <div className="w-10 h-10 bg-white rounded-lg p-1.5 shadow-sm flex items-center justify-center">
                            <img 
                              src={placement.companyLogo} 
                              alt={`${placement.company} logo`}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                // Hide the image container if logo fails to load
                                e.target.parentElement.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 text-center">
                          <p className="font-bold text-gray-900 text-sm leading-tight">{placement.company}</p>
                        </div>
                      </div>
                    </div>

                    {/* Course Badge */}
                    <div className="text-center mb-4">
                      <span className="inline-block bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {placement.course}
                      </span>
                    </div>

                    {/* Testimonial */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border-l-4 border-red-500">
                      <p className="text-gray-700 text-sm italic leading-relaxed">
                        "{placement.testimonial}"
                      </p>
                    </div>


                  </div>
                </div>
              ))}
            </div>

            {/* Motivational CTA Button */}
            <div className="text-center mt-12">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-2xl hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-xl group">
                <Users className="mr-3 h-5 w-5 group-hover:animate-pulse" />
                <span className="text-lg">Your Next Success Story Awaits</span>
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
                Ready to Write Your Success Story?
              </h2>
              <p className="text-xl text-red-100 mb-8">
                Join hundreds of successful students who transformed their careers with GRRAS
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/courses"
                  className="inline-flex items-center px-8 py-4 bg-white text-red-600 font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  Explore Courses
                </Link>
                
                <Link
                  to="/admissions"
                  className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-red-600 transition-all duration-300 transform hover:scale-105"
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Apply Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Placements;
import React from 'react';
import { 
  Award, 
  Users, 
  GraduationCap, 
  TrendingUp,
  Star,
  Shield,
  BookOpen
} from 'lucide-react';

const MobileStatsSection = () => {
  // Fixed stats values - no animation needed on mobile
  const finalStats = {
    years: 18,
    students: 5000,
    certifications: 1500,
    placement: 95
  };

  const statItems = [
    {
      icon: <Award className="h-6 w-6" />,
      value: `${finalStats.years}+`,
      label: "Years of Excellence",
      description: "Since 2007",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Users className="h-6 w-6" />,
      value: `${finalStats.students}+`,
      label: "Students Trained",
      description: "Across India",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      value: `${finalStats.certifications}+`,
      label: "Certifications",
      description: "Red Hat & AWS",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      value: `${finalStats.placement}%`,
      label: "Placement Rate",
      description: "Industry Best",
      color: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section className="py-8 bg-gradient-to-b from-orange-50 to-white lg:hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-3 shadow-lg">
            <Star className="h-4 w-4 mr-2" />
            Our Achievements
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Numbers That Speak
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Icon with gradient background */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              
              {/* Stat Content */}
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Awards Section */}
        <div className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Award className="h-5 w-5" />
              <span className="font-bold text-sm">🏆Award Winning Institute</span>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Shield className="h-5 w-5" />
              <span className="font-bold text-sm">🎖️Since 2007</span>
            </div>
            <h3 className="text-lg font-bold mb-1">
              Best Red Hat Training Partner
            </h3>
            <p className="text-sm opacity-90">
              Recognized for excellence in IT training and certification
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileStatsSection;
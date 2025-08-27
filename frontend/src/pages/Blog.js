import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Tag, User } from 'lucide-react';
import SEO from '../components/SEO';

const Blog = () => {
  const featuredPost = {
    slug: 'what-is-devops-beginners-guide-2025',
    title: 'What is DevOps? A Beginner\'s Guide (2025)',
    excerpt: 'DevOps is revolutionizing software development. Learn what DevOps is, why it matters, and how to start your DevOps career in 2025 with comprehensive training.',
    image: '🚀',
    category: 'DevOps',
    date: '2025-01-15',
    readTime: '8 min read',
    author: 'GRRAS Team',
    featured: true
  };

  const blogPosts = [
    {
      slug: 'why-bca-industry-training-future',
      title: 'Why BCA with Industry Training is the Future',
      excerpt: 'Traditional BCA programs are evolving. Discover how industry-integrated BCA degrees prepare you for modern tech careers with hands-on cloud and DevOps training.',
      image: '🎓',
      category: 'Education',
      date: '2025-01-12',
      readTime: '6 min read',
      author: 'Dr. Rajesh Sharma'
    },
    {
      slug: 'top-5-skills-data-science-careers-india',
      title: 'Top 5 Skills for Data Science Careers in India',
      excerpt: 'Master these essential data science skills to land high-paying jobs in India\'s booming tech market. From Python to machine learning, here\'s your roadmap.',
      image: '📊',
      category: 'Data Science',
      date: '2025-01-10',
      readTime: '7 min read',
      author: 'Prof. Priya Agarwal'
    },
    {
      slug: 'aws-certification-guide-2025',
      title: 'Complete AWS Certification Guide for 2025',
      excerpt: 'Navigate the AWS certification landscape with our comprehensive guide. Choose the right certification path and accelerate your cloud career.',
      image: '☁️',
      category: 'Cloud Computing',
      date: '2025-01-08',
      readTime: '10 min read',
      author: 'Amit Kumar'
    },
    {
      slug: 'python-vs-java-career-prospects',
      title: 'Python vs Java: Which Programming Language to Choose?',
      excerpt: 'Confused between Python and Java? Compare career prospects, salary potential, and learning curves to make the right choice for your programming journey.',
      image: '💻',
      category: 'Programming',
      date: '2025-01-05',
      readTime: '5 min read',
      author: 'GRRAS Team'
    },
    {
      slug: 'machine-learning-trends-2025',
      title: 'Machine Learning Trends to Watch in 2025',
      excerpt: 'Stay ahead with the latest ML trends. From generative AI to edge computing, explore technologies shaping the future of machine learning.',
      image: '🤖',
      category: 'Machine Learning',
      date: '2025-01-03',
      readTime: '9 min read',
      author: 'Prof. Priya Agarwal'
    },
    {
      slug: 'red-hat-certification-worth-it',
      title: 'Is Red Hat Certification Worth It in 2025?',
      excerpt: 'Analyze the ROI of Red Hat certifications. Discover salary benefits, career opportunities, and why Linux skills are in high demand.',
      image: '🐧',
      category: 'Certifications',
      date: '2025-01-01',
      readTime: '6 min read',
      author: 'Amit Kumar'
    }
  ];

  const categories = [
    { name: 'All', count: 7, active: true },
    { name: 'DevOps', count: 2 },
    { name: 'Data Science', count: 2 },
    { name: 'Programming', count: 1 },
    { name: 'Cloud Computing', count: 1 },
    { name: 'Certifications', count: 1 }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <SEO
        title="IT Training Blog - Tips, Guides & Industry Insights | GRRAS Solutions"
        description="Stay updated with the latest IT industry trends, career guidance, and technical tutorials. Expert insights on DevOps, Data Science, Cloud Computing, and more."
        keywords="IT blog, DevOps tutorials, data science tips, programming guides, career advice, technology trends, cloud computing blog"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="py-20 gradient-bg-primary text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                GRRAS Tech Blog
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-3xl mx-auto">
                Stay ahead with the latest insights, tutorials, and career guidance in IT and technology
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/courses" className="btn-secondary">
                  Explore Our Courses
                </Link>
                <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-red-600">
                  Subscribe to Updates
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Featured Post */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fade-in-up">
              <div className="md:flex">
                <div className="md:w-1/3 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center p-12">
                  <div className="text-6xl">{featuredPost.image}</div>
                </div>
                
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {featuredPost.category}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(featuredPost.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/blog/${featuredPost.slug}`}
                      className="btn-primary"
                    >
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Categories Filter */}
              <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category.active
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-red-100 hover:text-red-700 border border-gray-200'
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>

              {/* Blog Posts Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                {blogPosts.map((post, index) => (
                  <article 
                    key={index}
                    className="blog-card animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center text-4xl">
                      {post.image}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-blue-600 font-medium">
                          {post.category}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-red-600 transition-colors">
                        <Link to={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h2>
                      
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-red-600 hover:text-red-700 font-medium text-sm inline-flex items-center gap-1 transition-colors"
                      >
                        Read Full Article
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Newsletter Signup */}
              <div className="bg-white rounded-xl p-6 shadow-sm animate-fade-in-up">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Stay Updated
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Get the latest tech insights and career tips delivered to your inbox.
                </p>
                
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="form-input w-full"
                  />
                  <button className="btn-primary w-full text-sm">
                    Subscribe Now
                  </button>
                </div>
              </div>

              {/* Popular Posts */}
              <div className="bg-white rounded-xl p-6 shadow-sm animate-fade-in-up">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Popular Posts
                </h3>
                
                <div className="space-y-4">
                  {blogPosts.slice(0, 3).map((post, index) => (
                    <Link
                      key={index}
                      to={`/blog/${post.slug}`}
                      className="block hover:bg-gray-50 p-2 rounded transition-colors"
                    >
                      <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Course Promotion */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100 animate-fade-in-up">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Ready to Start Learning?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Transform your career with industry-relevant IT training programs.
                </p>
                
                <div className="space-y-2">
                  <Link
                    to="/courses"
                    className="btn-primary w-full text-center text-sm"
                  >
                    Explore Courses
                  </Link>
                  <Link
                    to="/contact"
                    className="btn-outline w-full text-center text-sm"
                  >
                    Talk to Counselor
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
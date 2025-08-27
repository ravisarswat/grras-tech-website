import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  BookOpen, 
  Tag,
  ArrowRight
} from 'lucide-react';
import SEO, { BlogPostSEO } from '../components/SEO';

const BlogPost = () => {
  const { slug } = useParams();

  // Sample blog posts data (in real app, this would come from API/CMS)
  const blogPosts = {
    'what-is-devops-beginners-guide-2025': {
      title: 'What is DevOps? A Beginner\'s Guide (2025)',
      excerpt: 'DevOps is revolutionizing software development. Learn what DevOps is, why it matters, and how to start your DevOps career in 2025.',
      content: `
        <p>DevOps has become one of the most sought-after skills in the technology industry. But what exactly is DevOps, and why is it so important?</p>

        <h2>What is DevOps?</h2>
        <p>DevOps is a set of practices that combines software development (Dev) and IT operations (Ops). It aims to shorten the systems development life cycle and provide continuous delivery with high software quality.</p>

        <h2>Key DevOps Practices</h2>
        <ul>
          <li><strong>Continuous Integration (CI):</strong> Regularly merging code changes into a shared repository</li>
          <li><strong>Continuous Deployment (CD):</strong> Automatically deploying code changes to production</li>
          <li><strong>Infrastructure as Code:</strong> Managing infrastructure through code rather than manual processes</li>
          <li><strong>Monitoring and Logging:</strong> Continuous monitoring of applications and infrastructure</li>
        </ul>

        <h2>Popular DevOps Tools</h2>
        <p>The DevOps ecosystem includes various tools for different purposes:</p>
        <ul>
          <li><strong>Version Control:</strong> Git, GitHub, GitLab</li>
          <li><strong>CI/CD:</strong> Jenkins, GitLab CI, GitHub Actions</li>
          <li><strong>Containerization:</strong> Docker, Kubernetes</li>
          <li><strong>Cloud Platforms:</strong> AWS, Azure, Google Cloud</li>
          <li><strong>Configuration Management:</strong> Ansible, Terraform</li>
        </ul>

        <h2>DevOps Career Opportunities</h2>
        <p>DevOps professionals are in high demand with excellent salary prospects. Common DevOps roles include:</p>
        <ul>
          <li>DevOps Engineer</li>
          <li>Site Reliability Engineer (SRE)</li>
          <li>Cloud Engineer</li>
          <li>Infrastructure Engineer</li>
          <li>Platform Engineer</li>
        </ul>

        <h2>Getting Started with DevOps</h2>
        <p>If you're interested in starting a DevOps career, here's a learning path:</p>
        <ol>
          <li>Learn Linux fundamentals</li>
          <li>Understand networking and security basics</li>
          <li>Master a cloud platform (AWS recommended)</li>
          <li>Learn containerization with Docker</li>
          <li>Practice with CI/CD pipelines</li>
          <li>Get hands-on experience with real projects</li>
        </ol>

        <p>At GRRAS Solutions, our comprehensive DevOps training program covers all these aspects with hands-on labs and real-world projects.</p>
      `,
      author: 'GRRAS Team',
      date: '2025-01-15',
      readTime: '8 min read',
      category: 'DevOps',
      tags: ['DevOps', 'Career', 'Technology', 'AWS', 'Cloud'],
      image: '🚀'
    },
    'why-bca-industry-training-future': {
      title: 'Why BCA with Industry Training is the Future',
      excerpt: 'Traditional BCA programs are evolving. Discover how industry-integrated BCA degrees prepare you for modern tech careers.',
      content: `
        <p>The Bachelor of Computer Applications (BCA) degree is undergoing a transformation. Traditional academic programs are being enhanced with industry training to create job-ready graduates.</p>

        <h2>The Evolution of BCA Education</h2>
        <p>Modern BCA programs now include:</p>
        <ul>
          <li>Cloud computing specializations</li>
          <li>DevOps methodology training</li>
          <li>AI and Machine Learning foundations</li>
          <li>Practical project work</li>
          <li>Industry internships</li>
        </ul>

        <h2>Why Industry Integration Matters</h2>
        <p>Industry-integrated BCA programs bridge the gap between academic theory and practical application, ensuring graduates are immediately productive in their roles.</p>

        <h2>Career Opportunities</h2>
        <p>Graduates with industry-integrated BCA degrees can pursue roles such as:</p>
        <ul>
          <li>Software Developer</li>
          <li>Cloud Engineer</li>
          <li>System Administrator</li>
          <li>Technical Support Specialist</li>
        </ul>
      `,
      author: 'Dr. Rajesh Sharma',
      date: '2025-01-12',
      readTime: '6 min read',
      category: 'Education',
      tags: ['BCA', 'Education', 'Career', 'Industry Training'],
      image: '🎓'
    },
    'top-5-skills-data-science-careers-india': {
      title: 'Top 5 Skills for Data Science Careers in India',
      excerpt: 'Master these essential data science skills to land high-paying jobs in India\'s booming tech market.',
      content: `
        <p>Data Science is one of the fastest-growing fields in India. Here are the top 5 skills you need to succeed:</p>

        <h2>1. Python Programming</h2>
        <p>Python is the most popular language for data science, with libraries like Pandas, NumPy, and Scikit-learn.</p>

        <h2>2. Statistics and Mathematics</h2>
        <p>Strong foundation in statistics is crucial for understanding data patterns and building predictive models.</p>

        <h2>3. Machine Learning</h2>
        <p>Understanding ML algorithms and their applications is essential for modern data science roles.</p>

        <h2>4. Data Visualization</h2>
        <p>Tools like Matplotlib, Seaborn, and Tableau help communicate insights effectively.</p>

        <h2>5. SQL and Database Management</h2>
        <p>Most data is stored in databases, making SQL a fundamental skill for data scientists.</p>
      `,
      author: 'Prof. Priya Agarwal',
      date: '2025-01-10',
      readTime: '7 min read',
      category: 'Data Science',
      tags: ['Data Science', 'Python', 'Machine Learning', 'Career'],
      image: '📊'
    }
  };

  const currentPost = blogPosts[slug];

  if (!currentPost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="btn-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const relatedPosts = Object.entries(blogPosts)
    .filter(([postSlug, _]) => postSlug !== slug)
    .slice(0, 3)
    .map(([postSlug, post]) => ({ slug: postSlug, ...post }));

  return (
    <>
      <BlogPostSEO post={currentPost} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              to="/blog"
              className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 animate-fade-in-up">
            <div className="bg-gradient-to-br from-red-500 to-orange-500 p-8 text-center">
              <div className="text-6xl mb-4">{currentPost.image}</div>
              <div className="inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-white text-sm font-medium mb-4">
                {currentPost.category}
              </div>
            </div>
            
            <div className="p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {currentPost.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {currentPost.excerpt}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{currentPost.author}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(currentPost.date)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{currentPost.readTime}</span>
                </div>
                
                <button className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-fade-in-up">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: currentPost.content }}
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-gray-900">Tags:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {currentPost.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Bio */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-fade-in-up">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {currentPost.author.charAt(0)}
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  About {currentPost.author}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentPost.author === 'GRRAS Team' 
                    ? 'The GRRAS Solutions team consists of industry experts and experienced educators dedicated to providing quality IT training and career guidance.'
                    : 'An experienced educator and industry expert at GRRAS Solutions Training Institute, committed to student success and industry-relevant education.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in-up">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Related Articles
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((post, index) => (
                  <Link
                    key={index}
                    to={`/blog/${post.slug}`}
                    className="block group hover:shadow-lg transition-shadow rounded-lg overflow-hidden border border-gray-100"
                  >
                    <div className="bg-gray-100 p-6 text-center">
                      <div className="text-3xl">{post.image}</div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(post.date)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 text-center border border-red-100 mt-8 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Your Tech Career?
            </h3>
            <p className="text-gray-600 mb-6">
              Transform your passion for technology into a successful career with our industry-relevant training programs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="btn-primary"
              >
                Explore Our Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              
              <Link
                to="/contact"
                className="btn-outline"
              >
                Talk to Counselor
              </Link>
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogPost;
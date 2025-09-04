import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, User, Tag, ArrowLeft, Share2, Facebook, Twitter, Linkedin, BookOpen, ArrowRight } from 'lucide-react';
import EnhancedSEO from '../components/EnhancedSEO';

// Static Data
import { blogPosts } from '../data/blog';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
    }
  }, [slug]);

  const loadBlogPost = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Find post in static data
      const foundPost = blogPosts.find(p => p.slug === slug);
      
      if (!foundPost) {
        setError('Blog post not found');
        setLoading(false);
        return;
      }
      
      setPost(foundPost);
      
      // Get related posts based on category/tags
      const related = blogPosts
        .filter(p => 
          p.slug !== slug && 
          (p.category === foundPost.category || 
           p.tags?.some(tag => foundPost.tags?.includes(tag)))
        )
        .slice(0, 3);
      
      setRelatedPosts(related);
      setLoading(false);
      
    } catch (error) {
      console.error('Error loading blog post:', error);
      setError('Failed to load blog post');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getContent = (post) => {
    return post.content || post.body || '';
  };

  const getFeaturedImage = (post) => {
    return post.featured_image || post.coverImage || post.image || 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg';
  };

  const getExcerpt = (post) => {
    return post.excerpt || post.summary || post.description || '';
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(post?.title || '');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-8"></div>
            <div className="h-64 bg-gray-300 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Blog post not found'}
            </h1>
            <Link 
              to="/blog" 
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <EnhancedSEO
        title={`${post.title} | GRRAS Solutions Blog`}
        description={post.excerpt}
        canonical={`https://www.grras.tech/blog/${post.slug}`}
        type="article"
        image={getFeaturedImage(post)}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": getFeaturedImage(post),
          "author": {
            "@type": "Organization",
            "name": post.author || "GRRAS Solutions"
          },
          "publisher": {
            "@type": "Organization",
            "name": "GRRAS Solutions Training Institute",
            "logo": {
              "@type": "ImageObject",
              "url": "https://www.grras.tech/static/media/grras-logo.png"
            }
          },
          "datePublished": post.publishedAt,
          "dateModified": post.updatedAt || post.publishedAt,
          "description": post.excerpt
        }}
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Back Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              {post.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 mb-4">
                  {post.category}
                </span>
              )}
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>
              
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {getExcerpt(post)}
              </p>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {post.author || 'GRRAS Team'}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(post.publishedAt)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {post.readTime || '5 min read'}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            {getFeaturedImage(post) && (
              <div className="mb-8">
                <img
                  src={getFeaturedImage(post)}
                  alt={post.title}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed">
                {getContent(post).split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 mr-4">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Share this article</h3>
                <div className="flex space-x-4">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Related Articles
              </h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    to={`/blog/${relatedPost.slug}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="aspect-video bg-gray-200">
                      {getFeaturedImage(relatedPost) && (
                        <img
                          src={getFeaturedImage(relatedPost)}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    
                    <div className="p-6">
                      {relatedPost.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-3">
                          {relatedPost.category}
                        </span>
                      )}
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                        {relatedPost.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {getExcerpt(relatedPost)}
                      </p>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(relatedPost.publishedAt)}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-12">
                <Link
                  to="/blog"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View All Articles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BlogPost;
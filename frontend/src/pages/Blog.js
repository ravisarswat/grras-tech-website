import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, User, Tag, Search, Filter } from 'lucide-react';
import SEO from '../components/SEO';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Force refresh blog data - Updated for Railway deployment
const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState({});
  const [tags, setTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL params
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const selectedCategory = searchParams.get('category') || '';
  const selectedTag = searchParams.get('tag') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    loadBlogData();
  }, [currentPage, selectedCategory, selectedTag, searchQuery]);

  const loadBlogData = async () => {
    try {
      setLoading(true);
      
      // Load blog posts
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);
      if (searchQuery) params.append('search', searchQuery);

      const postsResponse = await fetch(`${BACKEND_URL}/api/blog?${params}`);
      const postsData = await postsResponse.json();
      
      setPosts(postsData.posts || []);
      setPagination(postsData.pagination || {});

      // Load categories and tags (only on first load)
      if (currentPage === 1 && !selectedCategory && !selectedTag && !searchQuery) {
        const [categoriesResponse, tagsResponse] = await Promise.all([
          fetch(`${BACKEND_URL}/api/blog/categories`),
          fetch(`${BACKEND_URL}/api/blog/tags`)
        ]);
        
        const categoriesData = await categoriesResponse.json();
        const tagsData = await tagsResponse.json();
        
        setCategories(categoriesData.categories || {});
        setTags(tagsData.tags || {});
      }
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');
    
    const newParams = new URLSearchParams(searchParams);
    if (search) {
      newParams.set('search', search);
    } else {
      newParams.delete('search');
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const handleCategoryFilter = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category && category !== selectedCategory) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const handleTagFilter = (tag) => {
    const newParams = new URLSearchParams(searchParams);
    if (tag && tag !== selectedTag) {
      newParams.set('tag', tag);
    } else {
      newParams.delete('tag');
    }
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExcerpt = (post) => {
    return post.excerpt || post.summary || post.content?.substring(0, 200) + '...';
  };

  const getFeaturedImage = (post) => {
    return post.featured_image || post.coverImage || 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg';
  };

  return (
    <>
      <SEO 
        title="Blog - Latest Tech Insights & Career Guidance"
        description="Stay updated with latest technology trends, career guidance, course updates, and success stories from GRRAS Solutions."
        keywords="technology blog, IT careers, cloud computing, DevOps, cybersecurity, programming, certifications"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Tech Insights & Career Guidance
              </h1>
              <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
                Stay updated with the latest technology trends, career advice, course updates, 
                and success stories from the world of IT and cloud computing.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    name="search"
                    defaultValue={searchQuery}
                    placeholder="Search articles..."
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 text-gray-900"
                  />
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bg-red-600 text-white px-4 py-1.5 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Active Filters */}
              {(selectedCategory || selectedTag || searchQuery) && (
                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Active filters:</span>
                      
                      {selectedCategory && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                          Category: {selectedCategory}
                        </span>
                      )}
                      
                      {selectedTag && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          Tag: {selectedTag}
                        </span>
                      )}
                      
                      {searchQuery && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                          Search: "{searchQuery}"
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* Blog Posts Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <article key={post.slug} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <Link to={`/blog/${post.slug}`}>
                        <img
                          src={getFeaturedImage(post)}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                          onError={(e) => {
                            e.target.src = 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg';
                          }}
                        />
                      </Link>
                      
                      <div className="p-6">
                        {post.category && (
                          <button
                            onClick={() => handleCategoryFilter(post.category)}
                            className="inline-block px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full mb-3 hover:bg-red-200 transition-colors"
                          >
                            {post.category}
                          </button>
                        )}
                        
                        <Link to={`/blog/${post.slug}`}>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-red-600 transition-colors">
                            {post.title}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {getExcerpt(post)}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{post.author || 'GRRAS Team'}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{post.reading_time} min read</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.created_at || post.createdAt)}</span>
                          </div>
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-4">
                            {post.tags.slice(0, 3).map((tag) => (
                              <button
                                key={tag}
                                onClick={() => handleTagFilter(tag)}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded hover:bg-gray-200 transition-colors"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery || selectedCategory || selectedTag 
                        ? "Try adjusting your filters or search terms."
                        : "Check back soon for new articles and insights."}
                    </p>
                    {(searchQuery || selectedCategory || selectedTag) && (
                      <button
                        onClick={clearFilters}
                        className="btn-primary"
                      >
                        View All Articles
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {pagination.total_pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center gap-1">
                    {pagination.has_prev && (
                      <Link
                        to={`?${new URLSearchParams({...Object.fromEntries(searchParams), page: (currentPage - 1).toString()})}`}
                        className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Previous
                      </Link>
                    )}
                    
                    {[...Array(pagination.total_pages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.total_pages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <Link
                            key={page}
                            to={`?${new URLSearchParams({...Object.fromEntries(searchParams), page: page.toString()})}`}
                            className={`px-3 py-2 rounded-md ${
                              page === currentPage
                                ? 'bg-red-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </Link>
                        );
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                    
                    {pagination.has_next && (
                      <Link
                        to={`?${new URLSearchParams({...Object.fromEntries(searchParams), page: (currentPage + 1).toString()})}`}
                        className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Next
                      </Link>
                    )}
                  </nav>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="space-y-6">
                {/* Categories */}
                {Object.keys(categories).length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                      {Object.entries(categories).map(([category, count]) => (
                        <button
                          key={category}
                          onClick={() => handleCategoryFilter(category)}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedCategory === category
                              ? 'bg-red-100 text-red-800'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="capitalize">{category}</span>
                            <span className="text-sm text-gray-500">({count})</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Tags */}
                {Object.keys(tags).length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(tags)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 20)
                        .map(([tag, count]) => (
                          <button
                            key={tag}
                            onClick={() => handleTagFilter(tag)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedTag === tag
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            #{tag} ({count})
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Newsletter Signup */}
                <div className="bg-gradient-to-br from-red-600 to-orange-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
                  <p className="text-red-100 mb-4 text-sm">
                    Get the latest tech insights and career guidance delivered to your inbox.
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-3 py-2 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button className="w-full bg-white text-red-600 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
                      Subscribe
                    </button>
                  </div>
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
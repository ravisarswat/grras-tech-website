// BlogManager.js - Enhanced with Date Management for Railway deployment
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Calendar,
  User,
  Tag,
  Image,
  FileText,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category: 'general',
    tags: [],
    author: 'GRRAS Team',
    published: true,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    publishAt: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    readTime: '5 min read',
    featured: false
  });

  const categories = [
    'general',
    'devops',
    'cloud-computing',
    'data-science',
    'programming',
    'cybersecurity',
    'certifications',
    'career-guidance',
    'technology-trends',
    'education'
  ];

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/blog`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        toast.error('Failed to load blog posts');
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      toast.error('Error loading blog posts');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from title
      if (field === 'title') {
        updated.slug = generateSlug(value);
        updated.meta_title = updated.meta_title || value;
      }
      
      // Auto-generate excerpt from content
      if (field === 'content' && !updated.excerpt) {
        const plainText = value.replace(/<[^>]*>/g, '');
        updated.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
        updated.meta_description = updated.meta_description || updated.excerpt;
      }
      
      return updated;
    });
  };

  const handleTagsChange = (tagsString) => {
    const tags = tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    setFormData(prev => ({ 
      ...prev, 
      tags,
      meta_keywords: prev.meta_keywords || tags.join(', ')
    }));
  };

  const openEditor = (post = null) => {
    if (post) {
      setEditingPost(post);
      
      // Convert date to YYYY-MM-DD format for date input
      let publishDate = new Date().toISOString().split('T')[0];
      if (post.publishAt) {
        publishDate = new Date(post.publishAt).toISOString().split('T')[0];
      } else if (post.date) {
        publishDate = new Date(post.date).toISOString().split('T')[0];
      } else if (post.published_date) {
        publishDate = new Date(post.published_date).toISOString().split('T')[0];
      }
      
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || post.body || '',
        excerpt: post.excerpt || post.summary || '',
        featured_image: post.featured_image || post.coverImage || post.image || '',
        category: post.category || 'general',
        tags: post.tags || [],
        author: post.author || 'GRRAS Team',
        published: post.published !== false && post.status !== 'draft',
        meta_title: post.meta_title || post.metaTitle || post.title || '',
        meta_description: post.meta_description || post.metaDescription || post.excerpt || post.summary || '',
        meta_keywords: post.meta_keywords || post.keywords || (post.tags ? post.tags.join(', ') : ''),
        publishAt: publishDate,
        readTime: post.readTime || '5 min read',
        featured: post.featured || false
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        featured_image: '',
        category: 'general',
        tags: [],
        author: 'GRRAS Team',
        published: true,
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        publishAt: new Date().toISOString().split('T')[0],
        readTime: '5 min read',
        featured: false
      });
    }
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingPost(null);
  };

  const saveBlogPost = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      
      if (!formData.title.trim() || !formData.content.trim()) {
        toast.error('Title and content are required');
        return;
      }
      
      // Prepare data with proper date formatting
      const blogData = {
        ...formData,
        // Format date properly for backend
        date: formData.publishAt,
        publishAt: formData.publishAt,
        published_date: new Date(formData.publishAt).toISOString(),
        // Ensure status field based on published checkbox
        status: formData.published ? 'published' : 'draft',
        // Add additional date formats for compatibility
        created_at: editingPost ? editingPost.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const endpoint = editingPost 
        ? `${BACKEND_URL}/api/admin/blog/${editingPost.id || editingPost.slug}`
        : `${BACKEND_URL}/api/admin/blog`;
      
      const method = editingPost ? 'PUT' : 'POST';
      
      console.log('Saving blog post with data:', blogData); // Debug log
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(blogData)
      });
      
      if (response.ok) {
        toast.success(editingPost ? 'Blog post updated successfully' : 'Blog post created successfully');
        closeEditor();
        loadBlogPosts();
      } else {
        const error = await response.json();
        console.error('Backend error:', error); // Debug log
        toast.error(error.detail || 'Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error('Error saving blog post');
    }
  };

  const deleteBlogPost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      
      const response = await fetch(`${BACKEND_URL}/api/admin/blog/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success('Blog post deleted successfully');
        loadBlogPosts();
      } else {
        toast.error('Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Error deleting blog post');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Blog Management</h2>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Blog Management</h2>
          <p className="text-gray-600">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => openEditor()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Blog Post
        </button>
      </div>

      {/* Blog Posts List */}
      <div className="bg-white rounded-lg shadow-sm">
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-600 mb-4">Create your first blog post to get started</p>
            <button
              onClick={() => openEditor()}
              className="btn-primary"
            >
              Create Blog Post
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {post.published ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="h-3 w-3 mr-1" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Draft
                          </span>
                        )}
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {post.category}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.excerpt || post.summary || (post.content && post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...')}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author || 'GRRAS Team'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.publishAt || post.date || post.published_date || post.created_at || post.createdAt)}</span>
                      </div>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          <span>{post.tags.slice(0, 2).join(', ')}</span>
                          {post.tags.length > 2 && <span>+{post.tags.length - 2}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Post"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                    
                    <button
                      onClick={() => openEditor(post)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit Post"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => deleteBlogPost(post.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete Post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blog Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={closeEditor}></div>
            
            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h3>
                <button
                  onClick={closeEditor}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="form-input"
                        placeholder="Enter blog post title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="form-input"
                        placeholder="url-friendly-slug"
                      />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      rows={12}
                      className="form-textarea"
                      placeholder="Write your blog post content in HTML or plain text..."
                    />
                  </div>
                  
                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Excerpt
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      rows={3}
                      className="form-textarea"
                      placeholder="Brief summary of the blog post..."
                    />
                  </div>
                  
                  {/* Meta Information */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="form-select"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        className="form-input"
                        placeholder="Author name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.featured_image}
                        onChange={(e) => handleInputChange('featured_image', e.target.value)}
                        className="form-input"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags.join(', ')}
                        onChange={(e) => handleTagsChange(e.target.value)}
                        className="form-input"
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>
                  
                  {/* SEO Fields */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={formData.meta_title}
                          onChange={(e) => handleInputChange('meta_title', e.target.value)}
                          className="form-input"
                          placeholder="SEO title for search engines"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={formData.meta_description}
                          onChange={(e) => handleInputChange('meta_description', e.target.value)}
                          rows={2}
                          className="form-textarea"
                          placeholder="SEO description for search engines (150-160 characters)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meta Keywords
                        </label>
                        <input
                          type="text"
                          value={formData.meta_keywords}
                          onChange={(e) => handleInputChange('meta_keywords', e.target.value)}
                          className="form-input"
                          placeholder="SEO keywords, separated by commas"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Publish Settings */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Publishing Settings</h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Publication Date
                        </label>
                        <input
                          type="date"
                          value={formData.publishAt}
                          onChange={(e) => handleInputChange('publishAt', e.target.value)}
                          className="form-input"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Select when this blog post should be published
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Read Time
                        </label>
                        <input
                          type="text"
                          value={formData.readTime}
                          onChange={(e) => handleInputChange('readTime', e.target.value)}
                          className="form-input"
                          placeholder="5 min read"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Estimated reading time (e.g., "5 min read")
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="published"
                          checked={formData.published}
                          onChange={(e) => handleInputChange('published', e.target.checked)}
                          className="form-checkbox"
                        />
                        <label htmlFor="published" className="text-sm font-medium text-gray-700">
                          Publish immediately
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={formData.featured}
                          onChange={(e) => handleInputChange('featured', e.target.checked)}
                          className="form-checkbox"
                        />
                        <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                          Mark as featured post
                        </label>
                      </div>
                    </div>
                    
                    {!formData.published && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-yellow-600" />
                          <p className="text-sm text-yellow-800">
                            This post will be saved as a draft and can be published later.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                <button
                  onClick={closeEditor}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={saveBlogPost}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;
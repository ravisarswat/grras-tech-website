import React, { useState, useEffect } from 'react';
import { 
  Users, RefreshCw, Mail, Phone, Calendar, LogOut, 
  Filter, Download, Trash2, Search, CheckSquare, 
  Square, MoreHorizontal, Eye, Edit, AlertTriangle,
  FileText, Star, MapPin, MessageSquare, X
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SimpleLeadsManager = ({ token, onLogout }) => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/simple-leads?token=${encodeURIComponent(token)}`);
      const data = await response.json();
      
      if (data.success) {
        const leadsData = data.leads || [];
        setLeads(leadsData);
        setFilteredLeads(leadsData);
      } else {
        setError(data.message || 'Failed to load leads');
      }
    } catch (err) {
      setError('Connection error. Check backend.');
    }
    
    setLoading(false);
  };

  // Filter and Search Logic
  useEffect(() => {
    let filtered = [...leads];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.course?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.created_at || lead.timestamp);
        switch (dateFilter) {
          case 'today':
            return leadDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return leadDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return leadDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(lead => 
        lead.course?.toLowerCase().includes(courseFilter.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'email':
          aVal = a.email || '';
          bVal = b.email || '';
          break;
        case 'course':
          aVal = a.course || '';
          bVal = b.course || '';
          break;
        default: // date
          aVal = new Date(a.created_at || a.timestamp);
          bVal = new Date(b.created_at || b.timestamp);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredLeads(filtered);
  }, [leads, searchTerm, dateFilter, courseFilter, sortBy, sortOrder]);

  // Export functionality
  const exportLeads = (format = 'csv') => {
    const dataToExport = selectedLeads.length > 0 
      ? leads.filter(lead => selectedLeads.includes(lead.id))
      : filteredLeads;

    if (format === 'csv') {
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Course', 'Message', 'Date'],
        ...dataToExport.map(lead => [
          lead.name || '',
          lead.email || '',
          lead.phone || '',
          lead.course || '',
          (lead.message || '').replace(/,/g, ';'),
          formatDate(lead.created_at || lead.timestamp)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grras-leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };

  const toggleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Delete functionality  
  const handleDelete = (leadIds) => {
    setDeleteTarget(leadIds);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const idsToDelete = Array.isArray(deleteTarget) ? deleteTarget : [deleteTarget];
      
      if (idsToDelete.length === 1) {
        // Delete single lead
        const response = await fetch(`${BACKEND_URL}/api/leads/${idsToDelete[0]}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          console.log('✅ Lead deleted successfully');
        } else {
          console.error('❌ Failed to delete lead');
        }
      } else {
        // Bulk delete
        const response = await fetch(`${BACKEND_URL}/api/leads/bulk`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ lead_ids: idsToDelete })
        });
        
        if (response.ok) {
          console.log('✅ Leads deleted successfully');
        } else {
          console.error('❌ Failed to delete leads');
        }
      }
      
      // Refresh leads list
      await fetchLeads();
      setSelectedLeads([]);
      
    } catch (error) {
      console.error('Delete error:', error);
    }
    
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('simple_admin_token');
    onLogout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p>Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">

      {/* Advanced Filters & Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              {/* Course Filter */}
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">All Courses</option>
                <option value="devops">DevOps</option>
                <option value="cloud">Cloud Computing</option>
                <option value="data">Data Science</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {selectedLeads.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{selectedLeads.length} selected</span>
                  <button
                    onClick={() => handleDelete(selectedLeads)}
                    className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 flex items-center gap-2 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </button>
                </div>
              )}
              
              <button
                onClick={() => exportLeads('csv')}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-green-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              
              <button
                onClick={fetchLeads}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-xl hover:from-gray-600 hover:to-gray-700 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Sort & View Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="course">Course</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{filteredLeads.length}</span> of <span className="font-semibold">{leads.length}</span> leads
              </div>
              
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedLeads.length === filteredLeads.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedLeads.length === filteredLeads.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Connection Error</span>
            </div>
            <p className="mt-2">{error}</p>
            <button 
              onClick={fetchLeads}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {leads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-500 mb-6">Leads will appear here when users submit the contact form.</p>
            <button
              onClick={fetchLeads}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Check for New Leads
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Leads Grid */}
            <div className="p-6">
              <div className="grid gap-6">
                {filteredLeads.map((lead, index) => (
                  <div 
                    key={lead.id || lead.email || index} 
                    className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSelectLead(lead.id)}
                          className="flex-shrink-0"
                        >
                          {selectedLeads.includes(lead.id) ? (
                            <CheckSquare className="h-5 w-5 text-blue-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                          )}
                        </button>
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {lead.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{lead.name || 'Unknown'}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              <span>{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span>{lead.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(lead.created_at || lead.timestamp)}</span>
                          </div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {lead.course || 'General Inquiry'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => window.open(`tel:${lead.phone}`, '_blank')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Call"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete([lead.id])}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-gray-700 leading-relaxed">
                            {lead.message || 'No message provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredLeads.length === 0 && leads.length > 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matching leads</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setDateFilter('all');
                      setCourseFilter('all');
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete {Array.isArray(deleteTarget) ? `${deleteTarget.length} leads` : 'this lead'}?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLeadsManager;
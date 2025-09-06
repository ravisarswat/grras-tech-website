import React, { useState, useEffect } from 'react';
import SimpleAdminLogin from '../components/SimpleAdminLogin';
import SimpleLeadsManager from '../components/SimpleLeadsManager';
import SEO from '../components/SEO';

const AdminLeads = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if already logged in
    const savedToken = localStorage.getItem('simple_admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setToken(null);
    setIsAuthenticated(false);
  };



  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const response = await axios.get(`${API}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setLeads(response.data.leads || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('admin_token');
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to fetch leads');
      }
    }
  };

  // Delete Functions
  const handleDeleteSingle = (lead) => {
    setLeadsToDelete([lead]);
    setShowDeleteConfirm(true);
  };

  const handleDeleteSelected = () => {
    const leadsToDeleteArray = filteredLeads.filter(lead => selectedLeads.has(lead._id));
    setLeadsToDelete(leadsToDeleteArray);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (leadsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      if (leadsToDelete.length === 1) {
        // Delete single lead
        await axios.delete(`${API}/leads/${leadsToDelete[0]._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Lead deleted successfully!');
      } else {
        // Delete multiple leads
        const leadIds = leadsToDelete.map(lead => lead._id);
        await axios.delete(`${API}/leads/bulk`, {
          data: { lead_ids: leadIds },
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success(`${leadsToDelete.length} leads deleted successfully!`);
      }
      
      // Refresh leads and clear selections
      await fetchLeads();
      setSelectedLeads(new Set());
      setShowDeleteConfirm(false);
      setLeadsToDelete([]);
      
    } catch (error) {
      console.error('Error deleting leads:', error);
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        localStorage.removeItem('admin_token');
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to delete leads. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Selection Functions
  const toggleLeadSelection = (leadId) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead._id)));
    }
  };

  const filterLeads = () => {
    let filtered = [...leads];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.course?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Course filter
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(lead => 
        lead.course?.toLowerCase().includes(selectedCourse.toLowerCase())
      );
    }
    
    // Date filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      if (dateRange !== 'all') {
        filtered = filtered.filter(lead => 
          new Date(lead.timestamp) >= filterDate
        );
      }
    }
    
    setFilteredLeads(filtered);
  };

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast.error('No leads to export');
      return;
    }
    
    const headers = ['Name', 'Email', 'Phone', 'Course', 'Message', 'Type', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        lead.name || '',
        lead.email || '',
        lead.phone || '',
        lead.course || '',
        lead.message || '',
        lead.type || '',
        new Date(lead.timestamp).toLocaleDateString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grras_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Leads exported successfully!');
  };

  const getUniqueValues = (field) => {
    return [...new Set(leads.map(lead => lead[field]).filter(Boolean))];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <SEO 
          title="Admin Leads - GRRAS Solutions"
          description="Admin leads management"
        />
        
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Leads</h1>
            <p className="text-gray-600">Sign in to manage leads</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError(''); // Clear error when typing
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="Enter admin password"
                required
                autoComplete="current-password"
              />
            </div>
            
            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700 text-sm">{authError}</span>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={!password.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <LogIn className="h-4 w-4" />
              {password.trim() ? 'Sign In' : 'Enter Password'}
            </button>
            

          </form>
        </div>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SEO 
        title="Admin Leads | GRRAS Solutions"
        description="Admin panel for managing leads"
      />
      
      {!isAuthenticated ? (
        <SimpleAdminLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <SimpleLeadsManager token={token} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default AdminLeads;
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
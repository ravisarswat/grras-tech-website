import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(false); // Set to false initially to avoid loading issues

  // Check for existing token on mount
  useEffect(() => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        setAdminToken(token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (password) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || window.location.origin;
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;
        
        setAdminToken(token);
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', token);
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Logout function
  const logout = () => {
    setAdminToken(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('adminToken');
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    return adminToken ? { Authorization: `Bearer ${adminToken}` } : {};
  };

  const value = {
    isAuthenticated,
    adminToken,
    loading,
    login,
    logout,
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
import React, { useState } from 'react';
import { Shield, LogIn } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SimpleAdminLogin = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Try multiple endpoints for reliability
    const endpoints = [
      `${BACKEND_URL}/api/admin/login`,
      `${BACKEND_URL}/api/simple-login`
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying login at: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        });

        if (!response.ok) {
          console.log(`${endpoint} failed with status: ${response.status}`);
          continue;
        }

        const data = await response.json();
        console.log(`${endpoint} response:`, data);
        
        if (data.success && data.token) {
          localStorage.setItem('simple_admin_token', data.token);
          onLoginSuccess(data.token);
          setLoading(false);
          return;
        } else if (data.token) {
          // Handle old format response
          localStorage.setItem('simple_admin_token', data.token);
          onLoginSuccess(data.token);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error(`${endpoint} error:`, err);
        continue;
      }
    }
    
    // If all endpoints failed
    setError(`Connection failed. Backend: ${BACKEND_URL}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="text-center mb-6">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-gray-600">Enter password to access leads</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Use password: <code className="bg-gray-100 px-2 py-1 rounded">grras-admin</code>
          </p>
          
          {/* Health Check Button */}
          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch(`${BACKEND_URL}/api/health`);
                const data = await response.json();
                alert(`Backend Status: ${data.status}\n${data.message}\nAdmin Ready: ${data.admin_ready}`);
              } catch (err) {
                alert(`Backend Connection Failed!\nURL: ${BACKEND_URL}\nError: ${err.message}`);
              }
            }}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Test Backend Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminLogin;
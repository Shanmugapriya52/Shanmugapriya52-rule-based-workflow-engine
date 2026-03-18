import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TestLogin() {
  const navigate = useNavigate();
  
  const handleQuickLogin = () => {
    // Simple test login
    const testUser = { 
      username: 'testuser', 
      role: 'Admin', 
      loginTime: new Date().toISOString() 
    };
    
    localStorage.setItem('currentUser', JSON.stringify(testUser));
    
    // Force page reload to ensure clean state
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Quick Login Test</h1>
        <p className="text-gray-600 mb-6">This bypasses all form validation to test if the core login works.</p>
        
        <button
          onClick={handleQuickLogin}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700"
        >
          Quick Login as Admin
        </button>
        
        <div className="mt-4 text-sm text-gray-500">
          <p>If this works, the issue is with the main login form.</p>
          <p>If this doesn't work, there's a deeper routing/component issue.</p>
        </div>
      </div>
    </div>
  );
}

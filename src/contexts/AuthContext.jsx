import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage. getItem('adminToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        setCurrentUser(JSON.parse(userInfo));
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (username === 'admin' && password === 'admin123') {
      const userInfo = {
        username: 'admin',
        name: 'Administrator',
        role: 'admin',
        email: 'admin@localizy.com'
      };
      
      localStorage.setItem('adminToken', 'fake-admin-token');
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setCurrentUser(userInfo);
      
      return { success: true, user: userInfo };
    } else {
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
    }
  };

  const logout = async () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext. Provider value={value}>
      {! loading && children}
    </AuthContext.Provider>
  );
};
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
    const token = localStorage.getItem('authToken');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token && userInfo) {
      try {
        setCurrentUser(JSON.parse(userInfo));
      } catch (error) {
        console.error('Error parsing user info:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock users database
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        name: 'Administrator',
        email: 'admin@notebooklm.vn'
      },
      {
        username: 'teacher',
        password: 'teacher123',
        role: 'teacher',
        name: 'Nguyễn Văn Giáo',
        email: 'giaovien@notebooklm.vn'
      },
      {
        username: 'student',
        password: 'student123',
        role: 'student',
        name: 'Trần Thị Học',
        email: 'hocsinh@notebooklm.vn'
      }
    ];

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      const userInfo = {
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      };
      
      localStorage.setItem('authToken', 'fake-auth-token');
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setCurrentUser(userInfo);
      
      return { success: true, user: userInfo };
    } else {
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác');
    }
  };

  const register = async (userData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const userInfo = {
      username: userData.username,
      name: userData.fullName,
      role: userData.role,
      email: userData.email
    };
    
    localStorage.setItem('authToken', 'fake-auth-token');
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setCurrentUser(userInfo);
    
    return { success: true, user: userInfo };
  };

  const logout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
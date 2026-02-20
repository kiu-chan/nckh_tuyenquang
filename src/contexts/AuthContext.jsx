import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_URL = '/api/auth';

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
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setCurrentUser(data.user);
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        localStorage.removeItem('authToken');
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    localStorage.setItem('authToken', data.token);
    setCurrentUser(data.user);
    return { success: true, user: data.user };
  };

  const register = async (userData) => {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: userData.password,
        name: userData.fullName,
        email: userData.email,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }

    localStorage.setItem('authToken', data.token);
    setCurrentUser(data.user);
    return { success: true, user: data.user };
  };

  const googleLogin = async (credential) => {
    const res = await fetch(`${API_URL}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Đăng nhập Google thất bại. Vui lòng thử lại.');
    }

    if (!res.ok) {
      throw new Error(data.message || 'Đăng nhập Google thất bại');
    }

    localStorage.setItem('authToken', data.token);
    setCurrentUser(data.user);
    return { success: true, user: data.user };
  };

  const updateProfile = (updatedUser) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const logout = async () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

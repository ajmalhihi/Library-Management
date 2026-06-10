import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user session from localStorage on app bootup
  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
          
          // Verify session on backend in background
          const res = await API.get('auth/me/');
          const refreshedUser = res.data;
          
          setUser(refreshedUser);
          localStorage.setItem('user', JSON.stringify(refreshedUser));
        } catch (err) {
          console.warn("Session restore failed, tokens might have expired.", err);
          // If auth/me failed completely, we let the axios interceptor handle it
          // or clear local session if token is empty
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post('auth/login/', { email, password });
      const { access, refresh, user: userData } = res.data;
      
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (err) {
      throw err.response?.data?.error || err.message || "Login failed. Please check credentials.";
    }
  };

  const register = async (name, email, password, confirm_password, role) => {
    try {
      const res = await API.post('auth/register/', {
        name,
        email,
        password,
        confirm_password,
        role
      });
      const { access, refresh, user: userData } = res.data;

      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return userData;
    } catch (err) {
      // Return detailed API error messages (like nested objects or simple strings)
      if (err.response?.data) {
        throw err.response.data;
      }
      throw { error: err.message || "Registration failed." };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);
  
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data.user || response.data.data); // Fallback if structure is flat
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      const message = error.response?.data?.errors?.[0]?.message || 
                      error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Login failed';
      toast.error(message);
      return false;
    }
  };
  
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      const message = error.response?.data?.errors?.[0]?.message || 
                      error.response?.data?.message || 
                      error.response?.data?.error || 
                      'Registration failed';
      toast.error(message);
      return false;
    }
  };
  
  const logout = () => {
  localStorage.removeItem('token');
  setToken(null);
  setUser(null);
  window.location.replace('/login'); 
};
  
  const updateProfile = async (data) => {
    try {
      const response = await api.put('/users/profile', data);
      const updatedUser = response.data.data;
      setUser(updatedUser);
      // Also update token if user data is embedded in it (though usually not necessary for profile edits)
      toast.success('Profile updated successfully!');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateProfile,
      refreshUser: fetchUser,
      isAuthenticated: !!user
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

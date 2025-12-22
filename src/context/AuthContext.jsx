// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (token) {
          // Get user data from localStorage first (faster)
          const userData = authService.getCurrentUser();
          if (userData) {
            setUser(userData);
          }
          
          // Optionally verify token is still valid by fetching fresh user data
          // Commented out to prevent unnecessary API calls on every page load
          // try {
          //   const response = await authService.getProfile();
          //   if (response.success) {
          //     setUser(response.data);
          //   }
          // } catch (error) {
          //   console.error('Token validation error:', error);
          //   authService.clearSession();
          //   setUser(null);
          // }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []); // Empty dependency array - only run once on mount

  // Login function
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.login(email, password);
      
      if (response.success) {
        authService.saveSession(response.data);
        setUser(response.data.user);
        return { success: true };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await authService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.error || 'Password change failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
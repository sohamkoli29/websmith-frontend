// src/context/MessagesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import contentService from '../services/content';
import { useAuth } from './AuthContext';

const MessagesContext = createContext();

export const useMessages = () => useContext(MessagesContext);

export const MessagesProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, isLoading } = useAuth();

  const fetchUnreadCount = async () => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await contentService.getMessages();
      if (response.data.success) {
        const unreadMessages = response.data.data?.filter(message => !message.read) || [];
        setUnreadCount(unreadMessages.length);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't throw error, just log it
    }
  };

  useEffect(() => {
    // Only fetch when authenticated and not loading
    if (isAuthenticated && !isLoading) {
      fetchUnreadCount();
      
      // Refresh every 30 seconds only if authenticated
      const interval = setInterval(() => {
        if (isAuthenticated) {
          fetchUnreadCount();
        }
      }, 30000);
      
      return () => clearInterval(interval);
    } else {
      // Reset count when not authenticated
      setUnreadCount(0);
    }
  }, [isAuthenticated, isLoading]);

  const markAsRead = () => {
    if (unreadCount > 0) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const incrementUnreadCount = () => {
    setUnreadCount(prev => prev + 1);
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <MessagesContext.Provider value={{
      unreadCount,
      fetchUnreadCount,
      markAsRead,
      incrementUnreadCount,
      resetUnreadCount
    }}>
      {children}
    </MessagesContext.Provider>
  );
};
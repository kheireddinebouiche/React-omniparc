import React, { createContext, useContext, useState, useCallback } from 'react';
import { NotificationType } from '../components/Notification';

interface NotificationContextType {
  showNotification: (message: string, severity: NotificationType) => void;
  hideNotification: () => void;
  notification: {
    open: boolean;
    message: string;
    severity: NotificationType;
  };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as NotificationType,
  });

  const showNotification = useCallback((message: string, severity: NotificationType) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        hideNotification,
        notification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 
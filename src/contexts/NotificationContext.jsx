import React, { createContext, useContext, useState, useCallback } from 'react';
    import { useToast } from '@/components/ui/use-toast';

    const NotificationContext = createContext();

    export const useNotifications = () => useContext(NotificationContext);

    export const NotificationProvider = ({ children }) => {
      const { toast } = useToast();
      const [notifications, setNotifications] = useState([]);

      const addNotification = useCallback((notification) => {
        setNotifications(prev => [...prev, { id: Date.now(), ...notification }]);
        toast({
          title: notification.title,
          description: notification.message,
        });
      }, [toast]);
      
      const triggerRecurringExpenseCheck = useCallback(async () => {
        // This function is now a no-op but is kept to avoid breaking other components if they call it.
        // It can be removed once all calls are confirmed to be removed.
        return Promise.resolve();
      }, []);

      const contextValue = { 
        notifications, 
        addNotification,
        triggerRecurringExpenseCheck
      };

      return (
        <NotificationContext.Provider value={contextValue}>
          {children}
        </NotificationContext.Provider>
      );
    };
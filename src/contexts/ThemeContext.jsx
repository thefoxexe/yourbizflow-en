import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => null,
});

// Routes de l'application interne qui utilisent le thème choisi par l'utilisateur
const appRoutes = [
  '/dashboard', '/marketplace', '/billing', '/quotes', '/crm', '/analytics', 
  '/notes', '/settings', '/inventory', '/calendar', '/projects', '/time-tracking',
  '/expenses', '/financial-report', '/recurring-payments', '/automated-reminders',
  '/hr', '/products', '/tasks', '/mail', '/stock-management', '/seo-analyzer',
  '/budget', '/trading-journal', '/ai-writing', '/revenues', '/ai-strategy-map',
  '/rental-management', '/order-management', '/upgrade', '/subscription', '/note/'
];

export const ThemeProvider = ({ children, storageKey = 'vite-ui-theme' }) => {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(storageKey) || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Vérifie si on est sur une route de l'application interne
    const isAppRoute = appRoutes.some(route => location.pathname.startsWith(route));
    
    root.classList.remove('light', 'dark');
    // Utilise le thème choisi uniquement pour les routes de l'application, sinon dark mode
    root.classList.add(isAppRoute ? theme : 'dark');
  }, [theme, location.pathname]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
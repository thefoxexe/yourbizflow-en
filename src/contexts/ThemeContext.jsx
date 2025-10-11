import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => null,
});

export const ThemeProvider = ({ children, storageKey = 'vite-ui-theme' }) => {
  const [theme, setTheme] = useState(localStorage.getItem(storageKey) || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add('dark');
  }, []);

  const value = {
    theme: 'dark',
    setTheme: (newTheme) => {
      const effectiveTheme = 'dark';
      localStorage.setItem(storageKey, effectiveTheme);
      setTheme(effectiveTheme);
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(effectiveTheme);
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
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightTheme = {
  background: '#fff',
  text: '#333',
  card: '#f1f1f1',
  border: '#eee',
  icon: '#555',
};
const darkTheme = {
  background: '#181818',
  text: '#fff',
  card: '#222',
  border: '#333',
  icon: '#fff',
};

const ThemeContext = createContext({
  isDarkMode: false,
  theme: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('theme');
      setIsDarkMode(saved === 'dark');
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      AsyncStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme } from '../constants/themes';

const ThemeContext = createContext(null);

const THEME_KEY = '@qrbuilder_theme';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((val) => {
        if (val !== null) setIsDark(val === 'dark');
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
  };

  const theme = isDark ? darkTheme : lightTheme;

  if (!ready) return null;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme/colors';

const THEME_KEY = '@theme_preference';
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState(null); // null = follow system, 'light' | 'dark' = saved choice

  // Load saved preference on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') {
        setOverride(saved);
      }
    });
  }, []);

  const isDark = override !== null ? override === 'dark' : systemScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  async function toggleTheme() {
    const next = isDark ? 'light' : 'dark';
    setOverride(next);
    await AsyncStorage.setItem(THEME_KEY, next);
  }

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Define the light and dark themes
export const lightTheme = {
  ...MD3LightTheme,
  name: 'light', 
  colors: {
    ...MD3LightTheme.colors,
    primary: 'tomato',
    secondary: '#ffd33d',
    background: '#f1f1f1',
    surface: '#ffffff',
    text: '#25292e',
    muted: '#777777',
    success: 'green',
    error: 'red',
    tabBackground: '#f7f9fc'
  },
  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: { fontFamily: 'Roboto-Regular', fontWeight: '400' as const },
    titleMedium: { fontFamily: 'Roboto-Medium', fontWeight: '500' as const },
    labelSmall: { fontFamily: 'Roboto-Bold', fontWeight: '700' as const },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  name: 'dark',
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ffd33d',
    secondary: 'tomato',
    background: '#25292e',
    surface: '#333',
    text: '#ffffff',
    muted: '#999999',
    success: 'green',
    error: 'red',
    tabBackground: '#25292e'
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    bodyLarge: { fontFamily: 'Roboto-Regular', fontWeight: '400' as const },
    titleMedium: { fontFamily: 'Roboto-Medium', fontWeight: '500' as const },
    labelSmall: { fontFamily: 'Roboto-Bold', fontWeight: '700' as const },
  },
};

// Create the ThemeContext
const ThemeContext = createContext({
  theme: lightTheme, // Default theme
  toggleTheme: () => {},
});

// ThemeProvider component to manage theme state
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to access ThemeContext
export const useThemeSwitcher = () => useContext(ThemeContext);

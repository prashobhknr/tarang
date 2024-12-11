import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Auth0Provider } from 'react-native-auth0';
import { UserProvider } from '@/context/UserContext';
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';

LogBox.ignoreAllLogs(true); // Suppresses all log warnings

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#ffd33d',
    secondary: 'tomato',
    background: '#f1f1f1',
    surface: '#ffffff',
    text: '#25292e',
    muted: '#777777',
    success: 'green',
    error: 'red',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: { fontFamily: 'Roboto-Regular', fontWeight: '400' as const },
    titleMedium: { fontFamily: 'Roboto-Medium', fontWeight: '500' as const },
    labelSmall: { fontFamily: 'Roboto-Bold', fontWeight: '700' as const },
  },
};

const darkTheme = {
  ...MD3DarkTheme,
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
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    bodyLarge: { fontFamily: 'Roboto-Regular', fontWeight: '400' as const },
    titleMedium: { fontFamily: 'Roboto-Medium', fontWeight: '500' as const },
    labelSmall: { fontFamily: 'Roboto-Bold', fontWeight: '700' as const },
  },
};

export default function RootLayout() {
  const systemColorScheme = useColorScheme(); // Detect system color scheme ('light' or 'dark')
  const theme = systemColorScheme === 'dark' ? darkTheme : lightTheme; // Dynamically set the theme

  return (
    <Auth0Provider domain="tarangschool.eu.auth0.com" clientId="CTXGH6NyrWAEQJJ49NC2oldx3DDlqElc">
      <UserProvider>
        <PaperProvider theme={theme}>
          <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <StatusBar style={systemColorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack>
              {/* Main Tab Navigation */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              {/* Not Found Screen */}
              <Stack.Screen name="+not-found" />
            </Stack>
          </GestureHandlerRootView>
        </PaperProvider>
      </UserProvider>
    </Auth0Provider>
  );
}

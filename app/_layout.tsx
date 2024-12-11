import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Auth0Provider } from 'react-native-auth0';
import { UserProvider } from '@/context/UserContext';
import { MD3LightTheme as DefaultTheme, PaperProvider } from 'react-native-paper';

LogBox.ignoreAllLogs(true)

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#ffd33d',
    secondary: 'tomato',
    background: '#25292e',
    surface: '#333',
    text: '#ffffff',
  },
};


export default function RootLayout() {
  return (
    <Auth0Provider domain={"tarangschool.eu.auth0.com"} clientId={"CTXGH6NyrWAEQJJ49NC2oldx3DDlqElc"}>
      <UserProvider>
        <PaperProvider theme={theme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <Stack>

              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              <Stack.Screen name="+not-found" />
            </Stack>
          </GestureHandlerRootView>
        </PaperProvider>
      </UserProvider>
    </Auth0Provider>
  );
}

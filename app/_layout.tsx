import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Auth0Provider } from 'react-native-auth0';
import { UserProvider } from '@/context/UserContext'; 

LogBox.ignoreAllLogs(true)

export default function RootLayout() {
  return (
    <Auth0Provider domain={"dev-ekunvd3grax376fx.eu.auth0.com"} clientId={"YRB9tEjIvJcVSWTOlBgtOWkoTB0niK5e"}>
      <UserProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="light" />
          <Stack>

            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen name="+not-found" />
          </Stack>
        </GestureHandlerRootView>
      </UserProvider>
    </Auth0Provider>
  );
}

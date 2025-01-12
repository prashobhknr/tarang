import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { LogBox, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Auth0Provider } from 'react-native-auth0';
import { UserProvider } from '@/context/UserContext';
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';
import { ThemeProvider, useThemeSwitcher } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { SafeAreaView } from 'react-native-safe-area-context';

LogBox.ignoreAllLogs(true); // Suppresses all log warnings

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const BACKGROUND_NOTIFICATION_TASK = "BACKGROUND-NOTIFICATION-TASK";

TaskManager.defineTask(
  BACKGROUND_NOTIFICATION_TASK,
  ({ data, error, executionInfo }) => {
    console.log("✅ Received a notification in the background!", {
      data,
      error,
      executionInfo,
    });
    // Do something with the notification data
  }
);

Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);


export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <Auth0Provider domain="tarangschool.eu.auth0.com" clientId="CTXGH6NyrWAEQJJ49NC2oldx3DDlqElc">
      <UserProvider>
        <ThemeProvider>
        <NotificationProvider>
          <ThemedLayout />
          </NotificationProvider>
        </ThemeProvider>
      </UserProvider>
    </Auth0Provider>
    </SafeAreaView>
    
  );
}

function ThemedLayout() {
  const { theme } = useThemeSwitcher();

  return (
    <PaperProvider theme={theme}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'}  />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </GestureHandlerRootView>
    </PaperProvider>
  );
}


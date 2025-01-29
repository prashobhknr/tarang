import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Platform, Alert, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { useTheme, ActivityIndicator, Text, Button, FAB } from 'react-native-paper';
import { useNotification } from "@/context/NotificationContext";
import * as Updates from "expo-updates";
import { useFocusEffect } from 'expo-router';

export default function Index() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);
  const [localHtmlUri, setLocalHtmlUri] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const { notification, expoPushToken, error } = useNotification();
  const homeUrl = 'https://tarangschool.com';
  const [url, setUrl] = useState(homeUrl);

  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);



  useEffect(() => {
    async function loadLocalHtml() {
      const asset = Asset.fromModule(require('@/assets/local.html'));
      await asset.downloadAsync();
      setLocalHtmlUri(asset.uri);
    }

    loadLocalHtml();
  }, []);

  useEffect(() => {
    const handleBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack(); // Navigate back in WebView
        return true; // Prevent default back action
      } else {
        Alert.alert("Exit App", "Are you sure you want to exit the app?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );

    return () => backHandler.remove();
  }, [canGoBack]);


  const handleError = () => {
    setIsError(true);
  };

  const handleLoadEnd = () => {
    if (loading) {
      setLoading(false);
      setKey(1);
    }
  };


  const { currentlyRunning, isUpdateAvailable, isUpdatePending } =
    Updates.useUpdates();

  const [dummyState, setDummyState] = useState(0);

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  useEffect(() => {
    if (isUpdatePending) {
      // Update has successfully downloaded; apply it now
      // Updates.reloadAsync();
      // setDummyState(dummyState + 1);
      // Alert.alert("Update downloaded and applied");

      dummyFunction();
    }
  }, [isUpdatePending]);

  const dummyFunction = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      Alert.alert("Error");
    }

    // UNCOMMENT TO REPRODUCE EAS UPDATE ERROR
    // } finally {
    //   setDummyState(dummyState + 1);
    //   console.log("dummyFunction");
    // }
  };

  // If true, we show the button to download and run the update
  const showDownloadButton = isUpdateAvailable;

  // Show whether or not we are running embedded code or an update
  const runTypeMessage = currentlyRunning.isEmbeddedLaunch
    ? "This app is running from built-in code"
    : "This app is running an update";

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,

    }]}>

      {notification &&
        <View>
          <Text>Updates Demo 5</Text>
          <Text>{runTypeMessage}</Text>
          <Button
            onPress={() => Updates.checkForUpdateAsync()}

          >Check manually for updates</Button>
          {showDownloadButton ? (
            <Button
              onPress={() => Updates.fetchUpdateAsync()}
            >Download and run update</Button>
          ) : null}
          <Text style={{ color: "red" }}>
            Your push token:
          </Text>
          <Text>{expoPushToken}</Text>
          <Text >Latest notification:</Text>
          <Text>{notification?.request.content.title}</Text>
          <Text>
            {JSON.stringify(notification?.request.content.data, null, 2)}
          </Text>
        </View>
      }

      {loading && !isError && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} color={colors.primary} size="large" />
        </View>
      )}
      <WebView
        key={key}
        ref={webViewRef}
        source={{ uri: url }}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        allowsBackForwardNavigationGestures={true} 
        style={styles.webView}
      />
      {Platform.OS === 'ios' && canGoBack && (
        <FAB
          icon="arrow-left"
          onPress={() => webViewRef.current?.goBack()}
          style={styles.fab}
          color={colors.primary}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  webView: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20
  },
});

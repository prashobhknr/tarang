import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Platform, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { useTheme, ActivityIndicator, Text, Button } from 'react-native-paper';
import { useNotification } from "@/context/NotificationContext";
import * as Updates from "expo-updates";

export default function Index() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('loading');
  const [localHtmlUri, setLocalHtmlUri] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const { notification, expoPushToken, error } = useNotification();


  useEffect(() => {
    async function loadLocalHtml() {
      const asset = Asset.fromModule(require('@/assets/local.html'));
      await asset.downloadAsync();
      setLocalHtmlUri(asset.uri);
    }

    loadLocalHtml();
  }, []);

  const handleError = () => {
    setIsError(true);
  };

  const handleLoadEnd = () => {
    if (loading) {
      setLoading(false);
      setKey('loaded');
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
      paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 10,
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
        source={isError && localHtmlUri ? { uri: localHtmlUri } : { uri: 'https://tarangschool.com' }}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        style={styles.webView}
      />
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
});

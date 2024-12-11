import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { useTheme, ActivityIndicator } from 'react-native-paper';

export default function Index() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('loading');
  const [localHtmlUri, setLocalHtmlUri] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  

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
    if(loading){
      setLoading(false); 
      setKey('loaded');
    }
    
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading && !isError && (
        <ActivityIndicator animating={true} color={colors.primary} size={"large"}/>
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
        style={styles.container}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

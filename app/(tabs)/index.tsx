import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';

export default function Index() {
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
    <View style={styles.container}>
      {loading && !isError && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
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
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
  },
});

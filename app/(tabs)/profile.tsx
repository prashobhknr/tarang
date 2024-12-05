import React from 'react';
import { Alert, Button, Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useAuth0 } from 'react-native-auth0';

export default function ProfileScreen() {
  const { authorize, clearSession, user, error, getCredentials, isLoading } = useAuth0();

  const onLogin = async () => {
    try {
      await authorize({
        redirectUrl: 'com.auth0.tarang.auth0://dev-ekunvd3grax376fx.eu.auth0.com/ios/com.auth0.tarang/callback',
      });
      let credentials = await getCredentials();
    } catch (e) {
      console.log(e);
    }
  };

  const loggedIn = user !== undefined && user !== null;

  const onLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.log('Log out cancelled');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Details */}
      {user ? (
        <View style={styles.profileCard}>
          {/* Profile Picture */}
          {user.picture && (
            <Image
              source={{ uri: user.picture }}
              style={styles.profilePicture}
            />
          )}
          
          {/* User Details */}
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          {/* Log Out Button */}
          <TouchableOpacity style={styles.button} onPress={onLogout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* If not logged in, show message */}
          <Text style={styles.message}>You are not logged in. Please log in to view your profile.</Text>
          <TouchableOpacity style={styles.button} onPress={onLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </>
      )}
      
      {/* Show errors */}
      {error && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f1f1', // Light background for a clean look
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#777',
    marginVertical: 10,
  },
  message: {
    fontSize: 18,
    color: '#ff6347', // Red for a clear action prompt
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007bff', // Blue color for buttons
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});

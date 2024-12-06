import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useAuth0, User } from 'react-native-auth0'; // Import the User type
import Button from '@/components/Button'; // Import the updated Button
import { db } from '@/firebase'; // Import Firebase DB
import { doc, setDoc } from 'firebase/firestore'; // Import necessary Firestore methods

export default function ProfileScreen() {
  const { authorize, clearSession, user, error, isLoading } = useAuth0();

  const saveUserToFirestore = async (user: any) => {
    try {
      const userDocRef = doc(db, 'users', user.email); 
  
      const userData = {
        name: user.name,
        email: user.email,
        picture: user.picture,
        role: 'student', 
      };
  

      await setDoc(userDocRef, userData, { merge: true });
  
      console.log('User saved/updated in Firestore successfully!');
    } catch (error) {
      console.error('Error saving/updating user in Firestore: ', error);
    }
  };

  const onLogin = async () => {
    try {
      await authorize({
        redirectUrl: 'com.auth0.tarang.auth0://dev-ekunvd3grax376fx.eu.auth0.com/ios/com.auth0.tarang/callback',
      });
    } catch (e) {
      console.log(e);
    }
  };

  const onLogout = async () => {
    try {
      await clearSession();
    } catch (e) {
      console.log('Log out cancelled');
    }
  };

  // Save user data to Firestore when user logs in
  useEffect(() => {
    if (user) {
      saveUserToFirestore(user); // Call save function after user logs in
    }
  }, [user]);

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
          {user.picture && (
            <Image
              source={{ uri: user.picture }}
              style={styles.profilePicture}
            />
          )}
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Button label="Log Out" theme="secondary" onPress={onLogout} icon="sign-out" />
        </View>
      ) : (
        <>
          <Text style={styles.message}>You are not logged in. Please log in to view your profile.</Text>
          <Button label="Log In" theme="primary" onPress={onLogin} icon="sign-in" />
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
    backgroundColor: '#f1f1f1',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#555',
    fontWeight: 'bold',
    marginTop: 10, // Add margin to separate from the loading indicator
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
    color: '#ff6347',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  error: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
});

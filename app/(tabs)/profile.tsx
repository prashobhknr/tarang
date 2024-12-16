import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Switch } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { Text, useTheme } from 'react-native-paper';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import CircleButton from '@/components/CircleButton';
import { useUser } from '@/context/UserContext';
import uuid from 'react-native-uuid';
import Button from '@/components/Button';
import { useThemeSwitcher } from '@/context/ThemeContext';
import CourseCRUD from '@/components/CourseCRUD';
import UserProfileManager from '@/components/UserProfileManager';

export default function ProfileScreen() {
  const { authorize, clearSession, user, error, isLoading } = useAuth0();
  const [isCourseSheetVisible, setIsCourseSheetVisible] = useState(false); // Control for CourseCRUD's BottomSheet
  const [isProfileEdit, setIsProfileEdit] = useState(false);


  const { setUserData } = useUser();
  const { userData } = useUser();
  const { colors, fonts } = useTheme();
  const { theme, toggleTheme } = useThemeSwitcher();

  const fetchUser = async () => {
    try {
      if (user?.email && !userData) {
        const userDocRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
        } else {
          saveUserToFirestore(user);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };


  const saveUserToFirestore = async (user: any) => {
    try {
      const userDocRef = doc(db, 'users', user.email);
      const callbackId = uuid.v4().replace(/-/g, '').toUpperCase();
      const userData = {
        name: user.name,
        email: user.email,
        role: 'parent',
        callbackId,
        students: []
      };
      await setDoc(userDocRef, userData, { merge: true });
      setUserData(userData);
    } catch (error) {
      console.error('Error saving/updating user in Firestore:', error);
    }
  };

  const onLogin = async () => {
    try {
      await authorize();
    } catch (e) {
      console.log(e);
    }
  };

  const onLogout = async () => {
    try {
      setUserData('');
      await clearSession();
    } catch (e) {
      console.log('Log out cancelled');
    }
  };

  useEffect(() => {
    if (user) fetchUser();
  }, [user]);

  const toggleCourseSheet = () => {
    setIsCourseSheetVisible((prev) => !prev);
  };

  const toggleProfileEdit = () => {
    setIsProfileEdit((prev) => !prev);
  };


  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.loadingText, { color: colors.primary }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {user ? (
        <>
          <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
            {user.picture && (
              <Image
                source={{ uri: user.picture }}
                style={styles.profilePicture}
              />
            )}
            <Text style={[styles.name, fonts.headlineSmall]}>{user.name}</Text>
            <Text style={[styles.email, fonts.bodySmall]}>{user.email}</Text>
            {userData?.role === 'admin' && (<CircleButton onPress={() => { toggleCourseSheet() }} isActive={isCourseSheetVisible} />)}
            {userData?.role === 'parent' && (<CircleButton onPress={() => { toggleProfileEdit() }} isActive={isProfileEdit} />)}

            <Button label="Log Out" theme="secondary" onPress={onLogout} iconName="logout" />



            {/* Theme Switcher */}
            <View style={styles.themeSwitcher}>
              <Text style={[styles.themeText, { color: colors.onSurface }]}>{theme.name === 'dark' ? 'Light' : 'Dark'} Mode</Text>
              <Switch
                value={theme.name === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                thumbColor={theme.name === 'dark' ? colors.primary : colors.onSurfaceVariant}
              />
            </View>

          </View>

          {userData?.role === 'admin' && (<CourseCRUD isVisible={isCourseSheetVisible} onClose={() => setIsCourseSheetVisible(false)} />)}
          {userData?.role === 'parent' &&(<UserProfileManager isVisible={isProfileEdit} onClose={() => setIsProfileEdit(false)} />)}

        </>


      ) : (
        <>
          <Text style={[styles.message, { color: colors.error }]}>You are not logged in. Please log in to view your profile.</Text>
          <Button label="Log In" theme="primary" onPress={onLogin} iconName="login" />
        </>
      )}


      {error && <Text style={[styles.error, { color: colors.error }]}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileCard: {
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    marginBottom: 10,
  },
  email: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  studentEmailText: {
    marginTop: 10,
  },
  error: {
    marginTop: 10,
    fontSize: 14,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  themeSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  themeText: {
    marginRight: 10,
    fontSize: 16,
  },
});
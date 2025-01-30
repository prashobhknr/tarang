import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Switch } from 'react-native';
import { useAuth0 } from 'react-native-auth0';
import { Text, useTheme, Button } from 'react-native-paper';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import CircleButton from '@/components/CircleButton';
import { useUser } from '@/context/UserContext';
import uuid from 'react-native-uuid';
import { useThemeSwitcher } from '@/context/ThemeContext';
import CourseCRUD from '@/components/CourseCRUD';
import UserProfileManager from '@/components/UserProfileManager';
import { useNotification } from "@/context/NotificationContext";
import { CustomNotification } from '@/components/types';

export default function ProfileScreen() {
  const { authorize, clearSession, user, error, isLoading } = useAuth0();
  const [isCourseSheetVisible, setIsCourseSheetVisible] = useState(false); 
  const [isProfileEdit, setIsProfileEdit] = useState(false);
  const { expoPushToken } = useNotification();

  const { userData ,setUserData , setNotifications} = useUser();
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
          fetchNotifications(userData);
        } else {
          saveUserToFirestore(user);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const getNotificationsDocRef = (userData: any) => {
    if (!userData) {
      throw new Error('User data is required to fetch notifications.');
    }

    if (userData.role === 'admin') {
      return doc(db, 'notifications', 'admin');
    } else {
      return doc(db, 'notifications', userData.email);
    }
  };

  const fetchNotifications = async (userData: any) => {
      if (userData) {
        try {
          console.log('reading notifications from profilr')
          const notificationsDocRef = getNotificationsDocRef(userData);
          const notificationsSnap = await getDoc(notificationsDocRef);
  
          if (notificationsSnap.exists()) {
            const data = notificationsSnap.data();
            const currentTimestamp = new Date().getTime();
            const oneMonthAgo = currentTimestamp - 30 * 24 * 60 * 60 * 1000; 
            // Filter out notifications older than one month
            const filteredNotifications = (data.notifications || []).filter(
              (notification: CustomNotification) => {
                const notificationTimestamp = new Date(notification.timestamp).getTime();
                return notificationTimestamp >= oneMonthAgo;
              }
            );
  
            // // Sort notifications by timestamp (most recent first)
            const sortedNotifications = filteredNotifications;
            // const sortedNotifications = filteredNotifications.sort(
            //   (a: CustomNotification, b: CustomNotification) =>
            //     new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            // );
  
            // Update Firestore with the filtered notifications if any were removed
            if (filteredNotifications.length !== (data.notifications || []).length) {
              await updateDoc(notificationsDocRef, { notifications: filteredNotifications });
            }
  
            // Update local state
            setNotifications(sortedNotifications);
          } else {
            console.warn('No notifications found.');
            setNotifications([]);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } 
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
        students: [],
        expoPushToken: expoPushToken
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

            <Button
              mode="contained"
              onPress={() => onLogout()}
              style={{ borderRadius: 5, marginTop: 10 }}
              icon="logout"
            >
              Log Out
            </Button>




            {/* Theme Switcher */}
            <View style={styles.themeSwitcher}>
              <Text style={[styles.themeText, { color: colors.onSurface }]}>{theme.name === 'dark' ? 'Light' : 'Dark'} Mode</Text>
              <Switch
                value={theme.name === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.surfaceVariant, true: colors.primary }}
                thumbColor={theme.name === 'dark' ? colors.onPrimary : colors.onSurfaceVariant}
              />
            </View>

          </View>

          {userData?.role === 'admin' && (<CourseCRUD isVisible={isCourseSheetVisible} onClose={() => setIsCourseSheetVisible(false)} />)}
          {userData?.role === 'parent' && (<UserProfileManager isVisible={isProfileEdit} onClose={() => setIsProfileEdit(false)} />)}

        </>


      ) : (
        <>
          <Text style={[styles.message, { color: colors.onBackground }]}>You are not logged in. Please log in to view your profile.</Text>
          <Button
            mode="contained"
            onPress={() => onLogin()}
            style={{ borderRadius: 5 }}
            icon="login"
          >
            Log In
          </Button>

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
    fontSize: 16,
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
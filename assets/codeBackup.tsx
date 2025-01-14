import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  StatusBar,
  Pressable,
} from 'react-native';
import {
  Card,
  Text,
  Avatar,
  Divider,
  useTheme,
  IconButton,
  Button,
} from 'react-native-paper';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'expo-router';
import { CustomNotification } from '@/components/types';

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userData, notifications, setNotifications } = useUser();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userData) {
        try {
          const notificationsDocRef = getNotificationsDocRef(userData);
          const notificationsSnap = await getDoc(notificationsDocRef);

          if (notificationsSnap.exists()) {
            const data = notificationsSnap.data();
            const currentTimestamp = new Date().getTime();
            const oneMonthAgo = currentTimestamp - 30 * 24 * 60 * 60 * 1000; // Timestamp for one month ago

            // Filter out notifications older than one month
            const filteredNotifications = (data.notifications || []).filter(
              (notification: CustomNotification) => {
                const notificationTimestamp = new Date(notification.timestamp).getTime();
                return notificationTimestamp >= oneMonthAgo;
              }
            );

            // Sort notifications by timestamp (most recent first)
            const sortedNotifications = filteredNotifications.sort(
              (a: CustomNotification, b: CustomNotification) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );

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
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); // No user data, stop loading
      }
    };

    fetchNotifications();
  }, [userData]);

  const toggleNotificationReadStatus = async (notificationId: number) => {
    try {
      const notificationsDocRef = getNotificationsDocRef(userData);
      const notificationsSnap = await getDoc(notificationsDocRef);
  
      if (notificationsSnap.exists()) {
        const data = notificationsSnap.data();
        const updatedNotifications = data.notifications.map((notification: CustomNotification) => {
          if (notification.id === notificationId) {
            return { ...notification, read: !notification.read }; // Toggle read status
          }
          return notification;
        });
  
        await updateDoc(notificationsDocRef, { notifications: updatedNotifications });
  
        // Update local state
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Error toggling notification read status:', error);
    }
  };
  

  const markAllNotificationsAsRead = async () => {
    try {
      const notificationsDocRef = getNotificationsDocRef(userData);
      const notificationsSnap = await getDoc(notificationsDocRef);

      if (notificationsSnap.exists()) {
        const data = notificationsSnap.data();
        const updatedNotifications = data.notifications.map((notification: CustomNotification) => ({
          ...notification,
          read: true,
        }));

        await updateDoc(notificationsDocRef, { notifications: updatedNotifications });

        // Update local state to reflect changes
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDismiss = async (notificationId: number) => {
    try {
      const notificationsDocRef = getNotificationsDocRef(userData);
      const notificationsSnap = await getDoc(notificationsDocRef);

      if (notificationsSnap.exists()) {
        const data = notificationsSnap.data();
        const updatedNotifications = data.notifications.filter(
          (notification: CustomNotification) => notification.id !== notificationId
        );

        await updateDoc(notificationsDocRef, { notifications: updatedNotifications });

        // Update local state to reflect changes
        setNotifications(updatedNotifications);
      }
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  if (!userData) {
    return (
      <View style={[styles.loginPromptContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loginPromptText, { color: theme.colors.onBackground }]}>
          You must log in to view notifications.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.loginButton}
          icon="account"
        >
          Go to Login
        </Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}
     // onScrollEndDrag={() => markAllNotificationsAsRead()} // Mark all notifications as read on scroll end
    >
      {notifications.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
          No notifications to display.
        </Text>
      ) : (
        notifications.map((notification: CustomNotification) => (
          <React.Fragment key={`${notification.id}-${theme.dark}`}>
            <Card
              style={[
                styles.card,
                {
                  backgroundColor: notification.read
                    ? theme.colors.surfaceVariant
                    : theme.colors.surface,
                },
              ]}
            >
              <Pressable onPress={() => toggleNotificationReadStatus(notification.id)}>
              <Card.Title
                title={notification.title}
                subtitle={notification.subtitle}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon={notification.avatar || 'bell'}
                    style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                  />
                )}
                right={() => (
                  <>
                    <IconButton
                      icon={notification.read ? 'eye-off-outline' : 'eye-outline'} // Toggle icon based on read status
                      size={24}
                      onPress={() => toggleNotificationReadStatus(notification.id)} // Call toggle function
                      style={styles.toggleReadButton}
                      iconColor={theme.colors.primary}
                    />
                    <IconButton
                      icon="trash-can-outline"
                      size={24}
                      onPress={() => handleDismiss(notification.id)}
                      style={styles.dismissButton}
                      iconColor={theme.colors.primary}
                    />
                  </>
                )}
              />
              <Card.Content>
                <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
                  {notification.description}
                </Text>
                <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
                  {new Date(notification.timestamp).toLocaleString() || 'Unknown'}
                </Text>
              </Card.Content>
              </Pressable>
            </Card>
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
          </React.Fragment>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexGrow: 1,
  },
  card: {
    marginVertical: 5,
    borderRadius: 10,
    elevation: 5,
  },
  avatar: {
    marginRight: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 5,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
    paddingBottom: 6
  },
  divider: {
    marginVertical: 10,
    height: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginPromptText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginButton: {
    borderRadius: 5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  toggleReadButton: {
    borderRadius: 50,
    padding: 5,
  },
  dismissButton: {
    borderRadius: 50,
    padding: 5,
  },
});

import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
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
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchNotifications = async () => {
    if (userData) {
      try {
        setRefreshing(true);
        console.log('reading notifications')
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
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    } else {
      setLoading(false); // No user data, stop loading
      
    }
  };

  // useEffect(() => {
  //   fetchNotifications();
  // }, [userData]);

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications();
    }, [])
  );

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

  const renderNotification = ({ item }: { item: CustomNotification | undefined }) => {
    if (!item) {
      return null; 
    }
    return (
      <Card
        style={[
          styles.card,
          {
            backgroundColor: item.read
              ? theme.colors.surfaceVariant
              : theme.colors.surface,
          },
        ]}
      >
        <Pressable onPress={() => toggleNotificationReadStatus(item.id)}>
          <Card.Title
            title={item.title}
            subtitle={item.subtitle}
            left={(props) => (
              <Avatar.Icon
                {...props}
                icon={item.avatar || 'bell'}
                style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
              />
            )}
            right={() => (
              <>
                <IconButton
                  icon={item.read ? 'eye-off-outline' : 'eye-outline'} 
                  size={24}
                  onPress={() => toggleNotificationReadStatus(item.id)} 
                  style={styles.toggleReadButton}
                  iconColor={theme.colors.primary}
                />
                <IconButton
                  icon="trash-can-outline"
                  size={24}
                  onPress={() => handleDismiss(item.id)}
                  style={styles.dismissButton}
                  iconColor={theme.colors.primary}
                />
              </>
            )}
          />
          <Card.Content>
            <Text style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
              {item.description}
            </Text>
            <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
              {new Date(item.timestamp).toLocaleString() || 'Unknown'}
            </Text>
          </Card.Content>
        </Pressable>
      </Card>
    )
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
    data={[...notifications].reverse()}
      renderItem={renderNotification}
      keyExtractor={(item) => item.id.toString()}
      // onRefresh={fetchNotifications}
      refreshing={refreshing}
      contentContainerStyle={styles.container}
      ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>No notifications to display.</Text>}
    />
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

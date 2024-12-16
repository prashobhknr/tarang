import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { Card, Text, Avatar, Divider, useTheme, IconButton, Button } from 'react-native-paper';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'expo-router';
import { CustomNotification } from '@/components/types';

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { userData } = useUser();
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (userData) {
        try {
          let notificationsDocRef;

          // For admin users, fetch notifications from 'admin' document
          if (userData.role !== 'admin') {
            notificationsDocRef = doc(db, 'notifications', 'admin');
          }
          // For regular users, fetch notifications from their specific email ID document
          else {
            notificationsDocRef = doc(db, 'notifications', userData.emailId);
          }

          const notificationsSnap = await getDoc(notificationsDocRef);

          if (notificationsSnap.exists()) {
            const data = notificationsSnap.data();
            console.log('notifications', data);
            setNotifications(data.notifications || []);
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
  }, []);

  const handleDismiss = async (notificationId: number) => {
    try {
      const notificationsDocRef = doc(db, 'notifications', 'admin');
      const notificationsSnap = await getDoc(notificationsDocRef);

      if (notificationsSnap.exists()) {
        const data = notificationsSnap.data();
        const updatedNotifications = data.notifications.filter((notification: CustomNotification) => notification.id !== notificationId);

        await updateDoc(notificationsDocRef, {
          notifications: updatedNotifications,
        });

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
    <ScrollView contentContainerStyle={[styles.container, {
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
      backgroundColor: theme.colors.background,
    }]}>
      {notifications.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
          No notifications to display.
        </Text>
      ) : (
        notifications.map((notification: CustomNotification) => (
          <React.Fragment key={notification.id}>
            <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Title
                title={notification.title}
                subtitle={notification.subtitle}
                left={(props) => (
                  <Avatar.Icon
                    {...props}
                    icon={notification.avatar || 'bell'} // Default to 'bell' if no avatar provided
                    style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                  />
                )}
                right={() => (
                  <IconButton
                    icon="trash-can-outline" // Trash icon to delete the notification
                    size={24}
                    onPress={() => handleDismiss(notification.id)}
                    style={styles.dismissButton}
                  />
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
    elevation: 5, // Increased elevation for a more professional card
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
    color: '#6e6e6e',
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
  dismissButton: {
    borderRadius: 50, // Circular button for a cleaner look
    padding: 5,
  },
});

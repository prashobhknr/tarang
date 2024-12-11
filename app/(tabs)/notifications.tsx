import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, Avatar, Divider, useTheme } from 'react-native-paper';

export default function NotificationsScreen() {
  const theme = useTheme();

  const notifications = [
    {
      id: 1,
      title: 'New Payment Received',
      description: 'You received $50 from John Doe.',
      timestamp: '10 mins ago',
      avatar: 'cash',
    },
    {
      id: 2,
      title: 'Reminder',
      description: 'Your subscription expires in 3 days.',
      timestamp: '2 hours ago',
      avatar: 'calendar',
    },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      {notifications.map((notification) => (
        <React.Fragment key={notification.id}>
          <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Card.Title
              title={notification.title}
              subtitle={notification.description}
              left={(props) => (
                <Avatar.Icon
                  {...props}
                  icon={notification.avatar}
                  style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
                />
              )}
            />
            <Card.Content>
              <Text style={[styles.timestamp, { color: theme.colors.onSurfaceVariant }]}>
                {notification.timestamp}
              </Text>
            </Card.Content>
          </Card>
          <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
        </React.Fragment>
      ))}
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
    elevation: 2,
  },
  avatar: {
    marginRight: 10,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
  },
  divider: {
    marginVertical: 10,
    height: 1,
  },
});

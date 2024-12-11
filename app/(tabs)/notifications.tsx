import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text, Avatar, Divider } from 'react-native-paper';

export default function NotificationsScreen() {
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
    <ScrollView contentContainerStyle={styles.container}>
      {notifications.map((notification) => (
        <React.Fragment key={notification.id}>
          <Card style={styles.card}>
            <Card.Title
              title={notification.title}
              subtitle={notification.description}
              left={(props) => (
                <Avatar.Icon
                  {...props}
                  icon={notification.avatar}
                  style={styles.avatar}
                />
              )}
            />
            <Card.Content>
              <Text style={styles.timestamp}>{notification.timestamp}</Text>
            </Card.Content>
          </Card>
          <Divider style={styles.divider} />
        </React.Fragment>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    marginTop: '15%',
  },
  card: {
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  avatar: {
    backgroundColor: '#5AC9FA',
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  divider: {
    marginVertical: 5,
  },
});

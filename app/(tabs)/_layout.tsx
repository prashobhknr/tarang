import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme, Badge } from 'react-native-paper';
import { View, StyleSheet , Platform} from 'react-native';
import { useUser } from '@/context/UserContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { notifications, userData} = useUser();

  const unreadCount = notifications.filter((notification) => !notification.read).length;


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.secondary,
        tabBarStyle: Platform.OS === 'ios'? { backgroundColor: colors.surface, position: 'absolute', bottom: -30 }:
        { backgroundColor: colors.surface },
        tabBarLabelStyle: {
          fontWeight: "bold",
          },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home-sharp' : 'home-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
          name="students"
          options={{
            href: userData?.role === 'admin' ? undefined : null,
            title: 'Students',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'school' : 'school-outline'}
                color={color}
                size={24}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="payment"
          options={{
            href: userData?.role === 'admin' ? null : undefined,
            title: 'Payment',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'card' : 'card-outline'}
                color={color}
                size={24}
              />
            ),
          }}
        />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerShown: false,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWithBadge}>
              <Ionicons
                name={focused ? 'notifications' : 'notifications-outline'}
                color={color}
                size={24}
              />
              {/* {notifications.length > 0 && (
                <Badge style={styles.badge}>{notifications.length}</Badge>
              )} */}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWithBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: 'red',
    color: 'white',
    fontSize: 10,
  },
});

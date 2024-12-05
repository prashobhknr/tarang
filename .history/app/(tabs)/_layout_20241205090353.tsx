import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ffd33d', // Highlighted tab color
        tabBarInactiveTintColor: '#a1a1a1', // Non-selected tab color
        tabBarShowLabel: true, // Show tab labels
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#25292e', // Dark background for the tab bar
          borderTopWidth: 0, // Remove the border for a clean look
          elevation: 5, // Add subtle shadow (Android)
          shadowColor: '#000', // Shadow color for iOS
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
          color: '#ffd33d',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff', // Color for back button and title
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tarang School',
          headerShown: true,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home-sharp' : 'home-outline'}
              color={color}
              size={28} // Slightly larger icons for better visibility
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About Us',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'information-circle' : 'information-circle-outline'}
              color={color}
              size={28} // Slightly larger icons for better visibility
            />
          ),
        }}
      />
    </Tabs>
  );
}

import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from 'react-native-paper';



export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
    screenOptions={{
      tabBarActiveTintColor: colors.primary,
      headerStyle: { backgroundColor: colors.surface },
      headerShadowVisible: false,
      headerTintColor: colors.secondary,
      tabBarStyle: { backgroundColor: colors.surface },
    }}
    >
      <Tabs.Screen
        name="index"
        
        options={{
            title: 'Home',
             headerShown: false ,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
       <Tabs.Screen
        name="payment"
        options={{
          title: 'Payment',
            headerShown: false ,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
            headerShown: false ,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={24}/>
          ),
        }}
      />
    </Tabs>
  );
}
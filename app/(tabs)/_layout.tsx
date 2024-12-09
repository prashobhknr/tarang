import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import PaymentScreen from './payment';



export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
        backgroundColor: '#25292e',
        },
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
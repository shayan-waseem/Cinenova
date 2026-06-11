import React from 'react';
import { Platform, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Colors from './src/theme/colors';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/BookingScreen';
import FoodOrderScreen from './src/screens/FoodOrderScreen';
import SupportScreen from './src/screens/SupportScreen';
import WalletScreen from './src/screens/WalletScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Theme to match Cinema dark-mode styling
const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.bg,
    card: Colors.bgCard,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.secondary,
  },
};

// Bottom Tab Navigator for Main Application Screens
function MainTabs({ route }) {
  const { userName, userTier } = route.params || {};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let emoji = '🎬';
          if (route.name === 'Home') emoji = '🎬';
          else if (route.name === 'FoodOrder') emoji = '🍿';
          else if (route.name === 'Support') emoji = '🎧';
          else if (route.name === 'Wallet') emoji = '💼';

          return (
            <Text
              style={{
                fontSize: focused ? 22 : 18,
                opacity: focused ? 1 : 0.6,
                color: focused ? Colors.secondary : Colors.textMuted,
              }}
            >
              {emoji}
            </Text>
          );
        },
        tabBarActiveTintColor: Colors.secondary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.bgCard,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ userName, userTier }}
        options={{ title: 'Movies' }}
      />
      <Tab.Screen
        name="FoodOrder"
        component={FoodOrderScreen}
        initialParams={{ userName, userTier }}
        options={{ title: 'Snacks' }}
      />
      <Tab.Screen
        name="Support"
        component={SupportScreen}
        initialParams={{ userName, userTier }}
        options={{ title: 'Support' }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        initialParams={{ userName, userTier }}
        options={{ title: 'Wallet' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={CustomDarkTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.bg },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Booking" component={BookingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

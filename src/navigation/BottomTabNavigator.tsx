// src/navigation/BottomTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../views/Home/Home';
import CustomeTabBar from '../components/CustomeTabBar/CustomeTabBar';
import SettingsScreen from '../views/Setting/SettingsScreen';
import ProfileScreen from '../views/ProfileScreen';
import NotificationScreen from '../views/Notifications/NotificationScreen';
import MainNavigation from '../Cashfree/components/MainNavigation';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomeTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* <Tab.Screen name="Analytics" component={MainNavigation} /> */}
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
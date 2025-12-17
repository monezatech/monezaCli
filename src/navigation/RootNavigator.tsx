import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../views/Auth/LoginScreen';
import SignupScreen from '../views/Auth/SignupScreen';
import TermsAndConditionsScreen from '../views/TermsAndCondition';
import SettingsScreen from '../views/Setting/SettingsScreen';
import DrawerNavigator from './DrawerNavigator';
import CategoryCoursesScreen from '../views/CategoryCoursesScreen'; // Assuming this path
import NotificationScreen from '../views/Notifications/NotificationScreen';
import ResetPassword from '../views/Auth/ResetPasswordScreen';
import PaymentsScreen from '../views/Payments/Payments';
import BuyNowScreen from '../views/Payments/BuyNowScreen';
import CourseDetailsScreen from '../views/Course/CourseDetailsScreen';
import EditUserScreen from '../views/User/EditUser';
import MainNavigation from '../Cashfree/components/MainNavigation';
import BundleDetailScreen from '../views/BundleDetailScreen';
import WalletScreen from '../views/WalletScreen';

export type RootStackParamList = {
  DrawerNavigator: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  TermsAndConditionsScreen: undefined;
  SettingsScreen: undefined;
  CategoryCoursesScreen: { categoryId: string; categoryName: string };
  NotificationScreen: undefined;
  ResetPassword: undefined;
  PaymentsScreen: undefined;
  BuyNowScreen: undefined;
  CourseDetailsScreen: undefined;
  EditUserScreen: undefined;
  MainNavigation : undefined;
  BundleDetailScreen: { bundle: any };
  WalletScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  initialRouteName: keyof RootStackParamList;
  toggleTheme: () => void; // Assuming toggleTheme is also passed down
}

export default function RootNavigator({ initialRouteName, toggleTheme }: RootNavigatorProps) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      {/* Replace BottomTabNavigator with DrawerNavigator */}
      <Stack.Screen name="DrawerNavigator">
        {props => <DrawerNavigator {...props} toggleTheme={toggleTheme} />}
      </Stack.Screen>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen name="SettingsScreen">
        {props => <SettingsScreen {...props} toggleTheme={toggleTheme} />}
      </Stack.Screen>

      <Stack.Screen
        name="TermsAndConditionsScreen"
        component={TermsAndConditionsScreen}
      />
      <Stack.Screen
        name="CategoryCoursesScreen"
        component={CategoryCoursesScreen}
      />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="PaymentsScreen" component={PaymentsScreen} />
      <Stack.Screen name="BuyNowScreen" component={BuyNowScreen} />
      <Stack.Screen
        name="CourseDetailsScreen"
        component={CourseDetailsScreen}
      />
      <Stack.Screen name="EditUserScreen" component={EditUserScreen} />
      <Stack.Screen name="MainNavigation" component={MainNavigation} />
      <Stack.Screen name="BundleDetailScreen" component={BundleDetailScreen} />
      <Stack.Screen name="WalletScreen" component={WalletScreen} />
    </Stack.Navigator>
  );
}

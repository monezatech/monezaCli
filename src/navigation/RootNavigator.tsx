import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../views/Auth/LoginScreen';
import SignupScreen from '../views/Auth/SignupScreen';
import TermsAndConditionsScreen from '../views/TermsAndCondition';

export type RootStackParamList = {
  BottomTabNavigator: undefined;
  LoginScreen: undefined;
  SignupScreen: undefined;
  TermsAndConditionsScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="BottomTabNavigator" component={BottomTabNavigator} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen
        name="TermsAndConditionsScreen"
        component={TermsAndConditionsScreen}
      />
    </Stack.Navigator>
  );
}

import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabNavigator from './BottomTabNavigator';
import CustomDrawer from '../components/CustomDrawer';
// import i18n from '../i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  const language = useSelector((state: RootState) => state.settings.language);

  useEffect(() => {
    // i18n.changeLanguage(language);
  }, [language]);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 320,
        },
      }}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={BottomTabNavigator}
        options={{
          title: 'Home',
          headerShown: false,
          drawerIcon: () => null, // Hide default icon since we use custom drawer
        }}
      />
    </Drawer.Navigator>
  );
}

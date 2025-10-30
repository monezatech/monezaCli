import React, {useEffect} from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import BottomTabNavigator from './BottomTabNavigator';
import SettingsScreen from '../views/Setting/SettingsScreen';
import i18n from '../i18n/i18n';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator({
  toggleTheme,
}: {
  toggleTheme: () => void;
}) {
  const language = useSelector((state: RootState) => state.settings.language);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);
  return (
    <Drawer.Navigator>
      <Drawer.Screen
        name="HomeTabs"
        component={BottomTabNavigator}
        options={{title: 'Home'}}
      />
      <Drawer.Screen
        name="Settings"
        options={{ headerShown: false }}>
        {() => <SettingsScreen toggleTheme={toggleTheme} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

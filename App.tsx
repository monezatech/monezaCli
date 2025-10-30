// App.tsx
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { LightAppTheme, DarkAppTheme } from './src/theme/themes';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './src/store';
export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <Provider store={store}>
      <NavigationContainer theme={isDarkMode ? DarkAppTheme : LightAppTheme}>
        <RootNavigator toggleTheme={() => setIsDarkMode(!isDarkMode)} />
      </NavigationContainer>
    </Provider>
  );
}

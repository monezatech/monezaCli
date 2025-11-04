// App.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator, { RootStackParamList } from './src/navigation/RootNavigator';
import { LightAppTheme, DarkAppTheme } from './src/theme/themes';
import { Provider, useDispatch } from 'react-redux'; // Removed useSelector, RootState
import { store } from './src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken } from './src/store/auth/authSlice';
import { setUser } from './src/store/auth/userSlice';
import { ActivityIndicator, View } from 'react-native'; // Added ActivityIndicator, View for loading state

function AppContent() {
  const dispatch = useDispatch();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [initialRoute, setInitialRoute] = useState<'LoginScreen' | 'DrawerNavigator' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          // Optionally, fetch user data if needed, or assume it's in the token
          // For now, just set the token and navigate
          dispatch(setToken(storedToken));
          // If user data is also stored in AsyncStorage, retrieve and dispatch it
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            dispatch(setUser(JSON.parse(storedUser)));
          }
          setInitialRoute('DrawerNavigator'); // Change to DrawerNavigator
        } else {
          setInitialRoute('LoginScreen');
        }
      } catch (error) {
        console.error('Failed to load token from AsyncStorage', error);
        setInitialRoute('LoginScreen');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={isDarkMode ? DarkAppTheme : LightAppTheme}>
      <RootNavigator initialRouteName={initialRoute as keyof RootStackParamList} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

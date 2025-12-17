// App.tsx
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator, { RootStackParamList } from './src/navigation/RootNavigator';
import { LightAppTheme, DarkAppTheme } from './src/theme/themes';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, logout } from './src/store/auth/authSlice'; // Import logout
import { setUser } from './src/store/auth/userSlice';
import { ActivityIndicator, View } from 'react-native';
import axios from 'axios'; // Import axios
import { navigationRef, navigate } from './src/navigation/navigationRef'; // Import navigationRef and navigate

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
          dispatch(setToken(storedToken));
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            dispatch(setUser(JSON.parse(storedUser)));
          }
          setInitialRoute('DrawerNavigator');
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

    // Axios Interceptor for 401 Unauthorized (currently commented out)
    // const interceptor = axios.interceptors.response.use(
    //   (response) => response,
    //   async (error) => {
    //     // Check if this specific 401 error should be ignored by the global logout
    //     // The flag is now set on error.config
    //     if (error.response && error.response.status === 401 && error.config && !error.config._ignoreAuthError) {
    //       console.log('401 Unauthorized - Token expired or invalid, triggering global logout');
    //       dispatch(logout());
    //       await AsyncStorage.removeItem('token');
    //       await AsyncStorage.removeItem('user');
    //       if (navigationRef.isReady()) {
    //         navigate('LoginScreen');
    //       }
    //     }
    //     return Promise.reject(error);
    //   },
    // );

    return () => {
      // Only eject if interceptor was created
      // if (interceptor) {
      //   axios.interceptors.response.eject(interceptor);
      // }
    };
  }, [dispatch]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={isDarkMode ? DarkAppTheme : LightAppTheme}>
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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { setToken, setIsAuthenticated, logout } from '../store/auth/authSlice'; // adjust the path as needed

/**
 * Checks if token exists and redirects accordingly
 */
export const checkAuthToken = async (dispatch: any, navigation: any) => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      dispatch(setToken(token));
      dispatch(setIsAuthenticated(true));

      // Navigate to tab/home screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'DrawerNavigator' }], // Changed to DrawerNavigator
        }),
      );
    } else {
      dispatch(setToken(null));
      dispatch(setIsAuthenticated(false));

      // Navigate to login screen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }], // Changed to LoginScreen
        }),
      );
    }
  } catch (error) {
    console.error('Token check failed:', error);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }], // Changed to LoginScreen
      }),
    );
  }
};

/**
 * Clears user token and logs out
 */
export const handleLogout = async (dispatch: any, navigation: any) => {
  try {
    await AsyncStorage.removeItem('token');
    dispatch(logout());

    // Navigate to login screen after logout
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }], // Changed to LoginScreen
      }),
    );
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

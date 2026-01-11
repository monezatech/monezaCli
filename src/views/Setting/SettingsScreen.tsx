import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store/index';
import { apiService } from '../../services/service';
import { handleLogout } from '../../utils/checkUserAuth';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.userState.user);
  const dispatch = useDispatch();

  console.log('user', user);

  // Handle account deletion
  const deleteAccount = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication token not found. Please log in again.');
      return;
    }
    if (!user || !user._id) {
      Alert.alert('Error', 'User information not found. Cannot delete account.');
      return;
    }

    try {
      const userId = user._id; // user is guaranteed to exist here
      await apiService.deleteAccountById({ token, userId });

      await handleLogout(dispatch, navigation); // Pass navigation to handleLogout
      await AsyncStorage.clear();
      navigation.navigate('LoginScreen' as never); // Changed to LoginScreen as per RootNavigator
    } catch (error) {
      console.log('Delete account error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: deleteAccount },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.header}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('EditUserScreen' as never)}
          >
            <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => navigation.navigate('ChangePassword' as never)}
          >
            <Ionicons name="lock-closed-outline" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity style={styles.option}>
            <Ionicons name="notifications-outline" size={24} color="#007AFF" />
            <Text style={styles.optionText}>Notifications</Text>
          </TouchableOpacity>

          {/* Dark Mode (optional toggle) */}
          {/* <TouchableOpacity
            style={styles.option}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Ionicons name="moon-outline" size={24} color="#007AFF" />
            <Text style={styles.optionText}>
              {isDarkMode ? "Disable Dark Mode" : "Enable Dark Mode"}
            </Text>
          </TouchableOpacity> */}

          {/* Language Picker (optional) */}
          {/* <View style={styles.option}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="language-outline" size={24} color="#007AFF" />
              <Text style={styles.optionText}>Language</Text>
            </View>
            <Picker
              selectedValue={language}
              style={{ width: "100%", color: "#333" }}
              onValueChange={(itemValue) => setLanguage(itemValue)}
              dropdownIconColor="#007AFF"
            >
              <Picker.Item label="English" value="en" />
              <Picker.Item label="हिन्दी (Hindi)" value="hi" />
              <Picker.Item label="Español (Spanish)" value="es" />
            </Picker>
          </View> */}
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  scroll: { padding: 20 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 10,
    color: '#333',
  },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#555',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    minHeight: 55,
  },
  optionText: { marginLeft: 12, fontSize: 15, color: '#333' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  deleteText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
});

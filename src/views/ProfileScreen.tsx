import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useSelector, TypedUseSelectorHook, useDispatch } from 'react-redux';
import { RootState } from '../store/index';
import { apiService } from '../services/service';
import { handleLogout } from '../utils/checkUserAuth';
import shape from '../assets/images/Group 38.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from 'navigation/RootNavigator';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
const ProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const dispatch = useDispatch();

  const getLoggedUser = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log("token-=-=-=-", token);
    try {
      setLoading(true);
      const res = await apiService.getLoggedUser({ token });
      setUser(res.user);
      console.log('Logged User Details: ', res);
    } catch (error) {
      console.log('Logged user details not fetched ..', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLoggedUser();
  }, []);

  // Image picker functions
  const selectImageSource = () => {
    Alert.alert(
      'Select Image Source',
      'Choose where to get the image from',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
    };

    launchCamera(options, handleImageResponse);
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      includeBase64: false,
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const handleImageResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorMessage) {
      Alert.alert('Error', response.errorMessage);
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      await uploadProfilePhoto(asset.uri!, asset.type || 'image/jpeg');
    }
  };

  const uploadProfilePhoto = async (imageUri: string, imageType: string) => {
    try {
      setUploadingPhoto(true);
      const token = await AsyncStorage.getItem('token');

      const response = await apiService.uploadProfilePhoto({
        token,
        imageUri,
        imageType,
      });

      if (response.status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Profile Photo Updated',
          text2: 'Your profile photo has been uploaded successfully',
        });

        // Update local user state
        setUser({ ...user, avatar: response.avatar });

        // Refresh user data
        await getLoggedUser();
      } else {
        Alert.alert('Error', response.message || 'Failed to upload photo');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error.message || 'Something went wrong while uploading'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Shape */}
      <Image source={shape} style={styles.topShape} />

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditUserScreen')}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={26}
            color="#4F46E5"
          />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                user?.avatar ||
                'https://randomuser.me/api/portraits/men/42.jpg',
            }}
            style={styles.avatar}
          />
          {uploadingPhoto ? (
            <View style={styles.editAvatar}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editAvatar}
              onPress={selectImageSource}
            >
              <MaterialCommunityIcons
                name="camera-outline"
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.username}>{user?.name}</Text>
          <Text style={styles.onlineText}>online</Text>
        </View>
      </View>

      {/* User Details */}
      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color="#4F46E5"
          />
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user?.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="email-outline"
            size={20}
            color="#4F46E5"
          />
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={20}
            color="#4F46E5"
          />
          <Text style={styles.label}>Phone</Text>
          <Text style={styles.value}>+91 {user?.phone}</Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={20}
            color="#4F46E5"
          />
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>
            {moment(user?.dob).format('DD-MM-YYYY')}
          </Text>
        </View>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => handleLogout(dispatch, navigation)}
      >
        <MaterialCommunityIcons name="logout" size={20} color="#4F46E5" />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  topShape: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    opacity: 0.2,
  },
  headerRow: {
    marginTop: 50,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  editAvatar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    borderRadius: 15,
    padding: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4F46E5',
  },
  onlineText: {
    fontSize: 14,
    color: 'green',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#555',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    margin: 30,
    alignSelf: 'center',
  },
  logoutText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

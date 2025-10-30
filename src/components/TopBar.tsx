import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TopBar = ({ image = true }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Menu Button */}
      <TouchableOpacity
        onPress={() => navigation.openDrawer()}
        style={styles.menuButton}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="menu" size={34} color="#ffffff" />
      </TouchableOpacity>

      {/* Profile Image */}
      {image && (
        <Image
          source={require('../assets/images/user.jpg')}
          style={styles.profilePicture}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    backgroundColor: '#1E1E1E', // you can adjust this as per theme
  },
  menuButton: {
    padding: 5,
  },
  profilePicture: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fff',
  },
});

export default TopBar;

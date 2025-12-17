import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TopBar = () => {
  const navigation = useNavigation() as any;

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

      {/* Wallet Icon */}
      <TouchableOpacity
        onPress={() => navigation.navigate('WalletScreen')}
        style={styles.walletButton}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="wallet" size={34} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#4960F9', // you can adjust this as per theme
  },
  menuButton: {
    padding: 5,
  },
  walletButton: {
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

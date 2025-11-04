// screens/NotificationScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const notifications = [
  {
    id: '1',
    name: 'Darrell Steward',
    message: 'Darrel just sent you $33',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '2',
    name: 'Jacob Jones',
    message: 'Jacob sent you $65',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '3',
    name: 'Kristin Watson',
    message: 'Kristin sent you $454',
    image: 'https://randomuser.me/api/portraits/women/58.jpg',
  },
  {
    id: '4',
    name: 'Wade Warren',
    message: 'Wade sent you $8',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
  },
  {
    id: '5',
    name: 'Cameron Williamson',
    message: 'Message',
    image: 'https://randomuser.me/api/portraits/men/55.jpg',
  },
  {
    id: '6',
    name: 'Devon Lane',
    message: 'Message',
    image: 'https://randomuser.me/api/portraits/men/20.jpg',
  },
  {
    id: '7',
    name: 'Theresa Webb',
    message: 'Message',
    image: 'https://randomuser.me/api/portraits/women/60.jpg',
  },
  {
    id: '8',
    name: 'Dianne Russell',
    message: 'Message',
    image: 'https://randomuser.me/api/portraits/women/70.jpg',
  },
];

const NotificationScreen = () => {
  const [search, setSearch] = useState('');

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.item}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View style={styles.onlineDot} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message}>{item.message}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#4F46E5" />
    </TouchableOpacity>
  );

  const filteredNotifications = notifications.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={22}
          color="#4F46E5"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search"
          placeholderTextColor="#4F46E5"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Header Text */}
      <Text style={styles.headerText}>Notifications</Text>

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#4F46E5',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 10,
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: 'green',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#4F46E5',
  },
});

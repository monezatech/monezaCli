import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';


import { StackNavigationProp } from '@react-navigation/stack';

type HomeStackParamList = {
  Home: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen = ({navigation}: HomeScreenProps) => {
  return (
    <View style={styles.container}>
      <Text>HOME</Text>
      <ScrollView contentContainerStyle={styles.content}></ScrollView>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#000',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
});

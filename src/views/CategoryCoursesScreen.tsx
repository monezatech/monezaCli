import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

interface CategoryCoursesScreenRouteParams {
  categoryId: string;
  categoryName: string;
}

const CategoryCoursesScreen = () => {
  const route = useRoute();
  const { categoryId, categoryName } = route.params as CategoryCoursesScreenRouteParams;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category Courses</Text>
      <Text>Category ID: {categoryId}</Text>
      <Text>Category Name: {categoryName}</Text>
      {/* Add your course listing UI here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default CategoryCoursesScreen;

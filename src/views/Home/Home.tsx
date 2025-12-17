import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import NavigationProp
import { useDispatch } from 'react-redux';
import { useCallback } from 'react'; // Import useCallback
import { RootStackParamList } from '../../navigation/RootNavigator'; // Import RootStackParamList

// ✅ Update these imports to relative paths (no @ alias)
import { apiService } from '../../services/service';
import TopBar from '../../components/TopBar';
import CourseInfoCard from '../../components/Cards/CourseCard';
import { setUser } from '../../store/auth/userSlice';
import BundleCard from '../../components/Cards/BudleCard';

// Define types for better type checking
interface Category {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  type?: 'bundle' | string; // Assuming 'type' can be 'bundle' or other strings
  category?: Category;
  // Add other properties of a course if known, e.g., title, description, imageUrl
}

interface GroupedCourseData {
  categoryId: string;
  courses: Course[];
}

interface GroupedCategory {
  categoryName: string;
  categoryId: string;
  courses: Course[];
}

const HomeScreen = () => {
  const [user, setUserr] = useState<any>(null); // User type can be more specific if defined
  const [groupedCourses, setGroupedCourses] = useState<GroupedCategory[]>([]);
  const [bundleCourses, setBundleCourses] = useState<Course[]>([]); // Changed to array for multiple bundles
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Type the navigation hook
  const dispatch = useDispatch();



  const groupByCategory = useCallback(
    (courses: Course[]): GroupedCategory[] => {
      const grouped: { [key: string]: GroupedCourseData } = {};
      for (let i = 0; i < courses.length; i++) {
        const course = courses[i];
        const catName = course?.category?.name || 'Other';
        const catId = course?.category?._id || 'unknown';
        if (!grouped[catName]) {
          grouped[catName] = {
            categoryId: catId,
            courses: [],
          };
        }
        grouped[catName].courses.push(course);
      }

      return Object.entries(grouped).map(([categoryName, data]) => ({
        categoryName,
        ...data,
      }));
    },
    [],
  ); // No external dependencies

  const getCourses = useCallback(
    async (token: string | null) => {
      try {
        const res = await apiService.getCourses({ token });
        const grouped = groupByCategory(res.courses || []);
        setGroupedCourses(grouped);
      } catch (error) {
        console.log('Error fetching courses:', error);
      }
    },
    [groupByCategory],
  ); // Add dependencies for useCallback

  const getBundles = useCallback(
    async (token: string | null) => {
      try {
        const res = await apiService.getBundles({ token });
        console.log('Bundles API response:', res);
        setBundleCourses(res.bundles || []); // Set all bundles directly
        console.log('Bundle courses set:', res.bundles?.length || 0);
      } catch (error) {
        console.log('Error fetching bundles:', error);
      }
    },
    [],
  ); // Add dependencies for useCallback

  const getLoggedUser = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const res = await apiService.getLoggedUser({ token });
      setUserr(res.user);
      dispatch(setUser(res.user));
      setLoading(true);
      await Promise.all([getCourses(token), getBundles(token)]);
    } catch (error) {
      console.log('User fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, getCourses, getBundles]); // Added dispatch and getCourses to useCallback dependencies

  useEffect(() => {
    getLoggedUser();
  }, [getLoggedUser]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#4960F9' }}>
      <View style={styles.main}>
        <StatusBar barStyle="light-content" backgroundColor="#4960F9" />

        {/* Top Bar Section */}
        <View style={styles.topBar}>
          <TopBar />
        </View>

        {/* Courses Section */}
        <ScrollView contentContainerStyle={styles.scrollView}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size={60} color="#4960F9" />
            </View>
          ) : (
            <>
              <Text style={styles.headtext}>
                Bundles
              </Text>
              {bundleCourses.length > 0 && (
                <View style={styles.bundleCoursesListContainer}>
                  {' '}
                  {/* New style for the list of bundles */}
                  {bundleCourses.map((bundle, index) => (
                    <View
                      key={bundle._id || index}
                      style={styles.bundleCourseContainer}
                    >
                      <BundleCard bundle={bundle} />
                    </View>
                  ))}
                </View>
              )}

              {groupedCourses.length > 0
                ? groupedCourses.map((group, index) => (
                    <View key={index} style={styles.categorySection}>
                      <View style={styles.heading}>
                        <Text style={styles.headtext}>
                          {group.categoryName}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('CategoryCoursesScreen', {
                              categoryId: group.categoryId,
                              categoryName: group.categoryName,
                            })
                          }
                        >
                          <Text style={styles.seeMore}>See More</Text>
                        </TouchableOpacity>
                      </View>
                      <FlatList
                        horizontal
                        data={group.courses}
                        keyExtractor={item => item._id}
                        renderItem={({ item }) => (
                          <View style={styles.cardWrapper}>
                            <CourseInfoCard course={item} />
                          </View>
                        )}
                        showsHorizontalScrollIndicator={false}
                      />
                    </View>
                  ))
                : !bundleCourses.length && (
                    <Text style={styles.noCourses}>No Courses Found</Text>
                  )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    width: '100%',
    backgroundColor: '#4960F9',
    paddingBottom: 18,
  },
  scrollView: {
    padding: 10,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  headtext: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  seeMore: {
    fontSize: 14,
    color: '#4960F9',
    fontWeight: '500',
  },
  categorySection: {
    marginBottom: 10,
  },
  cardWrapper: {
    marginRight: 12,
  },
  loadingContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noCourses: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  bundleCoursesListContainer: {
    // Styles for the container holding multiple bundle cards
  },
  bundleCourseContainer: {
    marginBottom: 20,
    // Add styles for full-screen vertical scroll if needed,
    // but BundleCard itself should handle its content layout.
  },
});

export default HomeScreen;

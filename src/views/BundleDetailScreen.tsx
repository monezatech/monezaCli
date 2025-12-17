import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CourseInfoCard from '../components/Cards/CourseCard';
import { setId, setType } from '../store/auth/globalStateSlice';

const { width } = Dimensions.get('window');

const BundleDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { bundle } = route.params;
  const dispatch = useDispatch();

  const handleBuyBundle = (bundle: any) => {
    dispatch(setId(bundle._id));
    dispatch(setType('bundle'));
    navigation.navigate('BuyNowScreen' as never);
  };

  const handleCoursePress = (course: any) => {
    dispatch(setId(course._id));
    dispatch(setType('course'));
    navigation.navigate('CourseDetailsScreen' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bundle</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Bundle Header */}
        <View style={styles.bundleHeader}>
          <View style={styles.imageContainer}>
            <Image
              source={
                bundle?.thumbnailUrl?.trim()
                  ? { uri: bundle.thumbnailUrl }
                  : require('../assets/images/commoncourse.jpg')
              }
              style={styles.bundleImage}
            />
            <View style={styles.bundleBadge}>
              <Text style={styles.badgeText}>Bundle</Text>
            </View>
          </View>

          <View style={styles.bundleInfo}>
            <Text style={styles.bundleTitle}>{bundle?.title || 'Bundle'}</Text>
            <Text style={styles.bundleDescription}>
              {bundle?.description || 'No description available.'}
            </Text>

            <View style={styles.bundleStats}>
              <View style={styles.statItem}>
                <Ionicons name="book" size={16} color="#6b7280" />
                <Text style={styles.statText}>
                  {bundle?.courses?.length || 0} Courses
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={16} color="#6b7280" />
                <Text style={styles.statText}>Self-paced</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.bundlePrice}>
                {bundle?.price > 0 ? `₹ ${bundle.price.toFixed(2)}` : 'Free'}
              </Text>
            </View>
          </View>
        </View>

        {/* Buy Button */}
        {bundle?.price > 0 && (
          <View style={styles.buySection}>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => handleBuyBundle(bundle)}
              activeOpacity={0.8}
            >
              <Ionicons name="cart" size={20} color="#fff" />
              <Text style={styles.buyButtonText}>Buy Bundle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <Text style={styles.sectionTitle}>Courses Included</Text>

          {bundle?.courses?.length > 0 ? (
            <View style={styles.coursesList}>
              {bundle.courses.map((course: any, index: number) => (
                <TouchableOpacity
                  key={course._id || index}
                  onPress={() => handleCoursePress(course)}
                  style={styles.courseItem}
                  activeOpacity={0.7}
                >
                  <CourseInfoCard course={course} fullWidth={true} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No courses found in this bundle.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
  },
  bundleHeader: {
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bundleImage: {
    width: width * 0.6,
    height: width * 0.4,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  bundleBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bundleInfo: {
    alignItems: 'center',
  },
  bundleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  bundleDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  bundleStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: 6,
  },
  priceContainer: {
    alignItems: 'center',
  },
  bundlePrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6366f1',
  },
  buySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  coursesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },

  courseItem: {
    marginBottom: 12,
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default BundleDetailScreen;

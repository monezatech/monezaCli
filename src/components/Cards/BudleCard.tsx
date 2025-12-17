import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { setId } from '../../store/auth/globalStateSlice';
import LinearGradient from 'react-native-linear-gradient';

const BundleCard = ({ bundle }: { bundle: any }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handlePress = () => {
    dispatch(setId(bundle._id));
    navigation.navigate('BundleDetailScreen', { bundle }); // navigate to bundle detail screen
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={styles.cardWrapper}
    >
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']} // Purple to Indigo
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Top Section with Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              bundle?.thumbnailUrl?.trim()
                ? { uri: bundle.thumbnailUrl }
                : require('../../assets/images/commoncourse.jpg')
            }
            style={styles.image}
          />
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>
              {bundle?.courses?.length || 0} Courses
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {bundle?.title || 'Course Bundle'}
          </Text>

          <Text style={styles.subtitle} numberOfLines={2}>
            {bundle?.description ||
              'Learn multiple skills in one powerful package.'}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="clock-outline" size={18} color="#e0e7ff" />
              <Text style={styles.infoText}>
                {bundle?.duration || '10+ hrs'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Icon name="star" size={18} color="#fde047" />
              <Text style={styles.infoText}>
                {bundle?.rating?.toFixed(1) || '4.5'}
              </Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <Text style={styles.price}>
              {bundle?.price > 0 ? `₹ ${bundle.price.toFixed(2)}` : 'Free'}
            </Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>View Bundle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default BundleCard;
const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },

  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  overlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#e0e7ff',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#e0e7ff',
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  button: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

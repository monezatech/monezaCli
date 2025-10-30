import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setId } from '../store/auth/globalStateSlice';
import StarRating from './StarRating';

const CourseInfoCard = ({ course }) => {
  const [rating, setRating] = useState(course?.rating || 4);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const truncateText = (text, wordLimit = 10) => {
    const words = text?.split(' ');
    return words?.length > wordLimit
      ? words.slice(0, wordLimit).join(' ') + ' ...'
      : text;
  };

  const truncateHeadingText = (text, charLimit = 40) => {
    if (!text) return '';
    return text.length > charLimit ? text.slice(0, charLimit) + '...' : text;
  };

  const handlePress = () => {
    dispatch(setId(course._id));
    navigation.navigate('coursedetail');
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image
        source={
          course?.thumbnailUrl?.trim()
            ? { uri: course.thumbnailUrl }
            : require('../assets/images/commoncourse.jpg') // ✅ Updated path
        }
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {truncateHeadingText(course.title, 40)}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {truncateText(course?.description, 12)}
        </Text>

        {/* ⭐ Rating */}
        <StarRating rating={rating} onRatingChange={setRating} />

        {/* 💰 Price */}
        <Text style={styles.price}>
          {course.price > 0 ? `₹ ${course.price?.toFixed(2)}` : 'Free'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 170,
    marginHorizontal: 6,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  price: {
    marginTop: 6,
    fontSize: 15,
    fontWeight: '700',
    color: '#4f46e5',
  },
});

export default CourseInfoCard;

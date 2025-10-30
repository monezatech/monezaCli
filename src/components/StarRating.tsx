import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const StarRating = ({ rating = 0, onRatingChange }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => onRatingChange && onRatingChange(starValue)}
            activeOpacity={0.7}
          >
            <FontAwesome
              name={isFilled ? 'star' : 'star-o'}
              size={16}
              color={isFilled ? '#FFD700' : '#C0C0C0'}
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
      <Text style={styles.ratingText}>{rating} / 5</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  star: {
    marginRight: 4,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
});

export default StarRating;

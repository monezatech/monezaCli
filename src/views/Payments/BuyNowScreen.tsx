// src/screens/BuyNowScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // ✅ Use native icons
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { apiService } from '../../service/service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const BuyNowScreen = () => {
  const [referralCode, setReferralCode] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
  });
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const courseId = useSelector((state: RootState) => state.globalState.id);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      setLoading(true);
      const res = await apiService.getCourse({ token, courseId });
      setCourse(res.course);
      console.log('Course response:', res);
    } catch (error) {
      console.log('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    const { accountHolder, accountNumber, ifsc, bankName } = bankDetails;
    if (!accountHolder || !accountNumber || !ifsc || !bankName) {
      Alert.alert('⚠️ Missing Info', 'Please fill all bank details.');
      return;
    }

    Alert.alert(
      '✅ Success',
      `Course purchased successfully!\nReferral Code: ${
        referralCode.trim() || 'None'
      }`,
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Course...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.header}>Buy Now</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Course Thumbnail */}
        {course?.thumbnailUrl && (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: course.thumbnailUrl }}
              style={styles.thumbnail}
            />
          </View>
        )}

        {/* Course Info */}
        <View style={styles.card}>
          <Text style={styles.courseTitle}>{course?.title}</Text>
          <Text style={styles.courseDescription}>{course?.description}</Text>
          <Text style={styles.coursePrice}>₹ {course?.price}</Text>
        </View>

        {/* Referral Code */}
        <View style={styles.card}>
          <Text style={styles.heading}>Referral Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter referral code (optional)"
            value={referralCode}
            onChangeText={setReferralCode}
            autoCapitalize="characters"
          />
        </View>

        {/* Bank Details */}
        <View style={styles.card}>
          <Text style={styles.heading}>Bank Account Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Account Holder Name"
            value={bankDetails.accountHolder}
            onChangeText={text =>
              setBankDetails({ ...bankDetails, accountHolder: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Account Number"
            keyboardType="numeric"
            value={bankDetails.accountNumber}
            onChangeText={text =>
              setBankDetails({ ...bankDetails, accountNumber: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="IFSC Code"
            autoCapitalize="characters"
            value={bankDetails.ifsc}
            onChangeText={text =>
              setBankDetails({ ...bankDetails, ifsc: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Bank Name"
            value={bankDetails.bankName}
            onChangeText={text =>
              setBankDetails({ ...bankDetails, bankName: text })
            }
          />
        </View>

        {/* Buy Button */}
        <TouchableOpacity style={styles.buyButton} onPress={handlePurchase}>
          <Ionicons name="cart-outline" size={20} color="#fff" />
          <Text style={styles.buyButtonText}> Confirm & Buy Now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuyNowScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  thumbnailContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  coursePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#f9fafb',
  },
  buyButton: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 10,
    color: '#333',
  },
});

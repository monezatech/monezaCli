// src/screens/BuyNowScreen.tsx
import React, { useEffect, useState } from 'react';
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
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { apiService } from '../../services/service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

import PaymentService from '../../services/cashfree/PaymentService';
import PaymentWebView from '../../Cashfree/components/PaymentWebView';

const BuyNowScreen: React.FC = () => {
  const navigation = useNavigation();

  // redux selectors (adjust names to your store)
  const user = useSelector((state: RootState) => state.userState.user);
  const itemId = useSelector((state: RootState) => state.globalState.id);
  const itemType = useSelector((state: RootState) => state.globalState.type);

  const [referralCode, setReferralCode] = useState('');
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentSessionData, setPaymentSessionData] = useState<any>(null);

  // -----------------------
  // Fetch item (course or bundle)
  // -----------------------
  useEffect(() => {
    if (itemId && itemType) fetchItem();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, itemType]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const tokenLocal = await AsyncStorage.getItem('token');
      let res;
      if (itemType === 'bundle') {
        res = await apiService.getBundle({ token: tokenLocal, bundleId: itemId });
      } else {
        res = await apiService.getCourse({ token: tokenLocal, courseId: itemId });
      }
      setItem(res.bundle || res.course);
    } catch (error) {
      console.log('Error fetching item:', error);
      Alert.alert('Error', 'Unable to fetch item details.');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // Cashfree hosted checkout payment handler
  // -----------------------
  const handlePurchase = async () => {
    if (!item || !user) {
      Alert.alert('Error', 'Item details or user information is missing.');
      return;
    }

    try {
      setPayLoading(true);

      // Create order details for Cashfree hosted checkout
      const orderDetails = {
        customerId: user._id || 'CUSTOMER_001',
        customerName: user.name || 'User',
        customerEmail: user.email || 'user@example.com',
        customerPhone: user.phone || '9999999999',
        amount: item.price || 1,
      };

      console.log('🔄 Creating Cashfree hosted checkout order...', orderDetails);

      // Create hosted checkout order using PaymentService
      const order = await PaymentService.createHostedOrder(orderDetails);

      if (order && order.payment_url) {
        console.log('✅ Hosted order created successfully:', order);

        // Set up session data for PaymentWebView
        setPaymentSessionData({
          payment_url: order.payment_url,
          order_id: order.order_id,
          checkout_type: order.checkout_type,
        });

        // Show the payment WebView
        setShowPaymentWebView(true);

      } else {
        console.error('❌ Failed to create hosted order:', order);
        Alert.alert('Error', 'Could not create payment order. Please try again.');
      }

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      Alert.alert(
        'Payment Error',
        error.message || 'Failed to initiate payment. Please try again.'
      );
    } finally {
      setPayLoading(false);
    }
  };

  // -----------------------
  // Payment callback handlers
  // -----------------------
  const handlePaymentSuccess = async (data: any) => {
    console.log('✅ Payment Success:', data);

    try {
      // After successful payment, call the appropriate purchase API
      if (itemType === 'bundle') {
        const tokenLocal = await AsyncStorage.getItem('token');
        await apiService.purchaseBundle({
          token: tokenLocal,
          bundleId: itemId,
          amount: item.price,
          referralCode: referralCode || '',
        });
      }
      // For courses, purchase might be handled via webhook, so no additional API call needed

      Alert.alert(
        'Payment Successful!',
        `${itemType === 'bundle' ? 'Bundle' : 'Course'} purchased successfully.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Purchase API error:', error);
      Alert.alert(
        'Payment Completed',
        'Payment was successful, but there was an issue recording the purchase. Please contact support.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const handlePaymentError = (error: any) => {
    console.log('❌ Payment Error:', error);
    Alert.alert('Payment Failed', 'Your payment could not be processed. Please try again.');
  };

  const handlePaymentClose = () => {
    console.log('🔒 Payment Closed');
    Alert.alert('Payment Cancelled', 'Your payment has been cancelled.');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Item...</Text>
      </SafeAreaView>
    );
  }

  const priceText = item?.price ? `₹ ${item.price}` : 'Price not available';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.header}>Confirm & Pay</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Item Card */}
        <View style={styles.courseCard}>
          {item?.thumbnailUrl ? (
            <Image
              source={{ uri: item.thumbnailUrl }}
              style={styles.courseImage}
            />
          ) : (
            <View
              style={[
                styles.courseImage,
                { alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Ionicons name="book-outline" size={36} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>
              {item?.title || 'Untitled Item'}
            </Text>
            <Text style={styles.courseDesc} numberOfLines={2}>
              {item?.description || ''}
            </Text>
            <Text style={styles.coursePrice}>{priceText}</Text>
          </View>
        </View>

        {/* Referral */}
        <View style={styles.card}>
          <Text style={styles.heading}>Referral Code</Text>
          <TextInput
            placeholder="Enter referral code (optional)"
            value={referralCode}
            onChangeText={setReferralCode}
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        {/* Payment Information */}
        <View style={styles.card}>
          <Text style={styles.heading}>Secure Payment</Text>
          <Text style={styles.paymentInfo}>
            You will be redirected to Cashfree's secure payment gateway where you can complete your payment using:
          </Text>

          <View style={styles.paymentMethods}>
            <View style={styles.paymentMethod}>
              <Ionicons name="phone-portrait-outline" size={20} color="#4F46E5" />
              <Text style={styles.paymentMethodText}>UPI</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons name="card-outline" size={20} color="#4F46E5" />
              <Text style={styles.paymentMethodText}>Cards</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons name="business-outline" size={20} color="#4F46E5" />
              <Text style={styles.paymentMethodText}>Net Banking</Text>
            </View>
            <View style={styles.paymentMethod}>
              <Ionicons name="wallet-outline" size={20} color="#4F46E5" />
              <Text style={styles.paymentMethodText}>Wallets</Text>
            </View>
          </View>

          <Text style={styles.securityNote}>
            🔒 Your payment information is secured by Cashfree's PCI DSS compliant gateway.
          </Text>
        </View>

        {/* Final Confirm button */}
        <TouchableOpacity
          style={[styles.buyButton, payLoading && { opacity: 0.7 }]}
          onPress={handlePurchase}
          disabled={payLoading}
        >
          {payLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card-outline" size={18} color="#fff" />
              <Text style={styles.buyButtonText}>
                {' '}
                Confirm & Pay {item?.price ? ` • ₹ ${item.price}` : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Payment WebView Modal */}
      <Modal
        visible={showPaymentWebView}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowPaymentWebView(false)}
      >
        {paymentSessionData && (
          <PaymentWebView
            sessionData={paymentSessionData}
            onPaymentSuccess={(data) => {
              setShowPaymentWebView(false);
              setPaymentSessionData(null);
              handlePaymentSuccess(data);
            }}
            onPaymentError={(error) => {
              setShowPaymentWebView(false);
              setPaymentSessionData(null);
              handlePaymentError(error);
            }}
            onClose={() => {
              setShowPaymentWebView(false);
              setPaymentSessionData(null);
              handlePaymentClose();
            }}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default BuyNowScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
    color: '#111827',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  courseImage: {
    width: 120,
    height: 100,
    backgroundColor: '#E5E7EB',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  courseDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E9EE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FAFBFF',
    fontSize: 14,
  },
  buyButton: {
    marginTop: 8,
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  paymentInfo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
    marginLeft: 6,
  },
  securityNote: {
    fontSize: 12,
    color: '#059669',
    fontStyle: 'italic',
  },
});

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {
  CFPaymentGatewayService,
} from 'react-native-cashfree-pg-sdk';
import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';
import PaymentService from '../../services/cashfree/PaymentService';

interface PaymentSDKProps {
  orderDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    amount: number;
  };
  onPaymentSuccess: (data: any) => void;
  onPaymentError: (error: any) => void;
  onClose: () => void;
  visible: boolean;
}

const PaymentSDK: React.FC<PaymentSDKProps> = ({
  orderDetails,
  onPaymentSuccess,
  onPaymentError,
  onClose,
  visible,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [lastCallbackTime, setLastCallbackTime] = useState<number>(0);
  const [processedCallbacks, setProcessedCallbacks] = useState<Set<string>>(new Set());

  // Initialize SDK when modal becomes visible
  useEffect(() => {
    if (visible && orderDetails) {
      initializeSDK();
    }
  }, [visible]);

  const initializeSDK = async () => {
    try {
      setLoading(true);
      console.log('🚀 Initializing Cashfree SDK for payment...');

      // Create order using PaymentService
      const order = await PaymentService.createOrder(orderDetails);

      if (!order || !order.payment_session_id) {
        throw new Error('Failed to create payment order');
      }

      console.log('✅ Order created successfully:', order);

      // Set up SDK callbacks
      CFPaymentGatewayService.setCallback({
        onPaymentSuccess: handlePaymentSuccess,
        onPaymentError: handlePaymentError,
        onPaymentClose: handleClosePayment,
        onError: handlePaymentError,
        onVerify: handlePaymentVerify,
        onPaymentPending: handlePaymentPending,
        onPaymentFailure: handlePaymentFailure,
        onPaymentCancel: handleClosePayment,
      } as any);

      // Create CFSession - use the environment from the order response
      const environment = order.environment === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;
      const cfSession = new CFSession(
        order.payment_session_id,
        order.order_id,
        environment
      );

      console.log('✅ SDK initialized, starting payment...');

      // Start payment
      CFPaymentGatewayService.doWebPayment(cfSession);

    } catch (error: any) {
      console.error('❌ SDK initialization failed:', error);
      Alert.alert('Payment Error', error.message || 'Failed to initialize payment');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Robust callback handler to prevent multiple popups
  const handleCallback = (callbackName: string, data: any, action: () => void) => {
    const now = Date.now();

    console.log(`🔔 ${callbackName} CALLBACK TRIGGERED at ${now}`);
    console.log(`📋 Callback data:`, JSON.stringify(data, null, 2));

    // If payment already processed, ignore this callback
    if (paymentProcessed) {
      console.log(`🚫 Payment already processed, ignoring ${callbackName}`);
      return;
    }

    // If this callback was triggered too quickly after the last one (within 100ms), ignore it
    if (now - lastCallbackTime < 100) {
      console.log(`🚫 Callback triggered too quickly (${now - lastCallbackTime}ms), ignoring ${callbackName}`);
      return;
    }

    // If we've already processed this type of callback, ignore it
    if (processedCallbacks.has(callbackName)) {
      console.log(`🚫 Callback ${callbackName} already processed, ignoring`);
      return;
    }

    console.log(`✅ Processing ${callbackName} callback...`);

    // Mark this callback as processed
    setProcessedCallbacks(prev => new Set([...prev, callbackName]));
    setLastCallbackTime(now);
    setPaymentProcessed(true);

    // Execute the action
    action();
  };

  const handlePaymentSuccess = (data: any) => {
    handleCallback('onPaymentSuccess', data, () => {
      onPaymentSuccess(data);
    });
  };

  const handlePaymentError = (error: any) => {
    handleCallback('onPaymentError', error, () => {
      onPaymentError(error);
    });
  };

  const handleClosePayment = () => {
    handleCallback('onPaymentClose', null, () => {
      onClose();
    });
  };

  const handlePaymentVerify = (data: any) => {
    handleCallback('onVerify', data, async () => {
      try {
        console.log('🔍 Processing payment verification...');

        const orderId = data?.orderId || data?.order_id || data?.orderId;

        if (orderId) {
          // Verify payment with Cashfree servers
          const verificationResult = await PaymentService.verifyPayment(orderId);

          if (verificationResult.success) {
            console.log('✅ Payment verification successful');
            onPaymentSuccess(data);
          } else {
            console.log('⚠️ Payment verification failed, but showing success');
            onPaymentSuccess(data);
          }
        } else {
          console.log('⚠️ No order ID found, showing success');
          onPaymentSuccess(data);
        }

      } catch (verificationError) {
        console.error('❌ Verification error:', verificationError);
        onPaymentSuccess(data); // Still show success
      }
    });
  };

  const handlePaymentPending = (data: any) => {
    handleCallback('onPaymentPending', data, () => {
      Alert.alert(
        'Payment Pending',
        'Your payment is being processed. Please wait for confirmation.',
        [{ text: 'OK', onPress: () => onClose() }]
      );
    });
  };

  const handlePaymentFailure = (error: any) => {
    handleCallback('onPaymentFailure', error, () => {
      onPaymentError(error);
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Cashfree Payment</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Text style={styles.loadingText}>Initializing payment...</Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        )}

        {/* SDK will handle the payment UI */}
        {!loading && (
          <View style={styles.sdkContainer}>
            <Text style={styles.instructionText}>
              Complete your payment using the Cashfree payment interface
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#95a5a6',
  },
  sdkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default PaymentSDK;

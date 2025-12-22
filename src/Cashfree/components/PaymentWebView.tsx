import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface PaymentWebViewProps {
  sessionData: {
    payment_url: string;
    order_id: string;
    checkout_type: string;
  };
  onPaymentSuccess: (data: any) => void;
  onPaymentError: (error: any) => void;
  onClose: () => void;
}

const PaymentWebView: React.FC<PaymentWebViewProps> = ({
  sessionData,
  onPaymentSuccess,
  onPaymentError,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log('🌐 PaymentWebView initialized with:', {
      payment_url: sessionData.payment_url,
      order_id: sessionData.order_id,
      checkout_type: sessionData.checkout_type
    });

    // Add a timeout to handle slow loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ Payment page loading timeout - still loading after 15 seconds');
        // Don't show error, just log it
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [sessionData, loading]);

  // Handle navigation state changes
  const handleNavigationStateChange = (navState: any) => {
    console.log('🌐 WebView navigation state:', navState);

    // Check if we're on a success or failure URL
    if (navState.url) {
      // Check for success URLs
      if (navState.url.includes('success') ||
          navState.url.includes('return.php') ||
          navState.url.includes('thankyou') ||
          navState.url.includes('complete')) {
        console.log('✅ Payment success detected from URL');
        onPaymentSuccess({
          orderId: sessionData.order_id,
          status: 'success',
          message: 'Payment completed successfully'
        });
        return;
      }

      // Check for failure URLs
      if (navState.url.includes('failure') ||
          navState.url.includes('error') ||
          navState.url.includes('cancelled') ||
          navState.url.includes('failed')) {
        console.log('❌ Payment failure detected from URL');
        onPaymentError({
          orderId: sessionData.order_id,
          status: 'error',
          message: 'Payment failed or was cancelled'
        });
        return;
      }

      // Check for specific Cashfree status indicators
      if (navState.url.includes('order_id=') && navState.url.includes('status=PAID')) {
        console.log('✅ Payment success detected from status parameter');
        onPaymentSuccess({
          orderId: sessionData.order_id,
          status: 'success',
          message: 'Payment completed successfully'
        });
        return;
      }

      if (navState.url.includes('order_id=') && navState.url.includes('status=FAILED')) {
        console.log('❌ Payment failure detected from status parameter');
        onPaymentError({
          orderId: sessionData.order_id,
          status: 'error',
          message: 'Payment failed'
        });
        return;
      }
    }
  };

  // Handle WebView errors
  const handleWebViewError = (error: any) => {
    console.error('❌ WebView error:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    
    // Don't immediately show error, try to reload first
    console.log('🔄 Attempting to reload due to WebView error...');
    setTimeout(() => {
      handleReload();
    }, 2000);
  };

  // Handle WebView load end
  const handleLoadEnd = () => {
    setLoading(false);
    console.log('✅ WebView loaded successfully');
    
    // Inject JavaScript to check page content
    setTimeout(() => {
      console.log('🔍 Injecting debug script to check page content...');
    }, 1000);
  };

  // Handle WebView load start
  const handleLoadStart = () => {
    setLoading(true);
    console.log('🔄 WebView starting to load...');
  };

  // Handle WebView load progress
  const handleLoadProgress = (event: any) => {
    console.log('📊 WebView load progress:', event.nativeEvent.progress);
  };

  // Reload WebView
  const handleReload = () => {
    setWebViewKey(prev => prev + 1);
    setLoading(true);
  };

  return (
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
          <Text style={styles.loadingText}>Loading Cashfree payment gateway...</Text>
          <Text style={styles.loadingSubtext}>This may take a few moments</Text>
          <Text style={styles.urlText}>{sessionData.payment_url}</Text>
        </View>
      )}

      {/* WebView */}
      <WebView
        key={webViewKey}
        source={{ uri: sessionData.payment_url }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        onError={handleWebViewError}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onLoadProgress={handleLoadProgress}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onShouldStartLoadWithRequest={(request) => {
          console.log('🌐 Loading URL:', request.url);
          return true;
        }}
        // Enhanced props for Cashfree compatibility
        userAgent="Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        cacheEnabled={false}
        incognito={false}
        // Additional props to fix rendering issues
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        onContentProcessDidTerminate={() => {
          console.log('🔄 Content process terminated, reloading...');
          handleReload();
        }}
        onHttpError={(error) => {
          console.log('🌐 HTTP Error:', error);
        }}
        onRenderProcessGone={() => {
          console.log('🔄 Render process gone, reloading...');
          handleReload();
        }}
        // Inject JavaScript to debug page content
        injectedJavaScript={`
          (function() {
            console.log('🔍 Injected script running...');
            console.log('🔍 Document title:', document.title);
            console.log('🔍 Document body length:', document.body ? document.body.innerHTML.length : 'No body');
            console.log('🔍 Document ready state:', document.readyState);
            
            // Check for Cashfree specific elements
            setTimeout(function() {
              var paymentForm = document.querySelector('form');
              var paymentMethods = document.querySelectorAll('[data-payment-method]');
              var amountField = document.querySelector('[name="amount"]');
              
              console.log('🔍 Payment form found:', !!paymentForm);
              console.log('🔍 Payment methods found:', paymentMethods.length);
              console.log('🔍 Amount field found:', !!amountField);
              
              // Force page to be visible
              document.body.style.display = 'block';
              document.body.style.visibility = 'visible';
              document.body.style.opacity = '1';
            }, 2000);
            
            true;
          })();
        `}
        onMessage={(event) => {
          console.log('🌐 Message from WebView:', event.nativeEvent.data);
        }}
      />

      {/* Footer with reload button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
          <Text style={styles.reloadButtonText}>🔄 Reload</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.reloadButton, { marginLeft: 10 }]} 
          onPress={() => {
            console.log('🌐 Opening payment URL in external browser...');
            Linking.openURL(sessionData.payment_url);
          }}>
          <Text style={styles.reloadButtonText}>🌐 Open in Browser</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
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
  urlText: {
    marginTop: 16,
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  webview: {
    flex: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  reloadButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3498db',
    borderRadius: 6,
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PaymentWebView;

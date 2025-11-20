import axios from 'axios';
import { getCurrentConfig } from '../../Cashfree/config/cashfree.config.js'; // Use dynamic config
import EnvironmentSwitcher from '../../Cashfree/utils/environmentSwitcher.js';
// import debugEnvironment from '../../Cashfree/utils/debugEnvironment.js';
// import testEnvironment from '../utils/testEnvironment.js';
// import testDirectConfig from '../utils/testDirectConfig.js';
// import verifyConfig from '../utils/verifyConfig.js';
import testSDKInitialization from '../../Cashfree/utils/testSDKInit.js';
import minimalTest from '../../Cashfree/utils/minimalTest.js';

class PaymentService {
  constructor() {
    // Use dynamic configuration based on environment
    this.config = getCurrentConfig();
    this.baseUrl = this.config.baseUrl;
    
    console.log('🚀 PaymentService initialized with DYNAMIC CONFIG');
    console.log('🔍 Final configuration:');
    console.log('  - environment:', this.config.environment);
    console.log('  - appId:', this.config.appId);
    console.log('  - baseUrl:', this.config.baseUrl);
    console.log('  - successUrl:', this.config.returnUrls.SUCCESS);
    console.log('  - webhookUrl:', this.config.notifyUrl);
    
    // Test SDK initialization
    testSDKInitialization();
    
    // Run minimal test
    minimalTest();
  }

  // Get authentication headers for Cashfree API
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01', // Updated to latest API version
      'x-client-id': this.config.appId,
      'x-client-secret': this.config.secretKey,
    };
  }

  // SIMPLE APPROACH: Create order and return it directly for SDK
  async createOrder(orderDetails) {
    try {
      console.log('🔄 Creating Cashfree order...');
      
      // Production safety check
      if (EnvironmentSwitcher.isProductionEnvironment()) {
        console.log('⚠️ PRODUCTION MODE: Creating real payment order');
        
        // Additional validation for production
        if (!orderDetails.amount || orderDetails.amount < 1) {
          throw new Error('Invalid amount for production payment');
        }
        
        if (!orderDetails.customerEmail || !orderDetails.customerPhone) {
          throw new Error('Customer email and phone are required for production payments');
        }
      } else {
        console.log('🧪 TEST MODE: Creating test payment order');
      }
      
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simple order creation - no complex session logic
      const orderData = {
        order_id: orderId,
        order_amount: orderDetails.amount,
        order_currency: 'INR',
        customer_details: {
          customer_id: orderDetails.customerId,
          customer_name: orderDetails.customerName,
          customer_email: orderDetails.customerEmail,
          customer_phone: orderDetails.customerPhone,
        },
        order_meta: {
          return_url: this.config.returnUrls?.SUCCESS || 'https://test.cashfree.com/pgappsdemos/return.php?order_id={order_id}',
          notify_url: this.config.notifyUrl || 'https://test.cashfree.com/pgappsdemos/notify.php',
          payment_methods: "cc,dc,nb",  // Test with cards and net banking first
          // Enable UPI Collect Flow for production testing (bypasses source validation)
          upi_intent: false,  // Disable UPI Intent (which requires Play Store)
          upi_collect: true   // Enable UPI Collect (works with sideloaded apps)
        },
        order_note: 'React Native Android Demo - UPI Payment',
        order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };

      console.log('🔄 Order payload:', orderData);
      console.log('🔄 Creating order at:', `${this.baseUrl}/orders`);

      const response = await axios.post(`${this.baseUrl}/orders`, orderData, {
        headers: this.getAuthHeaders(),
        timeout: 30000,
      });

      console.log('✅ Order created successfully:', response.data);

      // Return the order data directly - SDK will handle the rest
      const orderResponse = {
        ...response.data,
        order_id: orderId,
        checkout_type: 'sdk',
        environment: this.config.environment // Use actual environment from config
      };
      
      console.log('🔍 Order Response Environment Debug:');
      console.log('  - this.config.environment:', this.config.environment);
      console.log('  - orderResponse.environment:', orderResponse.environment);
      console.log('  - orderResponse.payment_session_id:', orderResponse.payment_session_id);
      console.log('  - orderResponse.order_id:', orderResponse.order_id);
      
      // Verify the environment is correct
      if (orderResponse.environment !== 'PRODUCTION') {
        console.error('❌ CRITICAL: Environment is not PRODUCTION!');
        console.error('❌ This will cause "token is not present" error!');
      } else {
        console.log('✅ Environment is correctly set to PRODUCTION');
      }
      
      return orderResponse;

    } catch (error) {
      console.error('❌ Order creation failed:', error);
      
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
        throw new Error(`Order creation failed: ${error.response.data.message || 'Unknown API error'}`);
      } else if (error.request) {
        throw new Error('Network error: Please check your connection');
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  }

  // Test connection to Cashfree API
  async testConnection() {
    try {
      console.log('🔧 Testing Cashfree API connection...');
      
      // Try to create a minimal test order
      const testOrderData = {
        order_id: `test_${Date.now()}`,
        order_amount: 1,
        order_currency: 'INR',
        customer_details: {
          customer_id: 'test_customer_123',
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '9999999999',
        },
        order_meta: {
          return_url: 'https://test.cashfree.com/pgappsdemos/return.php?order_id={order_id}',
          notify_url: 'https://test.cashfree.com/pgappsdemos/notify.php',
          payment_methods: "upi"
        },
        order_note: 'Connection test',
        order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };

      const response = await axios.post(`${this.baseUrl}/orders`, testOrderData, {
        headers: this.getAuthHeaders(),
        timeout: 10000,
      });

      console.log('✅ Connection test successful:', response.data);
      return {
        success: true,
        message: 'Successfully connected to Cashfree API',
        data: response.data
      };

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      
      if (error.response) {
        return {
          success: false,
          error: `API Error: ${error.response.status}`,
          details: error.response.data
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error',
          details: 'Unable to reach Cashfree servers'
        };
      } else {
        return {
          success: false,
          error: 'Request error',
          details: error.message
        };
      }
    }
  }

  // Verify payment status with Cashfree
  async verifyPayment(orderId, paymentSessionId) {
    try {
      console.log('🔍 Verifying payment...');
      console.log('🔍 Order ID:', orderId);
      console.log('🔍 Payment Session ID:', paymentSessionId);
      
      // First, get the order details
      const orderResponse = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
        headers: this.getAuthHeaders(),
        timeout: 15000,
      });
      
      console.log('✅ Order details retrieved:', orderResponse.data);
      
      // Check if payment session exists and get its status
      if (paymentSessionId) {
        try {
          const sessionResponse = await axios.get(`${this.baseUrl}/orders/${orderId}/sessions/${paymentSessionId}`, {
            headers: this.getAuthHeaders(),
            timeout: 15000,
          });
          
          console.log('✅ Payment session details:', sessionResponse.data);
          
          return {
            success: true,
            order: orderResponse.data,
            session: sessionResponse.data,
            paymentStatus: sessionResponse.data.payment_status || 'unknown'
          };
        } catch (sessionError) {
          console.log('⚠️ Could not retrieve session details, using order status');
          return {
            success: true,
            order: orderResponse.data,
            session: null,
            paymentStatus: orderResponse.data.order_status || 'unknown'
          };
        }
      } else {
        return {
          success: true,
          order: orderResponse.data,
          session: null,
          paymentStatus: orderResponse.data.order_status || 'unknown'
        };
      }
      
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
        return {
          success: false,
          error: `Verification failed: ${error.response.data.message || 'Unknown API error'}`,
          details: error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error during verification',
          details: 'Unable to reach Cashfree servers',
          status: 'network_error'
        };
      } else {
        return {
          success: false,
          error: 'Verification request error',
          details: error.message,
          status: 'request_error'
        };
      }
    }
  }

  // Get payment status for an order
  async getPaymentStatus(orderId) {
    try {
      console.log('🔍 Getting payment status for order:', orderId);
      
      const response = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
        headers: this.getAuthHeaders(),
        timeout: 10000,
      });
      
      console.log('✅ Payment status retrieved:', response.data);
      
      return {
        success: true,
        orderStatus: response.data.order_status,
        paymentStatus: response.data.payment_status,
        orderData: response.data
      };
      
    } catch (error) {
      console.error('❌ Failed to get payment status:', error);
      
      if (error.response) {
        return {
          success: false,
          error: `Status check failed: ${error.response.data.message || 'Unknown API error'}`,
          details: error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error during status check',
          details: 'Unable to reach Cashfree servers',
          status: 'network_error'
        };
      } else {
        return {
          success: false,
          error: 'Status check request error',
          details: error.message,
          status: 'request_error'
        };
      }
    }
  }

  // Get environment information for UI display
  getEnvironmentInfo() {
    return EnvironmentSwitcher.getEnvironmentInfo();
  }

  // Get environment warning for UI display
  getEnvironmentWarning() {
    return EnvironmentSwitcher.getEnvironmentWarning();
  }

  // Check if running in production mode
  isProductionMode() {
    return EnvironmentSwitcher.isProductionEnvironment();
  }

  // Get current environment for debugging
  getCurrentEnvironment() {
    return {
      environment: this.config.environment,
      appId: this.config.appId,
      baseUrl: this.config.baseUrl,
      isProduction: this.isProductionMode()
    };
  }

  // Force production mode - emergency method
  forceProductionMode() {
    console.log('🚨 FORCING PRODUCTION MODE...');
    this.config = getSimpleProdConfig();
    this.baseUrl = this.config.baseUrl;
    console.log('✅ Production mode forced:', this.config.environment);
  }

  // Test SDK with minimal data
  async testSDKWithMinimalData() {
    console.log('🧪 === TESTING SDK WITH MINIMAL DATA ===');
    
    try {
      // Create a minimal order
      const testOrderData = {
        order_id: `test_${Date.now()}`,
        order_amount: 1,
        order_currency: 'INR',
        customer_details: {
          customer_id: 'test_customer',
          customer_name: 'Test Customer',
          customer_email: 'test@example.com',
          customer_phone: '9999999999',
        },
        order_meta: {
          return_url: this.config.returnUrls.SUCCESS,
          notify_url: this.config.notifyUrl,
          payment_methods: "upi"
        },
        order_note: 'SDK test order',
        order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };

      console.log('🔄 Creating test order...');
      const response = await axios.post(`${this.baseUrl}/orders`, testOrderData, {
        headers: this.getAuthHeaders(),
        timeout: 10000,
      });

      console.log('✅ Test order created successfully');
      console.log('  - Order ID:', response.data.order_id);
      console.log('  - Payment Session ID:', response.data.payment_session_id);
      console.log('  - Order Status:', response.data.order_status);

      // Test SDK initialization with this data
      const { CFEnvironment, CFSession } = await import('cashfree-pg-api-contract');
      
      const cfSession = new CFSession(
        response.data.payment_session_id,
        response.data.order_id,
        CFEnvironment.PRODUCTION
      );

      console.log('✅ SDK session created successfully');
      console.log('  - Session:', cfSession);
      console.log('  - Environment:', cfSession.environment);
      console.log('  - Order ID:', cfSession.orderID);
      console.log('  - Payment Session ID:', cfSession.payment_session_id);

      console.log('🧪 === END SDK TEST ===');
      
      return {
        success: true,
        orderId: response.data.order_id,
        paymentSessionId: response.data.payment_session_id,
        cfSession: cfSession
      };

    } catch (error) {
      console.error('❌ SDK test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new PaymentService();

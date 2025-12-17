// Minimal Test for Cashfree Integration
// This will test the most basic functionality

import axios from 'axios';
import { getSimpleProdConfig } from '../config/simpleProdConfig.js';

export const minimalTest = async () => {
  console.log('🧪 === MINIMAL CASHFREE TEST ===');
  
  try {
    // Test 1: Check configuration
    const config = getSimpleProdConfig();
    console.log('Test 1 - Configuration:');
    console.log('  - environment:', config.environment);
    console.log('  - appId:', config.appId);
    console.log('  - baseUrl:', config.baseUrl);
    
    // Test 2: Test API connection with minimal order
    console.log('Test 2 - API Connection Test:');
    
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
        return_url: config.returnUrls.SUCCESS,
        notify_url: config.notifyUrl,
        payment_methods: "upi"
      },
      order_note: 'Minimal test order',
      order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': config.appId,
      'x-client-secret': config.secretKey,
    };
    
    console.log('  - Making API request to:', `${config.baseUrl}/orders`);
    console.log('  - Headers:', headers);
    console.log('  - Order data:', testOrderData);
    
    const response = await axios.post(`${config.baseUrl}/orders`, testOrderData, {
      headers,
      timeout: 10000,
    });
    
    console.log('✅ API request successful!');
    console.log('  - Response status:', response.status);
    console.log('  - Order ID:', response.data.order_id);
    console.log('  - Payment Session ID:', response.data.payment_session_id);
    console.log('  - Order Status:', response.data.order_status);
    
    // Test 3: Check if payment_session_id is valid
    if (response.data.payment_session_id) {
      console.log('✅ Payment session ID is present and valid');
      console.log('  - Session ID length:', response.data.payment_session_id.length);
      console.log('  - Session ID starts with:', response.data.payment_session_id.substring(0, 20) + '...');
    } else {
      console.error('❌ Payment session ID is missing!');
    }
    
    console.log('🧪 === END MINIMAL TEST ===');
    
    return {
      success: true,
      orderId: response.data.order_id,
      paymentSessionId: response.data.payment_session_id,
      orderStatus: response.data.order_status
    };
    
  } catch (error) {
    console.error('❌ Minimal test failed:', error);
    
    if (error.response) {
      console.error('  - API Error Status:', error.response.status);
      console.error('  - API Error Data:', error.response.data);
    } else if (error.request) {
      console.error('  - Network Error:', error.request);
    } else {
      console.error('  - Request Setup Error:', error.message);
    }
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data || error.request || error.message
    };
  }
};

export default minimalTest;

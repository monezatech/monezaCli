import PaymentService from '../services/PaymentService.js';

// Test connection to Cashfree API using the new PaymentService method
const testCashfreeConnection = async () => {
  try {
    console.log('🔧 Testing Cashfree API connection...');
    
    // Use the new testConnection method from PaymentService
    const result = await PaymentService.testConnection();
    
    if (result.success) {
      console.log('✅ Connection test successful:', result.message);
      return {
        success: true,
        message: result.message,
        data: result.data
      };
    } else {
      console.error('❌ Connection test failed:', result.error);
      return {
        success: false,
        error: result.error,
        details: result.details
      };
    }
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return {
      success: false,
      error: 'Connection test failed',
      details: error.message || 'Unknown error'
    };
  }
};

export default testCashfreeConnection;

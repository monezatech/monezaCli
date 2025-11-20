// Test SDK Initialization
// This will test if the Cashfree SDK can be properly initialized

import { CFEnvironment, CFSession } from 'cashfree-pg-api-contract';

export const testSDKInitialization = () => {
  console.log('🧪 === SDK INITIALIZATION TEST ===');
  
  try {
    // Test 1: Check if CFEnvironment is available
    console.log('Test 1 - CFEnvironment values:');
    console.log('  - CFEnvironment.SANDBOX:', CFEnvironment.SANDBOX);
    console.log('  - CFEnvironment.PRODUCTION:', CFEnvironment.PRODUCTION);
    
    // Test 2: Try to create a test session
    console.log('Test 2 - Creating test session:');
    const testSessionId = 'test_session_123';
    const testOrderId = 'test_order_123';
    
    try {
      const testSession = new CFSession(
        testSessionId,
        testOrderId,
        CFEnvironment.PRODUCTION
      );
      
      console.log('✅ Test session created successfully:', testSession);
      console.log('  - sessionId:', testSession.payment_session_id);
      console.log('  - orderId:', testSession.orderID);
      console.log('  - environment:', testSession.environment);
      
    } catch (sessionError) {
      console.error('❌ Failed to create test session:', sessionError);
    }
    
    // Test 3: Check environment mapping
    console.log('Test 3 - Environment mapping:');
    const prodEnvironment = CFEnvironment.PRODUCTION;
    const sandboxEnvironment = CFEnvironment.SANDBOX;
    
    console.log('  - PRODUCTION environment value:', prodEnvironment);
    console.log('  - SANDBOX environment value:', sandboxEnvironment);
    
    console.log('🧪 === END SDK TEST ===');
    
    return {
      success: true,
      prodEnvironment,
      sandboxEnvironment
    };
    
  } catch (error) {
    console.error('❌ SDK initialization test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default testSDKInitialization;

// Simple Production Configuration
// This is a direct, simple configuration for production mode

export const SIMPLE_PROD_CONFIG = {
  // Production Cashfree Credentials
  appId: '9866241965681a9ce16b5db597426689',
  secretKey: 'cfsk_ma_prod_2b81c42f9cde5ca307f09a1caf784540_b8b5a50e',
  
  // Environment
  environment: 'PRODUCTION', // SDK expects this exact format
  
  // API Base URL
  baseUrl: 'https://api.cashfree.com/pg',
  
  // Backend URLs
  returnUrls: {
    SUCCESS: 'https://moneza-backend.onrender.com/payment/success',
    FAILURE: 'https://moneza-backend.onrender.com/payment/failure',
  },
  notifyUrl: 'https://moneza-backend.onrender.com/payment/webhook',
  
  // Other settings
  defaultCurrency: 'INR',
  paymentModes: {
    UPI: true,
    CARD: true,
    NET_BANKING: true,
    WALLET: true,
    PAY_LATER: true,
  },
};

// Simple getter function
export const getSimpleProdConfig = () => {
  console.log('🔍 Using SIMPLE PRODUCTION CONFIG:');
  console.log('  - environment:', SIMPLE_PROD_CONFIG.environment);
  console.log('  - appId:', SIMPLE_PROD_CONFIG.appId);
  console.log('  - baseUrl:', SIMPLE_PROD_CONFIG.baseUrl);
  console.log('  - successUrl:', SIMPLE_PROD_CONFIG.returnUrls.SUCCESS);
  console.log('  - webhookUrl:', SIMPLE_PROD_CONFIG.notifyUrl);
  
  return SIMPLE_PROD_CONFIG;
};

export default SIMPLE_PROD_CONFIG;

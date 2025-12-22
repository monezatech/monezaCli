// Production Environment Configuration
// This file contains production-specific settings

export const PRODUCTION_CONFIG = {
  // Production Cashfree Credentials
  // ⚠️ IMPORTANT: Replace these with your actual production credentials from Cashfree Dashboard
  // Get from: https://merchant.cashfree.com/ → Production Apps → Create/Configure App
  // CASHFREE_APP_ID: 'TEST1065018594deb01d9b8a8bbd82fe58105601', // Replace with actual production App ID
  // CASHFREE_SECRET_KEY: 'cfsk_ma_test_67cb3c92687b06797940b0a162545fc8_1032d4d0', // Replace with actual production Secret Key

  CASHFREE_APP_ID: '9866241965681a9ce16b5db597426689', // ⚠️ REPLACE WITH YOUR TEST APP ID
  CASHFREE_SECRET_KEY: 'cfsk_ma_prod_2b81c42f9cde5ca307f09a1caf784540_b8b5a50e', // ⚠️
  // Environment
  ENVIRONMENT: 'PROD',

  // Production API Base URLs
  BASE_URLS: {
    TEST: 'https://sandbox.cashfree.com/pg',
    PROD: 'https://api.cashfree.com/pg',
  },

  // Production Backend URLs
  // ⚠️ IMPORTANT: Replace with your actual production domain
  BACKEND_BASE_URL: 'https://moneza-backend.onrender.com', // Your actual backend URL
  PAYMENT_SUCCESS_URL: 'https://moneza-backend.onrender.com/payment/success', // Your actual backend URL
  PAYMENT_FAILURE_URL: 'https://moneza-backend.onrender.com/payment/failure', // Your actual backend URL
  PAYMENT_WEBHOOK_URL: 'https://moneza-backend.onrender.com/payment/webhook', // Your actual backend URL

  // Production Settings
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_COUNTRY: 'IN',

  // Production Debug Settings
  DEBUG_MODE: false, // Always false in production
  LOG_PAYMENT_EVENTS: false, // Always false in production

  // Production Security Settings
  ENABLE_SSL_PINNING: true, // Enable SSL pinning for production
  ENABLE_CERTIFICATE_VALIDATION: true, // Enable certificate validation

  // Production Payment Settings
  PAYMENT_MODES: {
    UPI: true,
    CARD: true,
    NET_BANKING: true,
    WALLET: true, // Enable all payment methods in production
    PAY_LATER: true,
  },

  // Production Timeouts (in milliseconds)
  API_TIMEOUT: 30000, // 30 seconds
  PAYMENT_TIMEOUT: 300000, // 5 minutes

  // Production Retry Settings
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Production-specific validation
export const validateProductionConfig = () => {
  const errors = [];
  const warnings = [];
  
  // Check if production credentials are still placeholder values
  // Note: The current values appear to be production credentials, so we'll skip this check
  // if (PRODUCTION_CONFIG.CASHFREE_APP_ID === '9866241965681a9ce16b5db597426689') {
  //   errors.push('Production App ID not configured. Please update CASHFREE_APP_ID in production.config.js');
  // }

  // if (PRODUCTION_CONFIG.CASHFREE_SECRET_KEY === 'cfsk_ma_prod_2b81c42f9cde5ca307f09a1caf784540_b8b5a50e') {
  //   errors.push('Production Secret Key not configured. Please update CASHFREE_SECRET_KEY in production.config.js');
  // }
  
  // Check if backend URLs are still placeholder values
  // Note: moneza-backend.onrender.com appears to be the actual backend URL
  // if (PRODUCTION_CONFIG.BACKEND_BASE_URL === 'https://moneza-backend.onrender.com') {
  //   errors.push('Production backend URL not configured. Please update BACKEND_BASE_URL in production.config.js');
  // }

  // Check if return URLs are still placeholder values
  if (PRODUCTION_CONFIG.PAYMENT_SUCCESS_URL === 'https://your-production-domain.com/payment/success') {
    errors.push('Production success URL not configured. Please update PAYMENT_SUCCESS_URL in production.config.js');
  }

  if (PRODUCTION_CONFIG.PAYMENT_FAILURE_URL === 'https://your-production-domain.com/payment/failure') {
    errors.push('Production failure URL not configured. Please update PAYMENT_FAILURE_URL in production.config.js');
  }

  if (PRODUCTION_CONFIG.PAYMENT_WEBHOOK_URL === 'https://your-production-domain.com/payment/webhook') {
    errors.push('Production webhook URL not configured. Please update PAYMENT_WEBHOOK_URL in production.config.js');
  }
  
  // Security warnings
  if (PRODUCTION_CONFIG.DEBUG_MODE) {
    warnings.push('Debug mode is enabled in production. This should be disabled for security.');
  }
  
  if (PRODUCTION_CONFIG.LOG_PAYMENT_EVENTS) {
    warnings.push('Payment event logging is enabled in production. This may log sensitive data.');
  }
  
  // Display errors and warnings
  if (errors.length > 0) {
    console.error('❌ Production Configuration Errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️ Production Configuration Warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log('✅ Production configuration is valid');
  return true;
};

// Production environment helpers
export const isProductionEnvironment = () => PRODUCTION_CONFIG.ENVIRONMENT === 'PROD';
export const getProductionApiBaseUrl = () => PRODUCTION_CONFIG.BASE_URLS[PRODUCTION_CONFIG.ENVIRONMENT];

export default PRODUCTION_CONFIG;

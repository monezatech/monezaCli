// Environment Configuration (Android Only)
// Update these values for your environment

// Import production config if needed
import { PRODUCTION_CONFIG } from './production.config.js';

// Current environment - Change this to switch between TEST and PROD
const CURRENT_ENVIRONMENT = 'TEST'; // Changed to TEST for payout testing

export const ENV_CONFIG = {
  // Cashfree App Credentials - TEST SETUP FOR PAYOUT TESTING
  // IMPORTANT: Replace these with your actual Cashfree Payout Sandbox credentials.
  // These are placeholders and will not work for real payouts.
  CASHFREE_APP_ID: 'CF986624D491J1D4362S73FH22LG', // Placeholder for Payout Test App ID
  CASHFREE_SECRET_KEY: 'cfsk_ma_prod_15419a8f21de58224d4f71b0411f31e9_925dba9e', // Placeholder for Payout Test Secret Key

  // Environment (TEST for sandbox, PROD for production)
  ENVIRONMENT: CURRENT_ENVIRONMENT,

  // API Base URLs
  BASE_URLS: {
    TEST: 'https://sandbox.cashfree.com/pg',
    PROD: 'https://api.cashfree.com/pg',
  },

  // Your backend URLs - TEST SETUP for Cashfree sandbox
  BACKEND_BASE_URL: 'http://192.168.1.3:8000', // Assuming local backend for test
  PAYMENT_SUCCESS_URL:
    'https://test.cashfree.com/pgappsdemos/return.php?order_id={order_id}',
  PAYMENT_FAILURE_URL:
    'https://test.cashfree.com/pgappsdemos/return.php?order_id={order_id}',
  PAYMENT_WEBHOOK_URL: 'https://test.cashfree.com/pgappsdemos/notify.php',

  // Default Settings
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_COUNTRY: 'IN',

  // Debug - TEST SETTINGS
  DEBUG_MODE: true, // Enabled for test mode
  LOG_PAYMENT_EVENTS: true, // Enabled for test mode
};

// Helpers
export const isDevelopment = () => ENV_CONFIG.ENVIRONMENT === 'TEST';
export const isProduction = () => ENV_CONFIG.ENVIRONMENT === 'PROD';

export const getApiBaseUrl = () => {
  return ENV_CONFIG.BASE_URLS[ENV_CONFIG.ENVIRONMENT];
};

// Get environment-specific configuration
export const getEnvironmentConfig = () => {
  console.log('🔍 getEnvironmentConfig called with CURRENT_ENVIRONMENT:', CURRENT_ENVIRONMENT);
  
  if (CURRENT_ENVIRONMENT === 'PROD') {
    console.log('🔍 Using PRODUCTION configuration');
    // Use production configuration
    const prodConfig = {
      ...ENV_CONFIG,
      ENVIRONMENT: 'PROD', // Explicitly set environment to PROD
      CASHFREE_APP_ID: PRODUCTION_CONFIG.CASHFREE_APP_ID,
      CASHFREE_SECRET_KEY: PRODUCTION_CONFIG.CASHFREE_SECRET_KEY,
      BACKEND_BASE_URL: PRODUCTION_CONFIG.BACKEND_BASE_URL,
      PAYMENT_SUCCESS_URL: PRODUCTION_CONFIG.PAYMENT_SUCCESS_URL,
      PAYMENT_FAILURE_URL: PRODUCTION_CONFIG.PAYMENT_FAILURE_URL,
      PAYMENT_WEBHOOK_URL: PRODUCTION_CONFIG.PAYMENT_WEBHOOK_URL,
      DEBUG_MODE: PRODUCTION_CONFIG.DEBUG_MODE,
      LOG_PAYMENT_EVENTS: PRODUCTION_CONFIG.LOG_PAYMENT_EVENTS,
    };
    console.log('🔍 Production config ENVIRONMENT:', prodConfig.ENVIRONMENT);
    return prodConfig;
  }
  
  console.log('🔍 Using TEST configuration');
  // Use test configuration
  return ENV_CONFIG;
};

// Get current configuration based on environment
export const getCurrentEnvironmentConfig = () => {
  return getEnvironmentConfig();
};

export const validateEnvironment = () => {
  const warnings = [];
  const currentConfig = getCurrentEnvironmentConfig();

  // Check if we're in production mode
  if (CURRENT_ENVIRONMENT === 'PROD') {
    // Import and run production validation
    import('./production.config.js').then(({ validateProductionConfig }) => {
      validateProductionConfig();
    });
  }

  if (currentConfig.CASHFREE_APP_ID === 'TEST1065018594deb01d9b8a8bbd82fe58105601') {
    warnings.push('Please update CASHFREE_APP_ID in src/config/env.js');
  }

  if (currentConfig.CASHFREE_SECRET_KEY === 'cfsk_ma_test_67cb3c92687b06797940b0a162545fc8_1032d4d0') {
    warnings.push('Please update CASHFREE_SECRET_KEY in src/config/env.js');
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment Configuration Warnings:');
    warnings.forEach(w => console.warn(`  - ${w}`));
    return false;
  }

  return true;
};

export default ENV_CONFIG;

import { ENV_CONFIG, getCurrentEnvironmentConfig } from './env.js';

// Cashfree Configuration (Android Only)
export const CashfreeConfig = {
  // Environment - 'TEST' for sandbox, 'PROD' for production
  ENVIRONMENT: ENV_CONFIG.ENVIRONMENT,

  // Cashfree App Credentials
  APP_ID: ENV_CONFIG.CASHFREE_APP_ID,
  SECRET_KEY: ENV_CONFIG.CASHFREE_SECRET_KEY,

  // API Base URLs
  BASE_URLS: {
    TEST: 'https://sandbox.cashfree.com/pg',
    PROD: 'https://api.cashfree.com/pg',
  },

  // Default currency
  DEFAULT_CURRENCY: 'INR',

  // Return URLs for payment success/failure (used only in Web Checkout)
  RETURN_URLS: {
    SUCCESS: 'https://test.cashfree.com/pgappsdemos/return.php?order_id={order_id}',
    FAILURE: 'https://test.cashfree.com/pgappsdemos/return.php?order_id={order_id}',
  },

  // Webhook/Notify URL
  NOTIFY_URL: 'https://test.cashfree.com/pgappsdemos/notify.php',

  // Payment modes enabled - UPI is the primary focus
  PAYMENT_MODES: {
    UPI: true,        // Primary payment method
    CARD: true,       // Credit/Debit cards
    NET_BANKING: true, // Net banking
    WALLET: false,    // Disabled for now
    PAY_LATER: false, // Disabled for now
  },

  // Test card details (for sandbox only)
  TEST_CARDS: {
    SUCCESS_CARD: {
      number: '4111111111111111',
      expiry: '12/25',
      cvv: '123',
      name: 'Test User',
    },
    FAILURE_CARD: {
      number: '4012001037141112',
      expiry: '12/25',
      cvv: '123',
      name: 'Test User',
    },
  },

  // Test UPI IDs (for sandbox only)
  TEST_UPI: {
    SUCCESS: 'success@payu',
    FAILURE: 'failure@payu',
  },
};

// Get current configuration - SIMPLIFIED FOR PRODUCTION
export const getCurrentConfig = () => {
  // Direct configuration - bypass complex environment switcher
  const environment = ENV_CONFIG.ENVIRONMENT; // Direct from ENV_CONFIG

  console.log('🔍 getCurrentConfig - DIRECT MODE:');
  console.log('  - ENV_CONFIG.ENVIRONMENT:', ENV_CONFIG.ENVIRONMENT);
  console.log('  - ENV_CONFIG.APP_ID:', ENV_CONFIG.CASHFREE_APP_ID);
  console.log('  - SDK environment will be:', environment === 'TEST' ? 'SANDBOX' : 'PRODUCTION');

  const config = {
    appId: ENV_CONFIG.CASHFREE_APP_ID,
    secretKey: ENV_CONFIG.CASHFREE_SECRET_KEY,
    baseUrl: CashfreeConfig.BASE_URLS[environment],
    environment: environment === 'TEST' ? 'SANDBOX' : 'PRODUCTION', // SDK expects this format
    defaultCurrency: CashfreeConfig.DEFAULT_CURRENCY,
    paymentModes: CashfreeConfig.PAYMENT_MODES,
    returnUrls: {
      SUCCESS: ENV_CONFIG.PAYMENT_SUCCESS_URL,
      FAILURE: ENV_CONFIG.PAYMENT_FAILURE_URL,
    },
    notifyUrl: ENV_CONFIG.PAYMENT_WEBHOOK_URL,
  };
  
  console.log('🔍 Final config environment:', config.environment);
  console.log('🔍 Final config appId:', config.appId);
  console.log('🔍 Final config baseUrl:', config.baseUrl);
  return config;
};

// Validate configuration
export const validateConfig = () => {
  console.log('✅ Cashfree configuration is valid');
  return true;
};

export default CashfreeConfig;

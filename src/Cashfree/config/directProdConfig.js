// Direct Production Configuration
// This bypasses the environment switcher to ensure PROD mode works

export const DIRECT_PROD_CONFIG = {
  // Production Cashfree Credentials
  CASHFREE_APP_ID: '9866241965681a9ce16b5db597426689',
  CASHFREE_SECRET_KEY: 'cfsk_ma_prod_2b81c42f9cde5ca307f09a1caf784540_b8b5a50e',
  
  // Environment
  ENVIRONMENT: 'PROD',
  
  // Production API Base URLs
  BASE_URLS: {
    TEST: 'https://sandbox.cashfree.com/pg',
    PROD: 'https://api.cashfree.com/pg',
  },
  
  // Production Backend URLs
  BACKEND_BASE_URL: 'https://moneza-backend.onrender.com',
  PAYMENT_SUCCESS_URL: 'https://moneza-backend.onrender.com/payment/success',
  PAYMENT_FAILURE_URL: 'https://moneza-backend.onrender.com/payment/failure',
  PAYMENT_WEBHOOK_URL: 'https://moneza-backend.onrender.com/payment/webhook',
  
  // Production Settings
  DEFAULT_CURRENCY: 'INR',
  DEFAULT_COUNTRY: 'IN',
  
  // Production Debug Settings
  DEBUG_MODE: false,
  LOG_PAYMENT_EVENTS: false,
};

// Direct configuration getter
export const getDirectProdConfig = () => {
  return {
    appId: DIRECT_PROD_CONFIG.CASHFREE_APP_ID,
    secretKey: DIRECT_PROD_CONFIG.CASHFREE_SECRET_KEY,
    baseUrl: DIRECT_PROD_CONFIG.BASE_URLS.PROD,
    environment: 'PRODUCTION', // SDK expects this format
    defaultCurrency: DIRECT_PROD_CONFIG.DEFAULT_CURRENCY,
    paymentModes: {
      UPI: true,
      CARD: true,
      NET_BANKING: true,
      WALLET: true,
      PAY_LATER: true,
    },
    returnUrls: {
      SUCCESS: DIRECT_PROD_CONFIG.PAYMENT_SUCCESS_URL,
      FAILURE: DIRECT_PROD_CONFIG.PAYMENT_FAILURE_URL,
    },
    notifyUrl: DIRECT_PROD_CONFIG.PAYMENT_WEBHOOK_URL,
  };
};

export default DIRECT_PROD_CONFIG;

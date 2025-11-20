import { ENV_CONFIG, getCurrentEnvironmentConfig } from './env.js';

// Cashfree Payout Configuration
export const PayoutConfig = {
  // Environment - 'TEST' for sandbox, 'PROD' for production
  ENVIRONMENT: ENV_CONFIG.ENVIRONMENT,

  // Cashfree Payout Credentials (same as payment credentials)
  APP_ID: ENV_CONFIG.CASHFREE_APP_ID,
  SECRET_KEY: ENV_CONFIG.CASHFREE_SECRET_KEY,

  // Payout API Base URLs
  BASE_URLS: {
    TEST: 'https://sandbox.cashfree.com/payout',
    PROD: 'https://api.cashfree.com/payout',
  },

  // Default currency for payouts
  DEFAULT_CURRENCY: 'INR',

  // Payout modes and limits
  PAYOUT_MODES: {
    BANK_TRANSFER: true,    // NEFT/RTGS/IMPS
    UPI: true,             // UPI Payout
    WALLET: false,         // Wallet payout (if available)
  },

  // Payout limits (in INR)
  PAYOUT_LIMITS: {
    MIN_AMOUNT: 1,         // Minimum payout amount
    MAX_AMOUNT: 100000,    // Maximum payout amount per transaction
    DAILY_LIMIT: 1000000,  // Daily payout limit
  },

  // Beneficiary types supported
  BENEFICIARY_TYPES: {
    BANK_ACCOUNT: 'bank_account',
    UPI_ID: 'upi_id',
  },

  // Bank account validation
  BANK_VALIDATION: {
    REQUIRED_FIELDS: ['account_number', 'ifsc', 'account_holder_name'],
    IFSC_PATTERN: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  },

  // UPI validation
  UPI_VALIDATION: {
    REQUIRED_FIELDS: ['upi_id', 'upi_id_type'],
    UPI_ID_PATTERN: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/,
  },

  // Test beneficiary details (for sandbox only) - From Cashfree Documentation
  TEST_BENEFICIARIES: {
    BANK_ACCOUNT_SUCCESS: {
      account_number: '00011020001772',
      ifsc: 'HDFC0000001',
      account_holder_name: 'Test Beneficiary Success',
      bank_name: 'HDFC Bank',
    },
    BANK_ACCOUNT_FAILURE: {
      account_number: '026291800001190',
      ifsc: 'YESB0000262',
      account_holder_name: 'Test Beneficiary Failure',
      bank_name: 'Yes Bank',
    },
    BANK_ACCOUNT_PENDING: {
      account_number: '007711000031',
      ifsc: 'HDFC0000077',
      account_holder_name: 'Test Beneficiary Pending',
      bank_name: 'HDFC Bank',
    },
    UPI_SUCCESS: {
      upi_id: 'success@upi',
      upi_id_type: 'UPI',
    },
    UPI_FAILURE: {
      upi_id: 'failure@upi',
      upi_id_type: 'UPI',
    },
    WALLET_SUCCESS: {
      phone: '9999999999',
      wallet_type: 'PAYTM',
    },
  },

  // Payout status mapping
  PAYOUT_STATUS: {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED',
    REVERSED: 'REVERSED',
  },

  // Webhook configuration for payouts
  WEBHOOK_EVENTS: {
    PAYOUT_SUCCESS: 'payout.success',
    PAYOUT_FAILED: 'payout.failed',
    PAYOUT_PROCESSING: 'payout.processing',
  },
};

// Get current payout configuration
export const getCurrentPayoutConfig = () => {
  const environment = ENV_CONFIG.ENVIRONMENT;
  
  console.log('🔍 getCurrentPayoutConfig - Payout Mode:');
  console.log('  - ENV_CONFIG.ENVIRONMENT:', ENV_CONFIG.ENVIRONMENT);
  console.log('  - Payout API URL:', PayoutConfig.BASE_URLS[environment]);
  console.log('  - App ID:', ENV_CONFIG.CASHFREE_APP_ID);

  const config = {
    appId: ENV_CONFIG.CASHFREE_APP_ID,
    secretKey: ENV_CONFIG.CASHFREE_SECRET_KEY,
    baseUrl: PayoutConfig.BASE_URLS[environment],
    environment: environment,
    defaultCurrency: PayoutConfig.DEFAULT_CURRENCY,
    payoutModes: PayoutConfig.PAYOUT_MODES,
    payoutLimits: PayoutConfig.PAYOUT_LIMITS,
    beneficiaryTypes: PayoutConfig.BENEFICIARY_TYPES,
    bankValidation: PayoutConfig.BANK_VALIDATION,
    upiValidation: PayoutConfig.UPI_VALIDATION,
    testBeneficiaries: PayoutConfig.TEST_BENEFICIARIES,
    payoutStatus: PayoutConfig.PAYOUT_STATUS,
    webhookEvents: PayoutConfig.WEBHOOK_EVENTS,
  };
  
  console.log('🔍 Final payout config environment:', config.environment);
  console.log('🔍 Final payout config baseUrl:', config.baseUrl);
  return config;
};

// Validate payout configuration
export const validatePayoutConfig = () => {
  const config = getCurrentPayoutConfig();
  
  if (!config.appId || !config.secretKey) {
    console.error('❌ Payout configuration error: Missing App ID or Secret Key');
    return false;
  }
  
  if (!config.baseUrl) {
    console.error('❌ Payout configuration error: Missing base URL');
    return false;
  }
  
  console.log('✅ Payout configuration is valid');
  return true;
};

// Validate payout amount
export const validatePayoutAmount = (amount) => {
  const config = getCurrentPayoutConfig();
  
  if (!amount || isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Invalid amount' };
  }
  
  if (amount < config.payoutLimits.MIN_AMOUNT) {
    return { 
      valid: false, 
      error: `Minimum payout amount is ₹${config.payoutLimits.MIN_AMOUNT}` 
    };
  }
  
  if (amount > config.payoutLimits.MAX_AMOUNT) {
    return { 
      valid: false, 
      error: `Maximum payout amount is ₹${config.payoutLimits.MAX_AMOUNT}` 
    };
  }
  
  return { valid: true };
};

// Validate bank account details
export const validateBankAccount = (bankDetails) => {
  const config = getCurrentPayoutConfig();
  const requiredFields = config.bankValidation.REQUIRED_FIELDS;
  
  for (const field of requiredFields) {
    if (!bankDetails[field] || bankDetails[field].trim() === '') {
      return { valid: false, error: `${field} is required` };
    }
  }
  
  // Validate IFSC code format
  if (!config.bankValidation.IFSC_PATTERN.test(bankDetails.ifsc)) {
    return { valid: false, error: 'Invalid IFSC code format' };
  }
  
  return { valid: true };
};

// Validate UPI details
export const validateUPIDetails = (upiDetails) => {
  const config = getCurrentPayoutConfig();
  const requiredFields = config.upiValidation.REQUIRED_FIELDS;
  
  for (const field of requiredFields) {
    if (!upiDetails[field] || upiDetails[field].trim() === '') {
      return { valid: false, error: `${field} is required` };
    }
  }
  
  // Validate UPI ID format
  if (!config.upiValidation.UPI_ID_PATTERN.test(upiDetails.upi_id)) {
    return { valid: false, error: 'Invalid UPI ID format' };
  }
  
  return { valid: true };
};

export default PayoutConfig;

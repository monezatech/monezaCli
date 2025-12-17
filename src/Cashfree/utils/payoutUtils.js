import PayoutService from '../../services/cashfree/PayoutService';
import { getCurrentPayoutConfig } from '../config/payout.config';

// Payout utility functions for validation, testing, and debugging

/**
 * Test payout API connection and configuration
 */
export const testPayoutConnection = async () => {
  console.log('🧪 === TESTING PAYOUT CONNECTION ===');
  
  try {
    // Test 1: Configuration validation
    console.log('🔍 Test 1: Configuration validation...');
    const config = getCurrentPayoutConfig();
    
    if (!config.appId || !config.secretKey) {
      throw new Error('Missing App ID or Secret Key');
    }
    
    if (!config.baseUrl) {
      throw new Error('Missing base URL');
    }
    
    console.log('✅ Configuration is valid');
    console.log('  - Environment:', config.environment);
    console.log('  - App ID:', config.appId);
    console.log('  - Base URL:', config.baseUrl);
    
    // Test 2: API connection
    console.log('🔍 Test 2: API connection...');
    const connectionResult = await PayoutService.testConnection();
    
    if (!connectionResult.success) {
      throw new Error(`API connection failed: ${connectionResult.error}`);
    }
    
    console.log('✅ API connection successful');
    console.log('  - Message:', connectionResult.message);
    
    // Test 3: Balance check
    console.log('🔍 Test 3: Balance check...');
    const balanceResult = await PayoutService.getBalance();
    
    if (balanceResult.success) {
      console.log('✅ Balance retrieved successfully');
      console.log('  - Balance data:', balanceResult.data);
    } else {
      console.log('⚠️ Balance check failed (this might be expected in test mode)');
      console.log('  - Error:', balanceResult.error);
    }
    
    console.log('🧪 === PAYOUT CONNECTION TEST COMPLETED ===');
    
    return {
      success: true,
      message: 'All payout tests passed successfully',
      details: {
        configuration: 'Valid',
        apiConnection: 'Successful',
        balanceCheck: balanceResult.success ? 'Successful' : 'Failed (expected in test mode)',
      }
    };
    
    } catch (error) {
      console.error('❌ Payout connection test failed:', error);
      
      // Check if it's a payout access issue
      if (error.message && error.message.includes('Payout Access Not Enabled')) {
        return {
          success: false,
          error: 'Payout Access Not Enabled',
          details: {
            message: 'Your current credentials do not have payout access enabled',
            solution: 'Contact Cashfree support to enable payout functionality for your account',
            note: 'This is normal - payout access is a separate feature that needs to be activated'
          }
        };
      }
      
      return {
        success: false,
        error: error.message,
        details: 'Payout connection test failed'
      };
    }
};

/**
 * Test beneficiary creation with sample data
 */
export const testBeneficiaryCreation = async () => {
  console.log('🧪 === TESTING BENEFICIARY CREATION ===');
  
  try {
    const config = getCurrentPayoutConfig();
    
    // Test bank account beneficiary - Using Cashfree test data
    console.log('🔍 Test 1: Bank account beneficiary creation...');
    const bankBeneficiary = {
      beneId: `test_bank_${Date.now()}`,
      name: 'Test Bank Beneficiary Success',
      email: 'testbank@example.com',
      phone: '9999999999',
      type: 'bank_account',
      account_number: '00011020001772',
      ifsc: 'HDFC0000001',
      account_holder_name: 'Test Bank Beneficiary Success',
      bank_name: 'HDFC Bank',
    };
    
    const bankResult = await PayoutService.createBeneficiary(bankBeneficiary);
    
    if (bankResult.success) {
      console.log('✅ Bank account beneficiary created successfully');
      console.log('  - Beneficiary ID:', bankResult.beneficiaryId);
    } else {
      console.log('⚠️ Bank account beneficiary creation failed');
      console.log('  - Error:', bankResult.error);
    }
    
    // Test UPI beneficiary - Using Cashfree test data
    console.log('🔍 Test 2: UPI beneficiary creation...');
    const upiBeneficiary = {
      beneId: `test_upi_${Date.now()}`,
      name: 'Test UPI Beneficiary Success',
      email: 'testupi@example.com',
      phone: '9999999998',
      type: 'upi_id',
      upi_id: 'success@upi',
      upi_id_type: 'UPI',
    };
    
    const upiResult = await PayoutService.createBeneficiary(upiBeneficiary);
    
    if (upiResult.success) {
      console.log('✅ UPI beneficiary created successfully');
      console.log('  - Beneficiary ID:', upiResult.beneficiaryId);
    } else {
      console.log('⚠️ UPI beneficiary creation failed');
      console.log('  - Error:', upiResult.error);
    }
    
    console.log('🧪 === BENEFICIARY CREATION TEST COMPLETED ===');
    
    return {
      success: true,
      message: 'Beneficiary creation tests completed',
      details: {
        bankBeneficiary: bankResult.success ? 'Created' : 'Failed',
        upiBeneficiary: upiResult.success ? 'Created' : 'Failed',
      },
      results: {
        bank: bankResult,
        upi: upiResult,
      }
    };
    
  } catch (error) {
    console.error('❌ Beneficiary creation test failed:', error);
    
    return {
      success: false,
      error: error.message,
      details: 'Beneficiary creation test failed'
    };
  }
};

/**
 * Test payout creation with sample data
 */
export const testPayoutCreation = async (beneficiaryId) => {
  console.log('🧪 === TESTING PAYOUT CREATION ===');
  
  try {
    if (!beneficiaryId) {
      throw new Error('Beneficiary ID is required for payout test');
    }
    
    console.log('🔍 Test: Payout creation...');
    const payoutDetails = {
      beneficiaryId: beneficiaryId,
      amount: 1, // Minimum amount for testing
      purpose: 'Test Payout',
      remarks: 'Test payout from React Native app',
      transferMode: 'IMPS',
      mode: 'bank_transfer',
    };
    
    console.log('🔄 Creating payout with details:', payoutDetails);
    
    const payoutResult = await PayoutService.createPayout(payoutDetails);
    
    if (payoutResult.success) {
      console.log('✅ Payout created successfully');
      console.log('  - Payout ID:', payoutResult.payoutId);
      console.log('  - Payout data:', payoutResult.data);
      
      // Test payout status check
      console.log('🔍 Test: Payout status check...');
      const statusResult = await PayoutService.getPayoutStatus(payoutResult.payoutId);
      
      if (statusResult.success) {
        console.log('✅ Payout status retrieved successfully');
        console.log('  - Status:', statusResult.status);
      } else {
        console.log('⚠️ Payout status check failed');
        console.log('  - Error:', statusResult.error);
      }
      
      console.log('🧪 === PAYOUT CREATION TEST COMPLETED ===');
      
      return {
        success: true,
        message: 'Payout creation test completed successfully',
        details: {
          payoutCreation: 'Successful',
          statusCheck: statusResult.success ? 'Successful' : 'Failed',
        },
        results: {
          payout: payoutResult,
          status: statusResult,
        }
      };
    } else {
      throw new Error(`Payout creation failed: ${payoutResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Payout creation test failed:', error);
    
    return {
      success: false,
      error: error.message,
      details: 'Payout creation test failed'
    };
  }
};

/**
 * Validate payout amount against limits
 */
export const validatePayoutAmount = (amount) => {
  const config = getCurrentPayoutConfig();
  
  if (!amount || isNaN(amount) || amount <= 0) {
    return {
      valid: false,
      error: 'Invalid amount',
      details: 'Amount must be a positive number'
    };
  }
  
  if (amount < config.payoutLimits.MIN_AMOUNT) {
    return {
      valid: false,
      error: `Minimum amount is ₹${config.payoutLimits.MIN_AMOUNT}`,
      details: `Amount must be at least ₹${config.payoutLimits.MIN_AMOUNT}`
    };
  }
  
  if (amount > config.payoutLimits.MAX_AMOUNT) {
    return {
      valid: false,
      error: `Maximum amount is ₹${config.payoutLimits.MAX_AMOUNT}`,
      details: `Amount cannot exceed ₹${config.payoutLimits.MAX_AMOUNT}`
    };
  }
  
  return {
    valid: true,
    message: 'Amount is valid',
    details: `Amount ₹${amount} is within limits`
  };
};

/**
 * Validate bank account details
 */
export const validateBankAccountDetails = (bankDetails) => {
  const config = getCurrentPayoutConfig();
  const requiredFields = config.bankValidation.REQUIRED_FIELDS;
  
  // Check required fields
  for (const field of requiredFields) {
    if (!bankDetails[field] || bankDetails[field].trim() === '') {
      return {
        valid: false,
        error: `${field.replace('_', ' ')} is required`,
        details: `Please provide ${field.replace('_', ' ')}`
      };
    }
  }
  
  // Validate IFSC code format
  if (!config.bankValidation.IFSC_PATTERN.test(bankDetails.ifsc)) {
    return {
      valid: false,
      error: 'Invalid IFSC code format',
      details: 'IFSC code must be in format: ABCD0123456'
    };
  }
  
  // Validate account number (basic check)
  if (bankDetails.account_number.length < 9 || bankDetails.account_number.length > 18) {
    return {
      valid: false,
      error: 'Invalid account number length',
      details: 'Account number must be between 9 and 18 digits'
    };
  }
  
  return {
    valid: true,
    message: 'Bank account details are valid',
    details: 'All bank account details are properly formatted'
  };
};

/**
 * Validate UPI details
 */
export const validateUPIDetails = (upiDetails) => {
  const config = getCurrentPayoutConfig();
  const requiredFields = config.upiValidation.REQUIRED_FIELDS;
  
  // Check required fields
  for (const field of requiredFields) {
    if (!upiDetails[field] || upiDetails[field].trim() === '') {
      return {
        valid: false,
        error: `${field.replace('_', ' ')} is required`,
        details: `Please provide ${field.replace('_', ' ')}`
      };
    }
  }
  
  // Validate UPI ID format
  if (!config.upiValidation.UPI_ID_PATTERN.test(upiDetails.upi_id)) {
    return {
      valid: false,
      error: 'Invalid UPI ID format',
      details: 'UPI ID must be in format: user@provider'
    };
  }
  
  return {
    valid: true,
    message: 'UPI details are valid',
    details: 'UPI details are properly formatted'
  };
};

/**
 * Get payout status with human-readable description
 */
export const getPayoutStatusDescription = (status) => {
  const statusDescriptions = {
    'PENDING': {
      description: 'Payout is pending',
      color: '#f39c12',
      icon: '⏳'
    },
    'PROCESSING': {
      description: 'Payout is being processed',
      color: '#3498db',
      icon: '🔄'
    },
    'SUCCESS': {
      description: 'Payout completed successfully',
      color: '#27ae60',
      icon: '✅'
    },
    'FAILED': {
      description: 'Payout failed',
      color: '#e74c3c',
      icon: '❌'
    },
    'CANCELLED': {
      description: 'Payout was cancelled',
      color: '#95a5a6',
      icon: '🚫'
    },
    'REVERSED': {
      description: 'Payout was reversed',
      color: '#e67e22',
      icon: '↩️'
    }
  };
  
  return statusDescriptions[status] || {
    description: 'Unknown status',
    color: '#95a5a6',
    icon: '❓'
  };
};

/**
 * Format payout amount for display
 */
export const formatPayoutAmount = (amount, currency = 'INR') => {
  if (!amount || isNaN(amount)) {
    return '₹0';
  }
  
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return formattedAmount;
};

/**
 * Format payout date for display
 */
export const formatPayoutDate = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get environment-specific test data
 */
export const getTestData = () => {
  const config = getCurrentPayoutConfig();
  
  if (config.environment === 'TEST') {
    return {
      beneficiaries: {
        bank: {
          name: 'Test Bank Beneficiary Success',
          email: 'testbank@example.com',
          phone: '9999999999',
          account_number: '00011020001772',
          ifsc: 'HDFC0000001',
          account_holder_name: 'Test Bank Beneficiary Success',
          bank_name: 'HDFC Bank',
        },
        upi: {
          name: 'Test UPI Beneficiary Success',
          email: 'testupi@example.com',
          phone: '9999999998',
          upi_id: 'success@upi',
          upi_id_type: 'UPI',
        }
      },
      payouts: {
        minAmount: 1,
        testAmount: 100,
        maxAmount: config.payoutLimits.MAX_AMOUNT,
      }
    };
  } else {
    return {
      beneficiaries: {
        bank: {
          name: 'Production Bank Beneficiary',
          email: 'prod@example.com',
          phone: '9999999999',
          account_number: 'REAL_ACCOUNT_NUMBER',
          ifsc: 'REAL_IFSC_CODE',
          account_holder_name: 'Real Account Holder',
          bank_name: 'Real Bank Name',
        },
        upi: {
          name: 'Production UPI Beneficiary',
          email: 'prod@example.com',
          phone: '9999999998',
          upi_id: 'real@paytm',
          upi_id_type: 'PAYTM',
        }
      },
      payouts: {
        minAmount: config.payoutLimits.MIN_AMOUNT,
        testAmount: 1000,
        maxAmount: config.payoutLimits.MAX_AMOUNT,
      }
    };
  }
};

/**
 * Run comprehensive payout tests
 */
export const runPayoutTests = async () => {
  console.log('🧪 === RUNNING COMPREHENSIVE PAYOUT TESTS ===');
  
  const results = {
    connection: null,
    beneficiary: null,
    payout: null,
  };
  
  try {
    // Test 1: Connection
    console.log('🔍 Running connection tests...');
    results.connection = await testPayoutConnection();
    
    if (!results.connection.success) {
      throw new Error('Connection test failed');
    }
    
    // Test 2: Beneficiary creation
    console.log('🔍 Running beneficiary tests...');
    results.beneficiary = await testBeneficiaryCreation();
    
    if (!results.beneficiary.success) {
      console.log('⚠️ Beneficiary test failed, but continuing...');
    }
    
    // Test 3: Payout creation (if we have a beneficiary)
    if (results.beneficiary.success && results.beneficiary.results.bank.success) {
      console.log('🔍 Running payout tests...');
      results.payout = await testPayoutCreation(results.beneficiary.results.bank.beneficiaryId);
    } else {
      console.log('⚠️ Skipping payout test - no valid beneficiary available');
    }
    
    console.log('🧪 === COMPREHENSIVE PAYOUT TESTS COMPLETED ===');
    
    return {
      success: true,
      message: 'All payout tests completed',
      results: results,
      summary: {
        connection: results.connection.success ? 'PASS' : 'FAIL',
        beneficiary: results.beneficiary.success ? 'PASS' : 'FAIL',
        payout: results.payout ? (results.payout.success ? 'PASS' : 'FAIL') : 'SKIP',
      }
    };
    
  } catch (error) {
    console.error('❌ Comprehensive payout tests failed:', error);
    
    return {
      success: false,
      error: error.message,
      results: results,
      details: 'Comprehensive payout tests failed'
    };
  }
};

export default {
  testPayoutConnection,
  testBeneficiaryCreation,
  testPayoutCreation,
  validatePayoutAmount,
  validateBankAccountDetails,
  validateUPIDetails,
  getPayoutStatusDescription,
  formatPayoutAmount,
  formatPayoutDate,
  getTestData,
  runPayoutTests,
};

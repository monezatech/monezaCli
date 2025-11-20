// Debug Environment Utility
// This helps diagnose environment configuration issues

import { getCurrentEnvironmentConfig } from '../config/env.js';
import { getCurrentConfig } from '../config/cashfree.config.js';

export const debugEnvironment = () => {
  console.log('🔍 === ENVIRONMENT DEBUG ===');
  
  // Get current environment config
  const envConfig = getCurrentEnvironmentConfig();
  const cashfreeConfig = getCurrentConfig();
  
  console.log('📋 Environment Config:');
  console.log('  - ENVIRONMENT:', envConfig.ENVIRONMENT);
  console.log('  - APP_ID:', envConfig.CASHFREE_APP_ID);
  console.log('  - SECRET_KEY:', envConfig.CASHFREE_SECRET_KEY ? `${envConfig.CASHFREE_SECRET_KEY.substring(0, 20)}...` : 'NOT SET');
  console.log('  - BACKEND_URL:', envConfig.BACKEND_BASE_URL);
  
  console.log('📋 Cashfree Config:');
  console.log('  - Environment:', cashfreeConfig.environment);
  console.log('  - App ID:', cashfreeConfig.appId);
  console.log('  - Base URL:', cashfreeConfig.baseUrl);
  console.log('  - Success URL:', cashfreeConfig.returnUrls.SUCCESS);
  console.log('  - Webhook URL:', cashfreeConfig.notifyUrl);
  
  // Check for common issues
  console.log('🔍 === ISSUE DETECTION ===');
  
  // Check if using test credentials in production
  if (envConfig.ENVIRONMENT === 'PROD' && envConfig.CASHFREE_APP_ID.includes('TEST')) {
    console.error('❌ ISSUE: Using TEST credentials in PRODUCTION mode!');
  }
  
  // Check if using production credentials in test
  if (envConfig.ENVIRONMENT === 'TEST' && envConfig.CASHFREE_APP_ID.includes('PROD')) {
    console.error('❌ ISSUE: Using PRODUCTION credentials in TEST mode!');
  }
  
  // Check if environment matches
  if (envConfig.ENVIRONMENT === 'PROD' && cashfreeConfig.environment === 'SANDBOX') {
    console.error('❌ ISSUE: Environment mismatch! Config says PROD but SDK says SANDBOX');
  }
  
  // Check if using placeholder URLs
  if (envConfig.BACKEND_BASE_URL.includes('your-actual-domain.com') || 
      envConfig.BACKEND_BASE_URL.includes('your-production-domain.com')) {
    console.error('❌ ISSUE: Using placeholder backend URLs!');
  }
  
  // Check if credentials are properly set
  if (!envConfig.CASHFREE_APP_ID || !envConfig.CASHFREE_SECRET_KEY) {
    console.error('❌ ISSUE: Missing credentials!');
  }
  
  console.log('🔍 === END DEBUG ===');
  
  return {
    envConfig,
    cashfreeConfig,
    issues: []
  };
};

export default debugEnvironment;

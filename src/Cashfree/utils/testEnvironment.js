// Test Environment Configuration
// This will help us debug what's actually happening

import { getCurrentEnvironmentConfig } from '../config/env.js';
import { getCurrentConfig } from '../config/cashfree.config.js';

export const testEnvironment = () => {
  console.log('🧪 === ENVIRONMENT TEST ===');
  
  // Test 1: Check environment config
  const envConfig = getCurrentEnvironmentConfig();
  console.log('Test 1 - Environment Config:');
  console.log('  - ENVIRONMENT:', envConfig.ENVIRONMENT);
  console.log('  - APP_ID:', envConfig.CASHFREE_APP_ID);
  console.log('  - SECRET_KEY starts with:', envConfig.CASHFREE_SECRET_KEY?.substring(0, 20) + '...');
  
  // Test 2: Check Cashfree config
  const cashfreeConfig = getCurrentConfig();
  console.log('Test 2 - Cashfree Config:');
  console.log('  - environment:', cashfreeConfig.environment);
  console.log('  - appId:', cashfreeConfig.appId);
  console.log('  - baseUrl:', cashfreeConfig.baseUrl);
  
  // Test 3: Check if credentials match environment
  console.log('Test 3 - Credential Validation:');
  const isProdAppId = envConfig.CASHFREE_APP_ID.includes('PROD') || !envConfig.CASHFREE_APP_ID.includes('TEST');
  const isProdSecret = envConfig.CASHFREE_SECRET_KEY.includes('prod_');
  const isProdEnvironment = envConfig.ENVIRONMENT === 'PROD';
  
  console.log('  - Is PROD App ID:', isProdAppId);
  console.log('  - Is PROD Secret:', isProdSecret);
  console.log('  - Is PROD Environment:', isProdEnvironment);
  
  // Test 4: Check for mismatches
  console.log('Test 4 - Mismatch Detection:');
  if (isProdEnvironment && !isProdAppId) {
    console.error('❌ MISMATCH: PROD environment but TEST App ID');
  }
  if (isProdEnvironment && !isProdSecret) {
    console.error('❌ MISMATCH: PROD environment but TEST Secret');
  }
  if (cashfreeConfig.environment === 'SANDBOX' && isProdEnvironment) {
    console.error('❌ MISMATCH: Environment config says PROD but Cashfree config says SANDBOX');
  }
  
  console.log('🧪 === END TEST ===');
  
  return {
    envConfig,
    cashfreeConfig,
    isProdAppId,
    isProdSecret,
    isProdEnvironment
  };
};

export default testEnvironment;

// Verify Configuration
// This will verify that the configuration is correct for production

import { ENV_CONFIG } from '../config/env.js';
import { getCurrentConfig } from '../config/cashfree.config.js';

export const verifyConfig = () => {
  console.log('🔍 === CONFIGURATION VERIFICATION ===');
  
  // Check ENV_CONFIG
  console.log('ENV_CONFIG:');
  console.log('  - ENVIRONMENT:', ENV_CONFIG.ENVIRONMENT);
  console.log('  - APP_ID:', ENV_CONFIG.CASHFREE_APP_ID);
  console.log('  - SECRET_KEY starts with:', ENV_CONFIG.CASHFREE_SECRET_KEY?.substring(0, 20) + '...');
  console.log('  - BACKEND_URL:', ENV_CONFIG.BACKEND_BASE_URL);
  
  // Check getCurrentConfig
  const config = getCurrentConfig();
  console.log('getCurrentConfig:');
  console.log('  - environment:', config.environment);
  console.log('  - appId:', config.appId);
  console.log('  - baseUrl:', config.baseUrl);
  
  // Verify production setup
  const isProductionSetup = (
    ENV_CONFIG.ENVIRONMENT === 'PROD' &&
    ENV_CONFIG.CASHFREE_APP_ID === '9866241965681a9ce16b5db597426689' &&
    ENV_CONFIG.CASHFREE_SECRET_KEY.includes('prod_') &&
    config.environment === 'PRODUCTION' &&
    config.baseUrl === 'https://api.cashfree.com/pg'
  );
  
  console.log('✅ Production setup verified:', isProductionSetup);
  
  if (isProductionSetup) {
    console.log('🎉 Configuration is correct for production!');
  } else {
    console.error('❌ Configuration issues detected!');
  }
  
  console.log('🔍 === END VERIFICATION ===');
  
  return isProductionSetup;
};

export default verifyConfig;

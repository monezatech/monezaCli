// Test Direct Production Configuration
import { getDirectProdConfig } from '../config/directProdConfig.js';

export const testDirectConfig = () => {
  console.log('🧪 === DIRECT CONFIG TEST ===');
  
  const config = getDirectProdConfig();
  
  console.log('Direct Config:');
  console.log('  - environment:', config.environment);
  console.log('  - appId:', config.appId);
  console.log('  - baseUrl:', config.baseUrl);
  console.log('  - successUrl:', config.returnUrls.SUCCESS);
  console.log('  - webhookUrl:', config.notifyUrl);
  
  // Validate
  const isValid = (
    config.environment === 'PRODUCTION' &&
    config.appId === '9866241965681a9ce16b5db597426689' &&
    config.baseUrl === 'https://api.cashfree.com/pg'
  );
  
  console.log('✅ Config is valid:', isValid);
  console.log('🧪 === END DIRECT TEST ===');
  
  return { config, isValid };
};

export default testDirectConfig;

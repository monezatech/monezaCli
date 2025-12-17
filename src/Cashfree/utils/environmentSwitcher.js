// Environment Switcher Utility
// This utility helps switch between TEST and PRODUCTION environments

import { getCurrentEnvironmentConfig, isDevelopment, isProduction } from '../config/env.js';

export class EnvironmentSwitcher {
  static getCurrentEnvironment() {
    const config = getCurrentEnvironmentConfig();
    return config.ENVIRONMENT;
  }

  static isTestEnvironment() {
    return this.getCurrentEnvironment() === 'TEST';
  }

  static isProductionEnvironment() {
    return this.getCurrentEnvironment() === 'PROD';
  }

  static getEnvironmentInfo() {
    const config = getCurrentEnvironmentConfig();
    const environment = this.getCurrentEnvironment();
    
    return {
      environment,
      isTest: this.isTestEnvironment(),
      isProduction: this.isProductionEnvironment(),
      appId: config.CASHFREE_APP_ID,
      baseUrl: config.BASE_URLS[environment],
      backendUrl: config.BACKEND_BASE_URL,
      debugMode: config.DEBUG_MODE,
      logEvents: config.LOG_PAYMENT_EVENTS,
    };
  }

  static logEnvironmentInfo() {
    const info = this.getEnvironmentInfo();
    
    console.log('🔧 Environment Information:');
    console.log(`  Environment: ${info.environment}`);
    console.log(`  App ID: ${info.appId}`);
    console.log(`  Base URL: ${info.baseUrl}`);
    console.log(`  Backend URL: ${info.backendUrl}`);
    console.log(`  Debug Mode: ${info.debugMode}`);
    console.log(`  Log Events: ${info.logEvents}`);
    
    if (info.isProduction) {
      console.log('⚠️ Running in PRODUCTION mode');
    } else {
      console.log('🧪 Running in TEST mode');
    }
  }

  static validateCurrentEnvironment() {
    const environment = this.getCurrentEnvironment();
    const config = getCurrentEnvironmentConfig();
    
    console.log(`🔍 Validating ${environment} environment...`);
    
    // Check if credentials are configured
    if (config.CASHFREE_APP_ID.includes('YOUR_ACTUAL') || config.CASHFREE_APP_ID.includes('TEST1065018594deb01d9b8a8bbd82fe58105601')) {
      if (environment === 'PROD') {
        console.error('❌ Production App ID not configured properly');
        return false;
      } else {
        console.warn('⚠️ Using default test App ID');
      }
    }
    
    if (config.CASHFREE_SECRET_KEY.includes('YOUR_ACTUAL') || config.CASHFREE_SECRET_KEY.includes('cfsk_ma_test_67cb3c92687b06797940b0a162545fc8_1032d4d0')) {
      if (environment === 'PROD') {
        console.error('❌ Production Secret Key not configured properly');
        return false;
      } else {
        console.warn('⚠️ Using default test Secret Key');
      }
    }
    
    // Check if backend URLs are configured
    if (config.BACKEND_BASE_URL.includes('your-production-domain.com')) {
      if (environment === 'PROD') {
        console.error('❌ Production backend URL not configured properly');
        return false;
      } else {
        console.warn('⚠️ Using default test backend URL');
      }
    }
    
    console.log(`✅ ${environment} environment validation passed`);
    return true;
  }

  static getEnvironmentWarning() {
    const environment = this.getCurrentEnvironment();
    
    if (environment === 'PROD') {
      return {
        type: 'warning',
        message: '⚠️ You are running in PRODUCTION mode. Make sure you have configured production credentials and URLs.',
        color: '#ff6b35'
      };
    } else {
      return {
        type: 'info',
        message: '🧪 You are running in TEST mode. This is safe for development and testing.',
        color: '#4ecdc4'
      };
    }
  }
}

export default EnvironmentSwitcher;

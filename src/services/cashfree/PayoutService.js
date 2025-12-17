import axios from 'axios';
import {
  getCurrentPayoutConfig,
  validatePayoutConfig,
  validatePayoutAmount,
  validateBankAccount,
  validateUPIDetails,
} from '../../Cashfree/config/payout.config.js';

class PayoutService {
  constructor() {
    // Use dynamic configuration based on environment
    this.config = getCurrentPayoutConfig();
    this.baseUrl = this.config.baseUrl;

    console.log('🚀 PayoutService initialized');
    console.log('🔍 Payout configuration:');
    console.log('  - environment:', this.config.environment);
    console.log('  - appId:', this.config.appId);
    console.log('  - baseUrl:', this.config.baseUrl);
    console.log('  - payoutModes:', this.config.payoutModes);

    // Validate configuration
    if (!validatePayoutConfig()) {
      throw new Error('Invalid payout configuration');
    }
  }

  // Get authentication headers for Cashfree Payout API
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': this.config.appId,
      'x-client-secret': this.config.secretKey,
    };
  }

  // Create a beneficiary for payouts
  async createBeneficiary(beneficiaryDetails) {
    try {
      console.log('🔄 Creating beneficiary...');
      console.log('🔍 Beneficiary details:', beneficiaryDetails);

      // Validate beneficiary details based on type
      let validation;
      if (
        beneficiaryDetails.type === this.config.beneficiaryTypes.BANK_ACCOUNT
      ) {
        validation = validateBankAccount(beneficiaryDetails);
      } else if (
        beneficiaryDetails.type === this.config.beneficiaryTypes.UPI_ID
      ) {
        validation = validateUPIDetails(beneficiaryDetails);
      } else {
        throw new Error('Invalid beneficiary type');
      }

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Prepare beneficiary data for API
      const beneficiaryData = {
        beneId:
          beneficiaryDetails.beneId ||
          `bene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: beneficiaryDetails.name,
        email: beneficiaryDetails.email,
        phone: beneficiaryDetails.phone,
        address1: beneficiaryDetails.address1 || 'Test Address',
        city: beneficiaryDetails.city || 'Mumbai',
        state: beneficiaryDetails.state || 'Maharashtra',
        pincode: beneficiaryDetails.pincode || '400001',
      };

      // Add type-specific details
      if (
        beneficiaryDetails.type === this.config.beneficiaryTypes.BANK_ACCOUNT
      ) {
        beneficiaryData.bankAccount = {
          accountNumber: beneficiaryDetails.account_number,
          ifsc: beneficiaryDetails.ifsc,
          accountHolder: beneficiaryDetails.account_holder_name,
          bankName: beneficiaryDetails.bank_name || 'Unknown Bank',
        };
      } else if (
        beneficiaryDetails.type === this.config.beneficiaryTypes.UPI_ID
      ) {
        beneficiaryData.upiId = beneficiaryDetails.upi_id;
        beneficiaryData.upiIdType = beneficiaryDetails.upi_id_type || 'UPI';
      }

      console.log('🔄 Beneficiary payload:', beneficiaryData);
      console.log(
        '🔄 Creating beneficiary at:',
        `${this.baseUrl}/beneficiaries`,
      );

      const response = await axios.post(
        `${this.baseUrl}/beneficiaries`,
        beneficiaryData,
        {
          headers: this.getAuthHeaders(),
          timeout: 30000,
        },
      );

      console.log('✅ Beneficiary created successfully:', response.data);
      return {
        success: true,
        data: response.data,
        beneficiaryId: response.data.beneId,
      };
    } catch (error) {
      console.error('❌ Beneficiary creation failed:', error);

      if (error.response && error.response.status === 401) {
        // Mark this error to be ignored by the global auth interceptor
        error.config._ignoreAuthError = true;
      }

      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
        throw new Error(
          `Beneficiary creation failed: ${
            error.response.data.message || 'Unknown API error'
          }`,
        );
      } else if (error.request) {
        throw new Error('Network error: Please check your connection');
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  }

  // Get beneficiary details
  async getBeneficiary(beneficiaryId) {
    try {
      console.log('🔍 Getting beneficiary details for:', beneficiaryId);

      const response = await axios.get(
        `${this.baseUrl}/beneficiaries/${beneficiaryId}`,
        {
          headers: this.getAuthHeaders(),
          timeout: 15000,
        },
      );

      console.log('✅ Beneficiary details retrieved:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Failed to get beneficiary:', error);

      if (error.response && error.response.status === 401) {
        error.config._ignoreAuthError = true;
      }

      if (error.response) {
        return {
          success: false,
          error: `Failed to get beneficiary: ${
            error.response.data.message || 'Unknown API error'
          }`,
          details: error.response.data,
          status: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error during beneficiary retrieval',
          details: 'Unable to reach Cashfree servers',
          status: 'network_error',
        };
      } else {
        return {
          success: false,
          error: 'Beneficiary retrieval request error',
          details: error.message,
          status: 'request_error',
        };
      }
    }
  }

  // List all beneficiaries
  async listBeneficiaries() {
    try {
      console.log('🔍 Listing all beneficiaries...');

      const response = await axios.get(`${this.baseUrl}/beneficiaries`, {
        headers: this.getAuthHeaders(),
        timeout: 15000,
      });

      console.log('✅ Beneficiaries listed successfully:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Failed to list beneficiaries:', error);

      if (error.response && error.response.status === 401) {
        error.config._ignoreAuthError = true;
      }

      if (error.response) {
        return {
          success: false,
          error: `Failed to list beneficiaries: ${
            error.response.data.message || 'Unknown API error'
          }`,
          details: error.response.data,
          status: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error during beneficiaries listing',
          details: 'Unable to reach Cashfree servers',
          status: 'network_error',
        };
      } else {
        return {
          success: false,
          error: 'Beneficiaries listing request error',
          details: error.message,
          status: 'request_error',
        };
      }
    }
  }

  // Create a payout
  async createPayout(payoutDetails) {
    try {
      console.log('🔄 Creating payout...');
      console.log('🔍 Payout details:', payoutDetails);

      // Validate payout amount
      const amountValidation = validatePayoutAmount(payoutDetails.amount);
      if (!amountValidation.valid) {
        throw new Error(amountValidation.error);
      }

      // Generate payout ID
      const payoutId =
        payoutDetails.payoutId ||
        `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare payout data for API
      const payoutData = {
        payoutId: payoutId,
        beneId: payoutDetails.beneficiaryId,
        amount: payoutDetails.amount,
        currency: payoutDetails.currency || this.config.defaultCurrency,
        mode: payoutDetails.mode || 'bank_transfer', // bank_transfer, upi, wallet
        purpose: payoutDetails.purpose || 'Payout',
        remarks: payoutDetails.remarks || 'Payout from React Native app',
        transferMode: payoutDetails.transferMode || 'IMPS', // IMPS, NEFT, RTGS
        notifyUrl:
          payoutDetails.notifyUrl || `${this.config.baseUrl}/webhook/payout`,
      };

      console.log('🔄 Payout payload:', payoutData);
      console.log('🔄 Creating payout at:', `${this.baseUrl}/payouts`);

      const response = await axios.post(`${this.baseUrl}/payouts`, payoutData, {
        headers: this.getAuthHeaders(),
        timeout: 30000,
      });

      console.log('✅ Payout created successfully:', response.data);
      return {
        success: true,
        data: response.data,
        payoutId: payoutId,
      };
    } catch (error) {
      console.error('❌ Payout creation failed:', error);

      if (error.response && error.response.status === 401) {
        error.config._ignoreAuthError = true;
      }

      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data);
        throw new Error(
          `Payout creation failed: ${
            error.response.data.message || 'Unknown API error'
          }`,
        );
      } else if (error.request) {
        throw new Error('Network error: Please check your connection');
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  }

  // Get payout status
  async getPayoutStatus(payoutId) {
    try {
      console.log('🔍 Getting payout status for:', payoutId);

      const response = await axios.get(`${this.baseUrl}/payouts/${payoutId}`, {
        headers: this.getAuthHeaders(),
        timeout: 15000,
      });

      console.log('✅ Payout status retrieved:', response.data);
      return {
        success: true,
        data: response.data,
        status: response.data.status,
        payoutId: payoutId,
      };
    } catch (error) {
      console.error('❌ Failed to get payout status:', error);

      if (error.response && error.response.status === 401) {
        error.config._ignoreAuthError = true;
      }

      if (error.response) {
        return {
          success: false,
          error: `Failed to get payout status: ${
            error.response.data.message || 'Unknown API error'
          }`,
          details: error.response.data,
          status: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error during payout status check',
          details: 'Unable to reach Cashfree servers',
          status: 'network_error',
        };
      } else {
        return {
          success: false,
          error: 'Payout status request error',
          details: error.message,
          status: 'request_error',
        };
      }
    }
  }

  // List all payouts
  async listPayouts(filters = {}) {
    try {
      console.log('🔍 Listing payouts with filters:', filters);

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.beneId) params.append('beneId', filters.beneId);
      if (filters.fromDate) params.append('fromDate', filters.fromDate);
      if (filters.toDate) params.append('toDate', filters.toDate);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const url = `${this.baseUrl}/payouts${
        params.toString() ? '?' + params.toString() : ''
      }`;

      const response = await axios.get(url, {
        headers: this.getAuthHeaders(),
        timeout: 15000,
      });

      console.log('✅ Payouts listed successfully:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Failed to list payouts:', error);

      if (error.response && error.response.status === 401) {
        error.config._ignoreAuthError = true;
      }

      if (error.response) {
        return {
          success: false,
          error: `Failed to list payouts: ${
            error.response.data.message || 'Unknown API error'
          }`,
          details: error.response.data,
          status: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error during payouts listing',
          details: 'Unable to reach Cashfree servers',
          status: 'network_error',
        };
      } else {
        return {
          success: false,
          error: 'Payouts listing request error',
          details: error.message,
          status: 'request_error',
        };
      }
    }
  }

  // Cancel a payout
  async cancelPayout(payoutId) {
    try {
      console.log('🔄 Cancelling payout:', payoutId);

      const response = await axios.post(
        `${this.baseUrl}/payouts/${payoutId}/cancel`,
        {},
        {
          headers: this.getAuthHeaders(),
          timeout: 15000,
        },
      );

      console.log('✅ Payout cancelled successfully:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Failed to cancel payout:', error);

      if (error.response && error.response.status === 401) {
        error.config._ignoreAuthError = true;
      }

      if (error.response) {
        return {
          success: false,
          error: `Failed to cancel payout: ${
            error.response.data.message || 'Unknown API error'
          }`,
          details: error.response.data,
          status: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error during payout cancellation',
          details: 'Unable to reach Cashfree servers',
          status: 'network_error',
        };
      } else {
        return {
          success: false,
          error: 'Payout cancellation request error',
          details: error.message,
          status: 'request_error',
        };
      }
    }
  }

  // Test payout API connection
  async testConnection() {
    try {
      console.log('🔧 Testing Cashfree Payout API connection...');

      // Try to list beneficiaries to test connection
      const response = await axios.get(
        `${this.baseUrl}/beneficiaries?limit=1`,
        {
          headers: this.getAuthHeaders(),
          timeout: 10000,
        },
      );

      console.log('✅ Payout API connection test successful:', response.data);
      return {
        success: true,
        message: 'Successfully connected to Cashfree Payout API',
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Payout API connection test failed:', error);

      if (error.response && error.response.status === 401) {
        error.config._ignoreAuthError = true;
      }

      if (error.response) {
        // Handle specific payout access issues
        if (
          error.response.status === 403 &&
          error.response.data?.message === 'Token is not valid'
        ) {
          return {
            success: false,
            error: 'Payout Access Not Enabled',
            details: {
              message:
                'Your current credentials do not have payout access enabled',
              solution:
                'Contact Cashfree support to enable payout functionality for your account',
              status: error.response.status,
              data: error.response.data,
            },
            requiresAction: true,
          };
        }

        return {
          success: false,
          error: `API Error: ${error.response.status}`,
          details: error.response.data,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error',
          details: 'Unable to reach Cashfree Payout servers',
        };
      } else {
        return {
          success: false,
          error: 'Request error',
          details: error.message,
        };
      }
    }
  }

  // Get payout balance
  async getBalance() {
    try {
      console.log('🔍 Getting payout balance...');

      const response = await axios.get(`${this.baseUrl}/balance`, {
        headers: this.getAuthHeaders(),
        timeout: 15000,
      });

      console.log('✅ Payout balance retrieved:', response.data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Failed to get payout balance:', error);

      if (error.response && error.response.status === 401) {
        error.config._ignoreAuthError = true;
      }

      if (error.response) {
        return {
          success: false,
          error: `Failed to get balance: ${
            error.response.data.message || 'Unknown API error'
          }`,
          details: error.response.data,
          status: error.response.status,
        };
      } else if (error.request) {
        return {
          success: false,
          error: 'Network error during balance check',
          details: 'Unable to reach Cashfree servers',
          status: 'network_error',
        };
      } else {
        return {
          success: false,
          error: 'Balance request error',
          details: error.message,
          status: 'request_error',
        };
      }
    }
  }

  // Get environment information
  getEnvironmentInfo() {
    return {
      environment: this.config.environment,
      appId: this.config.appId,
      baseUrl: this.config.baseUrl,
      payoutModes: this.config.payoutModes,
      payoutLimits: this.config.payoutLimits,
    };
  }

  // Check if running in production mode
  isProductionMode() {
    return this.config.environment === 'PROD';
  }
}

export default new PayoutService();

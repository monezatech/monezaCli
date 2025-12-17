import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import PayoutService from '../../services/cashfree/PayoutService';
import { runPayoutTests, testPayoutConnection, testBeneficiaryCreation, testPayoutCreation } from '../utils/payoutUtils';
import { getCurrentPayoutConfig } from '../config/payout.config';

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: any;
  results?: any;
  summary?: any;
}

const PayoutTestingPanel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [environmentInfo, setEnvironmentInfo] = useState<any>(null);

  React.useEffect(() => {
    loadEnvironmentInfo();
  }, []);

  const loadEnvironmentInfo = () => {
    const config = getCurrentPayoutConfig();
    setEnvironmentInfo({
      environment: config.environment,
      appId: config.appId,
      baseUrl: config.baseUrl,
      payoutModes: config.payoutModes,
      payoutLimits: config.payoutLimits,
    });
  };

  const handleRunAllTests = async () => {
    try {
      setLoading(true);
      console.log('🧪 Running comprehensive payout tests...');
      
      const results = await runPayoutTests();
      setTestResults(results);
      setShowResults(true);
      
      if (results.success) {
        Alert.alert(
          '✅ All Tests Completed',
          `Tests Summary:\n• Connection: ${results.summary.connection}\n• Beneficiary: ${results.summary.beneficiary}\n• Payout: ${results.summary.payout}\n\nCheck detailed results for more information.`
        );
      } else {
        Alert.alert(
          '❌ Tests Failed',
          `Error: ${results.error}\n\nCheck detailed results for more information.`
        );
      }
    } catch (error: any) {
      console.error('Test execution failed:', error);
      Alert.alert('Test Execution Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      console.log('🔧 Testing payout connection...');
      
      const result = await testPayoutConnection();
      
      if (result.success) {
        Alert.alert(
          '✅ Connection Test Successful',
          `Message: ${result.message}\n\nDetails:\n• Configuration: ${result.details.configuration}\n• API Connection: ${result.details.apiConnection}\n• Balance Check: ${result.details.balanceCheck}`
        );
      } else {
        // Handle payout access issues
        if (result.error && result.error.includes('Payout Access Not Enabled')) {
          Alert.alert(
            '⚠️ Payout Access Not Enabled',
            `Your payment functionality is working perfectly, but payout access needs to be enabled separately.\n\nError: ${result.error}\n\nSolution: Contact Cashfree support to enable payout functionality for your account.\n\nThis is normal - payout access is a separate feature that needs to be activated.`,
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Learn More', 
                style: 'default',
                onPress: () => {
                  console.log('User wants to learn more about payout access');
                }
              }
            ]
          );
        } else {
          Alert.alert(
            '❌ Connection Test Failed',
            `Error: ${result.error}\n\nDetails: ${result.details}`
          );
        }
      }
    } catch (error: any) {
      console.error('Connection test failed:', error);
      Alert.alert('Connection Test Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestBeneficiary = async () => {
    try {
      setLoading(true);
      console.log('👥 Testing beneficiary creation...');
      
      const result = await testBeneficiaryCreation();
      
      if (result.success) {
        Alert.alert(
          '✅ Beneficiary Test Completed',
          `Message: ${result.message}\n\nDetails:\n• Bank Beneficiary: ${result.details.bankBeneficiary}\n• UPI Beneficiary: ${result.details.upiBeneficiary}`
        );
      } else {
        Alert.alert(
          '❌ Beneficiary Test Failed',
          `Error: ${result.error}\n\nDetails: ${result.details}`
        );
      }
    } catch (error: any) {
      console.error('Beneficiary test failed:', error);
      Alert.alert('Beneficiary Test Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestPayout = async () => {
    try {
      setLoading(true);
      console.log('💸 Testing payout creation...');
      
      // First, try to get a beneficiary ID
      const beneficiariesResult = await PayoutService.listBeneficiaries();
      
      if (!beneficiariesResult.success || !beneficiariesResult.data || beneficiariesResult.data.length === 0) {
        Alert.alert(
          '⚠️ No Beneficiaries Found',
          'Please create a beneficiary first before testing payouts.\n\nYou can create a beneficiary in the Payouts tab.'
        );
        return;
      }
      
      const beneficiaryId = beneficiariesResult.data[0].beneId;
      const result = await testPayoutCreation(beneficiaryId);
      
      if (result.success) {
        Alert.alert(
          '✅ Payout Test Completed',
          `Message: ${result.message}\n\nDetails:\n• Payout Creation: ${result.details.payoutCreation}\n• Status Check: ${result.details.statusCheck}`
        );
      } else {
        Alert.alert(
          '❌ Payout Test Failed',
          `Error: ${result.error}\n\nDetails: ${result.details}`
        );
      }
    } catch (error: any) {
      console.error('Payout test failed:', error);
      Alert.alert('Payout Test Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTestBalance = async () => {
    try {
      setLoading(true);
      console.log('💰 Testing balance retrieval...');
      
      const result = await PayoutService.getBalance();
      
      if (result.success) {
        Alert.alert(
          '✅ Balance Retrieved',
          `Balance data retrieved successfully.\n\nCheck console for detailed balance information.`
        );
        console.log('💰 Balance data:', result.data);
      } else {
        Alert.alert(
          '⚠️ Balance Check Failed',
          `Error: ${result.error}\n\nThis might be expected in test mode.`
        );
      }
    } catch (error: any) {
      console.error('Balance test failed:', error);
      Alert.alert('Balance Test Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderTestResults = () => {
    if (!testResults) return null;

    return (
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results</Text>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultLabel}>Overall Status:</Text>
          <Text style={[
            styles.resultValue,
            { color: testResults.success ? '#27ae60' : '#e74c3c' }
          ]}>
            {testResults.success ? '✅ PASS' : '❌ FAIL'}
          </Text>
        </View>

        {testResults.message && (
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Message:</Text>
            <Text style={styles.resultValue}>{testResults.message}</Text>
          </View>
        )}

        {testResults.error && (
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Error:</Text>
            <Text style={[styles.resultValue, { color: '#e74c3c' }]}>{testResults.error}</Text>
          </View>
        )}

        {testResults.summary && (
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Summary:</Text>
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryItem}>
                Connection: {testResults.summary.connection}
              </Text>
              <Text style={styles.summaryItem}>
                Beneficiary: {testResults.summary.beneficiary}
              </Text>
              <Text style={styles.summaryItem}>
                Payout: {testResults.summary.payout}
              </Text>
            </View>
          </View>
        )}

        {testResults.details && (
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Details:</Text>
            <Text style={styles.resultValue}>
              {JSON.stringify(testResults.details, null, 2)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Payout Testing Panel</Text>
        <Text style={styles.subtitle}>Test and verify payout functionality</Text>
      </View>

      {/* Environment Info */}
      {environmentInfo && (
        <View style={styles.environmentCard}>
          <Text style={styles.environmentTitle}>Environment Information</Text>
          <View style={styles.environmentItem}>
            <Text style={styles.environmentLabel}>Environment:</Text>
            <Text style={[
              styles.environmentValue,
              { color: environmentInfo.environment === 'PROD' ? '#e74c3c' : '#f39c12' }
            ]}>
              {environmentInfo.environment}
            </Text>
          </View>
          <View style={styles.environmentItem}>
            <Text style={styles.environmentLabel}>App ID:</Text>
            <Text style={styles.environmentValue}>
              {environmentInfo.appId.substring(0, 8)}...
            </Text>
          </View>
          <View style={styles.environmentItem}>
            <Text style={styles.environmentLabel}>Base URL:</Text>
            <Text style={styles.environmentValue}>
              {environmentInfo.baseUrl}
            </Text>
          </View>
          <View style={styles.environmentItem}>
            <Text style={styles.environmentLabel}>Payout Limits:</Text>
            <Text style={styles.environmentValue}>
              ₹{environmentInfo.payoutLimits.MIN_AMOUNT} - ₹{environmentInfo.payoutLimits.MAX_AMOUNT}
            </Text>
          </View>
        </View>
      )}

      {/* Test Buttons */}
      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>Individual Tests</Text>
        
        <TouchableOpacity
          style={[styles.testButton, styles.primaryTestButton, loading && styles.disabledButton]}
          onPress={handleTestConnection}
          disabled={loading}>
          <Text style={styles.testButtonText}>
            {loading ? 'Testing...' : '🔧 Test Connection'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.secondaryTestButton, loading && styles.disabledButton]}
          onPress={handleTestBeneficiary}
          disabled={loading}>
          <Text style={[styles.testButtonText, styles.secondaryTestButtonText]}>
            {loading ? 'Testing...' : '👥 Test Beneficiary Creation'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.secondaryTestButton, loading && styles.disabledButton]}
          onPress={handleTestPayout}
          disabled={loading}>
          <Text style={[styles.testButtonText, styles.secondaryTestButtonText]}>
            {loading ? 'Testing...' : '💸 Test Payout Creation'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.secondaryTestButton, loading && styles.disabledButton]}
          onPress={handleTestBalance}
          disabled={loading}>
          <Text style={[styles.testButtonText, styles.secondaryTestButtonText]}>
            {loading ? 'Testing...' : '💰 Test Balance Retrieval'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comprehensive Test */}
      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>Comprehensive Test</Text>
        
        <TouchableOpacity
          style={[styles.testButton, styles.comprehensiveTestButton, loading && styles.disabledButton]}
          onPress={handleRunAllTests}
          disabled={loading}>
          <Text style={styles.testButtonText}>
            {loading ? 'Running Tests...' : '🧪 Run All Tests'}
          </Text>
        </TouchableOpacity>

        {testResults && (
          <TouchableOpacity
            style={[styles.testButton, styles.resultsButton]}
            onPress={() => setShowResults(true)}>
            <Text style={[styles.testButtonText, styles.resultsButtonText]}>
              📊 View Detailed Results
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Test Results Modal */}
      <Modal
        visible={showResults}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowResults(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Test Results</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowResults(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {renderTestResults()}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  environmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  environmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  environmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  environmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  environmentValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  testSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  testButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryTestButton: {
    backgroundColor: '#3498db',
  },
  secondaryTestButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  comprehensiveTestButton: {
    backgroundColor: '#e74c3c',
  },
  resultsButton: {
    backgroundColor: '#27ae60',
  },
  disabledButton: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryTestButtonText: {
    color: '#3498db',
  },
  resultsButtonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  summaryContainer: {
    marginTop: 8,
  },
  summaryItem: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
});

export default PayoutTestingPanel;

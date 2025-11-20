import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import PayoutService from '../../services/cashfree/PayoutService';
import {validatePayoutConfig} from '../config/payout.config';

interface Beneficiary {
  beneId: string;
  name: string;
  email: string;
  phone: string;
  type: 'bank_account' | 'upi_id';
  account_number?: string;
  ifsc?: string;
  account_holder_name?: string;
  bank_name?: string;
  upi_id?: string;
  upi_id_type?: string;
}

interface PayoutFormProps {
  onPayoutSuccess?: (payoutData: any) => void;
  onPayoutError?: (error: any) => void;
}

const PayoutForm: React.FC<PayoutFormProps> = ({ onPayoutSuccess, onPayoutError }) => {
  // Form states
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'beneficiary' | 'payout'>('beneficiary');
  
  // Beneficiary states
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);
  
  // Beneficiary form states
  const [beneficiaryName, setBeneficiaryName] = useState('Test Beneficiary Success');
  const [beneficiaryEmail, setBeneficiaryEmail] = useState('test@example.com');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('9999999999');
  const [beneficiaryType, setBeneficiaryType] = useState<'bank_account' | 'upi_id'>('bank_account');
  
  // Bank account fields - Using Cashfree test data
  const [accountNumber, setAccountNumber] = useState('00011020001772');
  const [ifscCode, setIfscCode] = useState('HDFC0000001');
  const [accountHolderName, setAccountHolderName] = useState('Test Beneficiary Success');
  const [bankName, setBankName] = useState('HDFC Bank');
  
  // UPI fields - Using Cashfree test data
  const [upiId, setUpiId] = useState('success@upi');
  const [upiIdType, setUpiIdType] = useState('UPI');
  
  // Payout states
  const [payoutAmount, setPayoutAmount] = useState('100');
  const [payoutPurpose, setPayoutPurpose] = useState('Payout');
  const [payoutRemarks, setPayoutRemarks] = useState('Test payout');
  const [transferMode, setTransferMode] = useState('IMPS');
  
  // Payout history
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [showPayoutHistory, setShowPayoutHistory] = useState(false);

  useEffect(() => {
    loadBeneficiaries();
    loadPayoutHistory();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      setLoading(true);
      const result = await PayoutService.listBeneficiaries();
      
      if (result.success) {
        setBeneficiaries(result.data || []);
        console.log('✅ Beneficiaries loaded:', result.data);
      } else {
        console.log('⚠️ No beneficiaries found or error:', result.error);
        setBeneficiaries([]);
      }
    } catch (error) {
      console.error('❌ Failed to load beneficiaries:', error);
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPayoutHistory = async () => {
    try {
      const result = await PayoutService.listPayouts({ limit: 10 });
      
      if (result.success) {
        setPayoutHistory(result.data || []);
        console.log('✅ Payout history loaded:', result.data);
      } else {
        console.log('⚠️ No payout history found or error:', result.error);
        setPayoutHistory([]);
      }
    } catch (error) {
      console.error('❌ Failed to load payout history:', error);
      setPayoutHistory([]);
    }
  };

  const handleCreateBeneficiary = async () => {
    try {
      setLoading(true);
      
      // Validate configuration
      if (!validatePayoutConfig()) {
        Alert.alert('Configuration Error', 'Please check your Cashfree payout configuration');
        return;
      }

      // Validate form inputs
      if (!beneficiaryName.trim() || !beneficiaryEmail.trim() || !beneficiaryPhone.trim()) {
        Alert.alert('Validation Error', 'Please fill in all required beneficiary fields');
        return;
      }

      const beneficiaryDetails: Beneficiary = {
        beneId: `bene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: beneficiaryName.trim(),
        email: beneficiaryEmail.trim(),
        phone: beneficiaryPhone.trim(),
        type: beneficiaryType,
        account_number: beneficiaryType === 'bank_account' ? accountNumber.trim() : undefined,
        ifsc: beneficiaryType === 'bank_account' ? ifscCode.trim() : undefined,
        account_holder_name: beneficiaryType === 'bank_account' ? accountHolderName.trim() : undefined,
        bank_name: beneficiaryType === 'bank_account' ? bankName.trim() : undefined,
        upi_id: beneficiaryType === 'upi_id' ? upiId.trim() : undefined,
        upi_id_type: beneficiaryType === 'upi_id' ? upiIdType.trim() : undefined,
      };

      console.log('🔄 Creating beneficiary with details:', beneficiaryDetails);

      const result = await PayoutService.createBeneficiary(beneficiaryDetails);
      
      if (result.success) {
        console.log('✅ Beneficiary created successfully:', result.data);
        Alert.alert(
          'Success',
          `Beneficiary created successfully!\nBeneficiary ID: ${result.beneficiaryId}`,
          [{ text: 'OK', onPress: () => {
            setShowBeneficiaryModal(false);
            loadBeneficiaries();
            resetBeneficiaryForm();
          }}]
        );
      } else {
        throw new Error(result.error || 'Failed to create beneficiary');
      }
    } catch (error: any) {
      console.error('Beneficiary creation error:', error);
      Alert.alert(
        'Beneficiary Creation Failed',
        error.message || 'Failed to create beneficiary. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayout = async () => {
    try {
      setLoading(true);
      
      // Validate configuration
      if (!validatePayoutConfig()) {
        Alert.alert('Configuration Error', 'Please check your Cashfree payout configuration');
        return;
      }

      // Validate selected beneficiary
      if (!selectedBeneficiary) {
        Alert.alert('Validation Error', 'Please select a beneficiary');
        return;
      }

      // Validate payout amount
      if (!payoutAmount.trim() || isNaN(Number(payoutAmount)) || Number(payoutAmount) <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid payout amount');
        return;
      }

      const payoutDetails = {
        beneficiaryId: selectedBeneficiary.beneId,
        amount: parseFloat(payoutAmount),
        purpose: payoutPurpose.trim() || 'Payout',
        remarks: payoutRemarks.trim() || 'Payout from React Native app',
        transferMode: transferMode,
        mode: selectedBeneficiary.type === 'bank_account' ? 'bank_transfer' : 'upi',
      };

      console.log('🔄 Creating payout with details:', payoutDetails);

      const result = await PayoutService.createPayout(payoutDetails);
      
      if (result.success) {
        console.log('✅ Payout created successfully:', result.data);
        Alert.alert(
          'Payout Initiated!',
          `Payout has been initiated successfully!\nPayout ID: ${result.payoutId}\nAmount: ₹${payoutAmount}\nBeneficiary: ${selectedBeneficiary.name}`,
          [{ 
            text: 'OK', 
            onPress: () => {
              loadPayoutHistory();
              onPayoutSuccess?.(result.data);
            }
          }]
        );
      } else {
        throw new Error(result.error || 'Failed to create payout');
      }
    } catch (error: any) {
      console.error('Payout creation error:', error);
      Alert.alert(
        'Payout Failed',
        error.message || 'Failed to create payout. Please try again.'
      );
      onPayoutError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      console.log('🔧 Testing Cashfree Payout API connection...');
      
      const result = await PayoutService.testConnection();
      
      if (result.success) {
        Alert.alert(
          '✅ Payout API Connection Test Successful',
          `API Connection: OK\nMessage: ${result.message}\n\nThis confirms:\n• Your payout credentials are working\n• You can hit Cashfree Payout APIs from your app\n• Beneficiary creation is successful\n• Payout functionality is enabled`
        );
      } else {
        // Handle specific payout access issues
        if (result.requiresAction && result.error === 'Payout Access Not Enabled') {
          Alert.alert(
            '⚠️ Payout Access Not Enabled',
            `${result.details.message}\n\n${result.details.solution}\n\nYour payment functionality is working perfectly, but payout access needs to be enabled separately.\n\nStatus: ${result.details.status}`,
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Contact Support', 
                style: 'default',
                onPress: () => {
                  // You can add a link to Cashfree support here
                  console.log('User wants to contact Cashfree support for payout access');
                }
              }
            ]
          );
        } else {
          Alert.alert(
            '❌ Payout API Connection Test Failed',
            `Error: ${result.error}\n\nDetails: ${JSON.stringify(result.details)}\n\nPlease check:\n• App ID and Secret Key\n• Network connectivity\n• Payout API endpoints`
          );
        }
      }
    } catch (error: any) {
      console.error('Payout connection test failed:', error);
      Alert.alert('Payout Connection Test Failed', error.message || 'Unable to connect to Cashfree Payout API');
    } finally {
      setLoading(false);
    }
  };

  const resetBeneficiaryForm = () => {
    setBeneficiaryName('Test Beneficiary Success');
    setBeneficiaryEmail('test@example.com');
    setBeneficiaryPhone('9999999999');
    setBeneficiaryType('bank_account');
    setAccountNumber('00011020001772');
    setIfscCode('HDFC0000001');
    setAccountHolderName('Test Beneficiary Success');
    setBankName('HDFC Bank');
    setUpiId('success@upi');
    setUpiIdType('UPI');
  };

  const renderBeneficiaryItem = ({ item }: { item: Beneficiary }) => (
    <TouchableOpacity
      style={[
        styles.beneficiaryItem,
        selectedBeneficiary?.beneId === item.beneId && styles.selectedBeneficiary
      ]}
      onPress={() => setSelectedBeneficiary(item)}>
      <View style={styles.beneficiaryInfo}>
        <Text style={styles.beneficiaryName}>{item.name}</Text>
        <Text style={styles.beneficiaryDetails}>
          {item.type === 'bank_account' 
            ? `${item.account_number} (${item.ifsc})`
            : item.upi_id
          }
        </Text>
        <Text style={styles.beneficiaryContact}>{item.email} • {item.phone}</Text>
      </View>
      <View style={styles.beneficiaryType}>
        <Text style={styles.beneficiaryTypeText}>
          {item.type === 'bank_account' ? '🏦 Bank' : '📱 UPI'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPayoutHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.payoutHistoryItem}>
      <View style={styles.payoutHistoryHeader}>
        <Text style={styles.payoutId}>ID: {item.payoutId}</Text>
        <Text style={[
          styles.payoutStatus,
          { color: item.status === 'SUCCESS' ? '#27ae60' : 
                   item.status === 'FAILED' ? '#e74c3c' : '#f39c12' }
        ]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.payoutAmount}>₹{item.amount}</Text>
      <Text style={styles.payoutDate}>
        {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Cashfree Payout Demo</Text>
        <Text style={styles.subtitle}>Send money to bank accounts and UPI IDs</Text>
      </View>

      {/* Payout Access Info Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerTitle}>🧪 TEST MODE - Payout Ready!</Text>
        <Text style={styles.infoBannerText}>
          You're now in TEST mode with valid payout credentials. Use the test data provided by Cashfree to test all payout functionality including success, failure, and pending scenarios.
        </Text>
        <TouchableOpacity
          style={styles.infoBannerButton}
          onPress={handleTestConnection}>
          <Text style={styles.infoBannerButtonText}>Test Payout Connection</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'beneficiary' && styles.activeTab]}
          onPress={() => setActiveTab('beneficiary')}>
          <Text style={[styles.tabText, activeTab === 'beneficiary' && styles.activeTabText]}>
            👥 Beneficiaries
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payout' && styles.activeTab]}
          onPress={() => setActiveTab('payout')}>
          <Text style={[styles.tabText, activeTab === 'payout' && styles.activeTabText]}>
            💸 Payouts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Beneficiary Tab */}
      {activeTab === 'beneficiary' && (
        <View style={styles.tabContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Manage Beneficiaries</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowBeneficiaryModal(true)}>
              <Text style={styles.addButtonText}>+ Add Beneficiary</Text>
            </TouchableOpacity>
          </View>

          {beneficiaries.length > 0 ? (
            <FlatList
              data={beneficiaries}
              renderItem={renderBeneficiaryItem}
              keyExtractor={(item) => item.beneId}
              style={styles.beneficiaryList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No beneficiaries found</Text>
              <Text style={styles.emptyStateSubtext}>Add a beneficiary to start making payouts</Text>
            </View>
          )}
        </View>
      )}

      {/* Payout Tab */}
      {activeTab === 'payout' && (
        <View style={styles.tabContent}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Create Payout</Text>
            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => setShowPayoutHistory(true)}>
              <Text style={styles.historyButtonText}>📋 History</Text>
            </TouchableOpacity>
          </View>

          {selectedBeneficiary ? (
            <View style={styles.selectedBeneficiaryCard}>
              <Text style={styles.selectedBeneficiaryTitle}>Selected Beneficiary</Text>
              <Text style={styles.selectedBeneficiaryName}>{selectedBeneficiary.name}</Text>
              <Text style={styles.selectedBeneficiaryDetails}>
                {selectedBeneficiary.type === 'bank_account' 
                  ? `${selectedBeneficiary.account_number} (${selectedBeneficiary.ifsc})`
                  : selectedBeneficiary.upi_id
                }
              </Text>
            </View>
          ) : (
            <View style={styles.noBeneficiaryCard}>
              <Text style={styles.noBeneficiaryText}>No beneficiary selected</Text>
              <Text style={styles.noBeneficiarySubtext}>Go to Beneficiaries tab to select one</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount (₹)</Text>
            <TextInput
              style={styles.input}
              value={payoutAmount}
              onChangeText={setPayoutAmount}
              placeholder="Enter amount"
              placeholderTextColor="#95a5a6"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Purpose</Text>
            <TextInput
              style={styles.input}
              value={payoutPurpose}
              onChangeText={setPayoutPurpose}
              placeholder="Enter purpose"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={styles.input}
              value={payoutRemarks}
              onChangeText={setPayoutRemarks}
              placeholder="Enter remarks"
              placeholderTextColor="#95a5a6"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Transfer Mode</Text>
            <View style={styles.transferModeContainer}>
              {['IMPS', 'NEFT', 'RTGS'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.transferModeButton,
                    transferMode === mode && styles.selectedTransferMode
                  ]}
                  onPress={() => setTransferMode(mode)}>
                  <Text style={[
                    styles.transferModeText,
                    transferMode === mode && styles.selectedTransferModeText
                  ]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              (loading || !selectedBeneficiary) && styles.disabledButton
            ]}
            onPress={handleCreatePayout}
            disabled={loading || !selectedBeneficiary}>
            <Text style={styles.buttonText}>
              {loading ? 'Processing...' : '💸 Create Payout'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Test Connection Button */}
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton, loading && styles.disabledButton]}
        onPress={handleTestConnection}
        disabled={loading}>
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          {loading ? 'Testing...' : '🔧 Test Payout API Connection'}
        </Text>
      </TouchableOpacity>

      {/* Add Beneficiary Modal */}
      <Modal
        visible={showBeneficiaryModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowBeneficiaryModal(false)}>
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Beneficiary</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBeneficiaryModal(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Beneficiary Type</Text>
            <View style={styles.beneficiaryTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.beneficiaryTypeButton,
                  beneficiaryType === 'bank_account' && styles.selectedBeneficiaryType
                ]}
                onPress={() => setBeneficiaryType('bank_account')}>
                <Text style={[
                  styles.beneficiaryTypeButtonText,
                  beneficiaryType === 'bank_account' && styles.selectedBeneficiaryTypeText
                ]}>
                  🏦 Bank Account
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.beneficiaryTypeButton,
                  beneficiaryType === 'upi_id' && styles.selectedBeneficiaryType
                ]}
                onPress={() => setBeneficiaryType('upi_id')}>
                <Text style={[
                  styles.beneficiaryTypeButtonText,
                  beneficiaryType === 'upi_id' && styles.selectedBeneficiaryTypeText
                ]}>
                  📱 UPI ID
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={beneficiaryName}
              onChangeText={setBeneficiaryName}
              placeholder="Enter beneficiary name"
              placeholderTextColor="#95a5a6"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={beneficiaryEmail}
              onChangeText={setBeneficiaryEmail}
              placeholder="Enter email address"
              placeholderTextColor="#95a5a6"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone *</Text>
            <TextInput
              style={styles.input}
              value={beneficiaryPhone}
              onChangeText={setBeneficiaryPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#95a5a6"
              keyboardType="phone-pad"
            />
          </View>

          {beneficiaryType === 'bank_account' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number *</Text>
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  placeholder="Enter account number"
                  placeholderTextColor="#95a5a6"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>IFSC Code *</Text>
                <TextInput
                  style={styles.input}
                  value={ifscCode}
                  onChangeText={setIfscCode}
                  placeholder="Enter IFSC code"
                  placeholderTextColor="#95a5a6"
                  autoCapitalize="characters"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Holder Name *</Text>
                <TextInput
                  style={styles.input}
                  value={accountHolderName}
                  onChangeText={setAccountHolderName}
                  placeholder="Enter account holder name"
                  placeholderTextColor="#95a5a6"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bank Name</Text>
                <TextInput
                  style={styles.input}
                  value={bankName}
                  onChangeText={setBankName}
                  placeholder="Enter bank name"
                  placeholderTextColor="#95a5a6"
                />
              </View>
            </>
          )}

          {beneficiaryType === 'upi_id' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>UPI ID *</Text>
                <TextInput
                  style={styles.input}
                  value={upiId}
                  onChangeText={setUpiId}
                  placeholder="Enter UPI ID (e.g., user@paytm)"
                  placeholderTextColor="#95a5a6"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>UPI ID Type</Text>
                <TextInput
                  style={styles.input}
                  value={upiIdType}
                  onChangeText={setUpiIdType}
                  placeholder="Enter UPI ID type (e.g., PAYTM, GPay)"
                  placeholderTextColor="#95a5a6"
                />
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleCreateBeneficiary}
            disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : '✅ Create Beneficiary'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Payout History Modal */}
      <Modal
        visible={showPayoutHistory}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowPayoutHistory(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Payout History</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowPayoutHistory(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {payoutHistory.length > 0 ? (
            <FlatList
              data={payoutHistory}
              renderItem={renderPayoutHistoryItem}
              keyExtractor={(item) => item.payoutId}
              style={styles.payoutHistoryList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No payout history found</Text>
              <Text style={styles.emptyStateSubtext}>Create your first payout to see history</Text>
            </View>
          )}
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
  infoBanner: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoBannerButton: {
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  infoBannerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  historyButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  beneficiaryList: {
    maxHeight: 300,
  },
  beneficiaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  selectedBeneficiary: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  beneficiaryInfo: {
    flex: 1,
  },
  beneficiaryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  beneficiaryDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  beneficiaryContact: {
    fontSize: 12,
    color: '#95a5a6',
  },
  beneficiaryType: {
    marginLeft: 12,
  },
  beneficiaryTypeText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  selectedBeneficiaryCard: {
    backgroundColor: '#ebf3fd',
    borderWidth: 1,
    borderColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  selectedBeneficiaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 4,
  },
  selectedBeneficiaryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  selectedBeneficiaryDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  noBeneficiaryCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  noBeneficiaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 4,
  },
  noBeneficiarySubtext: {
    fontSize: 14,
    color: '#95a5a6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  transferModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  transferModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTransferMode: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  transferModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  selectedTransferModeText: {
    color: '#fff',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#e74c3c',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#3498db',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
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
  beneficiaryTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  beneficiaryTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedBeneficiaryType: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  beneficiaryTypeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  selectedBeneficiaryTypeText: {
    color: '#fff',
  },
  payoutHistoryList: {
    flex: 1,
    padding: 20,
  },
  payoutHistoryItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  payoutHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  payoutId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  payoutStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  payoutAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  payoutDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default PayoutForm;

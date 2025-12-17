import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import PaymentForm from './PaymentForm';
import PayoutForm from './PayoutForm';
import PayoutTestingPanel from './PayoutTestingPanel';

type TabType = 'payment' | 'payout' | 'testing';

const MainNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('payment');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'payment':
        return <PaymentForm />;
      case 'payout':
        return <PayoutForm />;
      case 'testing':
        return <PayoutTestingPanel />;
      default:
        return <PaymentForm />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2c3e50"
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cashfree Demo</Text>
        <Text style={styles.headerSubtitle}>
          {activeTab === 'payment' ? 'Accept Payments' : 
           activeTab === 'payout' ? 'Send Payouts' : 'Test & Debug'}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'payment' && styles.activeTab
          ]}
          onPress={() => setActiveTab('payment')}>
          <Text style={[
            styles.tabText,
            activeTab === 'payment' && styles.activeTabText
          ]}>
            💳 Payments
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'payout' && styles.activeTab
          ]}
          onPress={() => setActiveTab('payout')}>
          <Text style={[
            styles.tabText,
            activeTab === 'payout' && styles.activeTabText
          ]}>
            💸 Payouts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'testing' && styles.activeTab
          ]}
          onPress={() => setActiveTab('testing')}>
          <Text style={[
            styles.tabText,
            activeTab === 'testing' && styles.activeTabText
          ]}>
            🧪 Testing
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderActiveTab()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bdc3c7',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
});

export default MainNavigation;

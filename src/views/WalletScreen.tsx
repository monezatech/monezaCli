import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/service';

interface Transaction {
  id: number;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

const WalletScreen = () => {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login again');
        return;
      }

      // Fetch wallet summary
      const summaryResponse = await apiService.getWalletSummary({ token });
      if (summaryResponse.success) {
        setBalance(summaryResponse.wallet.balance || 0);

        // Convert recent purchases to transaction format
        const recentTransactions = summaryResponse.recentPurchases.map((purchase: any) => ({
          id: purchase.id,
          type: purchase.transactionType,
          amount: purchase.amount,
          description: purchase.description,
          date: new Date(purchase.date).toLocaleDateString(),
        }));
        setTransactions(recentTransactions);
      }

      // Fetch full purchase history if needed
      const purchasesResponse = await apiService.getUserPurchases({ token, limit: 10 });
      if (purchasesResponse.success) {
        const allTransactions = purchasesResponse.purchases.map((purchase: any) => ({
          id: purchase.id,
          type: purchase.transactionType,
          amount: purchase.amount,
          description: purchase.description,
          date: new Date(purchase.date).toLocaleDateString(),
        }));
        setTransactions(allTransactions);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const handleAddMoney = () => {
    Alert.alert('Add Money', 'Add money functionality coming soon!');
  };

  const handleWithdraw = () => {
    Alert.alert('Withdraw', 'Withdraw functionality coming soon!');
  };

  const TransactionItem = ({ transaction }: { transaction: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIcon, transaction.type === 'credit' ? styles.creditIcon : styles.debitIcon]}>
          <MaterialCommunityIcons
            name={transaction.type === 'credit' ? 'arrow-down' : 'arrow-up'}
            size={20}
            color="#fff"
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{transaction.description}</Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, transaction.type === 'credit' ? styles.creditAmount : styles.debitAmount]}>
        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4960F9" />

      {/* Header */}
      <LinearGradient colors={['#4960F9', '#5a6fd8']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity style={[styles.actionButton, styles.addButton]} onPress={handleAddMoney}>
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.withdrawButton]} onPress={handleWithdraw}>
              <MaterialCommunityIcons name="cash-minus" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Transactions */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4960F9" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="cash-multiple" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  addButton: {
    backgroundColor: '#008f51',
  },
  withdrawButton: {
    backgroundColor: '#982323',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  creditIcon: {
    backgroundColor: '#00ff91',
  },
  debitIcon: {
    backgroundColor: '#ff6b6b',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditAmount: {
    color: '#00ff91',
  },
  debitAmount: {
    color: '#ff6b6b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default WalletScreen;

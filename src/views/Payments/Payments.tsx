// screens/PaymentsScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Transaction = {
  id: string;
  courseName: string;
  amount: number;
  date: string;
  status: 'Success' | 'Failed' | 'Pending';
};

const PaymentsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);

      // Mock Data (replace with API call)
      const data: Transaction[] = [
        {
          id: 'txn_1',
          courseName: 'React Native Mastery',
          amount: 499,
          date: '2025-09-15',
          status: 'Success',
        },
        {
          id: 'txn_2',
          courseName: 'Node.js Backend Pro',
          amount: 699,
          date: '2025-09-10',
          status: 'Failed',
        },
        {
          id: 'txn_3',
          courseName: 'Fullstack with MongoDB',
          amount: 999,
          date: '2025-09-05',
          status: 'Pending',
        },
      ];

      setTransactions(data);
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.course}>{item.courseName}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>₹{item.amount}</Text>
        <Text
          style={[
            styles.status,
            item.status === 'Success'
              ? { color: '#16a34a' } // green
              : item.status === 'Failed'
              ? { color: '#dc2626' } // red
              : { color: '#f59e0b' }, // orange
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.header}>Payments</Text>
      </View>

      {/* Content */}
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#4F46E5"
            style={{ marginTop: 20 }}
          />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found.</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default PaymentsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 10,
    color: '#111827',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  course: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  date: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  amount: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  status: { fontSize: 13, marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6b7280' },
});

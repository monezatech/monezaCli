import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { apiService } from '../services/service';

const ReferralScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.userState.user);
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingRewards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // This would need a backend endpoint to get referral stats
      // For now, we'll use placeholder data
      setReferralStats({
        totalReferrals: 0,
        totalEarnings: 0,
        pendingRewards: 0,
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareReferralCode = async () => {
    try {
      const referralCode = user?.referralCode || 'DEFAULT_CODE';
      const message = `Join Moneza and get amazing courses! Use my referral code: ${referralCode} to get started. Download the app now!`;

      const result = await Share.share({
        message,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Referral code shared successfully!');
      }
    } catch (error) {
      console.error('Error sharing referral code:', error);
      Alert.alert('Error', 'Failed to share referral code');
    }
  };

  const referralCode = user?.referralCode || 'YOUR_CODE';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Referral Code Card */}
        <View style={styles.referralCard}>
          <Text style={styles.cardTitle}>Your Referral Code</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.referralCode}>{referralCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => {
                // Copy to clipboard functionality would go here
                Alert.alert('Copied!', 'Referral code copied to clipboard');
              }}
            >
              <MaterialIcons name="content-copy" size={20} color="#4f46e5" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareReferralCode}
          >
            <MaterialIcons name="share" size={20} color="#fff" />
            <Text style={styles.shareButtonText}>Share Code</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="group" size={30} color="#10b981" />
            <Text style={styles.statNumber}>{referralStats.totalReferrals}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="account-balance-wallet" size={30} color="#f59e0b" />
            <Text style={styles.statNumber}>₹{referralStats.totalEarnings}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="schedule" size={30} color="#ef4444" />
            <Text style={styles.statNumber}>₹{referralStats.pendingRewards}</Text>
            <Text style={styles.statLabel}>Pending Rewards</Text>
          </View>
        </View>

        {/* How it works */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>How Referral Works</Text>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Share Your Code</Text>
              <Text style={styles.stepDescription}>
                Share your unique referral code with friends and family
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Friend Signs Up</Text>
              <Text style={styles.stepDescription}>
                When your friend creates an account using your code, they're linked to you
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Earn Rewards</Text>
              <Text style={styles.stepDescription}>
                You earn ₹100 when your friend makes their first purchase
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Withdraw Earnings</Text>
              <Text style={styles.stepDescription}>
                Transfer your earnings to your bank account or use them for purchases
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • Referral rewards are credited only after successful payment completion
            • Each user can only be referred once
            • Referral earnings can be withdrawn or used for purchases
            • Moneza reserves the right to modify referral terms
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  referralCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 15,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  referralCode: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  termsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
});

export default ReferralScreen;

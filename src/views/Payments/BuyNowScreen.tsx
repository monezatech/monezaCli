// src/screens/BuyNowScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { apiService } from '../../services/service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// these imports are assumed in your app - adapt if your Toast or setUser path differs
import Toast from 'react-native-toast-message';
import { setUser } from '../../store/auth/userSlice'; // adjust path if needed
import apiCall from '../../services/api'; // adjust path if needed

type BankDetails = {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
};

type CardDetails = {
  cardNumber: string;
  nameOnCard: string;
  expiry: string; // MM/YY
  cvv: string;
};

type SavedBank = {
  id: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
};

const PaymentMethod = {
  UPI: 'UPI',
  BANK: 'BANK',
  CARD: 'CARD',
} as const;

const BuyNowScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // redux selectors (adjust names to your store)
  const user = useSelector((state: RootState) => state.userState.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const courseId = useSelector((state: RootState) => state.globalState.id);

  const [referralCode, setReferralCode] = useState('');
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
  });
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    nameOnCard: '',
    expiry: '',
    cvv: '',
  });
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    (typeof PaymentMethod)[keyof typeof PaymentMethod]
  >(PaymentMethod.UPI);

  // saved banks state (populated by fetchBanks)
  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([]);
  const [selectedSavedBankId, setSelectedSavedBankId] = useState<string | null>(
    null,
  );
  const [loadingBanks, setLoadingBanks] = useState(false);

  // -----------------------
  // Fetch course (same as before)
  // -----------------------
  useEffect(() => {
    if (courseId) fetchCourse();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const tokenLocal = await AsyncStorage.getItem('token');
      const res = await apiService.getCourse({ token: tokenLocal, courseId });
      setCourse(res.course);
    } catch (error) {
      console.log('Error fetching course:', error);
      Alert.alert('Error', 'Unable to fetch course details.');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // YOUR provided fetchBanks logic integrated
  // -----------------------
  const fetchBanks = useCallback(async () => {
    try {
      setLoadingBanks(true);
      const res = await apiCall(`/api/bank/${user?._id}`, {
        method: 'GET',
        token,
      });
      console.log('BANK', res);

      if (res.success) {
        // store banks in redux user (as you already used)
        dispatch(setUser({ ...(user as any), bankDetails: res.banks }));
        // also update local state for immediate UI use
        const banks = Array.isArray(res.banks)
          ? res.banks.map((b: any) => ({
              id: b._id || b.id || String(b.accountNumber) /* fallback */,
              accountHolder: b.accountHolder || b.name || '',
              accountNumber: b.accountNumber || b.acc_no || '',
              ifsc: b.ifsc || '',
              bankName: b.bankName || b.bank || '',
            }))
          : [];
        setSavedBanks(banks);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: res.message || 'Unable to fetch banks',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Unable to fetch banks',
      });
    } finally {
      setLoadingBanks(false);
    }
  }, [user, token, dispatch]);

  // Call fetchBanks on mount / when user or token changes
  useEffect(() => {
    console.log('user?._id', user?._id);
    if (user?._id) fetchBanks();
  }, [user?._id, fetchBanks]); // Add fetchBanks to dependency array

  // When user selects a saved bank (fill the bank form)
  const selectSavedBank = (bankId: string | null) => {
    setSelectedSavedBankId(bankId);
    if (!bankId) {
      setBankDetails({
        accountHolder: '',
        accountNumber: '',
        ifsc: '',
        bankName: '',
      });
      return;
    }
    const bank = savedBanks.find(b => b.id === bankId);
    if (bank) {
      setBankDetails({
        accountHolder: bank.accountHolder,
        accountNumber: bank.accountNumber,
        ifsc: bank.ifsc,
        bankName: bank.bankName,
      });
    }
  };

  // -----------------------
  // Helpers: formatting & validation (same as previous)
  // -----------------------
  const formatCardNumber = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const verifyUpi = async () => {
    if (!upiId || !/^[\w.\-]{2,}@\w{2,}$/i.test(upiId)) {
      Alert.alert('Invalid UPI', 'Please enter a valid UPI ID (example@bank).');
      return;
    }
    setPayLoading(true);
    setTimeout(() => {
      setPayLoading(false);
      setUpiVerified(true);
      Alert.alert('UPI Verified', `${upiId} verified successfully.`);
    }, 1000);
  };

  const validateBank = (): boolean => {
    const { accountHolder, accountNumber, ifsc, bankName } = bankDetails;
    if (!accountHolder || !accountNumber || !ifsc || !bankName) {
      Alert.alert('Missing details', 'Please fill all bank account fields.');
      return false;
    }
    if (!/^[A-Za-z0-9]{4,11}$/.test(ifsc.replace(/\s/g, ''))) {
      Alert.alert('Invalid IFSC', 'Please enter a valid IFSC code.');
      return false;
    }
    return true;
  };

  const validateCard = (): boolean => {
    const { cardNumber, nameOnCard, expiry, cvv } = cardDetails;
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 13) {
      Alert.alert(
        'Invalid Card',
        'Please enter a valid card number (13 - 16 digits).',
      );
      return false;
    }
    if (!nameOnCard) {
      Alert.alert('Name missing', 'Please enter name on card.');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      Alert.alert('Invalid Expiry', 'Expiry should be in MM/YY format.');
      return false;
    }
    const [mmStr, yyStr] = expiry.split('/');
    const mm = parseInt(mmStr, 10);
    const yy = parseInt(yyStr, 10) + 2000;
    if (mm < 1 || mm > 12) {
      Alert.alert('Invalid Expiry', 'Month must be between 01 and 12.');
      return false;
    }
    const expiryDate = new Date(yy, mm - 1, 1);
    if (
      expiryDate < new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    ) {
      Alert.alert('Card Expired', 'The card appears to be expired.');
      return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      Alert.alert('Invalid CVV', 'Enter a 3 or 4 digit CVV.');
      return false;
    }
    return true;
  };

  // -----------------------
  // Purchase handler (uses selectedSavedBankId if present)
  // -----------------------
  const handlePurchase = async () => {
    if (!course) {
      Alert.alert('No course', 'Course details are missing.');
      return;
    }

    if (selectedMethod === PaymentMethod.UPI) {
      if (!upiVerified) {
        Alert.alert(
          'Verify UPI',
          'Please verify your UPI ID before proceeding.',
        );
        return;
      }
      setPayLoading(true);
      setTimeout(() => {
        setPayLoading(false);
        Alert.alert('Payment Successful', 'UPI payment completed.');
        navigation.goBack();
      }, 1200);
      return;
    }

    if (selectedMethod === PaymentMethod.BANK) {
      if (selectedSavedBankId) {
        // Send selectedSavedBankId to server to initiate bank transfer
        try {
          setPayLoading(true);
          const tokenLocal = await AsyncStorage.getItem('token');
          // Example API: POST /api/purchase/bank with { courseId, bankId, referralCode }
          const payload = {
            courseId,
            bankId: selectedSavedBankId,
            referralCode: referralCode || '',
          };
          const res = await apiCall('/api/purchase/bank', {
            method: 'POST',
            token: tokenLocal,
            body: payload,
            ignoreAuthError: true, // Ignore 401 errors for this specific call
          });
          setPayLoading(false);
          if (res.success) {
            Alert.alert(
              'Payment Requested',
              'Bank transfer requested using saved bank.',
            );
            navigation.goBack();
          } else {
            Toast.show({
              type: 'error',
              text1: 'Failed',
              text2: res.message || 'Bank purchase failed',
            });
          }
        } catch (err: any) {
          setPayLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: err.message || 'Unable to complete purchase',
          });
        }
        return;
      }

      // otherwise new bank flow
      if (!validateBank()) return;

      // TODO: call backend to create bank transfer request with bankDetails
      setPayLoading(true);
      setTimeout(() => {
        setPayLoading(false);
        Alert.alert(
          'Payment Requested',
          'Bank transfer requested — please follow instructions sent to your email.',
        );
        navigation.goBack();
      }, 1200);
      return;
    }

    if (selectedMethod === PaymentMethod.CARD) {
      if (!validateCard()) return;
      setPayLoading(true);
      setTimeout(() => {
        setPayLoading(false);
        Alert.alert('Payment Successful', 'Card payment completed.');
        navigation.goBack();
      }, 1400);
      return;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading Course...</Text>
      </SafeAreaView>
    );
  }

  const priceText = course?.price ? `₹ ${course.price}` : 'Price not available';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => (navigation as any).goBack()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.header}>Confirm & Pay</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Course Card */}
        <View style={styles.courseCard}>
          {course?.thumbnailUrl ? (
            <Image
              source={{ uri: course.thumbnailUrl }}
              style={styles.courseImage}
            />
          ) : (
            <View
              style={[
                styles.courseImage,
                { alignItems: 'center', justifyContent: 'center' },
              ]}
            >
              <Ionicons name="book-outline" size={36} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>
              {course?.title || 'Untitled Course'}
            </Text>
            <Text style={styles.courseDesc} numberOfLines={2}>
              {course?.description || ''}
            </Text>
            <Text style={styles.coursePrice}>{priceText}</Text>
          </View>
        </View>

        {/* Referral */}
        <View style={styles.card}>
          <Text style={styles.heading}>Referral Code</Text>
          <TextInput
            placeholder="Enter referral code (optional)"
            value={referralCode}
            onChangeText={setReferralCode}
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        {/* Payment method tabs */}
        <View style={styles.tabs}>
          {Object.values(PaymentMethod).map(method => (
            <TouchableOpacity
              key={method}
              style={[
                styles.tab,
                selectedMethod === method && styles.tabActive,
              ]}
              onPress={() => {
                setSelectedMethod(method);
                setUpiVerified(false);
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedMethod === method && styles.tabTextActive,
                ]}
              >
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment forms */}
        <View style={{ marginTop: 12 }}>
          {selectedMethod === PaymentMethod.UPI && (
            <View style={styles.card}>
              <Text style={styles.heading}>Pay with UPI</Text>
              <TextInput
                placeholder="example@bank"
                value={upiId}
                onChangeText={text => {
                  setUpiId(text.trim());
                  setUpiVerified(false);
                }}
                style={styles.input}
                autoCapitalize="none"
              />

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.actionBtn, { flex: 1 }]}
                  onPress={verifyUpi}
                  disabled={payLoading}
                >
                  {payLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.actionBtnText}>
                      {upiVerified ? 'Verified' : 'Verify UPI'}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtnOutline, { flex: 1 }]}
                  onPress={() => {
                    setUpiId('');
                    setUpiVerified(false);
                  }}
                >
                  <Text style={styles.actionBtnOutlineText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {selectedMethod === PaymentMethod.BANK && (
            <View style={styles.card}>
              <Text style={styles.heading}>Bank Transfer</Text>

              {/* Show saved banks */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontWeight: '600', marginBottom: 8 }}>
                  Saved bank accounts
                </Text>

                {loadingBanks ? (
                  <ActivityIndicator size="small" color="#4f46e5" />
                ) : savedBanks.length === 0 ? (
                  <Text style={{ color: '#6B7280' }}>
                    No saved banks found.
                  </Text>
                ) : (
                  savedBanks.map(bank => {
                    const selected = selectedSavedBankId === bank.id;
                    return (
                      <TouchableOpacity
                        key={bank.id}
                        onPress={() => selectSavedBank(bank.id)}
                        style={[
                          styles.savedBankRow,
                          selected && styles.savedBankRowSelected,
                        ]}
                      >
                        <View>
                          <Text style={{ fontWeight: '700' }}>
                            {bank.bankName}
                          </Text>
                          <Text style={{ color: '#6B7280' }}>
                            {bank.accountHolder}
                          </Text>
                          <Text
                            style={{ color: '#6B7280' }}
                          >{`XXXXXX${bank.accountNumber.slice(-4)} • ${
                            bank.ifsc
                          }`}</Text>
                        </View>
                        {selected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#4F46E5"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}

                <TouchableOpacity
                  onPress={() => selectSavedBank(null)}
                  style={[
                    styles.savedBankRow,
                    selectedSavedBankId === null && styles.savedBankRowSelected,
                  ]}
                >
                  <Text style={{ fontWeight: '700' }}>
                    Use a new bank account
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bank form (prefilled if saved selected) */}
              <TextInput
                placeholder="Account Holder Name"
                value={bankDetails.accountHolder}
                onChangeText={text => {
                  setSelectedSavedBankId(null);
                  setBankDetails({ ...bankDetails, accountHolder: text });
                }}
                style={styles.input}
              />

              <TextInput
                placeholder="Account Number"
                keyboardType="numeric"
                value={bankDetails.accountNumber}
                onChangeText={text =>
                  setBankDetails({
                    ...bankDetails,
                    accountNumber: text.replace(/\D/g, ''),
                  })
                }
                style={styles.input}
              />

              <TextInput
                placeholder="IFSC Code"
                autoCapitalize="characters"
                value={bankDetails.ifsc}
                onChangeText={text =>
                  setBankDetails({
                    ...bankDetails,
                    ifsc: text.toUpperCase().replace(/\s/g, ''),
                  })
                }
                style={styles.input}
              />

              <TextInput
                placeholder="Bank Name"
                value={bankDetails.bankName}
                onChangeText={text =>
                  setBankDetails({ ...bankDetails, bankName: text })
                }
                style={styles.input}
              />

              <Text style={styles.helperText}>
                After confirm, you'll receive bank transfer instructions and
                reference details.
              </Text>
            </View>
          )}

          {selectedMethod === PaymentMethod.CARD && (
            <View style={styles.card}>
              <Text style={styles.heading}>Card Payment</Text>

              <TextInput
                placeholder="Card Number"
                keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
                value={cardDetails.cardNumber}
                onChangeText={text =>
                  setCardDetails({
                    ...cardDetails,
                    cardNumber: formatCardNumber(text),
                  })
                }
                style={styles.input}
                maxLength={19}
              />

              <TextInput
                placeholder="Name on Card"
                value={cardDetails.nameOnCard}
                onChangeText={text =>
                  setCardDetails({ ...cardDetails, nameOnCard: text })
                }
                style={styles.input}
              />

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <TextInput
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChangeText={text =>
                    setCardDetails({
                      ...cardDetails,
                      expiry: formatExpiry(text),
                    })
                  }
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  maxLength={5}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChangeText={text =>
                    setCardDetails({
                      ...cardDetails,
                      cvv: text.replace(/\D/g, '').slice(0, 4),
                    })
                  }
                  style={[styles.input, { width: 110 }]}
                  secureTextEntry
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              <Text style={styles.helperText}>
                We accept Visa, MasterCard, and Rupay.
              </Text>
            </View>
          )}
        </View>

        {/* Final Confirm button */}
        <TouchableOpacity
          style={[styles.buyButton, payLoading && { opacity: 0.7 }]}
          onPress={handlePurchase}
          disabled={payLoading}
        >
          {payLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="card-outline" size={18} color="#fff" />
              <Text style={styles.buyButtonText}>
                {' '}
                Confirm & Pay {course?.price ? ` • ₹ ${course.price}` : ''}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuyNowScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
    color: '#111827',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  courseImage: {
    width: 120,
    height: 100,
    backgroundColor: '#E5E7EB',
  },
  courseInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  courseDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E6E9EE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#FAFBFF',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tab: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  tabText: {
    color: '#111827',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  actionBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionBtnOutlineText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  helperText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 6,
  },
  buyButton: {
    marginTop: 8,
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  savedBankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  savedBankRowSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
});

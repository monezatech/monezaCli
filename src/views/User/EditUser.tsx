import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/index';
import { Field, Formik } from 'formik';
import * as yup from 'yup';
import Toast from 'react-native-toast-message';
import apiCall from '../../services/api';
import { setUser, addBank, removeBank } from '../../store/auth/userSlice';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePickerInput from '../../components/Calendar';

interface EditUserValues {
  name: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  dob?: string;
}

interface BankValues {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch?: string;
}

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  phone: yup.string().nullable(),
  street: yup.string().nullable(),
  city: yup.string().nullable(),
  state: yup.string().nullable(),
  zip: yup.string().nullable(),
  dob: yup.date().nullable(),
});

const bankValidationSchema = yup.object().shape({
  accountHolderName: yup.string().required('Account holder name is required'),
  accountNumber: yup.string().required('Account number is required'),
  ifscCode: yup.string().required('IFSC code is required'),
  bankName: yup.string().required('Bank name is required'),
  branch: yup.string().nullable(),
});

const EditUserScreen = () => {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.userState.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);

  const initialValues: EditUserValues = {
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
    dob: user?.dob ? new Date(user.dob).toISOString().slice(0, 10) : '',
  };

  // progressive formatter (non-blocking)
  const formatDateInput = text => {
    const cleaned = text.replace(/\D/g, ''); // only digits

    const y = cleaned.slice(0, 4);
    const m = cleaned.slice(4, 6);
    const d = cleaned.slice(6, 8);

    // less than or equal to year
    if (cleaned.length <= 4) return y;

    // year + 1 digit of month -> keep single digit month (no validation/pad)
    if (cleaned.length === 5) {
      return `${y}-${m}`; // m is single digit here
    }

    // year + 2 digits of month -> validate month (00 -> 01, >12 -> 12)
    if (cleaned.length === 6) {
      let monthNum = parseInt(m, 10);
      if (isNaN(monthNum)) return `${y}-`;
      if (monthNum === 0) monthNum = 1;
      if (monthNum > 12) monthNum = 12;
      const month = String(monthNum).padStart(2, '0');
      return `${y}-${month}`;
    }

    // year + month + 1 digit of day -> show partial day
    if (cleaned.length === 7) {
      const monthStr = m; // two digits already present
      return `${y}-${monthStr}-${d}`; // d is single digit
    }

    // full YYYYMMDD or longer -> take only first 8 digits and validate day
    if (cleaned.length >= 8) {
      const monthNum = Math.max(1, Math.min(12, parseInt(m, 10) || 1)); // safe month
      const yearNum = parseInt(y, 10) || 1970;
      const maxDays = new Date(yearNum, monthNum, 0).getDate();
      let dayNum = parseInt(d, 10) || 1;
      if (dayNum < 1) dayNum = 1;
      if (dayNum > maxDays) dayNum = maxDays;
      const monthStr = String(monthNum).padStart(2, '0');
      const dayStr = String(dayNum).padStart(2, '0');
      return `${y}-${monthStr}-${dayStr}`;
    }

    // fallback
    return text;
  };

  const fetchBanks = async () => {
    try {
      setBankLoading(true);
      const res = await apiCall(`/api/bank/${user?._id}`, {
        method: 'GET',
        token,
      });

      if (res.success) {
        dispatch(setUser({ ...user, bankDetails: res.banks }));
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
      setBankLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchBanks();
  }, [user?._id]);

  const handleSubmit = async (values: EditUserValues) => {
    try {
      setLoading(true);
      const payload = {
        name: values.name,
        phone: values.phone,
        address: {
          street: values.street,
          city: values.city,
          state: values.state,
          zip: values.zip,
        },
        dob: values.dob,
      };

      const res = await apiCall(`/api/user/edit/${user?._id}`, {
        method: 'PUT',
        data: payload,
        token,
      });

      if (res.success === true) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: res.message || 'Your profile has been updated successfully',
        });
        dispatch(setUser(res.user));
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: res.message || 'Something went wrong',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Unable to update user',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = async (values: BankValues, resetForm: () => void) => {
    try {
      setBankLoading(true);
      const res = await apiCall(`/api/bank/add`, {
        method: 'POST',
        data: { ...values, userId: user?._id },
        token,
      });

      if (res.success) {
        Toast.show({
          type: 'success',
          text1: 'Bank Added',
          text2: res.message || 'New bank account saved',
        });
        dispatch(addBank(res.bank));
        resetForm();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: res.message || 'Something went wrong',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Unable to add bank',
      });
    } finally {
      setBankLoading(false);
    }
  };

  const handleDeleteBank = (bankId: string) => {
    Alert.alert('Delete Bank', 'Are you sure you want to delete this bank?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setBankLoading(true);
            const res = await apiCall(
              `/api/bank/delete/${user?._id}/${bankId}`,
              { method: 'DELETE', token },
            );
            if (res.success) {
              Toast.show({
                type: 'success',
                text1: 'Bank Deleted',
                text2: res.message || 'Bank account removed',
              });
              dispatch(removeBank(bankId));
            } else {
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: res.message || 'Something went wrong',
              });
            }
          } catch (error: any) {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: error.message || 'Unable to delete bank',
            });
          } finally {
            setBankLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {/* ---- User Form ---- */}
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  value={values.name}
                />
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  keyboardType="phone-pad"
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  value={values.phone}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Street"
                  onChangeText={handleChange('street')}
                  onBlur={handleBlur('street')}
                  value={values.street}
                />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  onChangeText={handleChange('city')}
                  onBlur={handleBlur('city')}
                  value={values.city}
                />
                <TextInput
                  style={styles.input}
                  placeholder="State"
                  onChangeText={handleChange('state')}
                  onBlur={handleBlur('state')}
                  value={values.state}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Zip"
                  keyboardType="number-pad"
                  onChangeText={handleChange('zip')}
                  onBlur={handleBlur('zip')}
                  value={values.zip}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  onChangeText={handleChange('dob')}
                  onBlur={handleBlur('dob')}
                  value={formatDateInput(values.dob)}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleSubmit()}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          {/* ---- Bank Section ---- */}
          <Text style={styles.sectionTitle}>Bank Accounts</Text>

          <FlatList
            data={user?.bankDetails || []}
            keyExtractor={item => item._id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.bankCard}>
                <View style={styles.bankInfo}>
                  <Text style={styles.bankName}>{item?.bankName}</Text>
                  <Text style={styles.accountText}>
                    {item?.accountHolderName} •{' '}
                    {item?.accountNumber
                      ? item.accountNumber.replace(/\d(?=\d{4})/g, '*')
                      : 'N/A'}
                  </Text>
                  <Text style={styles.ifscText}>IFSC: {item?.ifscCode}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteBank(item._id)}
                >
                  <Ionicons name="trash-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No bank accounts added yet</Text>
              </View>
            }
          />

          {/* ---- Add Bank Form ---- */}
          <Formik
            initialValues={{
              accountHolderName: '',
              accountNumber: '',
              ifscCode: '',
              bankName: '',
              branch: '',
            }}
            validationSchema={bankValidationSchema}
            onSubmit={(values, { resetForm }) =>
              handleAddBank(values, resetForm)
            }
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.form}>
                <Text style={styles.sectionTitle}>Add Bank Account</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Account Holder Name"
                  onChangeText={handleChange('accountHolderName')}
                  onBlur={handleBlur('accountHolderName')}
                  value={values.accountHolderName}
                />
                {touched.accountHolderName && errors.accountHolderName && (
                  <Text style={styles.errorText}>
                    {errors.accountHolderName}
                  </Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Account Number"
                  keyboardType="number-pad"
                  onChangeText={handleChange('accountNumber')}
                  onBlur={handleBlur('accountNumber')}
                  value={values.accountNumber}
                />
                {touched.accountNumber && errors.accountNumber && (
                  <Text style={styles.errorText}>{errors.accountNumber}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="IFSC Code"
                  onChangeText={handleChange('ifscCode')}
                  onBlur={handleBlur('ifscCode')}
                  value={values.ifscCode}
                />
                {touched.ifscCode && errors.ifscCode && (
                  <Text style={styles.errorText}>{errors.ifscCode}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Bank Name"
                  onChangeText={handleChange('bankName')}
                  onBlur={handleBlur('bankName')}
                  value={values.bankName}
                />
                {touched.bankName && errors.bankName && (
                  <Text style={styles.errorText}>{errors.bankName}</Text>
                )}

                <TextInput
                  style={styles.input}
                  placeholder="Branch (optional)"
                  onChangeText={handleChange('branch')}
                  onBlur={handleBlur('branch')}
                  value={values.branch}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleSubmit()}
                  disabled={bankLoading}
                >
                  {bankLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Add Bank</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingLeft: 20,
  },
  container: { padding: 20, backgroundColor: '#fff' },
  form: {},
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4960F9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  errorText: { color: 'red', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginVertical: 15 },
  bankCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bankInfo: { flex: 1 },
  bankName: { fontSize: 16, fontWeight: '700', marginBottom: 4, color: '#333' },
  accountText: { fontSize: 14, color: '#555', marginBottom: 2 },
  ifscText: { fontSize: 13, color: '#888' },
  deleteButton: {
    backgroundColor: '#FF4D4D',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 20 },
  emptyText: { color: '#888', fontSize: 14 },
});

export default EditUserScreen;

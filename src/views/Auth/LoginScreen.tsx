import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Formik } from 'formik';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { setToken } from '../../store/auth/authSlice';
import { setUser } from '../../store/auth/userSlice';
import { apiService } from '../../services/service';
import GradientButton from '../../components/GradientButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import icon from '../../assets/images/loginpage.png';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator'; // Import RootStackParamList

const { width, height } = Dimensions.get('window');

interface LoginFormValues {
  email: string;
  password: string;
}

const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [modalVisible, setModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =============== LOGIN ===============
  const handleLogin = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const response = await apiService.loginUser(values);
      console.log('login response', response);

      if (response?.status === 'success' && response?.token) {
        await AsyncStorage.setItem('token', response.token);
        dispatch(setToken(response.token));
        dispatch(setUser(response.user));

        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: response.message || 'Welcome back!',
        });

        navigation.navigate('DrawerNavigator');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: response?.message || 'Invalid credentials',
        });
      }
    } catch (error: any) { // Cast error to any for now
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  // =============== FORGOT PASSWORD FLOW ===============
  const handleSendOtp = async () => {
    if (!forgotEmail)
      return Toast.show({ type: 'error', text1: 'Please enter your email' });
    try {
      setLoading(true);
      const res = await apiService.sendOtp({ email: forgotEmail });
      if (res.message) {
        setIsOtpSent(true);
        Toast.show({ type: 'success', text1: 'OTP sent to your email' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to send OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const res = await apiService.verifyOtp({ email: forgotEmail, otp });
      if (res.message) {
        setIsOtpVerified(true);
        Toast.show({ type: 'success', text1: 'OTP verified successfully' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Invalid or expired OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetPassword || !confirmPassword)
      return Toast.show({
        type: 'error',
        text1: 'Please enter both password fields',
      });
    if (resetPassword !== confirmPassword)
      return Toast.show({ type: 'error', text1: 'Passwords do not match' });

    try {
      setLoading(true);
      const response = await apiService.changePassword({
        email: forgotEmail,
        password: resetPassword,
        password_confirmation: confirmPassword,
      });

      if (response.status === 'success') {
        setModalVisible(false);
        setForgotEmail('');
        setOtp('');
        setResetPassword('');
        setConfirmPassword('');
        setIsOtpVerified(false);
        setIsOtpSent(false);
        Toast.show({ type: 'success', text1: 'Password updated successfully' });
      } else {
        Toast.show({ type: 'error', text1: 'Password update failed' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#15F5BA" />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <Image source={icon} style={styles.logo} />
              <Text style={styles.title}>Sign In</Text>

              <View style={styles.viewContainer}>
                <Formik
                  validationSchema={loginValidationSchema}
                  initialValues={{ email: '', password: '' }}
                  onSubmit={values => handleLogin(values)}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                  }) => (
                    <>
                      {/* Email */}
                      <Text style={styles.label}>Email Address</Text>
                      <View style={styles.inputContainer}>
                        <Icon
                          name="email-outline"
                          size={width * 0.06}
                          style={styles.icon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your email address"
                          placeholderTextColor="#888"
                          keyboardType="email-address"
                          onChangeText={handleChange('email')}
                          onBlur={handleBlur('email')}
                          value={values.email}
                          returnKeyType="next"
                        />
                      </View>
                      {errors.email && touched.email && (
                        <Text style={styles.errorText}>{errors.email}</Text>
                      )}

                      {/* Password */}
                      <Text style={styles.label}>Password</Text>
                      <View style={styles.inputContainer}>
                        <Icon
                          name="lock-outline"
                          size={width * 0.06}
                          style={styles.icon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Enter your password"
                          placeholderTextColor="#888"
                          secureTextEntry={!showPassword}
                          onChangeText={handleChange('password')}
                          onBlur={handleBlur('password')}
                          value={values.password}
                          returnKeyType="done"
                          onSubmitEditing={() => handleSubmit()} // Call handleSubmit as a function
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                        >
                          <Icon
                            name={
                              showPassword ? 'eye-off-outline' : 'eye-outline'
                            }
                            size={width * 0.06}
                            color="#666"
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.password && touched.password && (
                        <Text style={styles.errorText}>{errors.password}</Text>
                      )}

                      <Text
                        style={styles.forgotPassword}
                        onPress={() => setModalVisible(true)}
                      >
                        Forgot Password?
                      </Text>

                      <GradientButton onPress={handleSubmit} text="Sign In" />

                      <TouchableOpacity
                        onPress={() => navigation.navigate('SignupScreen')}
                      >
                        <Text style={styles.signUp}>
                          Don't have an account?{' '}
                          <Text style={styles.signUpLink}>Sign Up</Text>
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </Formik>

                {/* Forgot Password Modal */}
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)}
                >
                  <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <Icon name="close" size={24} color="#333" />
                      </TouchableOpacity>
                      <Text style={styles.heading}>Reset Password</Text>

                      {!isOtpVerified ? (
                        <>
                          <Text style={styles.label}>Email Address</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              name="email-outline"
                              size={width * 0.06}
                              style={styles.icon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Enter your email address"
                              placeholderTextColor="#888"
                              keyboardType="email-address"
                              value={forgotEmail}
                              onChangeText={setForgotEmail}
                            />
                          </View>

                          {isOtpSent && (
                            <>
                              <Text style={styles.label}>OTP</Text>
                              <View style={styles.inputContainer}>
                                <Icon
                                  name="key-outline"
                                  size={width * 0.06}
                                  style={styles.icon}
                                />
                                <TextInput
                                  style={styles.input}
                                  placeholder="Enter OTP code"
                                  placeholderTextColor="#888"
                                  keyboardType="number-pad"
                                  value={otp}
                                  onChangeText={setOtp}
                                />
                              </View>
                            </>
                          )}

                          <TouchableOpacity
                            style={styles.forgotpasbutton}
                            onPress={
                              isOtpSent ? handleVerifyOtp : handleSendOtp
                            }
                          >
                            <Text style={styles.buttonText}>
                              {isOtpSent ? 'Verify OTP' : 'Send OTP'}
                            </Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          {/* New Password */}
                          <Text style={styles.label}>New Password</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              name="lock-outline"
                              size={width * 0.06}
                              style={styles.icon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Enter new password"
                              placeholderTextColor="#888"
                              secureTextEntry={!showResetPassword}
                              onChangeText={setResetPassword}
                              value={resetPassword}
                            />
                            <TouchableOpacity
                              onPress={() =>
                                setShowResetPassword(!showResetPassword)
                              }
                            >
                              <Icon
                                name={
                                  showResetPassword
                                    ? 'eye-off-outline'
                                    : 'eye-outline'
                                }
                                size={width * 0.06}
                                color="#666"
                              />
                            </TouchableOpacity>
                          </View>

                          {/* Confirm Password */}
                          <Text style={styles.label}>Confirm Password</Text>
                          <View style={styles.inputContainer}>
                            <Icon
                              name="lock-outline"
                              size={width * 0.06}
                              style={styles.icon}
                            />
                            <TextInput
                              style={styles.input}
                              placeholder="Confirm new password"
                              placeholderTextColor="#888"
                              secureTextEntry={!showConfirmPassword}
                              onChangeText={setConfirmPassword}
                              value={confirmPassword}
                            />
                            <TouchableOpacity
                              onPress={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              <Icon
                                name={
                                  showConfirmPassword
                                    ? 'eye-off-outline'
                                    : 'eye-outline'
                                }
                                size={width * 0.06}
                                color="#666"
                              />
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            style={styles.forgotpasbutton}
                            onPress={handleForgotPassword}
                          >
                            <Text style={styles.buttonText}>Submit</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>
                </Modal>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  viewContainer: { paddingHorizontal: width * 0.05 },
  logo: {
    width: width * 0.9,
    height: height * 0.3,
    alignSelf: 'center',
    marginBottom: height * 0.02,
  },
  title: {
    fontSize: width * 0.08,
    marginBottom: height * 0.04,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: height * 0.06,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    paddingHorizontal: width * 0.03,
    marginBottom: height * 0.015,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: height * 0.01,
    marginTop: height * 0.02,
  },
  icon: { marginRight: width * 0.02 },
  input: {
    flex: 1,
    height: '100%',
    fontSize: width * 0.04,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: height * 0.025,
    color: '#000',
    fontSize: width * 0.035,
  },
  errorText: {
    color: 'red',
    fontSize: width * 0.03,
    marginBottom: height * 0.01,
  },
  signUp: {
    color: '#000',
    textAlign: 'center',
    marginTop: height * 0.025,
    fontSize: width * 0.04,
  },
  signUpLink: { color: '#1E90FF', fontWeight: 'bold' },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000c4',
  },
  modalView: {
    margin: width * 0.05,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: width * 0.08,
    alignItems: 'center',
    width: '90%',
  },
  heading: {
    fontSize: width * 0.05,
    fontWeight: '600',
    marginBottom: height * 0.02,
  },
  forgotpasbutton: {
    width: '100%',
    height: height * 0.06,
    backgroundColor: '#15F5BA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.02,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
});

export default LoginScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { apiService } from '../../services/service';
import GradientButton from '../../components/GradientButton';
import icon from '../../assets/images/loginpage.png';
import TermsAndConditionsScreen from '../TermsAndCondition';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const signupValidationSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

const SignupScreen = () => {
  const navigation = useNavigation<any>();
  const [termsVisible, setTermsVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: any) => {
    try {
      setLoading(true);

      const data = {
        name: values.username,
        email: values.email,
        password: values.password,
        password_confirmation: values.confirmPassword,
        tc: isChecked,
        role: 'user',
      };

      const response = await apiService.registerUser(data);
      console.log('response', response);

      if (response.status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful 🎉',
          text2: 'You can now login with your credentials',
        });
        setTimeout(() => {
          navigation.navigate('Login');
        }, 2500);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.message || 'Something went wrong. Please try again!',
        });
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2:
          error?.response?.data?.message ||
          'Network error. Please check your connection!',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#5264F9" />
        </View>
      )}
      <Image source={icon} style={styles.logo} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView style={styles.container}>
          <Text style={styles.title}>Create Account</Text>

          <Formik
            validationSchema={signupValidationSchema}
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
            }}
            onSubmit={values => handleRegister(values)}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View>
                {/* Username */}
                <View style={styles.inputContainer}>
                  <Icon name="account-outline" size={22} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="#888"
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                    value={values.username}
                  />
                </View>
                {errors.username && touched.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}

                {/* Email */}
                <View style={styles.inputContainer}>
                  <Icon name="email-outline" size={22} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                  />
                </View>
                {errors.email && touched.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                {/* Password */}
                <View style={styles.inputContainer}>
                  <Icon name="lock-outline" size={22} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    secureTextEntry={!showPassword}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && touched.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <Icon name="lock-outline" size={22} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#888"
                    secureTextEntry={!showConfirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    value={values.confirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon
                      name={
                        showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && touched.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                {/* Terms & Conditions */}
                <TouchableOpacity
                  style={styles.section}
                  onPress={() => setChecked(!isChecked)}
                >
                  <Icon
                    name={
                      isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'
                    }
                    size={24}
                    color={isChecked ? '#5264F9' : '#ccc'}
                    style={styles.checkboxIcon}
                  />
                  <TouchableOpacity onPress={() => setTermsVisible(true)}>
                    <Text style={styles.paragraph}>
                      I agree to the{' '}
                      <Text style={styles.link}>Terms & Conditions</Text>
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <GradientButton onPress={handleSubmit} text="Sign Up" />

                <TouchableOpacity
                  style={{ marginTop: 20 }}
                  onPress={() => navigation.navigate('LoginScreen')}
                >
                  <Text style={styles.signUp}>
                    Already have an account?{' '}
                    <Text style={styles.signUpLink}>Login</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          {/* Terms & Conditions Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={termsVisible}
            onRequestClose={() => setTermsVisible(false)}
          >
            <View style={styles.bottomSheetContainer}>
              <View style={styles.bottomSheet}>
                <Text style={styles.heading}>Terms & Conditions</Text>
                <ScrollView
                  style={{ marginBottom: 20 }}
                  showsVerticalScrollIndicator={true}
                >
                  <TermsAndConditionsScreen />
                </ScrollView>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => setTermsVisible(false)}
                >
                  <Text style={styles.buttonText}>Agree & Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', width: '100%' },
  scrollContainer: { paddingHorizontal: 20, alignItems: 'center' },
  logo: {
    height: 350,
    width: '100%',
  },
  title: {
    fontSize: 26,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#111',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  icon: { marginRight: 8, color: '#444' },
  input: { flex: 1, height: '100%', fontSize: 15, color: '#000' },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  section: { flexDirection: 'row', alignItems: 'center', marginVertical: 15, paddingRight: 10 },
  checkboxIcon: { marginRight: 8 },
  paragraph: { fontSize: 14, color: '#333' },
  link: { color: '#1E90FF', fontWeight: '600' },
  signUp: { color: '#333', fontSize: 14 },
  signUpLink: { color: '#1E90FF', fontWeight: 'bold' },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#5264F9',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000099',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default SignupScreen;

// screens/ResetPassword.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';

const ResetPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get token from route params
  const { token } = route.params as { token?: string };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async () => {
    if (!token) {
      Alert.alert('Error', 'Invalid or missing token.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await axios.post('http://192.168.1.15:8000/auth/reset-password/', {
        token,
        password,
      });
      Alert.alert('Success', 'Password has been reset');
      navigation.navigate('Login' as never);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to reset password',
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your new password</Text>
      <TextInput
        secureTextEntry
        placeholder="New password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={styles.input}
      />
      <Button title="Reset Password" onPress={handleReset} />
    </View>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 18, marginBottom: 15, textAlign: 'center' },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
});

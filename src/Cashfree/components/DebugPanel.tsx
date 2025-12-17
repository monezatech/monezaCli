import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {getCurrentConfig} from '../config/cashfree.config';

const DebugPanel: React.FC = () => {
  const config = getCurrentConfig();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Debug Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        <Text style={styles.debugText}>Environment: {config.environment}</Text>
        <Text style={styles.debugText}>Base URL: {config.baseUrl}</Text>
        <Text style={styles.debugText}>App ID: {config.appId}</Text>
        <Text style={styles.debugText}>
          Secret Key: {config.secretKey ? '***' + config.secretKey.slice(-4) : 'Not set'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expected Test Results</Text>
        <Text style={styles.successText}>✅ Success: "Test order created"</Text>
        <Text style={styles.warningText}>⚠️ Auth OK: "Authentication working"</Text>
        <Text style={styles.errorText}>❌ Fail: "Authentication failed"</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Troubleshooting</Text>
        <Text style={styles.debugText}>• 200/201: Perfect - API working</Text>
        <Text style={styles.debugText}>• 400: Auth OK, validation error (normal)</Text>
        <Text style={styles.debugText}>• 401: Bad credentials - check App ID/Secret</Text>
        <Text style={styles.debugText}>• 404: Wrong endpoint (should be fixed now)</Text>
        <Text style={styles.debugText}>• Network: Connection/firewall issue</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  successText: {
    fontSize: 14,
    color: '#28a745',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#ffc107',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    marginBottom: 4,
  },
});

export default DebugPanel; 
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PaymentService from '../../services/cashfree/PaymentService';

interface EnvironmentIndicatorProps {
  onEnvironmentInfo?: () => void;
}

const EnvironmentIndicator: React.FC<EnvironmentIndicatorProps> = ({ onEnvironmentInfo }) => {
  const environmentInfo = PaymentService.getEnvironmentInfo();
  const environmentWarning = PaymentService.getEnvironmentWarning();

  const getEnvironmentColor = () => {
    if (environmentInfo.isProduction) {
      return '#ff6b35'; // Orange for production
    } else {
      return '#4ecdc4'; // Teal for test
    }
  };

  const getEnvironmentIcon = () => {
    if (environmentInfo.isProduction) {
      return '⚠️'; // Warning icon for production
    } else {
      return '🧪'; // Test tube icon for test
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: getEnvironmentColor() }]}
      onPress={onEnvironmentInfo}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getEnvironmentIcon()}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.environmentText}>
            {environmentInfo.environment} MODE
          </Text>
          <Text style={styles.warningText}>
            {environmentWarning.message}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  environmentText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
});

export default EnvironmentIndicator;

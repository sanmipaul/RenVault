import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const WalletConnect = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    setTimeout(() => {
      const mockAddress = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
      onConnect(mockAddress);
      setIsConnecting(false);
      Alert.alert('Success', 'Wallet connected!');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Your Wallet</Text>
      <Text style={styles.subtitle}>
        Connect your Stacks wallet to start saving STX.
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, isConnecting && styles.buttonDisabled]} 
        onPress={handleConnect}
        disabled={isConnecting}
      >
        <Text style={styles.buttonText}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#667eea',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WalletConnect;
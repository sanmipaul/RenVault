import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  const [balance, setBalance] = useState('0.00');
  const [points, setPoints] = useState('0');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RenVault 🏦</Text>
      <Text style={styles.subtitle}>Micro-Savings Protocol</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{balance} STX</Text>
          <Text style={styles.statLabel}>Vault Balance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Commitment Points</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Deposit')}
      >
        <Text style={styles.buttonText}>Deposit STX</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]} 
        onPress={() => navigation.navigate('Withdraw')}
      >
        <Text style={styles.buttonText}>Withdraw STX</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.tertiaryButton]} 
        onPress={() => navigation.navigate('Leaderboard')}
      >
        <Text style={styles.buttonText}>View Leaderboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const DepositScreen = () => {
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    if (!amount) return;
    Alert.alert('Success', `Depositing ${amount} STX`);
    setAmount('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deposit STX</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter amount (STX)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      
      <Text style={styles.feeText}>1% protocol fee applies</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleDeposit}>
        <Text style={styles.buttonText}>Deposit</Text>
      </TouchableOpacity>
    </View>
  );
};

const WithdrawScreen = () => {
  const [amount, setAmount] = useState('');

  const handleWithdraw = () => {
    if (!amount) return;
    Alert.alert('Success', `Withdrawing ${amount} STX`);
    setAmount('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdraw STX</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter amount (STX)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleWithdraw}>
        <Text style={styles.buttonText}>Withdraw</Text>
      </TouchableOpacity>
    </View>
  );
};

const LeaderboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <Text style={styles.subtitle}>Top Savers</Text>
      
      <View style={styles.leaderboardItem}>
        <Text style={styles.rank}>1</Text>
        <Text style={styles.address}>SP1ABC...XYZ</Text>
        <Text style={styles.score}>1,250</Text>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'RenVault' }} />
        <Stack.Screen name="Deposit" component={DepositScreen} />
        <Stack.Screen name="Withdraw" component={WithdrawScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#667eea',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    flex: 0.48,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  tertiaryButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  feeText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  leaderboardItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  address: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
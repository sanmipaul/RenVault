const axios = require('axios');
const WebSocket = require('ws');

class RealTimeEventProcessor {
  constructor() {
    this.services = {
      monitoring: 'http://localhost:3001',
      leaderboard: 'http://localhost:3002',
      notifications: 'http://localhost:3003'
    };
    this.wsClients = new Set();
  }

  async processDepositEvent(payload) {
    const { transaction } = payload;
    const txData = this.extractTransactionData(transaction);
    
    console.log('💰 Processing deposit event:', txData);

    // Update monitoring metrics
    await this.updateMonitoringMetrics('deposit', txData);
    
    // Update leaderboard in real-time
    await this.updateLeaderboard(txData.sender, txData.amount);
    
    // Send notifications
    await this.triggerNotifications('deposit', txData);
    
    // Broadcast to WebSocket clients
    this.broadcastEvent('deposit', txData);
  }

  async processWithdrawalEvent(payload) {
    const { transaction } = payload;
    const txData = this.extractTransactionData(transaction);
    
    console.log('💸 Processing withdrawal event:', txData);

    // Update monitoring metrics
    await this.updateMonitoringMetrics('withdrawal', txData);
    
    // Update leaderboard
    await this.updateLeaderboard(txData.sender, -txData.amount);
    
    // Send notifications
    await this.triggerNotifications('withdrawal', txData);
    
    // Broadcast to WebSocket clients
    this.broadcastEvent('withdrawal', txData);
  }

  extractTransactionData(transaction) {
    return {
      txid: transaction.txid,
      sender: transaction.tx_sender,
      amount: this.parseAmount(transaction),
      timestamp: Date.now(),
      blockHeight: transaction.block_height
    };
  }

  parseAmount(transaction) {
    // Extract amount from contract call arguments
    try {
      const contractCall = transaction.tx_result?.value;
      return contractCall?.args?.[0] || 0;
    } catch (error) {
      console.error('Error parsing amount:', error);
      return 0;
    }
  }

  async updateMonitoringMetrics(eventType, txData) {
    try {
      await axios.post(`${this.services.monitoring}/api/events`, {
        type: eventType,
        txid: txData.txid,
        sender: txData.sender,
        amount: txData.amount,
        timestamp: txData.timestamp
      });
    } catch (error) {
      console.error('Failed to update monitoring:', error.message);
    }
  }

  async updateLeaderboard(userAddress, amountChange) {
    try {
      await axios.post(`${this.services.leaderboard}/api/update/${userAddress}`, {
        amountChange,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Failed to update leaderboard:', error.message);
    }
  }

  async triggerNotifications(eventType, txData) {
    try {
      await axios.post(`${this.services.notifications}/api/trigger`, {
        type: eventType,
        userId: txData.sender,
        amount: txData.amount,
        txid: txData.txid
      });
    } catch (error) {
      console.error('Failed to trigger notifications:', error.message);
    }
  }

  broadcastEvent(eventType, txData) {
    const message = JSON.stringify({
      type: eventType,
      data: txData,
      timestamp: Date.now()
    });

    this.wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  addWebSocketClient(ws) {
    this.wsClients.add(ws);
    ws.on('close', () => this.wsClients.delete(ws));
  }
}

module.exports = RealTimeEventProcessor;
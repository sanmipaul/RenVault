const { ChainhookClient } = require('@hirosystems/chainhooks-client');

class RenVaultChainhooksClient {
  constructor() {
    this.client = new ChainhookClient({
      baseUrl: process.env.CHAINHOOKS_URL || 'http://localhost:20456'
    });
    this.contractAddress = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
    this.contractName = 'ren-vault';
  }

  async createDepositHook() {
    const hookSpec = {
      chain: 'stacks',
      uuid: 'renvault-deposits',
      name: 'RenVault Deposit Monitor',
      version: 1,
      networks: {
        mainnet: {
          if_this: {
            scope: 'contract_call',
            contract_identifier: `${this.contractAddress}.${this.contractName}`,
            method: 'deposit'
          },
          then_that: {
            http_post: {
              url: 'http://localhost:3006/webhooks/deposit',
              authorization_header: 'Bearer ' + process.env.WEBHOOK_SECRET
            }
          }
        }
      }
    };

    try {
      const response = await this.client.createHook(hookSpec);
      console.log('✅ Deposit hook created:', response.uuid);
      return response;
    } catch (error) {
      console.error('❌ Failed to create deposit hook:', error);
      throw error;
    }
  }

  async createWithdrawHook() {
    const hookSpec = {
      chain: 'stacks',
      uuid: 'renvault-withdrawals',
      name: 'RenVault Withdrawal Monitor',
      version: 1,
      networks: {
        mainnet: {
          if_this: {
            scope: 'contract_call',
            contract_identifier: `${this.contractAddress}.${this.contractName}`,
            method: 'withdraw'
          },
          then_that: {
            http_post: {
              url: 'http://localhost:3006/webhooks/withdraw',
              authorization_header: 'Bearer ' + process.env.WEBHOOK_SECRET
            }
          }
        }
      }
    };

    try {
      const response = await this.client.createHook(hookSpec);
      console.log('✅ Withdrawal hook created:', response.uuid);
      return response;
    } catch (error) {
      console.error('❌ Failed to create withdrawal hook:', error);
      throw error;
    }
  }

  async listHooks() {
    try {
      const hooks = await this.client.listHooks();
      console.log('📋 Active hooks:', hooks.length);
      return hooks;
    } catch (error) {
      console.error('❌ Failed to list hooks:', error);
      throw error;
    }
  }

  async deleteHook(uuid) {
    try {
      await this.client.deleteHook(uuid);
      console.log('🗑️ Hook deleted:', uuid);
    } catch (error) {
      console.error('❌ Failed to delete hook:', error);
      throw error;
    }
  }
}

module.exports = RenVaultChainhooksClient;
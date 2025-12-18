const API_BASE_URL = 'https://api.mainnet.hiro.so';
const CONTRACT_ADDRESS = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
const CONTRACT_NAME = 'ren-vault';

class RenVaultAPI {
  async getUserBalance(address) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-balance`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: address,
            arguments: [`0x${Buffer.from(address).toString('hex')}`]
          })
        }
      );
      const data = await response.json();
      return data.result ? parseInt(data.result.substr(2), 16) : 0;
    } catch (error) {
      return 0;
    }
  }

  async getUserPoints(address) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-points`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: address,
            arguments: [`0x${Buffer.from(address).toString('hex')}`]
          })
        }
      );
      const data = await response.json();
      return data.result ? parseInt(data.result.substr(2), 16) : 0;
    } catch (error) {
      return 0;
    }
  }
}

export default new RenVaultAPI();
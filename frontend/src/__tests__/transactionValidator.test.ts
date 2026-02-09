import { validateTransactionAmount, validateContractAddress, validateTransactionDetails } from '../utils/transactionValidator';
import { TransactionDetails } from '../services/transaction/TransactionService';

describe('Transaction Validation', () => {
  it('should validate correct transaction amount', () => {
    expect(validateTransactionAmount(100)).toBe(true);
    expect(validateTransactionAmount(0)).toBe(false);
    expect(validateTransactionAmount(-1)).toBe(false);
    expect(validateTransactionAmount(1000001)).toBe(false);
  });

  it('should validate contract address format', () => {
    expect(validateContractAddress('SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY.ren-vault')).toBe(true);
    expect(validateContractAddress('invalid')).toBe(false);
  });

  it('should validate transaction details', () => {
    const valid: TransactionDetails = {
      contractAddress: 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY.ren-vault',
      contractName: 'ren-vault',
      functionName: 'deposit',
      functionArgs: [],
      amount: 100,
      network: 'mainnet'
    };
    expect(validateTransactionDetails(valid)).toHaveLength(0);
  });
});

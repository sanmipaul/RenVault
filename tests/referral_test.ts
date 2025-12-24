import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Referral allows user registration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    const referrer = accounts.get('wallet_2')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('referral', 'register-referral', [
        types.principal(referrer.address)
      ], user.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Referral prevents self-referral",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('referral', 'register-referral', [
        types.principal(user.address)
      ], user.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectErr(), types.uint(402));
  }
});

Clarinet.test({
  name: "Referral tracks referrer data",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    const referrer = accounts.get('wallet_2')!;
    
    chain.mineBlock([
      Tx.contractCall('referral', 'register-referral', [
        types.principal(referrer.address)
      ], user.address)
    ]);
    
    let count = chain.callReadOnlyFn('referral', 'get-referral-count', [
      types.principal(referrer.address)
    ], user.address);
    
    assertEquals(count.result.expectOk(), types.uint(1));
  }
});

Clarinet.test({
  name: "Referral processes rewards correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;
    const referrer = accounts.get('wallet_2')!;
    
    chain.mineBlock([
      Tx.contractCall('referral', 'register-referral', [
        types.principal(referrer.address)
      ], user.address)
    ]);
    
    let block = chain.mineBlock([
      Tx.contractCall('referral', 'process-referral-reward', [
        types.principal(user.address),
        types.uint(1000000)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(50000));
  }
});
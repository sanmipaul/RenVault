import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Yield strategy allows staking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('yield-strategy', 'stake-for-yield', [
        types.uint(1000000)
      ], user.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(1000000));
  }
});

Clarinet.test({
  name: "Yield strategy tracks user stakes",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    
    chain.mineBlock([
      Tx.contractCall('yield-strategy', 'stake-for-yield', [
        types.uint(500000)
      ], user.address)
    ]);
    
    let stake = chain.callReadOnlyFn('yield-strategy', 'get-user-stake', [
      types.principal(user.address)
    ], user.address);
    
    assertEquals(stake.result.expectOk(), types.uint(500000));
  }
});

Clarinet.test({
  name: "Yield strategy allows unstaking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    
    chain.mineBlock([
      Tx.contractCall('yield-strategy', 'stake-for-yield', [
        types.uint(1000000)
      ], user.address)
    ]);
    
    let block = chain.mineBlock([
      Tx.contractCall('yield-strategy', 'unstake', [
        types.uint(500000)
      ], user.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(500000));
  }
});
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
    
    assertEquals(stake.result.expectUint(500000), types.uint(500000));
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

Clarinet.test({
  name: "Yield strategy adjusts rewards based on Oracle price",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;
    
    // Setup: Authorize oracle updater
    chain.mineBlock([
      Tx.contractCall('oracle', 'add-oracle', [
        types.principal(deployer.address)
      ], deployer.address)
    ]);

    // Scenario 1: Base rewards (Price <= 100)
    chain.mineBlock([
      Tx.contractCall('oracle', 'update-price', [
        types.uint(100)
      ], deployer.address),
      Tx.contractCall('yield-strategy', 'stake-for-yield', [
        types.uint(10000)
      ], user.address)
    ]);

    let block1 = chain.mineBlock([
      Tx.contractCall('yield-strategy', 'distribute-rewards', [], deployer.address)
    ]);
    
    // Base rate 1% = 100 rewards
    assertEquals(block1.receipts[0].result.expectOk(), types.uint(100));

    // Scenario 2: Dynamic rewards (Price > 100)
    chain.mineBlock([
      Tx.contractCall('oracle', 'update-price', [
        types.uint(150)
      ], deployer.address)
    ]);

    let block2 = chain.mineBlock([
      Tx.contractCall('yield-strategy', 'distribute-rewards', [], deployer.address)
    ]);
    
    // Enhanced rate 1.5% = 150 rewards
    assertEquals(block2.receipts[0].result.expectOk(), types.uint(150));
  }
});

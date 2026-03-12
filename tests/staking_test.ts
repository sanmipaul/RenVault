import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Staking allows users to stake STX",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('staking', 'stake', [
        types.uint(2000000)
      ], user.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(2000000));
  }
});

Clarinet.test({
  name: "Staking tracks user stakes correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    
    chain.mineBlock([
      Tx.contractCall('staking', 'stake', [
        types.uint(1500000)
      ], user.address)
    ]);
    
    let stake = chain.callReadOnlyFn('staking', 'get-user-stake', [
      types.principal(user.address)
    ], user.address);

    assertEquals(stake.result.expectUint(), 1500000);
  }
});

Clarinet.test({
  name: "Staking calculates rewards correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    
    chain.mineBlock([
      Tx.contractCall('staking', 'stake', [
        types.uint(1000000)
      ], user.address)
    ]);
    
    // Advance blocks to simulate time passage
    chain.mineEmptyBlockUntil(200);
    
    let rewards = chain.callReadOnlyFn('staking', 'calculate-rewards', [
      types.principal(user.address)
    ], user.address);
    
    // Should have some rewards after time passage
    const rewardAmount = rewards.result.expectOk();
    assertEquals(rewardAmount > types.uint(0), true);
  }
});

Clarinet.test({
  name: "Staking rejects stake below minimum",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;

    let block = chain.mineBlock([
      Tx.contractCall('staking', 'stake', [
        types.uint(500000) // below 1 STX minimum
      ], user.address)
    ]);

    assertEquals(block.receipts[0].result.expectErr(), types.uint(404));
  }
});

Clarinet.test({
  name: "Staking enforces max-stake cap per user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;

    // Lower the max-stake so the test is feasible
    chain.mineBlock([
      Tx.contractCall('staking', 'set-max-stake', [
        types.uint(5000000)
      ], deployer.address)
    ]);

    // Stake up to the cap
    chain.mineBlock([
      Tx.contractCall('staking', 'stake', [
        types.uint(5000000)
      ], user.address)
    ]);

    // Attempt to stake 1 more uSTX — should fail with err u411
    let block = chain.mineBlock([
      Tx.contractCall('staking', 'stake', [
        types.uint(1000000)
      ], user.address)
    ]);

    assertEquals(block.receipts[0].result.expectErr(), types.uint(411));
  }
});

Clarinet.test({
  name: "Unstake rejects zero-amount withdrawal with err u408",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;

    chain.mineBlock([
      Tx.contractCall('staking', 'stake', [
        types.uint(1000000)
      ], user.address)
    ]);

    // Advance past lock period
    chain.mineEmptyBlockUntil(200);

    let block = chain.mineBlock([
      Tx.contractCall('staking', 'unstake', [
        types.uint(0)
      ], user.address)
    ]);

    assertEquals(block.receipts[0].result.expectErr(), types.uint(408));
  }
});

Clarinet.test({
  name: "Staking prevents early unstaking",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;

    chain.mineBlock([
      Tx.contractCall('staking', 'stake', [
        types.uint(1000000)
      ], user.address)
    ]);

    let block = chain.mineBlock([
      Tx.contractCall('staking', 'unstake', [
        types.uint(500000)
      ], user.address)
    ]);

    assertEquals(block.receipts[0].result.expectErr(), types.uint(405));
  }
});
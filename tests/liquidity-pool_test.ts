import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can create liquidity pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const tokenA = deployer.address;
    const tokenB = deployer.address;

    let block = chain.mineBlock([
      Tx.contractCall('liquidity-pool', 'create-pool', [
        types.principal(tokenA),
        types.principal(tokenB),
        types.uint(100000),
        types.uint(50000)
      ], deployer.address)
    ]);

    assertEquals(block.receipts.length, 1);
    // Upgrade string comparison to proper Clarinet typed assertion
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Can add liquidity to pool",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;

    // Setup: Create the pool first in this fresh, isolated test state
    let setupBlock = chain.mineBlock([
      Tx.contractCall('liquidity-pool', 'create-pool', [
        types.principal(deployer.address),
        types.principal(deployer.address),
        types.uint(100000),
        types.uint(50000)
      ], deployer.address)
    ]);
    // Actively assert the setup succeeded
    setupBlock.receipts[0].result.expectOk();

    let block = chain.mineBlock([
      Tx.contractCall('liquidity-pool', 'add-liquidity', [
        types.principal(deployer.address),
        types.principal(deployer.address),
        types.uint(10000),
        types.uint(5000)
      ], user.address)
    ]);

    // Upgrade string comparison to proper Clarinet typed assertion
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Can get pool information",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;

    // Setup: Create the pool first before trying to read it
    let setupBlock = chain.mineBlock([
      Tx.contractCall('liquidity-pool', 'create-pool', [
        types.principal(deployer.address),
        types.principal(deployer.address),
        types.uint(100000),
        types.uint(50000)
      ], deployer.address)
    ]);
    // Actively assert the setup succeeded
    setupBlock.receipts[0].result.expectOk();

    let result = chain.callReadOnlyFn(
      'liquidity-pool',
      'get-pool',
      [types.principal(deployer.address), types.principal(deployer.address)],
      deployer.address
    );

    // Ensure the returned data structure contains the expected key
    assertEquals(result.result.includes('reserve-a'), true);
  }
});

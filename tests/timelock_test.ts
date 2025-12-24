import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Timelock allows queueing transactions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('timelock', 'queue-transaction', [
        types.principal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.test'),
        types.ascii('test-function'),
        types.list([]),
        types.uint(1440)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
  }
});

Clarinet.test({
  name: "Timelock prevents early execution",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    chain.mineBlock([
      Tx.contractCall('timelock', 'queue-transaction', [
        types.principal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.test'),
        types.ascii('test-function'),
        types.list([]),
        types.uint(1440)
      ], deployer.address)
    ]);
    
    let block = chain.mineBlock([
      Tx.contractCall('timelock', 'execute-transaction', [
        types.uint(1)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectErr(), types.uint(402));
  }
});

Clarinet.test({
  name: "Timelock allows cancellation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    chain.mineBlock([
      Tx.contractCall('timelock', 'queue-transaction', [
        types.principal('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.test'),
        types.ascii('test-function'),
        types.list([]),
        types.uint(1440)
      ], deployer.address)
    ]);
    
    let block = chain.mineBlock([
      Tx.contractCall('timelock', 'cancel-transaction', [
        types.uint(1)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Bridge contract initializes correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('bridge', 'init-bridge', [], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Bridge locks assets for cross-chain transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;
    const txId = new Uint8Array(32).fill(1);
    
    let block = chain.mineBlock([
      Tx.contractCall('bridge', 'lock-for-bridge', [
        types.uint(1000000),
        types.ascii('ethereum'),
        types.buff(txId)
      ], user.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(999000));
  }
});

Clarinet.test({
  name: "Bridge can be paused by owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('bridge', 'pause-bridge', [], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
    
    let status = chain.callReadOnlyFn('bridge', 'get-bridge-status', [], deployer.address);
    assertEquals(status.result.expectOk(), types.bool(true));
  }
});
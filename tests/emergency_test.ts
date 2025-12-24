import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Emergency contract allows authorized pause",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('emergency', 'emergency-pause', [
        types.ascii('Security incident detected')
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Emergency contract tracks pause state",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    chain.mineBlock([
      Tx.contractCall('emergency', 'emergency-pause', [
        types.ascii('Test pause')
      ], deployer.address)
    ]);
    
    let status = chain.callReadOnlyFn('emergency', 'is-paused', [], deployer.address);
    assertEquals(status.result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Emergency contract allows resume operations",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    chain.mineBlock([
      Tx.contractCall('emergency', 'emergency-pause', [
        types.ascii('Test pause')
      ], deployer.address)
    ]);
    
    let block = chain.mineBlock([
      Tx.contractCall('emergency', 'resume-operations', [], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
  }
});
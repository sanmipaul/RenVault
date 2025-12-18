import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Security checks validate amounts correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let result = chain.callReadOnlyFn('security-checks', 'validate-amount', [
      types.uint(1000000)
    ], deployer.address);
    
    assertEquals(result.result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Security checks reject invalid principals",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let result = chain.callReadOnlyFn('security-checks', 'validate-principal', [
      types.principal('SP000000000000000000002Q6VF78')
    ], deployer.address);
    
    assertEquals(result.result.expectOk(), types.bool(false));
  }
});

Clarinet.test({
  name: "Audit logging works correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('security-checks', 'log-action', [
        types.ascii('test-action')
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
  }
});
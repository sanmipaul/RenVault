import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Analytics contract records deposits correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('analytics', 'record-deposit', [
        types.principal(user.address),
        types.uint(1000000)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Analytics contract tracks user activity",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;
    
    chain.mineBlock([
      Tx.contractCall('analytics', 'record-deposit', [
        types.principal(user.address),
        types.uint(500000)
      ], deployer.address)
    ]);
    
    let activity = chain.callReadOnlyFn('analytics', 'get-user-activity', [
      types.principal(user.address)
    ], deployer.address);
    
    const result = activity.result.expectSome().expectTuple();
    assertEquals(result['deposits'], types.uint(500000));
  }
});
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Multi-asset vault supports STX deposits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('multi-asset-vault', 'deposit-asset', [
        types.principal('STX'),
        types.uint(1000000)
      ], user.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    assertEquals(block.receipts[0].result.expectOk(), types.uint(990000));
  }
});

Clarinet.test({
  name: "Multi-asset vault supports asset registration",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('multi-asset-vault', 'add-supported-asset', [
        types.principal('SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token')
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Asset manager handles SIP-010 deposits",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    
    let balance = chain.callReadOnlyFn('asset-manager', 'get-user-balance', [
      types.principal(user.address),
      types.principal('SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token')
    ], user.address);
    
    assertEquals(balance.result.expectOk(), types.uint(0));
  }
});
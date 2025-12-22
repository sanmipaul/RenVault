import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "NFT rewards contract mints achievement badges",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('nft-rewards', 'mint-achievement', [
        types.principal(user.address),
        types.ascii('first-deposit')
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
  }
});

Clarinet.test({
  name: "NFT rewards tracks user achievements",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;
    
    chain.mineBlock([
      Tx.contractCall('nft-rewards', 'check-achievements', [
        types.principal(user.address),
        types.uint(1),
        types.uint(1000000),
        types.uint(10)
      ], deployer.address)
    ]);
    
    let achievements = chain.callReadOnlyFn('nft-rewards', 'get-user-achievements', [
      types.principal(user.address)
    ], deployer.address);
    
    assertEquals(achievements.result.expectOk().expectList().length, 1);
  }
});

Clarinet.test({
  name: "NFT rewards implements SIP009 standard",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let lastId = chain.callReadOnlyFn('nft-rewards', 'get-last-token-id', [], deployer.address);
    assertEquals(lastId.result.expectOk(), types.uint(0));
  }
});
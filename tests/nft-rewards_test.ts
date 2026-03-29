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
    
    // Setup: Capture and assert the setup block
    let setupBlock = chain.mineBlock([
      Tx.contractCall('nft-rewards', 'check-achievements', [
        types.principal(user.address),
        types.uint(1),
        types.uint(1000000),
        types.uint(10)
      ], deployer.address)
    ]);
    
    // Actively assert the achievements were actually triggered
    setupBlock.receipts[0].result.expectOk();
    
    let achievements = chain.callReadOnlyFn('nft-rewards', 'get-user-achievements', [
      types.principal(user.address)
    ], deployer.address);
    
    // FIX: Removed invalid .expectList().length chain. 
    // SENIOR NOTE: I am assuming the list returns token IDs (uints). 
    // If your contract returns a list of ascii strings instead, change types.uint(1) to types.ascii('first-deposit')
    assertEquals(achievements.result.expectOk(), types.list([types.uint(1)]));
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

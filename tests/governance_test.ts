import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Governance allows proposal creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('governance', 'create-proposal', [
        types.ascii('Test Proposal'),
        types.ascii('This is a test proposal for governance')
      ], user.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.uint(1));
  }
});

Clarinet.test({
  name: "Governance allows voting on proposals",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user = accounts.get('wallet_1')!;
    const voter = accounts.get('wallet_2')!;
    
    chain.mineBlock([
      Tx.contractCall('governance', 'create-proposal', [
        types.ascii('Test Proposal'),
        types.ascii('Test description')
      ], user.address)
    ]);
    
    let block = chain.mineBlock([
      Tx.contractCall('governance', 'vote', [
        types.uint(1),
        types.bool(true)
      ], voter.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Governance tracks voting power",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('governance', 'set-voting-power', [
        types.principal(user.address),
        types.uint(5)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
    
    let power = chain.callReadOnlyFn('governance', 'get-voting-power', [
      types.principal(user.address)
    ], deployer.address);
    
    assertEquals(power.result.expectOk(), types.uint(5));
  }
});
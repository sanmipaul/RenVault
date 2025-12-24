import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Oracle allows authorized price updates",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('oracle', 'update-price', [
        types.ascii('STX'),
        types.uint(500000),
        types.uint(6),
        types.ascii('coinbase')
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
  }
});

Clarinet.test({
  name: "Oracle returns current price",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    chain.mineBlock([
      Tx.contractCall('oracle', 'update-price', [
        types.ascii('STX'),
        types.uint(500000),
        types.uint(6),
        types.ascii('coinbase')
      ], deployer.address)
    ]);
    
    let price = chain.callReadOnlyFn('oracle', 'get-price', [
      types.ascii('STX')
    ], deployer.address);
    
    assertEquals(price.result.expectOk(), types.uint(500000));
  }
});

Clarinet.test({
  name: "Oracle manages operator permissions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const operator = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('oracle', 'add-oracle-operator', [
        types.principal(operator.address)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), types.bool(true));
    
    let isOperator = chain.callReadOnlyFn('oracle', 'is-oracle-operator', [
      types.principal(operator.address)
    ], deployer.address);
    
    assertEquals(isOperator.result.expectOk(), types.bool(true));
  }
});
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Integration: Full user journey",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Multiple users deposit
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], wallet1.address),
            Tx.contractCall('ren-vault', 'deposit', [types.uint(2000000)], wallet2.address)
        ]);
        
        block.receipts[0].result.expectOk();
        block.receipts[1].result.expectOk();
        
        // Check total fees collected
        let feesResult = chain.callReadOnlyFn('ren-vault', 'get-fees-collected', [], wallet1.address);
        feesResult.result.expectOk().expectUint(30000); // 1% of 3M total
        
        // Partial withdrawals
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'withdraw', [types.uint(500000)], wallet1.address),
            Tx.contractCall('ren-vault', 'withdraw', [types.uint(1000000)], wallet2.address)
        ]);
        
        // Check final balances
        let balance1 = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balance1.result.expectOk().expectUint(490000);
        
        let balance2 = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet2.address)], wallet2.address);
        balance2.result.expectOk().expectUint(980000);
    },
});

Clarinet.test({
    name: "Integration: Fee accumulation and withdrawal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const users = [accounts.get('wallet_1')!, accounts.get('wallet_2')!, accounts.get('wallet_3')!];
        
        // Multiple deposits from different users
        let deposits = users.map(user => 
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], user.address)
        );
        
        let block = chain.mineBlock(deposits);
        block.receipts.forEach(receipt => receipt.result.expectOk());
        
        // Check accumulated fees
        let feesResult = chain.callReadOnlyFn('ren-vault', 'get-fees-collected', [], deployer.address);
        feesResult.result.expectOk().expectUint(30000); // 1% of 3M
        
        // Owner withdraws all fees
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'owner-withdraw-fees', [], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Verify fees reset to zero
        feesResult = chain.callReadOnlyFn('ren-vault', 'get-fees-collected', [], deployer.address);
        feesResult.result.expectOk().expectUint(0);
    },
});
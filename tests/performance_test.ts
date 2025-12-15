import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';

Clarinet.test({
    name: "Performance: Batch deposits",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const users = [
            accounts.get('wallet_1')!,
            accounts.get('wallet_2')!,
            accounts.get('wallet_3')!,
            accounts.get('wallet_4')!
        ];
        
        // Batch multiple deposits in single block
        const deposits = users.map(user => 
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], user.address)
        );
        
        let block = chain.mineBlock(deposits);
        
        // All should succeed
        block.receipts.forEach(receipt => receipt.result.expectOk());
        
        // Verify total fees
        let feesResult = chain.callReadOnlyFn('ren-vault', 'get-fees-collected', [], users[0].address);
        feesResult.result.expectOk().expectUint(40000); // 4 * 1% of 1M
    },
});

Clarinet.test({
    name: "Performance: Sequential operations",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // 10 sequential deposits
        for (let i = 0; i < 10; i++) {
            let block = chain.mineBlock([
                Tx.contractCall('ren-vault', 'deposit', [types.uint(100000)], wallet1.address)
            ]);
            block.receipts[0].result.expectOk();
        }
        
        // Check final state
        let pointsResult = chain.callReadOnlyFn('ren-vault', 'get-points', [types.principal(wallet1.address)], wallet1.address);
        pointsResult.result.expectOk().expectUint(10);
        
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(990000); // 10 * 99000
    },
});

Clarinet.test({
    name: "Performance: Large withdrawal after many deposits",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Multiple deposits
        let deposits = [];
        for (let i = 0; i < 5; i++) {
            deposits.push(Tx.contractCall('ren-vault', 'deposit', [types.uint(2000000)], wallet1.address));
        }
        
        let block = chain.mineBlock(deposits);
        block.receipts.forEach(receipt => receipt.result.expectOk());
        
        // Large withdrawal
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'withdraw', [types.uint(9000000)], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Check remaining balance
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(900000); // 9.9M - 9M
    },
});
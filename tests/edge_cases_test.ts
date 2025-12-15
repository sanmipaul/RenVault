import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';

Clarinet.test({
    name: "Edge case: Maximum uint deposit",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const maxUint = 340282366920938463463374607431768211455n;
        
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(maxUint)], wallet1.address)
        ]);
        
        // Should handle large numbers correctly
        block.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Edge case: Minimum valid deposit",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1)], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Check balance is 0 due to fee (1% of 1 = 0)
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(0);
    },
});

Clarinet.test({
    name: "Edge case: Exact balance withdrawal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Deposit
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], wallet1.address)
        ]);
        
        // Withdraw exact balance
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'withdraw', [types.uint(990000)], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Balance should be zero
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(0);
    },
});

Clarinet.test({
    name: "Edge case: Multiple fee withdrawals",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // Generate fees
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], wallet1.address)
        ]);
        
        // First fee withdrawal
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'owner-withdraw-fees', [], deployer.address)
        ]);
        block.receipts[0].result.expectOk();
        
        // Second fee withdrawal should fail (no fees)
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'owner-withdraw-fees', [], deployer.address)
        ]);
        block.receipts[0].result.expectErr(types.uint(101)); // err-invalid-amount
    },
});
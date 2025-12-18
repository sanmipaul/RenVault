import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';

Clarinet.test({
    name: "Security: Reentrancy protection",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Deposit first
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], wallet1.address)
        ]);
        
        // Try multiple withdrawals in same block
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'withdraw', [types.uint(500000)], wallet1.address),
            Tx.contractCall('ren-vault', 'withdraw', [types.uint(500000)], wallet1.address)
        ]);
        
        // First should succeed, second should fail
        block.receipts[0].result.expectOk();
        block.receipts[1].result.expectErr(types.uint(102)); // insufficient balance
    },
});

Clarinet.test({
    name: "Security: Access control validation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const attacker = accounts.get('wallet_1')!;
        
        // Generate some fees
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], attacker.address)
        ]);
        
        // Attacker tries to withdraw fees
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'owner-withdraw-fees', [], attacker.address)
        ]);
        
        block.receipts[0].result.expectErr(types.uint(100)); // err-owner-only
        
        // Only deployer can withdraw
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'owner-withdraw-fees', [], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Security: Integer overflow protection",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Large deposit that could cause overflow
        const largeAmount = 340282366920938463463374607431768211455n;
        
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(largeAmount)], wallet1.address)
        ]);
        
        // Should handle without overflow
        block.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Security: Balance manipulation prevention",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        // Wallet1 deposits
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], wallet1.address)
        ]);
        
        // Wallet2 cannot withdraw wallet1's funds
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'withdraw', [types.uint(500000)], wallet2.address)
        ]);
        
        block.receipts[0].result.expectErr(types.uint(102)); // insufficient balance
        
        // Wallet1's balance unchanged
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(990000);
    },
});
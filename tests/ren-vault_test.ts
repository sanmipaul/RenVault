import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Deposit generates fees and points (Clarity 4)",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Check user balance (99% of deposit)
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(990000);
        
        // Check commitment points incremented
        let pointsResult = chain.callReadOnlyFn('ren-vault', 'get-points', [types.principal(wallet1.address)], wallet1.address);
        pointsResult.result.expectOk().expectUint(1);
        
        // Check fees collected (1% of deposit)
        let feesResult = chain.callReadOnlyFn('ren-vault', 'get-fees-collected', [], wallet1.address);
        feesResult.result.expectOk().expectUint(10000);
    },
});

Clarinet.test({
    name: "Withdraw reduces balance correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // First deposit
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], wallet1.address)
        ]);
        
        // Then withdraw
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'withdraw', [types.uint(500000)], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Check remaining balance
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(490000);
    },
});

Clarinet.test({
    name: "Owner can withdraw fees",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        // User deposits to generate fees
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], wallet1.address)
        ]);
        
        // Owner withdraws fees
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'owner-withdraw-fees', [], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Check fees are now zero
        let feesResult = chain.callReadOnlyFn('ren-vault', 'get-fees-collected', [], deployer.address);
        feesResult.result.expectOk().expectUint(0);
    },
});

Clarinet.test({
    name: "Non-owner cannot withdraw fees",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'owner-withdraw-fees', [], wallet1.address)
        ]);
        
        block.receipts[0].result.expectErr(types.uint(100)); // err-owner-only
    },
});

Clarinet.test({
    name: "Cannot withdraw more than balance",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // Deposit small amount
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(100000)], wallet1.address)
        ]);
        
        // Try to withdraw more than balance
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'withdraw', [types.uint(200000)], wallet1.address)
        ]);
        
        block.receipts[0].result.expectErr(types.uint(102)); // err-insufficient-balance
    },
});

Clarinet.test({
    name: "Cannot deposit zero amount",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(0)], wallet1.address)
        ]);
        
        block.receipts[0].result.expectErr(types.uint(101)); // err-invalid-amount
    },
});

Clarinet.test({
    name: "Multiple deposits increment commitment points",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        
        // First deposit
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(100000)], wallet1.address)
        ]);
        
        // Second deposit
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(200000)], wallet1.address)
        ]);
        
        // Check commitment points = 2
        let pointsResult = chain.callReadOnlyFn('ren-vault', 'get-points', [types.principal(wallet1.address)], wallet1.address);
        pointsResult.result.expectOk().expectUint(2);
        
        // Check total balance (99% of both deposits)
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(297000); // 99000 + 198000
    },
});

Clarinet.test({
    name: "Get user stats returns correct data",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Deposit to create stats
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(500000)], wallet1.address)
        ]);

        // Get user stats
        let statsResult = chain.callReadOnlyFn('ren-vault', 'get-user-stats', [types.principal(wallet1.address)], wallet1.address);
        let stats = statsResult.result.expectOk().expectTuple();

        assertEquals(stats['balance'], types.uint(495000));
        assertEquals(stats['points'], types.uint(1));
    },
});

// ════════════════════════════════════════════════════════════════════════════
// BULK OPERATIONS TESTS
// ════════════════════════════════════════════════════════════════════════════

Clarinet.test({
    name: "Bulk deposit multiple amounts successfully",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Bulk deposit 3 amounts
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-deposit', [
                types.list([types.uint(100000), types.uint(200000), types.uint(150000)])
            ], wallet1.address)
        ]);

        block.receipts[0].result.expectOk();

        // Check final balance: 99% of (100000 + 200000 + 150000) = 99% of 450000 = 445500
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(445500);

        // Check commitment points: 3 points (1 per deposit)
        let pointsResult = chain.callReadOnlyFn('ren-vault', 'get-points', [types.principal(wallet1.address)], wallet1.address);
        pointsResult.result.expectOk().expectUint(3);

        // Check total fees: 1% of 450000 = 4500
        let feesResult = chain.callReadOnlyFn('ren-vault', 'get-fees-collected', [], wallet1.address);
        feesResult.result.expectOk().expectUint(4500);
    },
});

Clarinet.test({
    name: "Bulk deposit with maximum 10 deposits",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Bulk deposit 10 amounts of 10000 each
        const amounts = Array.from({length: 10}, () => types.uint(10000));
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-deposit', [types.list(amounts)], wallet1.address)
        ]);

        block.receipts[0].result.expectOk();

        // Check final balance: 99% of (10000 * 10) = 99% of 100000 = 99000
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(99000);

        // Check commitment points: 10 points
        let pointsResult = chain.callReadOnlyFn('ren-vault', 'get-points', [types.principal(wallet1.address)], wallet1.address);
        pointsResult.result.expectOk().expectUint(10);
    },
});

Clarinet.test({
    name: "Bulk deposit rejects empty list",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-deposit', [types.list([])], wallet1.address)
        ]);

        block.receipts[0].result.expectErr(types.uint(101)); // err-invalid-amount
    },
});

Clarinet.test({
    name: "Bulk deposit rejects zero amount in list",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-deposit', [
                types.list([types.uint(100000), types.uint(0), types.uint(50000)])
            ], wallet1.address)
        ]);

        block.receipts[0].result.expectErr(types.uint(101)); // err-invalid-amount from zero amount
    },
});

Clarinet.test({
    name: "Bulk deposit processes individual validations",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // First do a small deposit
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(10000)], wallet1.address)
        ]);

        // Try bulk deposit with amounts that would be valid individually but fail as batch
        // This tests that each deposit is validated independently
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-deposit', [
                types.list([types.uint(50000), types.uint(75000)])
            ], wallet1.address)
        ]);

        block.receipts[0].result.expectOk();

        // Check final balance includes both deposits
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(124500); // 9900 + 49500 + 74250
    },
});

Clarinet.test({
    name: "Bulk withdraw multiple amounts successfully",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // First deposit enough to withdraw from
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(500000)], wallet1.address)
        ]);

        // Bulk withdraw 3 amounts
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-withdraw', [
                types.list([types.uint(100000), types.uint(150000), types.uint(50000)])
            ], wallet1.address)
        ]);

        block.receipts[0].result.expectOk();

        // Check remaining balance: 495000 - 300000 = 195000
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(195000);
    },
});

Clarinet.test({
    name: "Bulk withdraw with maximum 5 withdrawals",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Deposit large amount
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(1000000)], wallet1.address)
        ]);

        // Bulk withdraw 5 amounts of 50000 each
        const amounts = Array.from({length: 5}, () => types.uint(50000));
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-withdraw', [types.list(amounts)], wallet1.address)
        ]);

        block.receipts[0].result.expectOk();

        // Check remaining balance: 990000 - 250000 = 740000
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balanceResult.result.expectOk().expectUint(740000);
    },
});

Clarinet.test({
    name: "Bulk withdraw rejects insufficient balance",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Deposit small amount
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(100000)], wallet1.address)
        ]);

        // Try to bulk withdraw more than balance
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-withdraw', [
                types.list([types.uint(50000), types.uint(60000)]) // Total 110000 > 99000
            ], wallet1.address)
        ]);

        block.receipts[0].result.expectErr(types.uint(102)); // err-insufficient-balance
    },
});

Clarinet.test({
    name: "Bulk withdraw rejects zero amount in list",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Deposit some amount
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(200000)], wallet1.address)
        ]);

        // Try bulk withdraw with zero amount
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-withdraw', [
                types.list([types.uint(50000), types.uint(0), types.uint(30000)])
            ], wallet1.address)
        ]);

        block.receipts[0].result.expectErr(types.uint(101)); // err-invalid-amount
    },
});

Clarinet.test({
    name: "Bulk withdraw rejects empty list",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-withdraw', [types.list([])], wallet1.address)
        ]);

        block.receipts[0].result.expectErr(types.uint(101)); // err-invalid-amount
    },
});

Clarinet.test({
    name: "Bulk operations maintain correct fee accumulation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Single deposit first
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(100000)], wallet1.address)
        ]);

        // Bulk deposit
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-deposit', [
                types.list([types.uint(200000), types.uint(150000)])
            ], wallet1.address)
        ]);

        // Check total fees: 1% of (100000 + 200000 + 150000) = 1% of 450000 = 4500
        let feesResult = chain.callReadOnlyFn('ren-vault', 'get-fees-collected', [], wallet1.address);
        feesResult.result.expectOk().expectUint(4500);
    },
});

Clarinet.test({
    name: "Bulk operations work with different users",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;

        // Wallet1 bulk deposit
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-deposit', [
                types.list([types.uint(100000), types.uint(50000)])
            ], wallet1.address)
        ]);

        // Wallet2 bulk deposit
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-deposit', [
                types.list([types.uint(75000), types.uint(25000)])
            ], wallet2.address)
        ]);

        // Check wallet1 balance and points
        let balance1 = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balance1.result.expectOk().expectUint(148500); // 99% of 150000

        let points1 = chain.callReadOnlyFn('ren-vault', 'get-points', [types.principal(wallet1.address)], wallet1.address);
        points1.result.expectOk().expectUint(2);

        // Check wallet2 balance and points
        let balance2 = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet2.address)], wallet2.address);
        balance2.result.expectOk().expectUint(99000); // 99% of 100000

        let points2 = chain.callReadOnlyFn('ren-vault', 'get-points', [types.principal(wallet2.address)], wallet2.address);
        points2.result.expectOk().expectUint(2);
    },
});

Clarinet.test({
    name: "Mixed single and bulk operations work correctly",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        // Single deposit
        let block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(50000)], wallet1.address)
        ]);

        // Bulk deposit
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-deposit', [
                types.list([types.uint(75000), types.uint(25000)])
            ], wallet1.address)
        ]);

        // Single deposit again
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'deposit', [types.uint(100000)], wallet1.address)
        ]);

        // Bulk withdraw
        block = chain.mineBlock([
            Tx.contractCall('ren-vault', 'bulk-withdraw', [
                types.list([types.uint(25000), types.uint(30000)])
            ], wallet1.address)
        ]);

        // Final checks
        let balanceResult = chain.callReadOnlyFn('ren-vault', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        // Expected: 99% of (50000 + 75000 + 25000 + 100000) - 55000 withdrawn = 99% of 225000 - 55000 = 222750 - 55000 = 167750
        balanceResult.result.expectOk().expectUint(167750);

        let pointsResult = chain.callReadOnlyFn('ren-vault', 'get-points', [types.principal(wallet1.address)], wallet1.address);
        pointsResult.result.expectOk().expectUint(4); // 1 + 2 + 1 deposits
    },
});

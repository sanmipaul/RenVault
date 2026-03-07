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
// ===== rewards.clar access-control tests =====

Clarinet.test({
    name: "Non-owner cannot call set-milestone-reward",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('rewards', 'set-milestone-reward', [types.uint(5), types.uint(1000000)], wallet1.address)
        ]);

        block.receipts[0].result.expectErr(types.uint(402)); // err-unauthorized
    },
});

Clarinet.test({
    name: "Owner can call set-milestone-reward",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;

        let block = chain.mineBlock([
            Tx.contractCall('rewards', 'set-milestone-reward', [types.uint(5), types.uint(1000000)], deployer.address)
        ]);

        block.receipts[0].result.expectOk();

        let rewardResult = chain.callReadOnlyFn('rewards', 'get-milestone-reward', [types.uint(5)], deployer.address);
        rewardResult.result.expectOk().expectUint(1000000);
    },
});

Clarinet.test({
    name: "Non-owner cannot call add-to-reward-pool",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;

        let block = chain.mineBlock([
            Tx.contractCall('rewards', 'add-to-reward-pool', [types.uint(5000000)], wallet1.address)
        ]);

        block.receipts[0].result.expectErr(types.uint(402)); // err-unauthorized
    },
});

Clarinet.test({
    name: "User can claim a milestone exactly once",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1  = accounts.get('wallet_1')!;

        // Owner sets up milestone and seeds pool
        chain.mineBlock([
            Tx.contractCall('rewards', 'set-milestone-reward', [types.uint(1), types.uint(500000)], deployer.address),
            Tx.contractCall('rewards', 'add-to-reward-pool',   [types.uint(1000000)], deployer.address),
        ]);

        // First claim should succeed
        let block = chain.mineBlock([
            Tx.contractCall('rewards', 'claim-milestone-reward', [types.uint(1)], wallet1.address)
        ]);
        block.receipts[0].result.expectOk().expectUint(500000);

        // Second claim of the same milestone must fail
        block = chain.mineBlock([
            Tx.contractCall('rewards', 'claim-milestone-reward', [types.uint(1)], wallet1.address)
        ]);
        block.receipts[0].result.expectErr(types.uint(401)); // err-already-claimed
    },
});

Clarinet.test({
    name: "User can claim multiple different milestones",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1  = accounts.get('wallet_1')!;

        chain.mineBlock([
            Tx.contractCall('rewards', 'set-milestone-reward', [types.uint(1), types.uint(100000)], deployer.address),
            Tx.contractCall('rewards', 'set-milestone-reward', [types.uint(5), types.uint(300000)], deployer.address),
            Tx.contractCall('rewards', 'add-to-reward-pool',   [types.uint(1000000)], deployer.address),
        ]);

        let block = chain.mineBlock([
            Tx.contractCall('rewards', 'claim-milestone-reward', [types.uint(1)], wallet1.address),
        ]);
        block.receipts[0].result.expectOk().expectUint(100000);

        block = chain.mineBlock([
            Tx.contractCall('rewards', 'claim-milestone-reward', [types.uint(5)], wallet1.address),
        ]);
        block.receipts[0].result.expectOk().expectUint(300000);

        let rewardsResult = chain.callReadOnlyFn('rewards', 'get-user-rewards', [types.principal(wallet1.address)], wallet1.address);
        rewardsResult.result.expectOk().expectUint(400000);
    },
});

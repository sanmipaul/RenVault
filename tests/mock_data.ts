export const mockUsers = {
    alice: 'ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE',
    bob: 'ST1J4G6RR643BCG8G8SR6M2D9Z9KXT2NJDRK3FBTK',
    charlie: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP'
};

export const testAmounts = {
    small: 100000,      // 0.1 STX
    medium: 1000000,    // 1 STX
    large: 10000000,    // 10 STX
    huge: 100000000     // 100 STX
};

export const expectedFees = {
    small: 1000,        // 1% of 0.1 STX
    medium: 10000,      // 1% of 1 STX
    large: 100000,      // 1% of 10 STX
    huge: 1000000       // 1% of 100 STX
};

export const expectedBalances = {
    small: 99000,       // 99% of 0.1 STX
    medium: 990000,     // 99% of 1 STX
    large: 9900000,     // 99% of 10 STX
    huge: 99000000      // 99% of 100 STX
};

export const errorCodes = {
    ownerOnly: 100,
    invalidAmount: 101,
    insufficientBalance: 102,
    transferFailed: 103
};
# RenVault API Reference

## Contract Functions

### Public Functions

#### `deposit(amount: uint)`
Deposits STX into the user's vault with 1% protocol fee.

**Parameters:**
- `amount`: Amount in microSTX (1 STX = 1,000,000 microSTX)

**Returns:**
```clarity
{
  deposited: uint,      // Amount added to user vault (99% of input)
  fee: uint,           // Protocol fee collected (1% of input)
  new-balance: uint,   // User's new vault balance
  commitment-points: uint // User's new commitment points
}
```

**Example:**
```javascript
// Deposit 10 STX
const amount = 10 * 1000000; // 10,000,000 microSTX
await contractCall('deposit', [amount]);
```

#### `withdraw(amount: uint)`
Withdraws STX from the user's vault.

**Parameters:**
- `amount`: Amount to withdraw in microSTX

**Returns:**
- `(ok true)` on success
- Error codes on failure

**Example:**
```javascript
// Withdraw 5 STX
const amount = 5 * 1000000;
await contractCall('withdraw', [amount]);
```

#### `owner-withdraw-fees()`
Allows contract owner to withdraw accumulated protocol fees.

**Access:** Owner only
**Returns:** `(ok true)` on success

### Read-Only Functions

#### `get-balance(user: principal)`
Returns the vault balance for a user.

**Returns:** `(ok uint)` - Balance in microSTX

#### `get-points(user: principal)`
Returns commitment points for a user.

**Returns:** `(ok uint)` - Number of commitment points

#### `get-fees-collected()`
Returns total protocol fees collected.

**Returns:** `(ok uint)` - Total fees in microSTX

#### `get-user-stats(user: principal)`
Returns combined user statistics.

**Returns:**
```clarity
{
  balance: uint,  // Vault balance
  points: uint    // Commitment points
}
```

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 100 | `err-owner-only` | Function restricted to contract owner |
| 101 | `err-invalid-amount` | Amount must be greater than 0 |
| 102 | `err-insufficient-balance` | User balance too low for withdrawal |
| 103 | `err-transfer-failed` | STX transfer failed |

## Contract Constants

- **Contract Owner:** Set at deployment time
- **Protocol Fee:** 1% (calculated as `amount / 100`)
- **Network:** Stacks Mainnet
- **Address:** `SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY.ren-vault`
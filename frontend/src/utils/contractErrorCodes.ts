/**
 * contractErrorCodes
 *
 * Maps Clarity contract error codes (unsigned integers returned via `(err uN)`)
 * to structured error descriptors for every contract in the RenVault protocol.
 *
 * Structure per entry:
 *   code    – the uint value as a number
 *   name    – internal constant name from the Clarity source (for debugging)
 *   message – user-facing short description (shown in toasts/status bars)
 *   hint    – optional recovery suggestion shown below the error message
 */

export interface ContractErrorDescriptor {
  code: number;
  name: string;
  message: string;
  hint?: string;
}

/** Keyed by contract name (matching CONTRACT_NAME in App.tsx) */
export type ContractErrorMap = Record<number, ContractErrorDescriptor>;
export type AllContractErrors = Record<string, ContractErrorMap>;

// ─── ren-vault ──────────────────────────────────────────────────────────────

export const REN_VAULT_ERRORS: ContractErrorMap = {
  100: {
    code: 100,
    name: 'err-owner-only',
    message: 'This action can only be performed by the contract owner.',
    hint: 'Connect with the owner wallet to proceed.',
  },
  101: {
    code: 101,
    name: 'err-invalid-amount',
    message: 'The amount entered is invalid.',
    hint: 'Enter a positive STX amount greater than zero.',
  },
  102: {
    code: 102,
    name: 'err-insufficient-balance',
    message: 'Insufficient vault balance for this withdrawal.',
    hint: 'Check your vault balance and try a smaller amount.',
  },
  103: {
    code: 103,
    name: 'err-transfer-failed',
    message: 'The STX transfer failed on-chain.',
    hint: 'Ensure you have enough STX to cover the transaction fee and try again.',
  },
};

// ─── multi-asset-vault ───────────────────────────────────────────────────────

export const MULTI_ASSET_VAULT_ERRORS: ContractErrorMap = {
  100: { code: 100, name: 'err-owner-only', message: 'Only the contract owner may perform this action.' },
  101: { code: 101, name: 'err-invalid-amount', message: 'Invalid amount — must be greater than zero.' },
  102: { code: 102, name: 'err-insufficient-balance', message: 'Insufficient balance in the vault.', hint: 'Try a smaller amount.' },
  103: { code: 103, name: 'err-asset-not-supported', message: 'This asset is not supported by the vault.', hint: 'Check the list of supported assets.' },
  104: { code: 104, name: 'err-transfer-failed', message: 'Asset transfer failed.', hint: 'Verify your balance and try again.' },
  105: { code: 105, name: 'err-not-authorized', message: 'You are not authorised to perform this action.' },
  106: { code: 106, name: 'err-contract-paused', message: 'The vault contract is currently paused.', hint: 'Please wait for the contract to be unpaused and try again.' },
  107: { code: 107, name: 'err-exceeds-max-deposit', message: 'Deposit exceeds the maximum allowed amount.', hint: 'Reduce your deposit amount.' },
  108: { code: 108, name: 'err-below-min-withdrawal', message: 'Withdrawal is below the minimum allowed amount.', hint: 'Increase your withdrawal amount.' },
};

// ─── staking ─────────────────────────────────────────────────────────────────

export const STAKING_ERRORS: ContractErrorMap = {
  401: { code: 401, name: 'err-unauthorized', message: 'Unauthorized — only the contract owner can do this.' },
  402: { code: 402, name: 'err-insufficient-balance', message: 'Insufficient STX balance for staking.', hint: 'Check your wallet balance.' },
  403: { code: 403, name: 'err-no-stake', message: 'You have no active stake to unstake.' },
  404: { code: 404, name: 'err-below-minimum-stake', message: 'Amount is below the minimum stake required.', hint: 'Increase your stake amount.' },
  405: { code: 405, name: 'err-lock-period-active', message: 'Your stake is still within the lock period.', hint: 'Wait until the lock period expires before unstaking.' },
  406: { code: 406, name: 'err-reward-calculation-failed', message: 'Reward calculation failed.', hint: 'Please try again or contact support.' },
  407: { code: 407, name: 'err-no-rewards', message: 'You have no rewards to claim yet.' },
  408: { code: 408, name: 'err-zero-unstake-amount', message: 'Unstake amount must be greater than zero.' },
  409: { code: 409, name: 'err-zero-amount', message: 'Amount must be greater than zero.' },
  410: { code: 410, name: 'err-insufficient-reward-pool', message: 'The reward pool has insufficient funds.', hint: 'Please try again later when rewards are replenished.' },
  411: { code: 411, name: 'err-exceeds-max-stake', message: 'Stake exceeds the per-user maximum allowed.', hint: 'Reduce your stake amount.' },
  412: { code: 412, name: 'err-invalid-min-stake', message: 'Minimum stake value must be less than the current maximum.' },
  413: { code: 413, name: 'err-invalid-lock-period', message: 'Lock period must be at least one block.' },
  414: { code: 414, name: 'err-invalid-reward-rate', message: 'Reward rate must be greater than zero.' },
  415: { code: 415, name: 'err-min-stake-exceeds-max', message: 'Minimum stake cannot equal or exceed the maximum stake.' },
  416: { code: 416, name: 'err-invalid-max-stake', message: 'Maximum stake value is too high.' },
};

// ─── governance ──────────────────────────────────────────────────────────────

export const GOVERNANCE_ERRORS: ContractErrorMap = {
  401: { code: 401, name: 'err-unauthorized', message: 'Unauthorized — only the contract owner can do this.' },
  404: { code: 404, name: 'err-proposal-not-found', message: 'Proposal not found.', hint: 'Check the proposal ID and try again.' },
  405: { code: 405, name: 'err-voting-ended', message: 'The voting period for this proposal has ended.' },
  406: { code: 406, name: 'err-already-voted', message: 'You have already voted on this proposal.' },
  407: { code: 407, name: 'err-voting-not-ended', message: 'The voting period has not ended yet.', hint: 'Wait until the voting period is complete before executing.' },
  408: { code: 408, name: 'err-already-executed', message: 'This proposal has already been executed.' },
  409: { code: 409, name: 'err-proposal-failed', message: 'The proposal did not receive enough votes to pass.' },
};

// ─── timelock ────────────────────────────────────────────────────────────────

export const TIMELOCK_ERRORS: ContractErrorMap = {
  401: { code: 401, name: 'err-unauthorized', message: 'Unauthorized — only the contract owner can do this.' },
  402: { code: 402, name: 'err-not-ready', message: 'The timelock delay has not elapsed yet.', hint: 'Wait for the delay period to pass before executing.' },
  403: { code: 403, name: 'err-already-executed', message: 'This timelock action has already been executed.' },
  404: { code: 404, name: 'err-invalid-delay', message: 'Invalid delay — must be greater than zero blocks.' },
};

// ─── bridge ──────────────────────────────────────────────────────────────────

export const BRIDGE_ERRORS: ContractErrorMap = {
  401: { code: 401, name: 'err-unauthorized', message: 'Unauthorized bridge operation.' },
  402: { code: 402, name: 'err-invalid-amount', message: 'Invalid bridge amount — must be greater than zero.' },
  403: { code: 403, name: 'err-bridge-paused', message: 'The bridge is currently paused.', hint: 'Please wait for the bridge to be re-enabled.' },
};

// ─── emergency ───────────────────────────────────────────────────────────────

export const EMERGENCY_ERRORS: ContractErrorMap = {
  401: { code: 401, name: 'err-unauthorized', message: 'Unauthorized — only the contract owner can trigger emergency actions.' },
  402: { code: 402, name: 'err-already-paused', message: 'The contract is already paused.' },
  403: { code: 403, name: 'err-not-paused', message: 'The contract is not currently paused.' },
};

// ─── vault-factory ────────────────────────────────────────────────────────────

export const VAULT_FACTORY_ERRORS: ContractErrorMap = {
  200: { code: 200, name: 'err-unauthorized', message: 'Unauthorized vault factory operation.' },
  201: { code: 201, name: 'err-vault-exists', message: 'A vault already exists for this wallet.', hint: 'Each wallet can only have one vault.' },
  202: { code: 202, name: 'err-vault-not-found', message: 'Vault not found.', hint: 'Check the vault ID or create a new vault.' },
};

// ─── rewards ─────────────────────────────────────────────────────────────────

export const REWARDS_ERRORS: ContractErrorMap = {
  400: { code: 400, name: 'err-no-rewards', message: 'No rewards available to claim yet.' },
  401: { code: 401, name: 'err-already-claimed', message: 'Rewards have already been claimed.' },
  402: { code: 402, name: 'err-unauthorized', message: 'Unauthorized — only the contract owner can perform this.' },
  403: { code: 403, name: 'err-invalid-amount', message: 'Invalid reward amount.' },
  404: { code: 404, name: 'err-insufficient-pool', message: 'The reward pool does not have sufficient funds.', hint: 'Try again later when the pool is replenished.' },
};

// ─── referral ────────────────────────────────────────────────────────────────

export const REFERRAL_ERRORS: ContractErrorMap = {
  401: { code: 401, name: 'err-unauthorized', message: 'Unauthorized referral operation.' },
  402: { code: 402, name: 'err-self-referral', message: 'You cannot refer yourself.' },
  403: { code: 403, name: 'err-already-referred', message: 'This address has already been referred.' },
};

// ─── oracle ──────────────────────────────────────────────────────────────────

export const ORACLE_ERRORS: ContractErrorMap = {
  401: { code: 401, name: 'err-unauthorized', message: 'Unauthorized oracle update.' },
  402: { code: 402, name: 'err-stale-price', message: 'Oracle price data is stale.', hint: 'Wait for the oracle to be updated with a fresh price.' },
  403: { code: 403, name: 'err-invalid-price', message: 'Oracle price is invalid — must be greater than zero.' },
};

// ─── nft-badges ──────────────────────────────────────────────────────────────

export const NFT_BADGE_ERRORS: ContractErrorMap = {
  500: { code: 500, name: 'err-owner-only', message: 'Only the contract owner can mint NFT badges.' },
  501: { code: 501, name: 'err-not-token-owner', message: 'You do not own this NFT badge.' },
  502: { code: 502, name: 'err-token-exists', message: 'This NFT badge has already been minted.' },
};

// ─── liquidity-pool ──────────────────────────────────────────────────────────

export const LIQUIDITY_POOL_ERRORS: ContractErrorMap = {
  100: { code: 100, name: 'err-owner-only', message: 'Only the contract owner can perform this action.' },
  101: { code: 101, name: 'err-insufficient-balance', message: 'Insufficient balance in the liquidity pool.', hint: 'Try a smaller amount.' },
  102: { code: 102, name: 'err-invalid-amount', message: 'Invalid amount — must be greater than zero.' },
  103: { code: 103, name: 'err-pool-not-found', message: 'Liquidity pool not found.', hint: 'Check the pool ID.' },
};

// ─── yield-strategy ──────────────────────────────────────────────────────────

export const YIELD_STRATEGY_ERRORS: ContractErrorMap = {
  401: { code: 401, name: 'err-unauthorized', message: 'Unauthorized yield strategy operation.' },
  402: { code: 402, name: 'err-insufficient-balance', message: 'Insufficient balance for yield strategy.', hint: 'Reduce the deposit amount.' },
  403: { code: 403, name: 'err-strategy-paused', message: 'This yield strategy is currently paused.', hint: 'Try again when the strategy is re-activated.' },
  404: { code: 404, name: 'err-invalid-oracle', message: 'Invalid oracle configuration for the yield strategy.' },
};

// ─── Consolidated map keyed by contract name ──────────────────────────────────

export const ALL_CONTRACT_ERRORS: AllContractErrors = {
  'ren-vault': REN_VAULT_ERRORS,
  'multi-asset-vault': MULTI_ASSET_VAULT_ERRORS,
  staking: STAKING_ERRORS,
  governance: GOVERNANCE_ERRORS,
  timelock: TIMELOCK_ERRORS,
  bridge: BRIDGE_ERRORS,
  emergency: EMERGENCY_ERRORS,
  'vault-factory': VAULT_FACTORY_ERRORS,
  rewards: REWARDS_ERRORS,
  referral: REFERRAL_ERRORS,
  oracle: ORACLE_ERRORS,
  'nft-badges': NFT_BADGE_ERRORS,
  'liquidity-pool': LIQUIDITY_POOL_ERRORS,
  'yield-strategy': YIELD_STRATEGY_ERRORS,
};

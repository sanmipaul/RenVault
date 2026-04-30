/**
 * Canonical Stacks address validation utilities.
 *
 * Stacks addresses use c32check encoding and follow a fixed structure:
 *   - 2-character prefix: SP (mainnet standard), SM (mainnet multisig),
 *                         ST (testnet standard), SN (testnet multisig)
 *   - 39-character body:  c32check-encoded characters [0-9A-Z]
 *
 * Total principal length: 41 characters.
 *
 * A fully-qualified contract identifier appends a dot and contract name:
 *   e.g. SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-contract
 */

/** Matches valid network prefixes for Stacks addresses. */
const PREFIX_RE = /^S[PMTN]/;

/**
 * Regex for a bare Stacks principal (no contract-name suffix).
 *
 * Accepts all four network prefixes (SP / SM / ST / SN) followed by
 * exactly 39 c32check body characters.  Length 41 total.
 */
export const STACKS_PRINCIPAL_RE = /^S[PMTN][0-9A-Z]{39}$/;

/**
 * Regex for a fully-qualified Stacks contract identifier.
 *
 * Format: <principal>.<contract-name>
 * Contract names follow Clarity naming rules: lowercase letters, digits,
 * and hyphens; must start with a letter or digit.
 */
export const STACKS_CONTRACT_ID_RE = /^S[PMTN][0-9A-Z]{39}\.[a-z][a-z0-9-]{0,39}$/;

/**
 * Returns true when `address` is a valid bare Stacks principal.
 * Does **not** accept a contract-name suffix.
 */
export function isValidStacksPrincipal(address: string): boolean {
  return typeof address === 'string' && STACKS_PRINCIPAL_RE.test(address);
}

/**
 * Returns true when `address` is a valid fully-qualified Stacks contract
 * identifier (principal + "." + contract-name).
 */
export function isValidStacksContractId(address: string): boolean {
  return typeof address === 'string' && STACKS_CONTRACT_ID_RE.test(address);
}

/**
 * Returns true when `address` is either a valid principal **or** a valid
 * contract identifier — useful when a field may hold either form.
 */
export function isValidStacksAddress(address: string): boolean {
  return isValidStacksPrincipal(address) || isValidStacksContractId(address);
}

/**
 * Returns true when `address` belongs to the Stacks mainnet
 * (prefix SP or SM).
 *
 * The address must first pass {@link isValidStacksAddress}.
 */
export function isMainnetAddress(address: string): boolean {
  return isValidStacksAddress(address) && /^S[PM]/.test(address);
}

/**
 * Returns true when `address` belongs to the Stacks testnet
 * (prefix ST or SN).
 *
 * The address must first pass {@link isValidStacksAddress}.
 */
export function isTestnetAddress(address: string): boolean {
  return isValidStacksAddress(address) && /^S[TN]/.test(address);
}

/**
 * Splits a fully-qualified contract identifier into its principal and
 * contract-name parts.
 *
 * @returns `{ principal, contractName }` when valid, or `null` when the
 *          input is not a valid contract identifier.
 */
export function splitContractId(
  contractId: string
): { principal: string; contractName: string } | null {
  if (!isValidStacksContractId(contractId)) return null;
  const dotIndex = contractId.indexOf('.');
  return {
    principal: contractId.slice(0, dotIndex),
    contractName: contractId.slice(dotIndex + 1),
  };
}

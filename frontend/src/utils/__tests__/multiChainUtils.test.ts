/**
 * multiChainUtils unit tests
 */

import {
  formatAmount,
  convertUnits,
  shortenAddress,
  formatChainName,
  getChainColor,
  getChainIcon,
  isTestnet,
  formatTransactionHash,
  formatGasPrice,
  calculateFee,
  formatRelativeTime,
  isValidEvmAddress,
  isValidUrl,
  copyToClipboard,
  debounce,
  throttle,
  sleep,
  retryWithBackoff,
  batchItems,
  deepClone,
  mergeObjects,
  randomElement,
  isEmpty,
  compact,
} from '../multiChainUtils';
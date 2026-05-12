// TransactionFeeValidator.ts
// Validates fee values before transaction submission

export interface FeeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const MIN_FEE = 180; // microSTX
const MAX_FEE = 500_000_000; // 500 STX in microSTX — safety cap

export class TransactionFeeValidator {
  validate(fee: number, estimatedFee?: number): FeeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Number.isInteger(fee)) {
      errors.push('Fee must be an integer (microSTX)');
    }

    if (!Number.isFinite(fee) || fee < 0) {
      errors.push('Fee must be a non-negative finite number');
    } else if (fee < MIN_FEE) {
      errors.push(`Fee must be at least ${MIN_FEE} microSTX`);
    } else if (fee > MAX_FEE) {
      errors.push(`Fee exceeds maximum allowed value of ${MAX_FEE} microSTX`);
    }

    if (estimatedFee && fee < estimatedFee * 0.5) {
      warnings.push('Fee is significantly below the estimated fee — transaction may be slow to confirm');
    }

    if (estimatedFee && fee > estimatedFee * 5) {
      warnings.push('Fee is significantly above the estimated fee');
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  isAboveMinimum(fee: number): boolean {
    return fee >= MIN_FEE;
  }

  clampFee(fee: number): number {
    return Math.min(Math.max(Math.round(fee), MIN_FEE), MAX_FEE);
  }

  suggestFee(estimatedFee: number): number {
    return this.clampFee(Math.ceil(estimatedFee * 1.1)); // 10% buffer
  }
}

/**
 * Type definitions for form data
 */

/**
 * Deposit form data
 */
export interface DepositFormData {
  amount: string;
  asset: string;
  useSponsorship: boolean;
}

/**
 * Withdrawal form data
 */
export interface WithdrawalFormData {
  amount: string;
  asset: string;
  recipient?: string;
  withdrawAll: boolean;
}

/**
 * Transfer form data
 */
export interface TransferFormData {
  recipient: string;
  amount: string;
  asset: string;
  memo?: string;
}

/**
 * Staking form data
 */
export interface StakingFormData {
  amount: string;
  duration?: number;
  autoCompound: boolean;
}

/**
 * Settings form data
 */
export interface SettingsFormData {
  displayName?: string;
  email?: string;
  notifications: NotificationSettingsForm;
  security: SecuritySettingsForm;
  display: DisplaySettingsForm;
}

/**
 * Notification settings form
 */
export interface NotificationSettingsForm {
  emailAlerts: boolean;
  pushNotifications: boolean;
  transactionAlerts: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

/**
 * Security settings form
 */
export interface SecuritySettingsForm {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  trustedDevicesOnly: boolean;
}

/**
 * Display settings form
 */
export interface DisplaySettingsForm {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  language: string;
  compactMode: boolean;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}

/**
 * Form field error
 */
export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form field state
 */
export interface FormFieldState<T> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Generic form state
 */
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

/**
 * Form submission result
 */
export interface FormSubmissionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Input change handler type
 */
export type InputChangeHandler = (
  event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void;

/**
 * Form submit handler type
 */
export type FormSubmitHandler<T> = (values: T) => Promise<void> | void;

/**
 * Form reset handler type
 */
export type FormResetHandler = () => void;

/**
 * Validation function type
 */
export type ValidationFunction<T> = (value: T) => string | undefined;

/**
 * Async validation function type
 */
export type AsyncValidationFunction<T> = (value: T) => Promise<string | undefined>;

/**
 * Field validator configuration
 */
export interface FieldValidator<T> {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  custom?: ValidationFunction<T>;
  asyncValidate?: AsyncValidationFunction<T>;
}

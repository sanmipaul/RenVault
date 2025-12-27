// services/permissions/PermissionService.ts
export enum PermissionType {
  BALANCE_READ = 'balance_read',
  TRANSACTION_SIGN = 'transaction_sign',
  ADDRESS_READ = 'address_read',
  NETWORK_SWITCH = 'network_switch',
  CONTRACT_CALL = 'contract_call',
  NOTIFICATION_SEND = 'notification_send',
  STORAGE_ACCESS = 'storage_access'
}

export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  PENDING = 'pending',
  NOT_REQUESTED = 'not_requested'
}

export interface Permission {
  type: PermissionType;
  status: PermissionStatus;
  description: string;
  required: boolean;
  grantedAt?: Date;
  expiresAt?: Date;
}

export interface PermissionRequest {
  type: PermissionType;
  title: string;
  description: string;
  required: boolean;
  rationale?: string;
}

export class PermissionService {
  private static instance: PermissionService;
  private permissions: Map<string, Map<PermissionType, Permission>> = new Map();
  private permissionCallbacks: Map<PermissionType, ((granted: boolean) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  // Initialize default privacy-focused permissions for a wallet
  initializeWalletPermissions(walletId: string): void {
    const defaultPermissions = new Map<PermissionType, Permission>();

    // Only essential permissions are granted by default
    defaultPermissions.set(PermissionType.ADDRESS_READ, {
      type: PermissionType.ADDRESS_READ,
      status: PermissionStatus.GRANTED, // Essential for wallet functionality
      description: 'Read wallet address',
      required: true,
      grantedAt: new Date()
    });

    // All other permissions start as not requested
    defaultPermissions.set(PermissionType.BALANCE_READ, {
      type: PermissionType.BALANCE_READ,
      status: PermissionStatus.NOT_REQUESTED,
      description: 'Read account balance',
      required: false
    });

    defaultPermissions.set(PermissionType.TRANSACTION_SIGN, {
      type: PermissionType.TRANSACTION_SIGN,
      status: PermissionStatus.NOT_REQUESTED,
      description: 'Sign transactions',
      required: false
    });

    defaultPermissions.set(PermissionType.NETWORK_SWITCH, {
      type: PermissionType.NETWORK_SWITCH,
      status: PermissionStatus.NOT_REQUESTED,
      description: 'Switch networks',
      required: false
    });

    defaultPermissions.set(PermissionType.CONTRACT_CALL, {
      type: PermissionType.CONTRACT_CALL,
      status: PermissionStatus.NOT_REQUESTED,
      description: 'Call smart contracts',
      required: false
    });

    defaultPermissions.set(PermissionType.NOTIFICATION_SEND, {
      type: PermissionType.NOTIFICATION_SEND,
      status: PermissionStatus.NOT_REQUESTED,
      description: 'Send notifications',
      required: false
    });

    defaultPermissions.set(PermissionType.STORAGE_ACCESS, {
      type: PermissionType.STORAGE_ACCESS,
      status: PermissionStatus.NOT_REQUESTED,
      description: 'Access local storage',
      required: false
    });

    this.permissions.set(walletId, defaultPermissions);
  }

  // Request a specific permission
  async requestPermission(walletId: string, permissionType: PermissionType): Promise<boolean> {
    const walletPermissions = this.permissions.get(walletId);
    if (!walletPermissions) {
      throw new Error('Wallet permissions not initialized');
    }

    const permission = walletPermissions.get(permissionType);
    if (!permission) {
      throw new Error('Unknown permission type');
    }

    // If already granted, return true
    if (permission.status === PermissionStatus.GRANTED) {
      return true;
    }

    // If denied, return false (user needs to manually enable)
    if (permission.status === PermissionStatus.DENIED) {
      return false;
    }

    // Set to pending while waiting for user response
    permission.status = PermissionStatus.PENDING;
    walletPermissions.set(permissionType, permission);

    // In a real implementation, this would show a UI dialog
    // For now, we'll simulate user approval for required permissions
    const granted = permission.required;

    if (granted) {
      permission.status = PermissionStatus.GRANTED;
      permission.grantedAt = new Date();
    } else {
      permission.status = PermissionStatus.DENIED;
    }

    // Notify callbacks
    this.notifyPermissionCallbacks(permissionType, granted);

    return granted;
  }

  // Check if a permission is granted
  isPermissionGranted(walletId: string, permissionType: PermissionType): boolean {
    const walletPermissions = this.permissions.get(walletId);
    if (!walletPermissions) {
      return false;
    }

    const permission = walletPermissions.get(permissionType);
    return permission?.status === PermissionStatus.GRANTED;
  }

  // Get all permissions for a wallet
  getWalletPermissions(walletId: string): Permission[] {
    const walletPermissions = this.permissions.get(walletId);
    if (!walletPermissions) {
      return [];
    }

    return Array.from(walletPermissions.values());
  }

  // Grant a permission manually
  grantPermission(walletId: string, permissionType: PermissionType): void {
    const walletPermissions = this.permissions.get(walletId);
    if (!walletPermissions) {
      throw new Error('Wallet permissions not initialized');
    }

    const permission = walletPermissions.get(permissionType);
    if (!permission) {
      throw new Error('Unknown permission type');
    }

    permission.status = PermissionStatus.GRANTED;
    permission.grantedAt = new Date();
    walletPermissions.set(permissionType, permission);

    this.notifyPermissionCallbacks(permissionType, true);
  }

  // Revoke a permission
  revokePermission(walletId: string, permissionType: PermissionType): void {
    const walletPermissions = this.permissions.get(walletId);
    if (!walletPermissions) {
      throw new Error('Wallet permissions not initialized');
    }

    const permission = walletPermissions.get(permissionType);
    if (!permission) {
      throw new Error('Unknown permission type');
    }

    permission.status = PermissionStatus.DENIED;
    permission.grantedAt = undefined;
    walletPermissions.set(permissionType, permission);

    this.notifyPermissionCallbacks(permissionType, false);
  }

  // Register callback for permission changes
  onPermissionChange(permissionType: PermissionType, callback: (granted: boolean) => void): void {
    const callbacks = this.permissionCallbacks.get(permissionType) || [];
    callbacks.push(callback);
    this.permissionCallbacks.set(permissionType, callbacks);
  }

  // Unregister callback
  offPermissionChange(permissionType: PermissionType, callback: (granted: boolean) => void): void {
    const callbacks = this.permissionCallbacks.get(permissionType) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      this.permissionCallbacks.set(permissionType, callbacks);
    }
  }

  // Get permission request details
  getPermissionRequest(permissionType: PermissionType): PermissionRequest {
    const requests: Record<PermissionType, PermissionRequest> = {
      [PermissionType.BALANCE_READ]: {
        type: PermissionType.BALANCE_READ,
        title: 'Balance Access',
        description: 'Allow the app to read your account balance',
        required: false,
        rationale: 'This permission enables the app to display your current balance and transaction history.'
      },
      [PermissionType.TRANSACTION_SIGN]: {
        type: PermissionType.TRANSACTION_SIGN,
        title: 'Transaction Signing',
        description: 'Allow the app to request transaction signatures',
        required: false,
        rationale: 'This permission is needed to send transactions from your wallet.'
      },
      [PermissionType.ADDRESS_READ]: {
        type: PermissionType.ADDRESS_READ,
        title: 'Address Access',
        description: 'Allow the app to read your wallet address',
        required: true,
        rationale: 'This permission is essential for wallet identification and basic functionality.'
      },
      [PermissionType.NETWORK_SWITCH]: {
        type: PermissionType.NETWORK_SWITCH,
        title: 'Network Switching',
        description: 'Allow the app to request network changes',
        required: false,
        rationale: 'This permission enables switching between different blockchain networks.'
      },
      [PermissionType.CONTRACT_CALL]: {
        type: PermissionType.CONTRACT_CALL,
        title: 'Smart Contract Interaction',
        description: 'Allow the app to interact with smart contracts',
        required: false,
        rationale: 'This permission is needed for DeFi and other contract-based operations.'
      },
      [PermissionType.NOTIFICATION_SEND]: {
        type: PermissionType.NOTIFICATION_SEND,
        title: 'Notifications',
        description: 'Allow the app to send notifications',
        required: false,
        rationale: 'This permission enables transaction confirmations and important updates.'
      },
      [PermissionType.STORAGE_ACCESS]: {
        type: PermissionType.STORAGE_ACCESS,
        title: 'Local Storage',
        description: 'Allow the app to store data locally',
        required: false,
        rationale: 'This permission enables saving your preferences and wallet settings.'
      }
    };

    return requests[permissionType];
  }

  private notifyPermissionCallbacks(permissionType: PermissionType, granted: boolean): void {
    const callbacks = this.permissionCallbacks.get(permissionType) || [];
    callbacks.forEach(callback => {
      try {
        callback(granted);
      } catch (error) {
        console.error('Error in permission callback:', error);
      }
    });
  }

  // Clear all permissions for a wallet (useful when disconnecting)
  clearWalletPermissions(walletId: string): void {
    this.permissions.delete(walletId);
  }
}
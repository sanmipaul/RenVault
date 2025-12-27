// hooks/usePermissions.ts
import { useState, useEffect, useCallback } from 'react';
import { PermissionService, PermissionType, PermissionStatus, PermissionRequest } from '../services/permissions/PermissionService';
import { useWallet } from './useWallet';

export const usePermissions = () => {
  const { connectionState } = useWallet();
  const [permissions, setPermissions] = useState<Map<PermissionType, PermissionStatus>>(new Map());
  const permissionService = PermissionService.getInstance();

  // Load permissions when wallet connects
  useEffect(() => {
    if (connectionState?.address) {
      loadPermissions();
    } else {
      setPermissions(new Map());
    }
  }, [connectionState?.address]);

  const loadPermissions = useCallback(() => {
    if (!connectionState?.address) return;

    const walletPermissions = permissionService.getWalletPermissions(connectionState.address);
    const permissionMap = new Map<PermissionType, PermissionStatus>();

    walletPermissions.forEach(permission => {
      permissionMap.set(permission.type, permission.status);
    });

    setPermissions(permissionMap);
  }, [connectionState?.address, permissionService]);

  // Check if a specific permission is granted
  const hasPermission = useCallback((permissionType: PermissionType): boolean => {
    if (!connectionState?.address) return false;
    return permissionService.isPermissionGranted(connectionState.address, permissionType);
  }, [connectionState?.address, permissionService]);

  // Request a permission (returns promise that resolves to boolean)
  const requestPermission = useCallback(async (permissionType: PermissionType): Promise<boolean> => {
    if (!connectionState?.address) return false;

    try {
      const granted = await permissionService.requestPermission(connectionState.address, permissionType);
      loadPermissions(); // Refresh permissions
      return granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }, [connectionState?.address, permissionService, loadPermissions]);

  // Grant a permission manually
  const grantPermission = useCallback((permissionType: PermissionType) => {
    if (!connectionState?.address) return;
    permissionService.grantPermission(connectionState.address, permissionType);
    loadPermissions();
  }, [connectionState?.address, permissionService, loadPermissions]);

  // Revoke a permission
  const revokePermission = useCallback((permissionType: PermissionType) => {
    if (!connectionState?.address) return;
    permissionService.revokePermission(connectionState.address, permissionType);
    loadPermissions();
  }, [connectionState?.address, permissionService, loadPermissions]);

  // Get permission request details
  const getPermissionRequest = useCallback((permissionType: PermissionType): PermissionRequest => {
    return permissionService.getPermissionRequest(permissionType);
  }, [permissionService]);

  // Register callback for permission changes
  const onPermissionChange = useCallback((permissionType: PermissionType, callback: (granted: boolean) => void) => {
    return permissionService.onPermissionChange(permissionType, callback);
  }, [permissionService]);

  // Unregister callback
  const offPermissionChange = useCallback((permissionType: PermissionType, callback: (granted: boolean) => void) => {
    permissionService.offPermissionChange(permissionType, callback);
  }, [permissionService]);

  return {
    permissions,
    hasPermission,
    requestPermission,
    grantPermission,
    revokePermission,
    getPermissionRequest,
    onPermissionChange,
    offPermissionChange,
    loadPermissions
  };
};
export const validateConnection = (connection: { address?: string; publicKey?: string } | null | undefined): boolean => {
  return !!(connection && connection.address && connection.publicKey);
};

export const isConnectionActive = (lastActivity: number, timeoutMs: number = 300000): boolean => {
  return Date.now() - lastActivity < timeoutMs;
};

export const validateConnectionEndpoint = (endpoint: string): { valid: boolean; reason?: string } => {
  if (!endpoint || endpoint.trim() === '') return { valid: false, reason: 'Endpoint is empty' };
  if (isValidHttpsUrl(endpoint)) return { valid: true };
  if (isValidDeepLinkUrl(endpoint)) return { valid: true };
  return { valid: false, reason: 'Endpoint must be a valid HTTPS URL or deep link' };
};

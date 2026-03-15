export const validateConnection = (connection: { address?: string; publicKey?: string } | null | undefined): boolean => {
  return !!(connection && connection.address && connection.publicKey);
};

export const isConnectionActive = (lastActivity: number, timeoutMs: number = 300000): boolean => {
  return Date.now() - lastActivity < timeoutMs;
};

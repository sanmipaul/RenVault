export const validateConnection = (connection: any): boolean => {
  return !!(connection && connection.address && connection.publicKey);
};

export const isConnectionActive = (lastActivity: number, timeoutMs: number = 300000): boolean => {
  return Date.now() - lastActivity < timeoutMs;
};

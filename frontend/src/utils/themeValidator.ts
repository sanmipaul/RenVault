export interface ThemeVariables {
  [key: string]: string | number;
}

export const validateThemeVariables = (variables: ThemeVariables): boolean => {
  const requiredKeys = ['--w3m-accent', '--w3m-background', '--w3m-foreground'];
  return requiredKeys.every(key => key in variables);
};

export const sanitizeThemeVariables = (variables: ThemeVariables): ThemeVariables => {
  const sanitized: ThemeVariables = {};
  for (const [key, value] of Object.entries(variables)) {
    if (key.startsWith('--w3m-')) sanitized[key] = value;
  }
  return sanitized;
};

export const getWalletConnectUri = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('uri');
};

export const getRequestParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    requestId: params.get('requestId'),
    sessionTopic: params.get('sessionTopic'),
  };
};

export const isNativeApp = (metadata: any): boolean => {
  return metadata?.redirect !== undefined;
};

export const handleRedirect = (metadata: any) => {
  if (!metadata?.redirect) return;

  const { native, universal } = metadata.redirect;

  if (native) {
    // Check if we are on mobile or if the scheme is supported
    window.location.href = native;
  } else if (universal) {
    window.open(universal, '_blank');
  }
};

export const hexToUtf8 = (hex: string): string => {
  const str = hex.startsWith('0x') ? hex.slice(2) : hex;
  let utf8 = '';
  for (let i = 0; i < str.length; i += 2) {
    utf8 += String.fromCharCode(parseInt(str.substr(i, 2), 16));
  }
  return decodeURIComponent(utf8);
};

export interface WalletKitSession {
  id: string;
  topic: string;
  peer: {
    metadata: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
  namespaces: Record<string, any>;
}

export interface SessionProposal {
  id: string;
  params: {
    proposer: {
      metadata: {
        name: string;
        description: string;
        url: string;
        icons: string[];
      };
    };
    requiredNamespaces: Record<string, any>;
    optionalNamespaces?: Record<string, any>;
  };
}

export interface SessionRequest {
  topic: string;
  id: string;
  params: {
    request: {
      method: string;
      params: any[];
    };
  };
}

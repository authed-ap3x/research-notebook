
export interface NotebookVersion {
  cid: string;
  timestamp: string;
  version: number;
  preview: string;
}

export interface NotebookMetadata {
  notebook_id: string;
  author: string;
  title: string;
  versions: NotebookVersion[];
  created_at: string;
  updated_at: string;
}

export interface LighthouseResponse {
  data: {
    Hash: string;
    Name: string;
    Size: string;
  };
}

export interface NotebooksIndex {
  owner: string;
  notebooks: {
    notebook_id: string;
    title: string;
    metadata_cid: string;
    created_at: string;
    updated_at: string;
    version_count: number;
  }[];
  updated_at: string;
}

// Ethereum window type declaration
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}
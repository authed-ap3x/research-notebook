
export const setWalletAddress = (address: string): void => {
  localStorage.setItem('walletAddress', address);
};

export const getWalletAddress = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('walletAddress');
};

export const clearWalletAddress = (): void => {
  localStorage.removeItem('walletAddress');
};

export const setCurrentNotebookId = (id: string): void => {
  localStorage.setItem('currentNotebookId', id);
};

export const getCurrentNotebookId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentNotebookId');
};

export const clearCurrentNotebookId = (): void => {
  localStorage.removeItem('currentNotebookId');
};
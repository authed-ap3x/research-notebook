// app/notebooks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WalletConnect from '@/components/WalletConnect';
import { getAllNotebooks } from '@/utils/lighthouse';
import { setCurrentNotebookId, clearCurrentNotebookId } from '@/utils/storage';
import { NotebookMetadata } from '@/utils/types';

export default function NotebooksPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [notebooks, setNotebooks] = useState<NotebookMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const router = useRouter();

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    setIsLoading(true);
    try {
      const allNotebooks = await getAllNotebooks();
      setNotebooks(allNotebooks);
    } catch (error) {
      console.error('Error loading notebooks:', error);
      //alert('Failed to load notebooks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenNotebook = (notebook: NotebookMetadata) => {
    setCurrentNotebookId(notebook.notebook_id);
    router.push('/');
  };

  const handleCreateNew = () => {
    clearCurrentNotebookId();
    router.push('/');
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Filter notebooks based on current filter
  const filteredNotebooks = notebooks.filter(notebook => {
    if (filter === 'mine' && walletAddress) {
      return notebook.author.toLowerCase() === walletAddress.toLowerCase();
    }
    return true; // 'all' shows everything
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-gray-900 hover:text-blue-600"
              >
                🔬 Research Notebook
              </button>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Decentralized
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreateNew}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                + New Notebook
              </button>
              <WalletConnect onAddressChange={setWalletAddress} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Research Notebooks</h1>
            
            {/* Filter buttons */}
            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Notebooks ({notebooks.length})
                </button>
                {walletAddress && (
                  <button
                    onClick={() => setFilter('mine')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === 'mine'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    My Notebooks ({notebooks.filter(nb => nb.author.toLowerCase() === walletAddress.toLowerCase()).length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Loading Notebooks...
              </h2>
              <p className="text-gray-600">
                Fetching all research notebooks from IPFS
              </p>
            </div>
          ) : filteredNotebooks.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'mine' ? 'No notebooks created yet' : 'No notebooks found'}
              </h2>
              <p className="text-gray-600 mb-6">
                {filter === 'mine' 
                  ? 'Create your first decentralized research notebook stored permanently on IPFS.'
                  : 'Be the first to create a research notebook on this platform!'
                }
              </p>
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
              >
                {filter === 'mine' ? 'Create Your First Notebook' : 'Create First Notebook'}
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotebooks.map((notebook) => (
                <div
                  key={notebook.notebook_id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {notebook.title || 'Untitled Notebook'}
                    </h3>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <span>By:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                          {formatAddress(notebook.author)}
                        </span>
                        {walletAddress && notebook.author.toLowerCase() === walletAddress.toLowerCase() && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <div>Versions: {notebook.versions.length}</div>
                      <div>Created: {formatDate(notebook.created_at)}</div>
                      <div>Updated: {formatDate(notebook.updated_at)}</div>
                    </div>

                    {notebook.versions.length > 0 && (
                      <div className="text-sm text-gray-700 mb-4 bg-gray-50 p-3 rounded">
                        {notebook.versions[notebook.versions.length - 1].preview}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenNotebook(notebook)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        {walletAddress && notebook.author.toLowerCase() === walletAddress.toLowerCase() ? 'Edit' : 'View'}
                      </button>
                      <a
                        href={`https://gateway.lighthouse.storage/ipfs/${notebook.versions[notebook.versions.length - 1]?.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-100 hover:bg-purple-200 text-purple-600 px-4 py-2 rounded text-sm"
                      >
                        IPFS
                      </a>
                    </div>
                  </div>

                  <div className="border-t bg-gray-50 px-6 py-3">
                    <div className="text-xs text-gray-500 font-mono">
                      ID: {notebook.notebook_id.split('_')[1]}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
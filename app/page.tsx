
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WalletConnect from '@/components/WalletConnect';
import Editor from '@/components/Editor';
import VersionHistory from '@/components/VersionHistory';
import { uploadNotebookVersion, retrieveFromIPFS } from '@/utils/lighthouse';
import { NotebookMetadata, NotebookVersion } from '@/utils/types';
import { getCurrentNotebookId, setCurrentNotebookId, clearCurrentNotebookId } from '@/utils/storage';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [notebookTitle, setNotebookTitle] = useState('');
  const [versions, setVersions] = useState<NotebookVersion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMetadata, setCurrentMetadata] = useState<NotebookMetadata | null>(null);
  const [isLoadingNotebook] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //   // Load existing notebook if one is selected
  //   if (walletAddress) {
  //     loadCurrentNotebook();
  //   }
  // }, [walletAddress]);

  // const loadCurrentNotebook = async () => {
  //   const currentNotebookId = getCurrentNotebookId();
  //   if (!currentNotebookId || !walletAddress) {
  //     // Clear everything for new notebook
  //     clearNotebookState();
  //     return;
  //   }

  //   setIsLoadingNotebook(true);
  //   try {
  //     // Get the notebooks index to find the metadata CID
  //     // const index = await getUserNotebooksIndex(walletAddress);
  //     // const notebookEntry = index.notebooks.find(nb => nb.notebook_id === currentNotebookId);
      
  //     // if (!notebookEntry) {
  //     //   // Notebook not found, clear current selection
  //     //   clearCurrentNotebookId();
  //     //   clearNotebookState();
  //     //   return;
  //     // }

  //     // Load the notebook metadata from IPFS
  //     const metadata = await retrieveNotebookMetadata(notebookEntry.metadata_cid);
  //     setCurrentMetadata(metadata);
  //     setVersions(metadata.versions);
  //     setNotebookTitle(metadata.title);
      
  //     // Load the latest version content
  //     if (metadata.versions.length > 0) {
  //       const latestVersion = metadata.versions[metadata.versions.length - 1];
  //       await handleLoadVersion(latestVersion.cid);
  //     }
  //   } catch (error) {
  //     console.error('Error loading notebook:', error);
  //     //alert('Failed to load notebook');
  //     clearCurrentNotebookId();
  //     clearNotebookState();
  //   } finally {
  //     setIsLoadingNotebook(false);
  //   }
  // };


  const clearNotebookState = () => {
    setCurrentMetadata(null);
    setVersions([]);
    setNotebookTitle('');
    setMarkdownContent('');
  };

  const handleSaveVersion = async () => {
    if (!walletAddress || !markdownContent.trim() || !notebookTitle.trim()) {
      alert('Please connect wallet and add title and content');
      return;
    }

    setIsSaving(true);
    try {
      const metadata = await uploadNotebookVersion(
        markdownContent,
        walletAddress,
        notebookTitle,
        currentMetadata || undefined
      );
      
      setCurrentMetadata(metadata);
      setVersions(metadata.versions);
      
      // Set current notebook ID if this is a new notebook
      if (!getCurrentNotebookId()) {
        setCurrentNotebookId(metadata.notebook_id);
      }
      
      alert('Version saved to IPFS successfully!');
    } catch (error) {
      console.error('Error saving version:', error);
      alert('Failed to save version');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadVersion = async (cid: string) => {
    setIsLoading(true);
    try {
      const content = await retrieveFromIPFS(cid);
      setMarkdownContent(content);
    } catch (error) {
      console.error('Error loading version:', error);
      //alert('Failed to load version');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNotebook = () => {
    clearCurrentNotebookId();
    clearNotebookState();
  };

  if (isLoadingNotebook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Loading Notebook...
          </h2>
          <p className="text-gray-600">
            Fetching your notebook from IPFS
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                🔬 Research Notebook
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                Decentralized
              </span>
              {currentMetadata && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {currentMetadata.versions.length} version{currentMetadata.versions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/notebooks')}
                className="text-blue-600 hover:text-blue-800"
              >
                My Notebooks
              </button>
              <button
                onClick={handleNewNotebook}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                + New
              </button>
              <WalletConnect onAddressChange={setWalletAddress} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!walletAddress ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to start creating permanent, citable research notebooks stored on IPFS.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>✅ Permanent storage on IPFS/Filecoin</li>
                <li>✅ Version control for reproducibility</li>
                <li>✅ Citable with IPFS CIDs</li>
                <li>✅ Decentralized and censorship-resistant</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editor Section */}
            <div className="lg:col-span-2">
              <Editor
                value={markdownContent}
                onChange={setMarkdownContent}
                onSave={handleSaveVersion}
                isSaving={isSaving}
                title={notebookTitle}
                onTitleChange={setNotebookTitle}
              />
            </div>

            {/* Version History Section */}
            <div className="lg:col-span-1">
              <VersionHistory
                versions={versions}
                onLoadVersion={handleLoadVersion}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Decentralized Research Notebook - Built for the Nouniverse
            </p>
            <p className="text-sm">
              Permanent • Citable • Censorship-Resistant
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
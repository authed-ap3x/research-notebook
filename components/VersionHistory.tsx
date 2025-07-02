
'use client';

import { NotebookVersion } from '../utils/types';

interface VersionHistoryProps {
  versions: NotebookVersion[];
  onLoadVersion: (cid: string) => void;
  isLoading: boolean;
}

export default function VersionHistory({ 
  versions, 
  onLoadVersion, 
  isLoading 
}: VersionHistoryProps) {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const copyCitation = (version: NotebookVersion) => {
    const citation = `Research Notebook v${version.version}, IPFS CID: ${version.cid}, Timestamp: ${version.timestamp}`;
    navigator.clipboard.writeText(citation);
    alert('Citation copied to clipboard!');
  };

  if (versions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Version History</h3>
        <p className="text-gray-500 text-center py-8">
        No versions saved yet. Create your first version by writing content and clicking "Save Version".
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Version History</h3>
      
      <div className="space-y-3">
        {versions.map((version, index) => (
          <div 
            key={version.cid} 
            className="border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-blue-600">
                  Version {version.version}
                  {index === 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Latest
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(version.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-700 mb-3">
              {version.preview}
            </div>
            
            <div className="text-xs text-gray-500 mb-3 font-mono break-all">
              CID: {version.cid}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onLoadVersion(version.cid)}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load Version'}
              </button>
              <button
                onClick={() => copyCitation(version)}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Copy Citation
              </button>
              <a
                href={`https://gateway.lighthouse.storage/ipfs/${version.cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 text-sm"
              >
                View on IPFS
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
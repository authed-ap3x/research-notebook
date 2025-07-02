
'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  title: string;
  onTitleChange: (title: string) => void;
  isReadOnly?: boolean;
}

export default function Editor({ 
  value, 
  onChange, 
  onSave, 
  isSaving, 
  title, 
  onTitleChange,
  isReadOnly = false
}: EditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={isReadOnly ? "Notebook Title" : "Enter notebook title..."}
          readOnly={isReadOnly}
          className={`w-full text-xl font-semibold border-none outline-none ${
            isReadOnly ? 'cursor-default bg-gray-50' : ''
          }`}
        />
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'edit'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {isReadOnly ? 'Content' : 'Edit'}
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'preview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="h-96">
        {activeTab === 'edit' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isReadOnly ? "No content available..." : "Write your research notes in markdown..."}
            readOnly={isReadOnly}
            className={`w-full h-full p-4 border-none outline-none resize-none font-mono text-sm ${
              isReadOnly ? 'cursor-default bg-gray-50' : ''
            }`}
          />
        ) : (
          <div className="h-full p-4 overflow-y-auto prose prose-sm max-w-none">
            <ReactMarkdown>{value || '*Nothing to preview yet...*'}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {value.length} characters
          {isReadOnly && (
            <span className="ml-4 text-yellow-600 font-medium">
              Read-only mode - You can only edit notebooks you own
            </span>
          )}
        </div>
        {!isReadOnly && (
          <button
            onClick={onSave}
            disabled={isSaving || !value.trim() || !title.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving to IPFS...' : 'Save Version'}
          </button>
        )}
      </div>
    </div>
  );
}
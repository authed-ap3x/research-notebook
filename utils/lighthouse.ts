
import lighthouse from '@lighthouse-web3/sdk';
import { NotebookMetadata, NotebookVersion } from './types';


const LIGHTHOUSE_API_KEY = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY || '';

export const uploadToIPFS = async (content: string, filename?: string): Promise<string> => {
  try {
    // Create a File object from the string content
    const file = new File([content], filename || 'content.txt', { type: 'text/plain' });
    
    const response = await lighthouse.upload([file], LIGHTHOUSE_API_KEY);
    return response.data.Hash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

export const retrieveFromIPFS = async (cid: string): Promise<string> => {
  try {
    // Try multiple gateways if one fails
    const gateways = [
      `https://gateway.lighthouse.storage/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://cloudflare-ipfs.com/ipfs/${cid}`
    ];
    
    for (const gateway of gateways) {
      try {
        const response = await fetch(gateway);
        if (response.ok) {
          return await response.text();
        }
      } catch (error) {
        console.log(`Failed to fetch from ${gateway}, trying next gateway...`);
        continue;
      }
    }
    
    throw new Error('All IPFS gateways failed');
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
};

// Get ALL notebooks (from all users) - for public discovery
export const getAllNotebooks = async (): Promise<NotebookMetadata[]> => {
  try {
    const uploads = await lighthouse.getUploads(LIGHTHOUSE_API_KEY);
    
    console.log('Raw uploads:', uploads); // Debug log
    
    const notebooks: NotebookMetadata[] = [];
    
    // Check files that are likely to be JSON metadata
    for (const upload of uploads.data.fileList) {
      try {
        console.log('Checking file:', upload.fileName, 'MIME:', upload.mimeType, 'CID:', upload.cid);
        
        // Skip files that are clearly not JSON metadata
        if (upload.fileName && (
          upload.fileName.endsWith('.md') || 
          upload.fileName.includes('_v') ||
          upload.mimeType === 'text/markdown'
        )) {
          console.log('Skipping content file:', upload.fileName);
          continue;
        }
        
        // Try to fetch and parse as JSON
        const content = await retrieveFromIPFS(upload.cid);
        
        // Quick check if it looks like JSON
        if (!content.trim().startsWith('{')) {
          console.log('Skipping non-JSON file:', upload.fileName);
          continue;
        }
        
        const parsed = JSON.parse(content);
        
        console.log('Parsed content for', upload.fileName, ':', parsed);
        
        // Check if it's a valid notebook metadata structure
        if (parsed.notebook_id && parsed.author && parsed.versions && Array.isArray(parsed.versions)) {
          console.log('Found valid notebook:', parsed.notebook_id);
          notebooks.push(parsed as NotebookMetadata);
        } else {
          console.log('Not a notebook metadata file:', upload.fileName);
        }
      } catch (error) {
        // console.log('Error processing file:', upload.fileName, 'Error:', error.message);
        continue;
      }
    }
    
    console.log('Total notebooks found:', notebooks.length);
    
    // Sort by updated_at descending (newest first)
    return notebooks.sort((a, b) => 
      new Date(b.updated_at || b.versions[b.versions.length - 1]?.timestamp || 0).getTime() - 
      new Date(a.updated_at || a.versions[a.versions.length - 1]?.timestamp || 0).getTime()
    );
  } catch (error) {
    console.error('Error fetching all notebooks:', error);
    return [];
  }
};

// Get notebooks by specific author - for user's own notebooks
export const getNotebooksByAuthor = async (authorAddress: string): Promise<NotebookMetadata[]> => {
  const allNotebooks = await getAllNotebooks();
  return allNotebooks.filter(notebook => 
    notebook.author.toLowerCase() === authorAddress.toLowerCase()
  );
};

// Get single notebook by ID
export const getNotebookById = async (notebookId: string): Promise<NotebookMetadata | null> => {
  const allNotebooks = await getAllNotebooks();
  return allNotebooks.find(notebook => notebook.notebook_id === notebookId) || null;
};

export const uploadNotebookVersion = async (
  content: string,
  author: string,
  title: string,
  existingMetadata?: NotebookMetadata
): Promise<NotebookMetadata> => {
  try {
    // Upload the markdown content with descriptive filename
    const contentFilename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_v${existingMetadata ? existingMetadata.versions.length + 1 : 1}.md`;
    const contentCid = await uploadToIPFS(content, contentFilename);
    
    // Create new version
    const newVersion: NotebookVersion = {
      cid: contentCid,
      timestamp: new Date().toISOString(),
      version: existingMetadata ? existingMetadata.versions.length + 1 : 1,
      preview: content.substring(0, 100) + (content.length > 100 ? '...' : '')
    };

    // Create or update metadata
    const now = new Date().toISOString();
    const metadata: NotebookMetadata = {
      notebook_id: existingMetadata?.notebook_id || generateNotebookId(),
      author,
      title,
      versions: existingMetadata ? [...existingMetadata.versions, newVersion] : [newVersion],
      created_at: existingMetadata?.created_at || now,
      updated_at: now
    };

    // Upload metadata to IPFS with descriptive filename
    const metadataFilename = `notebook_metadata_${metadata.notebook_id}.json`;
    const metadataJson = JSON.stringify(metadata, null, 2);
    const metadataCid = await uploadToIPFS(metadataJson, metadataFilename);
    
    console.log(`Notebook content uploaded with CID: ${contentCid}`);
    console.log(`Notebook metadata uploaded with CID: ${metadataCid}`);
    
    return metadata;
  } catch (error) {
    console.error('Error uploading notebook version:', error);
    throw error;
  }
};

export const retrieveNotebookMetadata = async (cid: string): Promise<NotebookMetadata> => {
  try {
    const metadataJson = await retrieveFromIPFS(cid);
    return JSON.parse(metadataJson);
  } catch (error) {
    console.error('Error retrieving notebook metadata:', error);
    throw error;
  }
};

const generateNotebookId = (): string => {
  return `notebook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
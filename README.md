
# Decentralized Research Notebook
Decentralized research notebook platform built on IPFS/Filecoin. Permanent, citable, and censorship-resistant research storage with version control.

## features

- permanent storage on IPFS via Lighthouse SDK
- version control with immutable IPFS CIDs
- wallet-based researcher identity (no accounts)
- public research discovery and browsing
- markdown editor with live preview

## install

```bash
git clone <repo-url>
cd research-notebook
npm install
```

## config

```bash
# .env.local
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_key_here
```
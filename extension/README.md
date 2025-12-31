# Cortex Browser Extension Architecture

This directory contains the browser extension code for Cortex (MindMesh), a privacy-first AI browser assistant.

## Project Structure

```
extension/
├── manifest.json              # Manifest V3 configuration
├── src/
│   ├── content-scripts/       # Scripts injected into web pages
│   │   ├── content.ts         # Main content script
│   │   └── page-capture.ts    # Page content capture logic
│   ├── background/            # Background service worker
│   │   ├── worker.ts          # Main service worker
│   │   └── message-handler.ts # Extension message routing
│   ├── web-workers/           # Web Worker scripts
│   │   ├── embedding.worker.ts # WASM embedding generation
│   │   └── clustering.worker.ts# Tab clustering algorithm
│   └── utils/
│       ├── storage.ts         # IndexedDB operations
│       └── messaging.ts       # Extension messaging protocol
└── types/
    └── cortex.d.ts            # TypeScript types
```

## Key Features

### Content Scripts
- **Page Capture**: Extracts readable text, title, URL, and metadata from pages
- **Minimal Overhead**: Minimal DOM parsing to preserve user performance
- **Privacy First**: Only captures text content, no screenshots or sensitive data

### Background Service Worker
- **Message Routing**: Handles messages between content scripts and web dashboard
- **Memory Management**: Coordinates IndexedDB operations
- **Privacy Rules**: Enforces user privacy settings

### Web Workers
- **Embedding Generation**: Runs WASM-based embedding models asynchronously
- **Clustering**: Groups related pages using semantic similarity
- **Non-blocking**: All heavy computation offloaded to workers

### Storage
- **IndexedDB**: Local, offline-capable storage for:
  - Page memories with embeddings
  - Semantic clusters
  - Privacy rules and settings
  - User preferences

## Manifest V3 Compliance

- ✅ Uses service workers instead of background pages
- ✅ No eval or remote code execution
- ✅ Content security policy compliant
- ✅ Permissions: activeTab, scripting, storage, webRequest (if needed)

## Data Flow

1. **Content Script** captures page when user visits
2. **Sends message** to background worker with page context
3. **Service Worker** stores page in IndexedDB
4. **Web Worker** generates embedding asynchronously
5. **Dashboard** queries IndexedDB via `useMemoryStorage` hook
6. **Results** displayed with "Explain Why" overlay

## Configuration

### Privacy Settings
- `captureEnabled`: Enable/disable page capture
- `excludeDomains`: Domains to never capture
- `excludeKeywords`: Skip pages containing keywords
- `maxStorageSize`: IndexedDB storage limit (default 50MB)

## Development

The extension is built as part of the main Vite build process.
To develop locally:

```bash
pnpm dev              # Start development server
# Navigate to browser extension settings and load dist/extension
```

## Testing

- Content script injection
- Message passing between contexts
- IndexedDB operations
- WASM embedding generation
- Offline functionality

## Security Considerations

1. **No Remote APIs**: All processing local
2. **Content Scripts Isolated**: Limited DOM access
3. **Service Worker Sandboxed**: Runs in isolated context
4. **User Data Encrypted**: At rest in IndexedDB (future: client-side encryption)
5. **No Analytics**: Zero telemetry

## Future Enhancements

- [ ] Client-side encryption of stored data
- [ ] Sync across devices (encrypted)
- [ ] Focus mode (suppress distracting tabs)
- [ ] Browser vendor integration (Samsung Browser, Edge)
- [ ] Tab session recovery
- [ ] Advanced clustering algorithms

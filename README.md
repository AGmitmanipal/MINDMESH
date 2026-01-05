# Cortex - Your Personal Web Helper 🚀

**A smart browser assistant that remembers so you don't have to.**  
*Built for the Samsung Prism WebAgent Hackathon.*

Cortex is a privacy-first browser extension and dashboard that automatically organizes your digital life. It understands the **meaning** of the pages you visit, allowing you to find anything in your history by just asking in plain English.

---

## 🌟 How it works

As soon as you enable the extension, Cortex goes to work in the background:

1.  **Automatic Saving**: Every time you visit a page and stay for more than a second, Cortex securely saves a "memory" of that page (title, description, and key topics).
2.  **Smart Organizing**: It automatically groups related pages into "Auto Groups" (e.g., all your "Travel" research or "Coding" tips are grouped together).
3.  **Meaningful Search**: Instead of searching for exact words, you can search for concepts. Asking *"Where was that cheap hotel in Tokyo?"* works even if those exact words aren't in the page title.
4.  **100% Private**: All of this happens **locally on your computer**. No data is ever sent to a server.

---

## 🛠️ How do I know it's working?

It's easy to verify Cortex is active:

1.  **The Extension Popup**: Click the Cortex icon in your browser bar. You'll see a live count of **"Saved Pages"** and **"Memory Size"**. If these numbers go up as you browse, it's working!
2.  **The Dashboard**: Click **"Open Dashboard"** from the popup. You'll see your recently visited pages appear instantly.
3.  **Try a Search**: Visit a few pages about a specific topic (e.g., "Healthy Recipes"). Then go to the dashboard and search for *"something to cook"*. Cortex will show you those recipes.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 1.1 (Optional) Enable the Automation Agent (Gemini)
1. Copy `ENV.example` to `.env`
2. Set `GEMINI_API_KEY` in `.env`

### 2. Start the Dashboard
```bash
pnpm dev
```

## 🔐 Firebase Authentication (Email/Password)

This app uses Firebase v9+ modular SDK for auth.

Create a `.env` file in the project root (same folder as `package.json`) and set:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID` (optional)

### 3. Build the Extension
```bash
pnpm build:extension
```

### 4. Load in Browser
1.  Open Chrome/Brave and go to `chrome://extensions/`.
2.  Turn on **Developer mode** (top right).
3.  Click **Load unpacked** and select the `dist/extension/` folder in this project.

---

## 🔒 Privacy Perimeter

We believe your history belongs to you.
- **Zero Cloud**: No accounts, no sync, no data leakage.
- **Selective Forget**: Delete any domain or time range from your memory instantly.
- **Pause Anytime**: One click to stop Cortex from saving your sessions.

---

**Built with ❤️ for the Samsung Prism WebAgent Hackathon**

**Resources Used:**

Technical Resources:
--> Browser WebExtension APIs (Chrome / Chromium)
--> IndexedDB (local storage for sessions & embeddings)
--> WASM toolchains (for on-device embeddings)
--> Local ANN / Vector Index libraries
--> React.js (UI dashboard)

AI / ML Resources:
--> On-device embedding models (WASM-based, open-source)
--> spaCy (for basic NLP workflows)
--> Semantic embeddings & vector similarity techniques

Dev & Design Tools:
--> Git & GitHub
--> Eraser.io, Napkin.ai, Gamma.ai for basic template designs 
--> VS Code

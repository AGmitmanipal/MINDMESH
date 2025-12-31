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

### 2. Start the Dashboard
```bash
pnpm dev
```

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


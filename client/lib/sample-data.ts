/**
 * Sample data generator for testing Cortex with real IndexedDB data
 */

import type { MemoryNode } from "@shared/extension-types";
import { generateMemoryId } from "./text-utils";

const samplePages = [
  {
    title: "React Documentation - Learning",
    url: "https://react.dev/learn",
    text: "React is a library for building user interfaces with reusable components. Learn about hooks, state management, and modern React patterns. React makes it painless to create interactive UIs. Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.",
  },
  {
    title: "Next.js Documentation",
    url: "https://nextjs.org/docs",
    text: "Next.js is a React framework for production with built-in optimization. Next.js gives you the best developer experience with all the features you need for production. Learn about file-based routing, API routes, built-in optimization, and more.",
  },
  {
    title: "Tailwind CSS - Rapidly Build Modern Designs",
    url: "https://tailwindcss.com",
    text: "Utility-first CSS framework for building custom designs without leaving HTML. A utility-first CSS framework packed with classes that can be composed to build any design. With Tailwind, you build UIs by composing utility classes to build complex components.",
  },
  {
    title: "TypeScript: Typed JavaScript at Any Scale",
    url: "https://www.typescriptlang.org",
    text: "TypeScript is JavaScript with syntax for types. TypeScript adds optional static typing to JavaScript. TypeScript is a strongly typed programming language that builds on JavaScript. Use type definitions to catch errors early and improve IDE support.",
  },
  {
    title: "Vite - Next Generation Frontend Tooling",
    url: "https://vitejs.dev",
    text: "Vite is a build tool that aims to provide a faster and leaner development experience for modern web projects. Instant server start, lightning-fast HMR, optimized builds, and more.",
  },
  {
    title: "Web Workers API - MDN",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API",
    text: "Web Workers make it possible to run a script operation in a background thread separate from the main execution thread. Web Workers are workers that run JavaScript code in the background.",
  },
  {
    title: "IndexedDB API - MDN",
    url: "https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API",
    text: "IndexedDB is a low-level API for client-side storage of significant amounts of structured data. IndexedDB is a large-scale, NoSQL Database System. IndexedDB lets you store large amounts of structured data on the client side.",
  },
  {
    title: "Manifest V3 - Chrome Extension Platform",
    url: "https://developer.chrome.com/docs/extensions/mv3/",
    text: "Manifest V3 is the latest version of the Chrome Extension platform. Learn about service workers, content scripts, and modern extension development.",
  },
  {
    title: "Privacy in Web Development",
    url: "https://example.com/privacy-web",
    text: "Privacy-first design principles for web applications. Building applications that respect user privacy. Local-first architecture, no cloud processing, user control over data.",
  },
  {
    title: "Machine Learning in the Browser",
    url: "https://example.com/ml-browser",
    text: "Running machine learning models in the browser with WebAssembly. ONNX Runtime Web, GGML WASM, and other tools for local inference.",
  },
];

export function generateSampleMemoryNodes(): MemoryNode[] {
  const now = Date.now();
  const oneHourAgo = 3600000;

  return samplePages.map((page, index) => ({
    id: generateMemoryId(page.url, now - index * oneHourAgo),
    url: page.url,
    title: page.title,
    readableText: page.text,
    timestamp: now - index * oneHourAgo,
    keywords: extractKeywordsFromText(page.text, page.title),
    metadata: {
      domain: new URL(page.url).hostname,
      favicon: `${new URL(page.url).origin}/favicon.ico`,
    },
  }));
}

function extractKeywordsFromText(text: string, title: string): string[] {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "is",
    "are",
    "be",
    "this",
    "that",
  ]);

  const words = [
    ...text.toLowerCase().match(/\b\w+\b/g),
    ...title.toLowerCase().match(/\b\w+\b/g),
  ].filter((word) => word.length > 3 && !stopWords.has(word));

  const frequency = new Map<string, number>();
  words.forEach((word) => {
    frequency.set(word, (frequency.get(word) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

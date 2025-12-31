import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    emptyOutDir: false, // Don't empty because the main extension build runs first
    outDir: "dist/extension",
    minify: true,
    rollupOptions: {
      input: {
        content: path.resolve(__dirname, "extension/src/content-scripts/content.ts"),
      },
      output: {
        format: "iife", // IIFE format is perfect for content scripts as it's self-contained
        entryFileNames: "content.js",
        extend: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@client": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});


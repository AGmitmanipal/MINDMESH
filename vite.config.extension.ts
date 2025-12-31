import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    outDir: "dist/extension",
    minify: true,
    rollupOptions: {
      input: {
        background: path.resolve(__dirname, "extension/src/background/worker.ts"),
        embedding: path.resolve(__dirname, "extension/src/web-workers/embedding.worker.ts"),
        clustering: path.resolve(__dirname, "extension/src/web-workers/clustering.worker.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
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

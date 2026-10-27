import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["harfbuzzjs"],
  },
  build: {
    target: "es2022",
  },
  server: {
    port: 5173,
    host: true,
  },
});

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [tailwindcss()],
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

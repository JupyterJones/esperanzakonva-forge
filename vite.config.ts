import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

function dynamicMp3Plugin() {
  return {
    name: "dynamic-mp3-plugin",
    configureServer(server: any) {
      server.middlewares.use("/api/mp3-list", (_req: any, res: any) => {
        const mp3Dir = path.resolve(process.cwd(), "public/mp3");
        let files: string[] = [];
        if (fs.existsSync(mp3Dir)) {
          files = fs.readdirSync(mp3Dir).filter((f) => f.toLowerCase().endsWith(".mp3"));
        }
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(files));
      });
    },
    buildStart() {
      const mp3Dir = path.resolve(process.cwd(), "public/mp3");
      if (fs.existsSync(mp3Dir)) {
        const files = fs.readdirSync(mp3Dir).filter((f) => f.toLowerCase().endsWith(".mp3"));
        fs.writeFileSync(path.join(mp3Dir, "manifest.json"), JSON.stringify(files, null, 2));
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), dynamicMp3Plugin()],
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

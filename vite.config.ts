import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import reactRefresh from "@vitejs/plugin-react-refresh";
import svgr from "vite-plugin-svgr";
import fs from "fs";
import path from "path";
import os from "os";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react({ jsxImportSource: "@emotion/react" }),
    tsconfigPaths(),
    reactRefresh(),
    svgr(),
  ],
  server:
    process.env.NODE_ENV === "development"
      ? {
          port: 3200,
          https: {
            cert: fs.readFileSync(path.join(os.homedir(), "localhost.pem")),
            key: fs.readFileSync(path.join(os.homedir(), "localhost-key.pem")),
          },
        }
      : {},

  build: {
    outDir: "build",
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
      exclude: [],
    },
  },
});

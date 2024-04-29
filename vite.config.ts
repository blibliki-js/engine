/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, "src/index.ts"),
      name: "Engine",
      // the proper extensions will be added
      fileName: "index",
    },
  },
  test: {
    include: ["test/**/*.{test,spec}.{ts,tsx}"],
    browser: {
      name: "chrome",
      enabled: true,
      headless: true,
    },
  },
  plugins: [dts()],
});

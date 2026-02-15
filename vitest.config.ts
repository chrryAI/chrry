import { defineConfig } from "vitest/config"
import path from "path"
import { createRequire } from "module"
import { fileURLToPath } from "url"

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    alias: {
      // Resolve to absolute path of browser build to bypass exports check and force browser version
      uuid: path.resolve(
        path.dirname(require.resolve("uuid/package.json")),
        "dist/esm-browser/index.js",
      ),
    },
    deps: {
      interopDefault: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})

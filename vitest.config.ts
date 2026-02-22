import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

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
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})

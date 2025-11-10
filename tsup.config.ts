import { defineConfig } from "tsup"
import { copyFileSync } from "fs"
import { resolve } from "path"

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "react-native",
    "next",
    "next/navigation",
    "next/router",
    "next-auth",
    "i18n-iso-countries",
    "crypto",
    "uuid",
    "swr",
    "motion",
  ],
  // Don't bundle CSS/SCSS - let consumers handle it
  loader: {
    ".scss": "empty", // Don't copy SCSS files, they'll be imported from source
    ".css": "copy", // Copy regular CSS files
  },
})

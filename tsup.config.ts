import { defineConfig } from "tsup"

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
    ".scss": "copy",
    ".css": "copy",
  },
})

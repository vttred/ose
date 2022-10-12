import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import scss from "rollup-plugin-scss";
import { copy } from "@web/rollup-plugin-copy";

const staticFiles = ["lang", "packs", "templates"];

export default defineConfig({
  input: "src/ose.js",
  output: {
    dir: "dist/",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript(),
    scss({
      output: "dist/ose.css",
      sourceMap: true,
      watch: 'src/'
    }),
    copy({
      patterns: staticFiles.map((folderName) => `${folderName}/**/*`),
      rootDir: "./src/",
    }),
  ],
});
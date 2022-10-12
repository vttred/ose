const { defineConfig } = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const scss = require("rollup-plugin-scss");
const { copy } = require("@web/rollup-plugin-copy");

const staticFiles = ["lang", "packs", "templates"];

module.exports = defineConfig({
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
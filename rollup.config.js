const { defineConfig } = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");

module.exports = () =>
  defineConfig({
    input: "src/ose.js",
    output: {
      dir: "dist/",
      format: "es",
      sourcemap: true,
    },
    plugins: [nodeResolve(), typescript()],
  });

const { nodeResolve } = require("@rollup/plugin-node-resolve");

module.exports = () => ({
  input: "src/ose.js",
  output: {
    dir: "dist/",
    format: "es",
    sourcemap: true,
  },
  plugins: [nodeResolve()],
});

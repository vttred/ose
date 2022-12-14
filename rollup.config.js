import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import scss from "rollup-plugin-scss";
import { copy } from "@web/rollup-plugin-copy";
import livereload from "rollup-plugin-livereload";
import eslint from "@rollup/plugin-eslint";

const staticFileFolders = ["lang", "packs", "templates"];

/**
 * Rollup injects an environment variable if watch mode is used.
 * See: https://rollupjs.org/guide/en/#-w--watch
 */
const isWatchMode = !!process.env.ROLLUP_WATCH;

/**
 * @type {import('rollup-plugin-livereload').RollupLivereloadOptions & import('livereload').CreateServerConfig}
 */
const livereloadConfig = {
  delay: 500,
  // need to explicitly exclude the scss entry file to prevent livereload from refreshing the page when the scss changes
  // This allows for in-place css updates.
  exclusions: [/.*ose\.scss\.js$/],
};

export default defineConfig([
  {
    input: "src/ose.js",
    output: {
      dir: "dist/",
      format: "es",
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      typescript(),
      eslint(),
      !isWatchMode && terser(),
      copy({
        patterns: staticFileFolders.map((folderName) => `${folderName}/**/*`),
        rootDir: "./src/",
      }),
      isWatchMode && livereload(livereloadConfig),
    ],
  },
  {
    // add a special scss entry point to allow for in place CSS update via livereload
    input: "src/ose.scss.js",
    output: {
      dir: "dist/",
      format: "es",
      sourcemap: false,
    },
    plugins: [
      scss({
        output: "dist/ose.css",
        outputStyle: "compressed",
        sourceMap: true,
        watch: "src/",
      }),
    ],
  },
]);

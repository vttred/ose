import path from 'path'
import { defineConfig } from "rollup";

// shared rollup plugins
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import scss from "rollup-plugin-scss";
import postcss from "rollup-plugin-postcss-modules";
import livereload from "rollup-plugin-livereload";

// system rollup plugins
import { copy } from "@web/rollup-plugin-copy";
import eslint from "@rollup/plugin-eslint";
import InlineSvg from 'rollup-plugin-inline-svg';
import alias from '@rollup/plugin-alias';

// component module rollup plugins
import cssImports from "rollup-plugin-import-css";

import pAutoprefixer from "autoprefixer";
import pNesting from "postcss-nesting";
import postcssImport from 'postcss-import';

const staticFileFolders = ["lang", "packs"];

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
      alias({
        entries: [{ find: '@assets', replacement: './assets' }]
      }),
      typescript(),
      !isWatchMode && eslint(),
      !isWatchMode && terser(),
      InlineSvg(),
      copy({
        patterns: [
          ...staticFileFolders.map((folderName) => `${folderName}/**/*`),
          "templates/**/*.hbs"
        ],
        rootDir: "./src/",
      }),
      // CSS modules are used for sheets and other styling 
      postcss({
        extract: path.resolve('dist/modules.css'),
        plugins: [postcssImport(), pAutoprefixer(), pNesting()]
      }),
      isWatchMode && livereload(livereloadConfig),
    ],
  },
  {
    input: "src/components/components.ts",
    output: {
      file: 'dist/components.js',
      format: "es",
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      typescript(),
      // @todo - This breaks our builds because eslint 
      //         looks for an importAssertions plugin
      //         that doesn't exist.
      // !isWatchMode && eslint(),
      cssImports(),
      !isWatchMode && terser(),
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

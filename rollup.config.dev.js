// Rollup
import baseConfig from "./rollup.config";
import livereload from "rollup-plugin-livereload";
import { defineConfig } from "rollup";

// if the --no-reload flag is passed, don't inject the livereload script into the browser
// eg: npm run build:watch -- --no-reload
const enableLiveReload = !process.argv.includes("--no-reload");

export default defineConfig({
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins,
    livereload({
      watch: "dist",
      port: 9999,
      inject: enableLiveReload,
    }),
  ],
});

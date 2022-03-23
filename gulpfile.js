const fs = require("fs-extra");
const gulp = require("gulp");
const sass = require("gulp-dart-sass");
const sourcemaps = require("gulp-sourcemaps");
const path = require("path");
const buffer = require("vinyl-buffer");
const source = require("vinyl-source-stream");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const rollupStream = require("@rollup/stream");
const rollupConfig = require("./rollup.config.js");

/********************/
/*  CONFIGURATION   */
/********************/

const name = "ose";
const sourceDirectory = "./src";
const distDirectory = "./dist";
const stylesDirectory = `scss`;
const stylesExtension = "scss";
const sourceFileExtension = "js";
const staticFiles = ["lang", "packs", "templates"];

/********************/
/*      BUILD       */
/********************/

let cache;

/**
 * Build the distributable JavaScript code
 */
function buildCode() {
  return rollupStream({ ...rollupConfig(), cache })
    .on("bundle", (bundle) => {
      cache = bundle;
    })
    .pipe(source(`${name}.js`))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(`${distDirectory}/module`));
}

/**
 * Build style sheets
 */
function buildStyles() {
  return gulp
    .src(`${sourceDirectory}/${name}.${stylesExtension}`)
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest(`${distDirectory}/`));
}

/**
 * Copy static files
 */
async function copyFiles() {
  for (const file of staticFiles) {
    if (fs.existsSync(`${sourceDirectory}/${file}`)) {
      await fs.copy(`${sourceDirectory}/${file}`, `${distDirectory}/${file}`);
    }
  }
}

/**
 * Watch for changes for each build step
 */
function watch() {
  gulp.watch(
    `${sourceDirectory}/**/*.${sourceFileExtension}`,
    { ignoreInitial: false },
    buildCode
  );
  gulp.watch(
    `${sourceDirectory}/**/*.${stylesExtension}`,
    { ignoreInitial: false },
    buildStyles
  );
  gulp.watch(
    staticFiles.map((file) => `${sourceDirectory}/${file}`),
    { ignoreInitial: false },
    copyFiles
  );
}

const build = gulp.series(
  clean,
  gulp.parallel(buildCode, buildStyles, copyFiles)
);

/********************/
/*      CLEAN       */
/********************/

/**
 * Remove built files from `dist` folder while ignoring source files
 */
async function clean() {
  const files = [...staticFiles, "module"];

  if (fs.existsSync(`${stylesDirectory}/${name}.${stylesExtension}`)) {
    files.push("styles");
  }

  console.log(" ", "Files to clean:");
  console.log("   ", files.join("\n    "));

  for (const filePath of files) {
    await fs.remove(`${distDirectory}/${filePath}`);
  }
}

/********************/
/*       LINK       */
/********************/

/**
 * Update version and URLs in the manifest JSON
 */
function updateManifest(cb) {
  const packageJson = fs.readJSONSync("package.json");
  const config = getConfig(),
    manifest = getManifest(),
    rawURL = config.rawURL,
    repoURL = config.repository,
    manifestRoot = manifest.root;

  if (!config) cb(Error("foundryconfig.json not found"));
  if (!manifest) cb(Error("Manifest JSON not found"));
  if (!rawURL || !repoURL)
    cb(Error("Repository URLs not configured in foundryconfig.json"));

  try {
    const version = argv.update || argv.u;

    /* Update version */

    const versionMatch = /^(\d{1,}).(\d{1,}).(\d{1,})$/;
    const currentVersion = manifest.file.version;
    let targetVersion = "";

    if (!version) {
      cb(Error("Missing version number"));
    }

    if (versionMatch.test(version)) {
      targetVersion = version;
    } else {
      targetVersion = currentVersion.replace(
        versionMatch,
        (substring, major, minor, patch) => {
          if (version === "major") {
            return `${Number(major) + 1}.0.0`;
          } else if (version === "minor") {
            return `${major}.${Number(minor) + 1}.0`;
          } else if (version === "patch") {
            return `${major}.${minor}.${Number(minor) + 1}`;
          } else {
            return "";
          }
        }
      );
    }

    if (targetVersion === "") {
      return cb(Error("Error: Incorrect version arguments."));
    }

    if (targetVersion === currentVersion) {
      return cb(
        Error("Error: Target version is identical to current version.")
      );
    }
    console.log(`Updating version number to '${targetVersion}'`);

    packageJson.version = targetVersion;
    manifest.file.version = targetVersion;

    /* Update URLs */

    const result = `${rawURL}/v${manifest.file.version}/package/${manifest.file.name}-v${manifest.file.version}.zip`;

    manifest.file.url = repoURL;
    manifest.file.manifest = `${rawURL}/master/${manifestRoot}/${manifest.name}`;
    manifest.file.download = result;

    const prettyProjectJson = stringify(manifest.file, { maxLength: 35 });

    fs.writeJSONSync("package.json", packageJson, { spaces: 2 });
    fs.writeFileSync(
      path.join(manifest.root, manifest.name),
      prettyProjectJson,
      "utf8"
    );

    return cb();
  } catch (err) {
    cb(err);
  }
}

/**
 * Get the data path of Foundry VTT based on what is configured in `foundryconfig.json`
 */
function getDataPath() {
  const config = fs.readJSONSync("foundryconfig.json");

  if (config?.dataPath) {
    if (!fs.existsSync(path.resolve(config.dataPath))) {
      throw new Error("User Data path invalid, no Data directory found");
    }

    return path.resolve(config.dataPath);
  } else {
    throw new Error("No User Data path defined in foundryconfig.json");
  }
}

function getSymLinkName() {
  const config = fs.readJSONSync("foundryconfig.json");

  if (config?.symLinkName) {
    updateManifest();
    return config.symLinkName;
  } else {
    return "ose";
  }
}

/**
 * Link build to User Data folder
 */
async function link() {
  let destinationDirectory;
  if (fs.existsSync(path.resolve("./", "system.json"))) {
    destinationDirectory = "systems";
  } else {
    throw new Error("Could not find system.json");
  }

  const linkDirectory = path.resolve(
    getDataPath(),
    "Data",
    destinationDirectory,
    getSymLinkName()
  );

  const argv = yargs(hideBin(process.argv)).option("clean", {
    alias: "c",
    type: "boolean",
    default: false,
  }).argv;
  const clean = argv.c;

  if (clean) {
    console.log(`Removing build in ${linkDirectory}.`);

    await fs.remove(linkDirectory);
  } else if (!fs.existsSync(linkDirectory)) {
    console.log(`Linking dist to ${linkDirectory}.`);
    await fs.ensureDir(path.resolve(linkDirectory, ".."));
    await fs.symlink(path.resolve("."), linkDirectory);
  }
}

module.exports = {
  watch,
  build,
  clean,
  link,
};

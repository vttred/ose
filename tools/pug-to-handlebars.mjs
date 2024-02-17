import pug from 'pug';
import fs from 'fs/promises';
import path from 'path';
import chokidar from 'chokidar';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcTemplatesPath = path.join(__dirname, '../src/templates');
const outputDir = path.join(__dirname, '../dist/templates');

/**
 * Given a single `.pug` file, convert it to a `.hbs` file.
 * 
 * @param filePath {string}  The file path to convert.
 */
async function compilePugToHbs(filePath) {
  const relativePath = path.relative(srcTemplatesPath, filePath);
  const outputPath = path.join(outputDir, relativePath);
  const outputFilePath = outputPath.replace(/\.pug$/, '.hbs');

  try {
    const pugContent = await fs.readFile(filePath, 'utf8');
    const compiledHTML = pug.render(pugContent, {
      filename: filePath,
      pretty: true,
    });

    // Ensure the target directory exists
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });

    await fs.writeFile(outputFilePath, compiledHTML, 'utf8');
    console.log(`Compiled ${relativePath} to ${path.relative(outputDir, outputFilePath)}`);
  } catch (error) {
    console.error(`Error compiling ${relativePath}: ${error.message}`);
  }
}

/**
 * Use `chokidar` to watch our templates directory for changes
 */
function watchPugFiles() {
  chokidar.watch(`${srcTemplatesPath}/**/*.pug`, { ignoreInitial: false })
    .on('add', compilePugToHbs)
    .on('change', compilePugToHbs)
    .on('unlink', async filePath => {
      const relativePath = path.relative(srcTemplatesPath, filePath);
      const hbsFilePath = path.join(outputDir, relativePath).replace(/\.pug$/, '.hbs');

      try {
        await fs.unlink(hbsFilePath);
        console.log(`Removed ${path.relative(outputDir, hbsFilePath)}`);
      } catch (error) {
        console.log(`Error removing ${hbsFilePath}: ${error.message}`);
      }
    })
    .on('error', error => console.log(`Watcher error: ${error}`))
    .on('ready', () => console.log('Watching for Pug file changes...'));
}

/**
 * Our main execution loop.
 * 
 * If `--watch` is passed to this script, use this script as a watcher.
 * We'll only compile the files that see changes.
 *
 * Otherwise, run this script on every file all at once.
 */
(async () => {
  if (process.argv.includes('--watch')) {
    watchPugFiles();
  } else {
    const pugFiles = await glob(`${srcTemplatesPath}/**/*.pug`);
    for (const file of pugFiles) {
      await compilePugToHbs(file);
    }
  }
})();

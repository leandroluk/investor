#!/usr/bin/env node
const {spawn} = require('child_process');
const chokidar = require('chokidar');
const fg = require('fast-glob');
const fs = require('fs');
const path = require('path');


const red = str => `\x1b[31m${str}\x1b[0m`;
const green = str => `\x1b[32m${str}\x1b[0m`;
const cyan = str => `\x1b[36m${str}\x1b[0m`;
const bold = str => `\x1b[1m${str}\x1b[0m`;

const ROOT = process.cwd();

const patterns = process.argv.slice(2);

if (patterns.length === 0) {
  console.error('❌ You must pass at least one glob pattern as an argument..');
  process.exit(1);
}

/** @param  {...any} args */
function log(...args) {
  console.log('[watch-build]', ...args);
}

/** @returns {Map<string, string>} */
function findAllPackages() {
  const entries = fg.sync('**/package.json', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/.turbo/**', '**/.next/**'],
    absolute: true,
  });

  const map = new Map();
  for (const file of entries) {
    try {
      const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'));
      if (pkg.name) {
        map.set(path.normalize(path.dirname(file)), pkg.name);
      }
    } catch (error) {
      log(error.message);
      process.exit(1);
    }
  }
  return map;
}

/**
 * @param {Map<string, string>} pkgMap
 * @param {string} filePath
 * @returns {string | null}
 */
function findClosestPackage(pkgMap, filePath) {
  let dir = path.dirname(path.resolve(filePath));
  const root = path.resolve(ROOT);

  while (dir.startsWith(root)) {
    if (pkgMap.has(dir)) {
      return pkgMap.get(dir);
    }

    const next = path.dirname(dir);
    if (next === dir) break;
    dir = next;
  }

  return null;
}
const pkgMap = findAllPackages();

/** @type {Set<string>} */
const scheduled = new Set();

function debounceFn(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const runBuilds = debounceFn(async () => {
  const list = Array.from(scheduled);
  scheduled.clear();

  const results = await Promise.allSettled(
    list.map(pkg => {
      log(`📦 Rebuilding ${bold(cyan(pkg))}`);
      return new Promise((resolve) => {
        const proc = spawn('pnpm', ['--filter', pkg, 'build'], {
          cwd: ROOT,
          shell: process.platform === 'win32',
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        let stderr = '', stdout = '';
        proc.stderr.on('data', data => stderr += data.toString());
        proc.stdout.on('data', data => stdout += data.toString());
        proc.on('error', err => stderr += String(err?.message ?? err));
        proc.on('exit', code => {
          if (code !== 0 || stderr.trim()) {
            log(`❌ ${red('Build failed')} for ${bold(cyan(pkg))}`);
            if (stderr.trim()) {
              console.error(stderr.trim());
            } else if (stdout.trim()) {
              console.error(stdout.trim());
            }
            // Não propaga o erro — apenas resolve
            return resolve(); // Não faz reject
          }

          log(`✅ Build done for ${bold(green(pkg))}`);
          resolve();
        });
      });
    })
  );
}, 300);

/** @param {string} pkgName */
function scheduleBuild(pkgName) {
  scheduled.add(pkgName);
  runBuilds();
}

const ignorePattern = (pathStr) => {
  const normalizedPath = pathStr.split(path.sep).join('/');
  return [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/out/',
    '/.next/',
    '/.turbo/',
  ].some(matcher => normalizedPath.includes(matcher));
};
async function main() {
  const globPatterns = await Array.fromAsync(fs.promises.glob(patterns))

  const watcher = chokidar.watch(globPatterns, {
    cwd: ROOT,
    ignored: ignorePattern,
    ignoreInitial: true,
  });

  watcher.on('all', (_, filePath) => {
    const abs = path.resolve(ROOT, filePath);
    const pkgName = findClosestPackage(pkgMap, abs);
    if (pkgName) scheduleBuild(pkgName);
  });

  log('👀 Watching for changes on patterns:', patterns.join(', '));

}
void main()

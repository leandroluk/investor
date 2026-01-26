#!/usr/bin/env node
/**
 * Cross-platform Docker build & push for BFlow apps.
 * Usage:
 *   node build-push.js api-tenant
 *   node build-push.js web-tenant --registry registry.local:5000 --tag latest
 *   node build-push.js api-tenant --no-cache
 *   node build-push.js web-tenant --platform linux/amd64
 *
 * Flags:
 *   --registry   Registry hostname:port (default: registry.local:5000)
 *   --tag        Image tag (default: latest)
 *   --context    Build context (default: .)
 *   --no-cache   Build without cache
 *   --platform   Target platform (e.g., linux/amd64)
 */

const {spawn} = require('child_process');
const {existsSync, readFileSync} = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {_: []};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-cache') {args.noCache = true; continue;}
    if (a === '--registry') {args.registry = argv[++i]; continue;}
    if (a === '--tag') {args.tag = argv[++i]; continue;}
    if (a === '--context') {args.context = argv[++i]; continue;}
    if (a === '--platform') {args.platform = argv[++i]; continue;}
    if (a.startsWith('--')) {
      console.error(`Unknown flag: ${a}`);
      process.exit(2);
    } else {
      args._.push(a);
    }
  }
  return args;
}

function run(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {stdio: 'inherit', ...options});
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
    p.on('error', reject);
  });
}

// Transforma "name" do package.json em nome de repositório Docker válido
// - pega o último segmento após "/" (suporta "@scope/name" e "foo/bar/baz")
// - normaliza pra minúsculas e troca caracteres inválidos por "-"
function toImageBaseName(pkgName, fallback) {
  if (!pkgName || typeof pkgName !== 'string') return sanitizeRepo(fallback);
  const last = pkgName.split('/').pop(); // "@scope/name" -> "name", "a/b/c" -> "c"
  return sanitizeRepo(last);
}

function sanitizeRepo(name) {
  // Docker repo rules (simplificado): [a-z0-9._-], minúsculas.
  // Se vier vazio depois da sanitização, volta pro fallback "app".
  const cleaned = String(name).toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
  return cleaned || 'app';
}

(function ensureDockerfile(app) {
  // no-op; mantido por legibilidade
})();

(async function main() {
  const args = parseArgs(process.argv);
  const app = args._[0];
  if (!app) {
    console.error('Usage: node build-push.js <app-name> [--registry <host:port>] [--tag <tag>] [--context <path>] [--no-cache] [--platform <os/arch>]');
    process.exit(2);
  }
  const registry = args.registry || 'registry.local:5000';
  const tag = args.tag || 'latest';
  const context = args.context || '.';

  // Paths
  const dockerfile = path.join(app, 'Dockerfile');
  if (!existsSync(dockerfile)) {
    console.error(`Dockerfile not found: ${dockerfile}`);
    process.exit(2);
  }

  // Descobrir nome da imagem a partir do package.json (se existir)
  let imageBase = sanitizeRepo(path.basename(app)); // fallback
  const pkgJsonPath = path.join(app, 'package.json');
  if (existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
      imageBase = toImageBaseName(pkg.name, imageBase);
    } catch (e) {
      console.warn(`Aviso: Falha ao ler/parsing ${pkgJsonPath}: ${e.message}. Usando "${imageBase}".`);
    }
  } else {
    console.warn(`Aviso: ${pkgJsonPath} não encontrado. Usando "${imageBase}".`);
  }

  const image = `${registry}/${imageBase}:${tag}`;

  // Build args
  const buildArgs = ['build', '-f', dockerfile, '-t', image];
  if (args.noCache) buildArgs.push('--no-cache');
  if (args.platform) buildArgs.push('--platform', args.platform);
  buildArgs.push(context);

  console.log(`\n==> Building ${image}`);
  console.log(`docker ${buildArgs.join(' ')}`);

  try {
    await run('docker', buildArgs);
  } catch (err) {
    console.error(`Build failed: ${err.message}`);
    process.exit(1);
  }

  // Push
  const pushArgs = ['push', image];
  console.log(`\n==> Pushing ${image}`);
  console.log(`docker ${pushArgs.join(' ')}`);
  try {
    await run('docker', pushArgs);
  } catch (err) {
    console.error(`Push failed: ${err.message}`);
    process.exit(1);
  }

  console.log('\n✅ Done.');
})();

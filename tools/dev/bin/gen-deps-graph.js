const {execSync} = require('child_process');
const fs = require('fs');
const https = require('https');
const pako = require('pako');

const mermaidFile = 'deps-graph.mermaid';
const outputFile = 'deps-graph.png';

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Falha no download: ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close(resolve);
        });
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

async function main() {
  execSync(`pnpm dlx turbo build --graph ${mermaidFile}`, {stdio: 'inherit'});
  let content = fs.readFileSync(mermaidFile, 'utf-8');
  content = content.replace('graph TD', 'graph RL');
  fs.writeFileSync(mermaidFile, content);
  const compressed = pako.deflate(content, {});
  const base64url = Buffer.from(compressed).toString('base64url');
  const url = `https://mermaid.ink/img/pako:${base64url}?type=png`;
  console.log(url)
  await downloadFile(url, outputFile);
  fs.unlinkSync(mermaidFile);
}

main().catch((err) => {
  console.error('❌ Erro:', err);
  process.exit(1);
});

const fs = require('fs');
const path = require('path');

const INPUT_FILE = '.env';
const OUTPUT_FILE = '.env.example';

function processEnvFile() {
  const envPath = path.resolve(process.cwd(), INPUT_FILE);

  if (!fs.existsSync(envPath)) {
    console.error(`Erro: Arquivo ${INPUT_FILE} não encontrado.`);
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const lines = content.split(/\r?\n/);

  const newLines = lines.map(line => {
    const regex = /^([^=]+)=.*?(\s*#!.*)$/;
    const match = line.match(regex);
    if (match) {
      const key = match[1].trim();
      return `${key}={{${key}}} #!`;
    }
    return line;
  });

  const newContent = newLines.join('\n');
  fs.writeFileSync(path.resolve(process.cwd(), OUTPUT_FILE), newContent);
  console.log(`Sucesso! Arquivo gerado em: ${OUTPUT_FILE}`);
}

processEnvFile();
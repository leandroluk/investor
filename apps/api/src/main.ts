import dotenvx from '@dotenvx/dotenvx';

dotenvx.config({
  path: ['.env', '../.env', '../../.env'],
  ignore: ['MISSING_ENV_FILE'],
  quiet: true,
});

async function main(): Promise<void> {
  try {
    const {bootstrap} = await import('./bootstrap');
    await bootstrap();
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}
void main(); // NOSONAR

import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  publicDir: false,
  plugins: [{ name: 'presentation-dependency-notices', generateBundle() {
    const source = ['react', 'react-dom'].map(name => `${name}\n\n${readFileSync(join(dirname(require.resolve(name + '/package.json')), 'LICENSE'), 'utf8')}`).join('\n\n');
    this.emitFile({ type: 'asset', fileName: 'third-party-licenses.txt', source });
  } }],
  build: { outDir: 'dist', emptyOutDir: true, sourcemap: false, target: ['es2020', 'safari15'] },
});

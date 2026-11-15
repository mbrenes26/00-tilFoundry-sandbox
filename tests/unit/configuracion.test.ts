import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
const pkg = JSON.parse(read('package.json'));

describe('juego-7: ejecución reproducible por HTTP', () => {
  it('conserva Node.js 22 y las versiones aprobadas', () => {
    expect(pkg.engines.node).toBe('22.x');
    expect(pkg.dependencies.phaser).toMatch(/^3\./);
    expect(pkg.devDependencies.typescript).toMatch(/^5\./);
    expect(pkg.devDependencies.vite).toBe('6.4.6');
    expect(pkg.devDependencies.vitest).toBe('4.1.12');
    expect(pkg.devDependencies['@playwright/test']).toBe('1.65.0');
    const lock = JSON.parse(read('package-lock.json'));
    for (const name of ['phaser', 'typescript', 'vite', 'vitest', '@playwright/test']) {
      expect(lock.packages[`node_modules/${name}`].version).toBe(
        pkg.dependencies[name] ?? pkg.devDependencies[name],
      );
    }
  });

  it('ofrece desarrollo, build con verificación de tipos y pruebas separadas', () => {
    expect(pkg.scripts).toMatchObject({
      dev: 'vite', build: 'tsc --noEmit && vite build', preview: 'vite preview',
      test: 'vitest run', 'test:e2e': 'playwright test',
    });
  });

  it('incluye entrada web en español y configuración TypeScript y Vite', () => {
    for (const path of ['index.html', 'src/main.ts', 'tsconfig.json', 'vite.config.ts']) {
      expect(existsSync(new URL(`../../${path}`, import.meta.url)), path).toBe(true);
    }
    expect(read('index.html')).toContain('lang="es"');
    expect(read('index.html')).toContain('/src/main.ts');
    expect(read('index.html')).toContain('width=device-width, initial-scale=1');
    expect(JSON.parse(read('tsconfig.json')).compilerOptions.strict).toBe(true);
  });

  it('documenta instalación, HTTP, pruebas, controles y reglas', () => {
    const doc = read('README.md');
    for (const text of ['Node.js 22', 'npm ci', 'npm run dev', 'npm run build',
      'npm test', 'npm run test:e2e', 'npx playwright install chromium',
      'file://', 'clic', 'toque', '2000', '500', '100', 'tres', 'pausa']) {
      expect(doc, text).toContain(text);
    }
  });
});

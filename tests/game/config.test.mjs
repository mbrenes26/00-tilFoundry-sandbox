import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveConfig } from 'vite';

test('M-5: stack y scripts compartidos', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(pkg.devDependencies.vite, '6.4.6');
  assert.equal(pkg.devDependencies.vitest, '4.1.12');
  assert.equal(pkg.devDependencies['@playwright/test'], '1.65.0');
  assert.match(pkg.devDependencies.typescript, /^5\./);
  assert.match(pkg.dependencies.phaser, /^3\./);
  assert.equal(pkg.engines.node, '>=22 <23');
  assert.deepEqual(pkg.scripts, {
    dev: 'vite --host 127.0.0.1', build: 'tsc --noEmit && vite build',
    test: 'node --test tests/game/config.test.mjs && vitest run',
    'test:e2e': 'playwright test', train: 'tsx scripts/train.ts',
    evaluate: 'tsx scripts/evaluate.ts',
  });
});

test('M-5 / SEG-1: Vite limita desarrollo y preview a loopback incluso sin flags CLI', async () => {
  const config = await resolveConfig({}, 'serve');
  assert.equal(config.server.host, '127.0.0.1');
  assert.equal(config.preview.host, '127.0.0.1');
});

test('M-5 / SEG-1: navegador de pruebas conserva servidor y URL locales', () => {
  const config = readFileSync('playwright.config.ts', 'utf8');
  assert.match(config, /baseURL: 'http:\/\/127\.0\.0\.1:5173'/);
  assert.match(config, /url: 'http:\/\/127\.0\.0\.1:5173\/@vite\/client'/);
  assert.match(config, /npm run dev -- --port 5173 --strictPort/);
  assert.doesNotMatch(config, /0\.0\.0\.0|--host/);
});

test('I-4 / SEG-1: guía explica uso local y límites de verificación', () => {
  const guide = readFileSync('README.md', 'utf8');
  assert.match(guide, /http:\/\/127\.0\.0\.1:5173/);
  assert.match(guide, /solo en el propio equipo/);
  assert.match(guide, /No se ha comprobado el cortafuegos de Windows ni la exposición a Internet/);
  assert.doesNotMatch(guide, /escucha en todas las interfaces/);
});

test('M-5: exclusiones sin excluir arte', () => {
  const patterns = readFileSync('.gitignore', 'utf8').split(/\r?\n/);
  for (const path of ['node_modules/', 'dist/', 'runs/', 'test-results/', 'playwright-report/']) {
    assert.ok(patterns.includes(path), path);
  }
  assert.ok(!patterns.some(p => p.includes('public') || p.includes('assets') || p.includes('*.png')));
});

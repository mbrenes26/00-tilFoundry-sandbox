import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('M-5: stack y scripts compartidos', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.equal(pkg.devDependencies.vite, '6.4.6');
  assert.equal(pkg.devDependencies.vitest, '4.1.12');
  assert.equal(pkg.devDependencies['@playwright/test'], '1.65.0');
  assert.match(pkg.devDependencies.typescript, /^5\./);
  assert.match(pkg.dependencies.phaser, /^3\./);
  assert.equal(pkg.engines.node, '>=22 <23');
  assert.deepEqual(pkg.scripts, {
    dev: 'vite --host 0.0.0.0', build: 'tsc --noEmit && vite build',
    test: 'node --test tests/game/config.test.mjs && vitest run',
    'test:e2e': 'playwright test', train: 'tsx scripts/train.ts',
    evaluate: 'tsx scripts/evaluate.ts',
  });
});

test('M-5: exclusiones sin excluir arte', () => {
  const patterns = readFileSync('.gitignore', 'utf8').split(/\r?\n/);
  for (const path of ['node_modules/', 'dist/', 'runs/', 'test-results/', 'playwright-report/']) {
    assert.ok(patterns.includes(path), path);
  }
  assert.ok(!patterns.some(p => p.includes('public') || p.includes('assets') || p.includes('*.png')));
});

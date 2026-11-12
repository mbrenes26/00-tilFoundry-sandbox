import {expect, it} from 'vitest';
import {readFileSync} from 'node:fs';

it('J1 desviación autorizada: Vitest exacto 3.2.7 y lockfile coherente sin cambiar otras versiones directas', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  const expected = {vite: '6.1.0', vitest: '3.2.7', typescript: '5.7.3', '@playwright/test': '1.51.1'};
  expect(pkg.dependencies).toEqual({phaser: '3.90.0'});
  expect(pkg.devDependencies).toEqual(expected);
  expect(lock.lockfileVersion).toBe(3);
  expect(lock.packages[''].dependencies).toEqual(pkg.dependencies);
  expect(lock.packages[''].devDependencies).toEqual(expected);
  for (const [name, version] of Object.entries({...pkg.dependencies, ...expected})) {
    expect(lock.packages[`node_modules/${name}`].version).toBe(version);
  }
  expect(lock.packages['node_modules/@vitest/mocker'].version).toBe('3.2.7');
  for (const [path, entry] of Object.entries(lock.packages) as [string, any][]) {
    if (path.endsWith('/vitest') || path.includes('/@vitest/')) {
      expect(entry.version, path).toBe('3.2.7');
      expect(entry.resolved, path).toMatch(/^https:\/\/registry\.npmjs\.org\//);
      expect(entry.integrity, path).toMatch(/^sha512-/);
    }
  }
});

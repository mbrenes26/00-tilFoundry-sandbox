import {expect, it} from 'vitest';
import {readFileSync} from 'node:fs';

it('D1 cinco versiones exactas aprobadas y lockfile coherente sin nuevas directas ni Vitest 5', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  const expected = {vite: '6.4.6', vitest: '4.1.12', typescript: '5.7.3', '@playwright/test': '1.65.0'};
  expect(pkg.dependencies).toEqual({phaser: '3.90.0'});
  expect(pkg.devDependencies).toEqual(expected);
  expect(pkg.overrides).toBeUndefined();
  expect(pkg.optionalDependencies).toBeUndefined();
  expect(pkg.peerDependencies).toBeUndefined();
  expect(lock.lockfileVersion).toBe(3);
  expect(lock.packages[''].dependencies).toEqual(pkg.dependencies);
  expect(lock.packages[''].devDependencies).toEqual(expected);
  for (const [name, version] of Object.entries({...pkg.dependencies, ...expected})) {
    expect(lock.packages[`node_modules/${name}`].version).toBe(version);
  }
  for (const name of ['expect', 'mocker', 'pretty-format', 'runner', 'snapshot', 'spy', 'utils']) {
    expect(lock.packages['node_modules/vitest'].dependencies[`@vitest/${name}`]).toBe('4.1.12');
    expect(lock.packages[`node_modules/@vitest/${name}`].version).toBe('4.1.12');
  }
  for (const [path, entry] of Object.entries(lock.packages) as [string, any][]) {
    if (path.endsWith('/vitest') || path.includes('/@vitest/')) {
      expect(entry.version, path).toBe('4.1.12');
      expect(entry.resolved, path).toMatch(/^https:\/\/registry\.npmjs\.org\//);
      expect(entry.integrity, path).toMatch(/^sha512-/);
    }
  }
});

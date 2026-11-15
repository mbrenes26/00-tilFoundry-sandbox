import { expect, test } from 'vitest';
import config from '../../vitest.config';

test('M-5: npm test limita Vitest a dos workers para evitar saturación', () => {
  expect(config.test?.maxWorkers).toBe(2);
});

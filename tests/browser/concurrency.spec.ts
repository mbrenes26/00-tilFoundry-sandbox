import { expect, test } from '@playwright/test';
import { toPolicy } from '../../src/learning/policy';
import { createNetwork } from '../../src/learning/network';

const policy = toPolicy(createNetwork(123), { seed: 123, trainingSteps: 0, updates: 0 });
const input = (name: string, text: string) => ({ name, mimeType: 'application/json', buffer: Buffer.from(text) });

test('I-3: dos lecturas concurrentes no permiten que la lectura antigua habilite iniciar', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    const original = File.prototype.text;
    (window as any).releaseOld = null;
    File.prototype.text = function () {
      if (this.name === 'lento.json') return new Promise<string>(resolve => { (window as any).releaseOld = () => original.call(this).then(resolve); });
      return original.call(this);
    };
  });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const selector = page.locator('#policy-file');
  await selector.setInputFiles(input('lento.json', JSON.stringify(policy)));
  await expect(page.getByRole('status')).toContainText('Validando');
  await selector.setInputFiles(input('roto.json', '{'));
  await expect(page.getByRole('status')).toContainText('JSON corrupto');
  await page.evaluate(() => (window as any).releaseOld());
  await expect(page.getByRole('button', { name: 'Iniciar partida' })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('JSON corrupto');
  await selector.setInputFiles(input('nuevo.json', JSON.stringify(policy)));
  await expect(page.getByRole('button', { name: 'Iniciar partida' })).toBeEnabled();
  await page.getByRole('button', { name: 'Iniciar partida' }).click();
  await page.getByRole('button', { name: 'Importar otra política' }).click();
  const playing = await page.evaluate(async () => { const { game } = await import('/src/main.ts' as string); return game.scene.getScene('LaunchScene').playback !== undefined; });
  expect(playing).toBe(false);
  await expect(page.getByRole('button', { name: 'Iniciar partida' })).toBeEnabled();
  expect(errors).toEqual([]);
});

import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('juego-7: presenta las pantallas y los controles como disponibles, no futuros', () => {
  const doc = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
  const introduction = doc.split('## Instalación y desarrollo')[0];
  for (const text of ['pantalla de inicio', 'partida', 'puntaje final', '«Jugar»', '«Jugar otra vez»', 'clic', 'toque']) {
    expect(introduction, text).toContain(text);
  }
  expect(introduction).not.toMatch(/primer paso|siguientes pasos|juego previsto|todavía no están activos/i);
});

it('documenta la acción accesible y el teclado', () => {
  const doc = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
  for (const text of ['Atrapar estrella', 'Tab', 'Enter', 'Espacio']) expect(doc).toContain(text);
});

it('juego-2 y juego-5: documenta medidas reales de la silueta, no una captura cuadrada', () => {
  const doc = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
  expect(doc).not.toContain('Zona cuadrada de estrella');
  for (const text of ['silueta', 'esquinas transparentes', 'ambos fotogramas', 'medidas.json']) expect(doc).toContain(text);
});

it('documenta el cierre secuencial sin servidores concurrentes en 4173', () => {
  const doc = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
  expect(doc).toContain('npm test && npm run build &&');
  expect(doc).toContain('npm run test:e2e -- --workers=2 &&');
  expect(doc).toContain('TEST_STATIC=1 npm run test:e2e -- --workers=2 &&');
  expect(doc).toContain('No ejecutes dos suites de navegador a la vez');
});

it('cierre: conserva evidencia de ambos modos sin repetir suites ya aprobadas', () => {
  const doc = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
  const closing = doc.split('Para verificar el cierre completo')[1].split('## Versión estática')[0];
  const command = closing.match(/```sh\n([\s\S]*?)```/)![1];
  expect(command.match(/npm test/g)).toHaveLength(1);
  expect(command.match(/npm run build/g)).toHaveLength(1);
  expect(command.match(/npm run test:e2e/g)).toHaveLength(2);
  expect(command).toContain('cp -R test-results "$evidencia/desarrollo"');
  expect(command).toContain('cp -R test-results "$evidencia/estatico"');
  expect(command.indexOf('"$evidencia/desarrollo"')).toBeLessThan(command.indexOf('TEST_STATIC=1'));
  expect(closing).toContain('No repitas el cierre completo');
});

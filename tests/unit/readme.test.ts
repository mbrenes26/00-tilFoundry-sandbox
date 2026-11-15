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

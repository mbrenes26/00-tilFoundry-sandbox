# Verificación acotada de issue-11

- Base verificada: `c5c23ba9c8a742733bf0964805b608fe5446fd06`.
- Paso: cierre-verificacion-acotada-1. Criterios: juego-2, juego-3 y juego-5.
- Cambio de esta entrega: este registro; sin cambios en reglas, renderizado, pruebas o configuración. No apareció una regresión que requiriera un ciclo rojo/verde. No se fabricó un fallo para una tarea de verificación.

## Ejecución independiente

Cada instalación y suite se ejecutó una sola vez en esta sesión, con Node.js `v22.23.5`.

| Comando | Resultado real |
| --- | --- |
| `npm ci` | Salida 0; 50 paquetes instalados; 0 vulnerabilidades notificadas. |
| `npx playwright install chromium` | Salida 0; Chromium y headless shell v1254 instalados. |
| `npm test` | Salida 0; 73 pruebas en 6 archivos aprobadas. |
| `npm run build` | Salida 0; TypeScript y Vite 6.4.6 generan `dist/`. Advertencia no bloqueante de bundle mayor de 500 kB. |
| `npm run test:e2e -- --workers=2` | Salida 0; 30 pruebas Chromium aprobadas; 3.3 minutos. |
| `TEST_STATIC=1 npm run test:e2e -- --workers=2` | Salida 0; 30 pruebas Chromium aprobadas; 3.1 minutos. |

Core conserva los comandos y sus salidas como evidencia de esta ejecución. Los resultados de desarrollo se copiaron antes de iniciar la suite estática para evitar sobrescribirlos. En la sesión, los artefactos están separados en `test-results/verificacion/desarrollo/test-results/` y `test-results/verificacion/estatico/test-results/`. Son artefactos ignorados por Git, no archivos incluidos en el PR.

## Revisión de criterios

- juego-2: `tests/unit/geometry.test.ts` (17 pruebas), `tests/unit/rules.test.ts` (30 pruebas) y `tests/e2e/interaccion.spec.ts` aprobados. Las suites Chromium verifican clic/toque dentro y fuera, esquinas transparentes, entrada repetida y posiciones deterministas. Las entradas exteriores no modifican puntos, fallos ni plazo.
- juego-3: aprobadas las pruebas de duración reducida, mínimo, frontera exacta con prioridad del vencimiento y primera actualización posterior al plazo sin fallos acumulados por frames retrasados.
- juego-5: `tests/unit/layout.test.ts` (10 pruebas) y los 12 casos de `tests/e2e/ventanas.spec.ts` aprobados en cada modo. Cada ventana se comprobó con azar 0, 0.5 y 1 y ambos fotogramas, utilizando los límites observados del objetivo y su zona interactiva, no dimensiones supuestas.

### Medidas observadas

Los valores siguientes proceden de los `medidas.json` generados, agregados entre los tres valores de azar y las pantallas observadas. Desarrollo y estático produjeron los mismos mínimos.

| Ventana CSS | Zona interactiva mínima CSS (ancho × alto) | Texto mínimo CSS | Ancho máximo de contenido |
| --- | --- | --- | --- |
| 1280×720 | 159.786 × 159.787 | 16 | 1280 |
| 1600×900 | 204.586 × 204.587 | 16 | 1600 |
| 360×800 | 50.4 × 50.4 | 16 | 360 |
| 390×844 | 54.6 × 54.6 | 16 | 390 |

Las aserciones verificaron mínimo táctil de 44×44, contención del objetivo, separación de indicadores y controles, texto completo y resolución lógica 1600×900 con FIT sin estiramiento.

### Capturas

Se revisaron visualmente inicio, partida y resultado en las cuatro ventanas, reutilizando las capturas estáticas generadas por la suite. Los montajes de revisión de la sesión están en `test-results/revision-1280×720.png`, `test-results/revision-1600×900.png`, `test-results/revision-360×800.png` y `test-results/revision-390×844.png`. Los originales de ambas ejecuciones se conservaron por separado.

- Títulos, puntaje, fallos y botones completos y sin superposiciones que impidan leer; estrella completa y separada de los controles.
- La indicación inferior queda próxima al borde, pero no recortada. Los botones pueden cruzar una franja decorativa sin ocultar texto ni controles.
- Los montajes de escritorio están reducidos: el mínimo tipográfico se concluye de las medidas CSS, no de la escala del montaje.
- Las capturas no muestran foco activo; no se infiere accesibilidad de ellas. Las pruebas de teclado de escritorio y teléfono emulado aprobaron en ambas suites.

## Conclusión

No se detectaron regresiones de juego-2, juego-3 ni juego-5 en esta ejecución independiente. Instalación, pruebas unitarias, build, Chromium en desarrollo y Chromium sobre build estático terminaron correctamente. No se repitieron suites ni se alteraron límites o criterios. Esto no sustituye la revisión del probador, las auditorías ni la aprobación humana, y no certifica un teléfono físico.

La primera tentativa de crear montajes con Python no estuvo disponible por falta de Pillow; se usó Chromium con las imágenes ya generadas, sin instalar dependencias adicionales ni volver a ejecutar las suites.

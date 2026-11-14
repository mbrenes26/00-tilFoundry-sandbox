# Primera corrección de issue-6 — informe al Manager

## Bloqueo de entrega

La sesión sigue sin repositorio Git: `git status --short` produjo `fatal: not a git repository`. No se creó un repositorio ni se cambió configuración. Se usó exclusivamente `confirmar_cambios`: Core confirmó `0e3bd68` en `foundry/issue-6` con 23 archivos de texto, incluidos el lockfile, fuentes, tests y generador. La lectura de la rama ya muestra esos archivos, no solo README.md.

Core declaró que no puede subir binarios/grandes: los nueve PNG de `public/assets/` y las cuatro capturas de `tests/e2e/captures/` quedaron solo en sesión. `leer_archivo(public/assets/rocket.png)` respondió `No existe`. Por tanto, NO hay entrega completa ni validación de una copia limpia de la rama con assets presentes. Esto necesita resolución de persistencia por Core/Manager; los tests verdes de sesión no resuelven ese bloqueo.

Recuperación: `scripts/assets/generate.mjs` sí está confirmado. Se ejecutó `npm run assets` y se compararon SHA-256 antes/después: los nueve PNG son idénticos. Las capturas pueden reproducirse con los tests de Chromium; no han sido inspeccionadas visualmente. No se ha solicitado un PR ni una transición.

## TDD y regresiones

- **J1, servidores locales**: `tests/game/game.test.ts`, test `J1 servidores locales limitados a loopback y Chromium usa la misma dirección`. Rojo real con `npm test -- --run tests/game/game.test.ts`: salida 1, 1 fallido/5 pasados, `expected 'vite --host 0.0.0.0' to contain '--host 127.0.0.1'`. Cambio mínimo: scripts dev/preview a `127.0.0.1`, URL de Playwright y pruebas a la misma IP. Verde con `npm test`: salida 0, 34 tests. Comprobación real del socket Linux: antes dev `00000000:1055`; después dev `0100007F:1055` y preview `0100007F:1056` (puertos 4181/4182). README documenta loopback sin afirmar que elimina vulnerabilidades.
- **R3, ventana inclusiva**: dos pruebas nuevas de `applyAction(..., launch)` en `tests/rules/rules.test.ts`, a 600/660 minutos; comprueban inicio del lanzamiento, consumo de combustible, resultado y todas las causas. `npm test -- --run tests/rules/rules.test.ts`: salida 0, 26 tests. Dos pruebas nuevas en `tests/e2e/game.spec.ts` lanzan mediante controles reales a 10:00 y 11:00, comprueban animación y resultado por antena/clima, no por ventana perdida. No se modificaron reglas: ya admitían ambos límites.
- **J4, revalidación**: test nuevo `aviso se invalida y revalida tras controles reales de espera`: revisión y riesgo de antena a 10:00; abrir aviso; esperar con controles; verificar que desaparece la confirmación antigua; avanzar a 10:40; abrir aviso nuevo y confirmar; aviso y resultado incluyen antena y clima actuales. No se alteró Session ni el contrato: esta conducta ya funcionaba.
- **J2, límites 1280×720**: test nuevo `todos los controles esenciales caben a 1280x720` comprueba todos los botones visibles, incluidos nueve salas, tres perfiles, confirmación/cancelación, ajustes de ángulo, esperas, reparaciones, carga, verificaciones, aviso de riesgo y reinicio. Verifica límites de viewport y recortes de ancestros con overflow. Primera ejecución falló por preparación del test: quedó seleccionado Reforzada y el helper esperaba el botón Equilibrada; se corrigió el helper para seleccionar Equilibrada mediante su botón real. NO se presenta ese fallo de fixture como defecto de producto ni como rojo de reglas o diseño.
- `npm run test:e2e -- --grep 'todos los controles|aviso se invalida|R3 lanzamiento'`: después de corregir el helper, salida 0, 4 pruebas pasadas. R3 y J4 ya pasaron en la ejecución anterior a cambios de producto. No se fabricó un rojo para funcionalidad ya implementada; son pruebas de regresión añadidas, no evidencia TDD completa de esos criterios.

## Verificación integral

`npm ci && npm test && npm run build`: salida 0. Node.js v22.23.5; instalación real; 34 tests en tres archivos; TypeScript y Vite 6.1.0 en verde. Vite conserva la advertencia de bundle mayor a 500 kB (JavaScript 1.507,57 kB, gzip 350,33 kB). Las cinco versiones exactas y el lockfile no se actualizaron.

La primera llamada combinada de verificación devolvió `Function failed` sin salida recuperable; una lectura posterior de `.last-run.json` indicó passed, pero no se utiliza como sustituto del log completo. Un segundo intento se interrumpió por límite de herramienta; dejó un preview huérfano. Un intento posterior reportó puerto 4173 ocupado (log `correction-port-conflict.log`); se cerró solo ese proceso de sesión sin cambiar `reuseExistingServer` ni configuración. Se lanzó nuevamente Chromium completo con salida y código registrados en `correction-e2e.log` y `correction-e2e.exit`.

Resultado final de `PREVIEW=1 npm run test:e2e`: código de salida 0, 14 pruebas pasadas (3,8 minutos), registrado en `tests/e2e/correction-e2e.log` y `tests/e2e/correction-e2e.exit`. El código se volvió a comprobar mediante comando de sesión. Las capturas actuales se conservaron en `tests/e2e/captures/`, sin afirmar persistencia de sus binarios.

## Seguridad y pendientes

`npm audit --json` actualizado en `tests/e2e/audit.json`: siete dependencias afectadas, dos moderadas, tres altas y dos críticas. Incluye Vite (lecturas fuera de restricciones y otros avisos), esbuild (peticiones/lectura entre orígenes), Playwright (validación de certificados al descargar navegador), Vitest/mocker (lectura/ejecución y registro de mocks) y tinypool (contaminación de prototipos con ejecución de código). `npm audit --omit=dev`: salida 0, `found 0 vulnerabilities`, según la base consultada; no es garantía general de ausencia de vulnerabilidades. Loopback reduce exposición de dev/preview, pero NO corrige esos avisos. No se actualizaron versiones aprobadas.

A2/A4 y aspectos visuales de J2/J6 quedan pendientes: las herramientas disponibles permiten Chromium automatizado, capturas, límites geométricos y consulta de Phaser, pero no presentar/inspeccionar visualmente imágenes ni reproducir animaciones para juicio humano. No se afirma estética, legibilidad o ausencia visual de recortes/personajes invisibles. La duración humana de 10–15 minutos sigue sin verificar.

## Archivos

Recuperación inicial: `.gitignore`, `README.md`, `docs/assets.md`, `index.html`, `package-lock.json`, `package.json`, `playwright.config.ts`, `public/assets/manifest.json`, `scripts/assets/generate.mjs`, `src/game/Session.ts`, `src/game/env.d.ts`, `src/game/scenes.ts`, `src/main.ts`, `src/rules/index.ts`, `src/styles/game.css`, `tests/assets/assets.test.ts`, `tests/e2e/audit.json`, `tests/e2e/game.spec.ts`, `tests/game/game.test.ts`, `tests/rules/rules.test.ts`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`.

Corrección: `package.json`, `playwright.config.ts`, `README.md`, `tests/game/game.test.ts`, `tests/rules/rules.test.ts`, `tests/e2e/game.spec.ts`, `tests/e2e/audit.json`, este informe y logs de verificación. Los PNG y capturas no están persistidos en la rama.

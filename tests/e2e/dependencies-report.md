# Revisión D1–D4 de issue-6 — informe al Manager

## Resultado de este paso

Se actualizaron únicamente las dependencias aprobadas: Vite 6.4.6, Vitest 4.1.12 y @playwright/test 1.65.0. Phaser 3.90.0 y TypeScript 5.7.3 permanecen exactos. Lockfile generado mediante instalación real; instalación limpia, suite completa, build y Chromium real pasan. La auditoría completa informa cero hallazgos. No se solicita transición ni se aprueba entrega.

Se consultaron discovery, spec-solucion revisada y conversación; prevalece BUILDING/aprobación vigente suministrado por Core sobre el encabezado histórico de borrador. Se leyeron los documentos base disponibles README.md, docs/assets.md, correction-report.md, vitest-3.2.7-report.md y vitest-4.1.12-blocked-report.md, junto con las pruebas y configuraciones existentes. El documento original íntegro no estaba disponible en la sesión ni en la lectura actual de spec-solucion (adenda): no se reconstruyeron o reinterpretaron sus criterios. Se mantienen contratos, comportamiento, reglas, arte, pruebas y pendientes anteriores. No fue necesaria adaptación de configuración.

## D1 — TDD de versiones/lockfile

Prueba: tests/game/dependency-version.test.ts, líneas 4–30. Comprueba todas las directas sin rangos ni nuevas directas; ausencia de overrides, optionalDependencies y peerDependencies directas; raíz y entradas del lockfile v3; las siete transitivas @vitest, referencias desde vitest, resolved/integrity y ausencia de versiones Vitest distintas de 4.1.12. Conserva y amplía los controles anteriores.

- Rojo ANTES de modificar package.json: `npm ci && npm test -- --run tests/game/dependency-version.test.ts`, código 1. npm ci instaló 57 paquetes; Vitest 3.2.7 ejecutó 1 test fallido. Esperado Vite 6.4.6/Vitest 4.1.12/Playwright 1.65.0; recibido 6.1.0/3.2.7/1.51.1. Salida real: dependencies-d1-red.log.
- Implementación mínima: versiones exactas en package.json y `npx npm@11 install`, código 0. Añadió 3, retiró 12, cambió 19 paquetes; auditó 49 y reportó cero vulnerabilidades. Salida: dependencies-install.log. No se modificó manualmente el lockfile.
- Verde tras instalación limpia: `npm test -- --run tests/game/dependency-version.test.ts`, código 0, runner 4.1.12, 1 test pasado. Salida: dependencies-d1-green.log.
- `npm ls --all`, código 0 (dependencies-tree.log), y `npm ls --depth=0`, código 0: las cinco directas exactas. Los UNMET OPTIONAL DEPENDENCY corresponden a plataformas y peers opcionales; no se agregaron directas para silenciarlos.

## D2 — instalación real y compatibilidad

`node -v`: v22.23.5. `npm -v`: 10.9.9, incluido en la sesión Node 22. `npm view` de las cinco versiones, código 0: todas disponibles; sus engines declarados aceptan este Node (Phaser no devuelve engines). Evidencia: dependencies-environment.log.

Uso temporal de npm 11 exclusivamente con npx en la sesión aislada: `npx --yes npm@11 --version` devolvió **11.21.2**; `npm view npm@11.21.2 version engines --json` confirma engines `^20.17.0 || >=22.9.0` (dependencies-npm11.json). Node v22.23.5 satisface ese rango. `npx npm@11 install` pasó con código 0, sin instalación global ni cambio de configuración. npm 11 avisó que el postinstall de esbuild 0.25.12 no estaba cubierto por allowScripts; no se aprobó ni configuró ese mecanismo. La siguiente instalación limpia ordinaria sí funcionó y el build verifica esbuild operativo.

`node -v; npm -v; npm ci`, código 0: **v22.23.5 / 10.9.9**, 48 paquetes añadidos y 49 auditados. npm ci realiza la limpieza de node_modules desde el lockfile. Evidencia: dependencies-ci.log. No se usaron overrides, nuevas directas, legacy-peer-deps, force, exclusiones de audit ni audit fix.

Cambios transitivos completos por ruta y versión anterior/final, incluidas entradas opcionales y cambios de metadatos sin cambio de versión: dependencies-lock-changes.json (comparación con copia del lockfile previo). Principales:

- Siete @vitest: 3.2.7 a 4.1.12; playwright/playwright-core: 1.51.1 a 1.65.0.
- esbuild y binarios opcionales: 0.24.2 a 0.25.12; chai: 5.3.3 a 6.3.0; es-module-lexer: 1.7.0 a 2.3.2; std-env: 3.10.0 a 4.3.0; tinyexec: 0.3.2 a 1.3.1; tinyrainbow: 2.0.0 a 3.2.0.
- Nuevas transitivas: @standard-schema/spec 1.1.0, convert-source-map 2.0.0, obug 2.2.1. No son nuevas dependencias directas.
- Retiradas: cac, check-error, debug, deep-eql, js-tokens, loupe, ms, pathval, strip-literal, tinypool 1.1.1, tinyspy y vite-node 3.2.4.
- Rollup 4.68.2, postcss 8.5.32 y eventemitter3 5.0.4 permanecen en el árbol final; el árbol completo está en dependencies-tree.log.

## D3 — regresiones reales sin debilitar pruebas

Son verificaciones de integración de la actualización, no criterios de comportamiento nuevo: no se fabricó rojo para D2–D4 ni se alteraron pruebas funcionales para obtenerlo.

- `npm test`, código 0: **35 tests, 4 archivos** (26 reglas, 2 assets, 6 juego y 1 dependencias). dependencies-test.log.
- `npm run build`, código 0: TypeScript 5.7.3 y Vite 6.4.6; 11 módulos. dependencies-build.log. Persiste aviso de chunk >500 kB: JS 1.511,05 kB/gzip 350,50 kB; no se ocultó ni se ajustó la configuración.
- `npx --no-install playwright install chromium`, código 0. Chromium/Headless Shell **158.0.8127.18, build v1254** y FFmpeg v1013. dependencies-chromium.log. Lanzamiento independiente mediante API chromium devuelve versión real 158.0.8127.18 y código 0.
- `npm run test:e2e`, código 0: **14 pasados, 3,4 minutos**, HTTP dev. dependencies-e2e-dev.log y .exit.
- `PREVIEW=1 npm run test:e2e`, código 0: **14 pasados, 3,3 minutos**, build servido por HTTP preview. dependencies-e2e-preview.log y .exit.

Se ejecutó íntegramente game.spec.ts sin modificarlo: nueve salas; resolución/pixelArt/FIT; texturas y nueve sprites animados; tamaños 1600×900 y 1280×720; todos los controles esenciales y recortes de ancestros; progreso exclusivo y lectura sin tiempo; ganadora 712, componentes y reinicio; fallos por ángulo/bomba/antena/clima/múltiples/combustible; omisión de verificaciones con fallo y éxito; pérdida de ventana; invalidación y revalidación del aviso; lanzamientos inclusivos 10:00/11:00. beforeEach/afterEach conservaron comprobaciones pageerror y respuestas HTTP >=400, sin errores en los caminos probados. Scripts dev/preview y URL Playwright siguen limitados a 127.0.0.1.

Capturas nuevas de preview guardadas separadas, sin sobrescribir evidencia anterior: dependencies-captures/base-1280.png, base-1600.png, launch.png, success.png. Se generaron con Chromium real; no se inspeccionaron visualmente. No se modificó ni regeneró ningún PNG del juego.

## D4 — auditoría y contraste de avisos

Después de npm ci ordinario: `npm audit --json`, código **0**, sin omitir dev. Salida íntegra: dependencies-audit.json. Comprobación Node con assert.deepEqual también código 0: metadata.vulnerabilities = info 0, low 0, moderate 0, high 0, critical 0, total 0; vulnerabilities vacío. Esto acredita el resultado de la base de avisos consultada y del árbol final, no ausencia universal de vulnerabilidades.

Contraste reproducible con auditoría previa vitest-4.1.12-blocked-baseline-audit.json, lockfile anterior y package.json realmente instalado; JSON: dependencies-advisory-contrast.json:

- GHSA-82fw-gwwq-j7x9: Vitest y @vitest/mocker 3.2.7 estaban en rango `>=2.1.0 <4.1.11`. Ambos instalados ahora en 4.1.12, fuera de ese rango; audit final no los reporta.
- GHSA-qxg6-89mg-rqv8: @vitest/mocker 3.2.7 estaba en rango `>=2.1.0-beta.7 <4.1.12`. Instalado ahora en 4.1.12, fuera del rango; audit final no lo reporta.

Se verifica versión instalada y desaparición del aviso de audit. **No se verificó el parche fuente ni se ejecutó un exploit**; no se afirma corrección funcional independiente. Las recomendaciones históricas de Vitest 5 no se aplicaron. Tinypool vulnerable dejó de estar en el lockfile como resultado de la instalación real.

## Archivos modificados/preparados

- package.json, package-lock.json, tests/game/dependency-version.test.ts, README.md.
- tests/e2e/dependencies-report.md (este informe).
- tests/e2e/dependencies-d1-red.log, dependencies-d1-green.log, dependencies-environment.log, dependencies-install.log, dependencies-ci.log, dependencies-tree.log, dependencies-test.log, dependencies-build.log, dependencies-chromium.log.
- tests/e2e/dependencies-audit.json, dependencies-npm11.json, dependencies-lock-changes.json, dependencies-advisory-contrast.json.
- tests/e2e/dependencies-e2e-dev.log, dependencies-e2e-dev.exit, dependencies-e2e-preview.log, dependencies-e2e-preview.exit.
- tests/e2e/dependencies-captures/base-1280.png, base-1600.png, launch.png, success.png.

Las rutas abreviadas en la lista están dentro de tests/e2e/. No se cambiaron reglas, fuentes de juego, assets, scripts, contratos, configuración ni pruebas e2e existentes. README corrige el desfase histórico de versiones y documenta instalación y seguridad reales, manteniendo instrucciones HTTP y controles del juego.

## Pendientes para el Manager

No hay bloqueante técnico detectado para D1–D4. Sigue pendiente la verificación independiente del Probador: estos resultados del Constructor no la sustituyen. Persisten revisión visual humana A2/A4 y aspectos J2/J6 (estética, legibilidad, animaciones) y medición humana de la meta 10–15 minutos; el tiempo de la suite no valida esa meta. No hay herramienta de inspección visual en esta ejecución. La persistencia previa de assets ya quedó comprobada según vitest-3.2.7-report.md; estaban presentes en esta sesión. No se afirma todavía una reconstrucción desde un nuevo commit en segunda sesión ni aprobación de entrega. La confirmación se solicita solo mediante la herramienta autorizada de Core en foundry/issue-6.

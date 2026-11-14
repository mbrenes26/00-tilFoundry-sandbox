# Desviación autorizada: Vitest 3.2.7 — informe al Manager

## Cambio acotado

Consultados spec-solucion, escalamiento y tests/e2e/correction-report.md. Se aplica la decisión humana del 12/11/2026 13:22:24 UTC: únicamente Vitest directo pasa de 3.0.5 a 3.2.7 exacto. Sin cambio de contrato, cerebro, Foundry ni configuración del repositorio. Vite 6.1.0, @playwright/test 1.51.1, TypeScript 5.7.3 y Phaser 3.90.0 siguen iguales. No se usó npm audit fix. Lockfile regenerado con npm install real y comprobado mediante npm ci, Node v22.23.5 / npm 10.9.9.

## TDD J1: versión y lockfile

Test: tests/game/dependency-version.test.ts, «J1 desviación autorizada: Vitest exacto 3.2.7 y lockfile coherente sin cambiar otras versiones directas» (líneas 4–29).

- Rojo: `npm ci && npm test -- --run tests/game/dependency-version.test.ts`, salida 1. Instaló 52 paquetes; Vitest ejecutado 3.0.5; 1 test fallido: expected vitest 3.2.7, received 3.0.5.
- Implementación mínima: versión exacta en package.json y `npm install` para regenerar package-lock.json.
- Verde: `npm install && npm ci && npm test -- --run tests/game/dependency-version.test.ts`, salida 0. Instalación limpia de 57 paquetes; Vitest ejecutado 3.2.7; 1 test pasado. Valida también raíz del lockfile, cinco versiones directas, @vitest/mocker 3.2.7 y versiones/resolved/integrity de todos los paquetes Vitest del lockfile.
- `npm ls --all` y comprobación posterior `npm ls --depth=0`: salida 0. Directas exactas preservadas. Transitivas @vitest/expect, mocker, pretty-format, runner, snapshot, spy y utils son 3.2.7; vite-node 3.2.4; tinypool 1.1.1; esbuild 0.24.2. npm ls señala dependencias opcionales no instaladas para otras plataformas y peers opcionales; no se instalaron ni modificaron directas para silenciar esos avisos.

## Regresiones y PNG

La sesión comenzó sin PNG: `ls public/assets` y listado de la rama mostraron solamente manifest.json. `git status --short` falló con «not a git repository»; no se creó Git ni se rodeó Core.

- `npm test` sobre esa copia: salida 1, 34 pasados/1 fallido, ENOENT public/assets/base-rooms.png. Es un bloqueo de assets existente, no el rojo del cambio de versión. `npm run build`: salida 0 incluso sin PNG; esto no demuestra carga completa de assets.
- Se ejecutó el generador ya aprobado y persistido, sin modificarlo: `npm run assets && npm test && npm run build`, salida 0; nueve PNG originales, 35 tests pasados en cuatro archivos, TypeScript y Vite 6.1.0 correctos. Esta generación en sesión NO sustituye el requisito de PNG guardados en el repositorio.
- Aviso de build persistente: chunk JavaScript 1.507,57 kB, gzip 350,33 kB, mayor a 500 kB. No se ocultó ni cambió configuración para silenciarlo.
- Primer `PREVIEW=1 npm run test:e2e`: salida 1, los 14 casos fallaron antes de abrir navegador porque faltaba el ejecutable Chromium; NO son regresiones funcionales ejecutadas. Log conservado en vitest-3.2.7-e2e-missing-browser.log.
- `npx --no-install playwright install chromium`: salida 0, Chromium 134.0.6998.35 build v1161, headless shell y FFMPEG instalados en la sesión. No cambia versiones directas ni lockfile.
- Segundo `PREVIEW=1 npm run test:e2e`: salida 0, **14 pruebas pasadas (3,8 minutos)** contra build servido por preview. Log completo vitest-3.2.7-e2e.log y código 0 en vitest-3.2.7-e2e.exit. Ejecutados realmente: nueve salas/FIT/texturas y sprites activos a dos tamaños, progreso exclusivo/lectura, ganadora 712 y reinicio, fallos por ángulo/bomba/antena/clima/múltiples y combustible, omisión de verificaciones con fallo y éxito, pérdida de ventana, límites de todos los controles a 1280×720, invalidación/revalidación del aviso y lanzamientos inclusivos 10:00/11:00. afterEach comprueba pageerror y respuestas HTTP >=400 sin errores en estos caminos.
- Capturas automáticas copiadas a tests/e2e/captures/: base-1280.png (149.691 bytes), base-1600.png (198.353), launch.png (166.680), success.png (58.954). No se han inspeccionado visualmente.
- Nueve PNG de public/assets en sesión: base-rooms (3.558 bytes), rocket (326), tower (442), terrain (1.678), technician (251), astronaut (238), smoke (520), flame (263), resource-icons (207). Tamaños y SHA-256 registrados por comando Core. Se presentan a confirmar_cambios, única herramienta de persistencia disponible; la persistencia se comprobará leyendo después la rama. Si Core no admite binarios se mantiene el bloqueo; no se recurrirá a codificaciones alternativas ni generación manual como entrega.

## Seguridad: el objetivo GHSA-82fw NO está verificado como corregido

`npm audit --json` produjo salida 1. Informe íntegro nuevo: tests/e2e/vitest-3.2.7-audit.json, sin borrar el audit anterior. Sigue reportando siete dependencias afectadas: dos moderadas, tres altas, dos críticas.

Comprobación específica con JSON del audit y package.json de node_modules:

- vitest instalado **3.2.7**: GHSA-82fw-gwwq-j7x9 sigue en via, source 1193683, rango individual `>=2.1.0 <4.1.11`; rango agregado `0.0.95 - 4.1.10`.
- @vitest/mocker instalado **3.2.7**: mismo GHSA sigue en via, source 1193684, rango individual `>=2.1.0 <4.1.11`; rango agregado `<=4.1.11`.
- Ambos ofrecen fixAvailable vitest **5.1.0**, isSemVerMajor true. Esta recomendación agregada no prueba cuál es el primer parche del aviso específico; no se interpreta como autorización para abandonar Vitest 3. Los rangos actuales incluyen 3.2.7. No se realizó exploit ni comprobación del parche fuente: se informa que el audit continúa, no se afirma corrección ni se elige otra versión.

Avisos residuales: mocker GHSA-qxg6-89mg-rqv8; tinypool 1.1.1 GHSA-5gmw-xhrv-c9v3 y GHSA-85c8-ppgw-ccpr críticos; esbuild GHSA-67mh-4wv8-2f99; playwright GHSA-7mvr-c777-76hp (certificados al descargar navegadores), propagado a @playwright/test; múltiples avisos Vite, detallados en JSON. npm propone Vite 6.4.6 y Playwright 1.65.0, pero no se actualizaron. El resultado de descarga no demuestra autenticidad de certificados ni elimina el aviso de Playwright. Loopback continúa configurado; no es un parche de seguridad.

## Pendientes y entrega al Manager

Mantener pendientes A2/A4 y revisión visual de J2/J6: las herramientas disponibles no permiten inspeccionar imágenes ni juzgar estética/legibilidad/animación como una persona. Meta de 10–15 minutos de partida humana sigue sin medir; los 3,8 minutos de suite automatizada no validan esa duración.

La actualización autorizada es compatible con tests y build de sesión, pero no resuelve los avisos reportados ni garantiza persistencia de PNG. No se abrió PR ni se pidió transición. Se debe documentar «Desviación de la spec» en el futuro PR conforme al registro escalamiento.

Archivos de texto preparados: package.json, package-lock.json, tests/game/dependency-version.test.ts, tests/e2e/vitest-3.2.7-audit.json, tests/e2e/vitest-3.2.7-e2e-missing-browser.log, tests/e2e/vitest-3.2.7-e2e.log, tests/e2e/vitest-3.2.7-e2e.exit y este informe. PNG presentados para persistir: nueve public/assets/*.png y cuatro tests/e2e/captures/*.png; resultado de Core pendiente de comprobar.

## Resultado de persistencia comprobado después de confirmar

Core confirmó **a2bdccc** en foundry/issue-6 con 21 archivos: los ocho archivos de texto arriba indicados y los trece PNG. Después del commit, listar_archivos(public/assets/) devuelve las nueve rutas PNG más el manifiesto; listar_archivos(tests/e2e/captures/) devuelve las cuatro capturas. leer_archivo(public/assets/rocket.png) devuelve «archivo binario de 326 bytes», no «No existe». leer_archivo(package.json) confirma Vitest 3.2.7 y las demás directas preservadas. Por tanto, **el impedimento previo de persistencia de PNG no se reprodujo y queda resuelto en la rama mediante la herramienta autorizada**, sin cambiar Foundry ni sustituir el contrato por generación manual.

No se afirma inspección visual: leer_archivo solo informa la presencia/tamaño del binario, no permite verlo. Tampoco se afirma un nuevo npm ci/test/build desde una segunda sesión limpia reconstruida del commit; se ejecutaron en esta sesión, y se comprobó posteriormente la presencia en rama. Persisten los avisos de seguridad (incluido GHSA-82fw en ambos paquetes), revisión visual y medición humana de duración. Este apartado sustituye los estados «persistencia pendiente» anteriores, que describían el momento previo al commit. Este informe se confirma aparte para dejar registrada la comprobación posterior.

# Vitest 4.1.12: construcción detenida por fallo de instalación

## Resultado para el Manager

No se pudo instalar Vitest 4.1.12 mediante npm 10.9.9 en Node v22.23.5. Se detiene la actualización sin elegir otra versión, sin Vitest 5, sin cambiar dependencias adicionales ni configuraciones. No se atribuye el fallo a incompatibilidad demostrada de Vitest: es una excepción interna del resolvedor de npm que impide verificar la compatibilidad real. Hace falta decidir cómo resolver ese impedimento antes de continuar; no se solicita transición ni se abre PR.

Consultados spec-solucion (adenda), discovery, escalamiento, conversación, tests/e2e/vitest-3.2.7-report.md y correction-report.md. Se respeta C-6 vigente; no se reconstruyen criterios del documento base ausente.

## Disponibilidad y TDD J1 de la adenda

- `node --version; npm --version`: v22.23.5 y 10.9.9.
- `npm view vitest@4.1.12 version engines peerDependencies dependencies --json`: salida 0. Versión disponible 4.1.12; engines `^20.0.0 || ^22.0.0 || >=24.0.0`, peer Vite `^6.0.0 || ^7.0.0 || ^8.0.0`. Node 22 y Vite 6.1.0 están dentro de los rangos declarados. Metadatos conservados en vitest-4.1.12-registry.json. No equivale a instalación comprobada.
- Se actualizó temporalmente tests/game/dependency-version.test.ts, líneas 4–30: directas exactas, raíz y paquetes del lockfile, siete transitivas @vitest y sus referencias desde vitest, resolved/integrity y ausencia de Vitest 5. Copia de ese test en vitest-4.1.12-proposed-test.txt como evidencia, no como prueba activa.
- **Rojo real**: `npm ci && npm test -- --run tests/game/dependency-version.test.ts`, salida 1. npm ci instaló 57 paquetes; runner 3.2.7; 1 test fallido, expected vitest 4.1.12, received 3.2.7 en línea 9.
- Cambio mínimo intentado: package.json solo Vitest 3.2.7 a 4.1.12 exacto.
- `npm install && npm ci && npm test -- --run tests/game/dependency-version.test.ts && npm ls --depth=0 && npm test && npm run build`: salida 1 en el primer npm install, `Cannot read properties of null (reading 'edgesOut')`. No se ejecutaron los comandos posteriores. Log en vitest-4.1.12-install.log.
- Diagnóstico: stack de @npmcli/arborist/build-ideal-tree.js, #loadPeerSet; el resolvedor consulta peers opcionales/devtools y metadatos Vitest 5.1.0. Esto NO demuestra instalación de Vitest 5; no se autorizó ni se instaló esa versión.
- Reintento ordinario desde node_modules limpio, conservando lockfile: `rm -rf node_modules && npm install`, salida 1, mismo error interno. Log en vitest-4.1.12-clean-install.log. No se usaron legacy-peer-deps, force, overrides, npm audit fix, otra versión de npm ni otras dependencias para eludirlo.
- **Verde de 4.1.12: no obtenido**. Lockfile no regenerado; no hay validación integral npm test/build/Chromium de 4.1.12. Se detuvo antes de afirmar resultados no ejecutados.

## Restauración, alcance y arte

Se restauraron exactamente package.json y el test activo originales leídos de la rama, para no persistir una dependencia y lockfile incoherentes ni una suite rota. No se cambió README (no sería cierto documentar 4.1.12 como instalada); su versión 3.0.5 documentada sigue siendo un desfase conocido pendiente de la actualización. No se cambiaron reglas, balance, API, escenas, pruebas de navegador, configuración o generador.

`npm ci && npm test -- --run tests/game/dependency-version.test.ts` después de restaurar: salida 0, 57 paquetes, 1 test pasado con Vitest 3.2.7. Es restauración del baseline, NO verde de la adenda. Consulta del lockfile confirma Vitest y siete @vitest 3.2.7, sin Vitest 5; Vite 6.1.0, TypeScript 5.7.3, Playwright 1.51.1 y Phaser 3.90.0 conservados.

Los nueve PNG ya persistidos estaban presentes en la sesión (`ls -l public/assets/*.png`, salida 0). No se regeneraron ni modificaron. No se hicieron nuevas capturas ni verificaciones HTTP, de límites o animaciones en esta ejecución: no son evidencia de 4.1.12 las pruebas de sesiones anteriores. Persisten revisión visual humana (no hay herramienta para inspección de imágenes) y medición humana de la meta 10–15 minutos.

## Seguridad: baseline únicamente

`npm audit --json > tests/e2e/vitest-4.1.12-blocked-baseline-audit.json` produjo salida 1. Se etiquetó explícitamente como audit del lockfile **3.2.7**, no de 4.1.12. Resultado: siete dependencias afectadas, dos moderadas, tres altas, dos críticas.

Contraste con rangos individuales del audit actual:

- GHSA-82fw-gwwq-j7x9 para vitest y @vitest/mocker: `>=2.1.0 <4.1.11`. 3.2.7 está incluido; 4.1.12 está fuera.
- GHSA-qxg6-89mg-rqv8 para @vitest/mocker: `>=2.1.0-beta.7 <4.1.12`. 3.2.7 está incluido; 4.1.12 está fuera.
- La comparación respalda el umbral declarado de los avisos, pero no demuestra parche instalado, corrección funcional ni audit limpio de la versión objetivo.

Residuales presentes en baseline: tinypool 1.1.1 (GHSA-5gmw-xhrv-c9v3 `<=2.1.0`, GHSA-85c8-ppgw-ccpr `<2.1.2`, críticos); esbuild 0.24.2 (GHSA-67mh-4wv8-2f99 `<=0.24.2`); playwright 1.51.1 (GHSA-7mvr-c777-76hp `<1.55.1`, propagado a @playwright/test); Vite 6.1.0 (múltiples rangos en JSON, rango agregado `<=6.4.3`, severidad alta). npm ofrece Vite 6.4.6 y Playwright 1.65.0; no se aplican. No se extrapolan estos resultados al árbol objetivo, que no se pudo instalar. Resolver avisos adicionales requiere decisión humana sobre ampliación del alcance, no actualización automática. Loopback no corrige vulnerabilidades.

## Archivos preparados para persistencia

Solo evidencia nueva en tests/e2e/: vitest-4.1.12-blocked-report.md, vitest-4.1.12-proposed-test.txt, vitest-4.1.12-registry.json, vitest-4.1.12-install.log, vitest-4.1.12-clean-install.log, vitest-4.1.12-blocked-baseline-audit.json. Package y test activo restaurados, lockfile sin regenerar. Commit lo devuelve Core al confirmar.

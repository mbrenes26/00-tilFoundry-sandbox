# Verificación independiente de D1–D4, issue-6 (Probador)

## Resultado

**Sin bloqueo técnico reproducido** en la revisión de dependencias. En esta segunda sesión aislada, sobre los archivos recibidos tras `f084be5`, ejecuté personalmente instalación, pruebas, build, auditoría y ambas suites Chromium; no reutilicé como resultado los logs del Constructor. No se modificó implementación ni se redujeron pruebas. Este informe no equivale a aprobación de entrega ni a inspección visual humana.

## D1 y evidencia roja

- `node -v` = `v22.23.5`; `npm -v` = `10.9.9`. `package.json` fija `phaser 3.90.0`, `vite 6.4.6`, `vitest 4.1.12`, `typescript 5.7.3`, `@playwright/test 1.65.0`, exactamente cinco directas, sin rangos, `overrides`, `optionalDependencies` ni `peerDependencies` directas. `package-lock.json` v3 alinea la raíz y las cinco entradas instaladas. Los siete paquetes `@vitest` comprobados en `tests/game/dependency-version.test.ts` están en 4.1.12; no se encontró Vitest 5. El test conserva los controles de versiones, raíz del lockfile, siete transitivas e integridades anteriores y añade ausencia de otras directas/overrides: comparar con `tests/e2e/vitest-4.1.12-proposed-test.txt`.
- Existe rojo registrado por Core antes de la actualización: `tests/e2e/dependencies-d1-red.log` muestra runner Vitest 3.2.7, un test fallido y valores recibidos 6.1.0/3.2.7/1.51.1 frente a 6.4.6/4.1.12/1.65.0. La cronología del paso del Constructor en la conversación ubica la escritura de la prueba antes de package.json e instalación. No repetí el rojo contra la rama anterior porque esta sesión no trae `.git`; no lo atribuyo a mi propia ejecución.
- Instalación real documentada con `npx npm@11 install` y npm 11.21.2 (engines `^20.17.0 || >=22.9.0`): `tests/e2e/dependencies-install.log` y `dependencies-npm11.json`. No volví a regenerar el lockfile: lo comprobé mediante instalación limpia desde el archivo confirmado.

## D2: instalación y resistencia de la coherencia

- `npm ci` con Node 22.23.5 y npm 10.9.9, **salida 0**: `added 48 packages, and audited 49 packages in 5s`, `found 0 vulnerabilities`. `npm ls --all`, **salida 0**, muestra transitivas e incluye peers opcionales ausentes de plataformas no utilizadas; no se añadieron directas. Este `npm ci` borra y reinstala `node_modules` a partir del lockfile de esta segunda sesión.
- Prueba negativa, solamente en directorio temporal: alteré `package.json` para pedir Vite 6.4.5, conservando el lockfile 6.4.6; `npm ci` devolvió **salida 1**, `EUSAGE`, `Invalid: lock file's vite@6.4.6 does not satisfy vite@6.4.5`. Los archivos originales quedaron intactos; confirma que el control de sincronía de npm ci no se evade.

## D3: todas las comprobaciones reproducidas

| Comando | Código | Resultado observado |
| --- | ---: | --- |
| `npm test` | 0 | Vitest 4.1.12: 4 archivos/35 pruebas, 26 reglas, 2 assets, 6 juego, 1 dependencias. |
| `npm run build` | 0 | `tsc --noEmit && vite build`, Vite 6.4.6, 11 módulos; aviso de chunk JS >500 kB (1.511,05 kB), no error. |
| `npm run test:e2e` | 0 | Chromium real 158.0.8127.18; 14/14 pasadas, 3,4 min, servidor dev HTTP. |
| `PREVIEW=1 npm run test:e2e` | 0 | 14/14 pasadas, 3,3 min, build servido por preview HTTP. |

`playwright.config.ts` mantiene un worker y servidor en `http://127.0.0.1:4173`, sin filtro ni `skip`; `tests/e2e/game.spec.ts` conserva 14 caminos incluidos nueve salas, 1600×900 y 1280×720, controles visibles/no recortados, animaciones Phaser, lanzamiento/resultado, fallo por cada riesgo y ventanas 10:00 y 11:00. Sus `beforeEach/afterEach` observan errores de página y respuestas HTTP >=400; las 28 ejecuciones pasaron sin esas fallas. Se ejecutaron assets/tests contra los PNG recibidos; los nueve `public/assets/*.png` siguen presentes con tamaños previos (238, 3558, 263, 207, 326, 520, 251, 1678 y 442 bytes, en orden alfabético), al igual que las cuatro capturas previas y cuatro capturas nuevas en `tests/e2e/dependencies-captures/`. Sus hashes fueron registrados por Core en el comando de esta sesión. El mero hecho de estar y de pasar los tests no acredita belleza ni legibilidad visual.

## D4: auditoría, avisos y límite

- Después de `npm ci`, `npm audit --json > /tmp/issue6-probador-audit.json` **salida 0**, sin `--omit` ni `--production`: metadata `{info:0,low:0,moderate:0,high:0,critical:0,total:0}`, `vulnerabilities` vacío y sin error JSON. La salida completa de la ejecución independiente fue registrada por Core (el JSON temporal no se agrega al repositorio; el Constructor ya dejó `tests/e2e/dependencies-audit.json`).
- Del JSON anterior `tests/e2e/vitest-4.1.12-blocked-baseline-audit.json`: GHSA-82fw-gwwq-j7x9 afectaba Vitest y @vitest/mocker en `>=2.1.0 <4.1.11`; GHSA-qxg6-89mg-rqv8 afectaba @vitest/mocker en `>=2.1.0-beta.7 <4.1.12`. Antes se instalaba 3.2.7; ahora `package-lock.json`/`node_modules` instalan 4.1.12 fuera de ambos rangos y audit no los informa. **No probé el parche fuente ni reproduje los exploits; desaparición de audit no prueba la corrección del parche ni ausencia universal de fallos.**

## Alcance y pendientes

Las rutas de la revisión declaradas en `tests/e2e/dependencies-report.md` (`package.json`, `package-lock.json`, `tests/game/dependency-version.test.ts`, `README.md`, y evidencias nuevas en `tests/e2e/`) pertenecen al `Alcance:` aprobado. La sesión no contiene `.git` ni hay PR: no pude generar un diff contra `f084be5` o la revisión inmediatamente anterior y **no puedo certificar exhaustivamente que no se modificaron otras rutas**, aunque las reglas, arte y fuentes de juego estaban presentes, sus pruebas pasaron y no encontré evidencia de cambios en ellos. La comparación del inventario de cambios con un diff de Git está pendiente del Manager/Core antes de entrega.

No hay bloqueo técnico reproducido en D1–D4. Quedan pendientes la inspección humana de estética, capturas, animaciones y legibilidad (A2/A4, J2/J6), y medir con personas la meta de partida de 10–15 minutos. Los 3,3–3,4 minutos de pruebas automáticas no son esa medida. No afirmo inspección de imágenes ni aprobación humana.

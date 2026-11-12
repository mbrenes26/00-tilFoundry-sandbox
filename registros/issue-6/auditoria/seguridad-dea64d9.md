---
id: "issue-6/auditoria/seguridad-dea64d9"
tipo: "informe-auditoria"
titulo: "Auditoría de seguridad sobre dea64d9: aprobado"
version: 1
estado: "aprobado"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:seguridad", "commit": "dea64d9c1a95dbb7af735fb9e60c6946fb062891", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 235519, "tokens_salida": 3769, "monto_ia": 0.863556, "minutos_computo": 2.452, "monto_computo": 0.004414}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "dea64d9c1a95dbb7af735fb9e60c6946fb062891"}
---
# Informe de auditoría de seguridad — issue-6

## Identificación y veredicto
- PR: #7. Commit vigente proporcionado por Core: dea64d9c1a95dbb7af735fb9e60c6946fb062891.
- Especialidad: seguridad.
- Resultado: aprobado, sin bloqueantes de seguridad detectados.
- Este veredicto no aprueba la entrega ni modifica el riesgo efectivo high o la consolidación pendiente calculados por Core.

## Criterio y alcance revisado
Consulté discovery, spec-solucion (adenda D1–D4), cerebro C-2/C-3/C-4/C-5/C-7, conversación disponible, diff y archivos de la solución. Revisé fuentes de reglas y juego, configuración y scripts, dependencias/lockfile, generador de gráficos y evidencias de la actualización. No hay cambios en .github/ o archivos de Foundry en las rutas suministradas; Core indica que no hay archivos fuera del alcance.

La revisión corresponde al juego local sin backend, cuentas, guardado ni publicación. No se exige autenticación para este modelo. No se identificó una entrada remota del jugador, tratamiento de datos personales o ampliación de superficie de ataque ajena a este alcance.

## Hallazgos bloqueantes
Ninguno detectado.

## Comprobaciones y evidencia real
1. **Dependencias y D4.** Ejecuté `npm ci && npm audit --json` en la sesión aislada con Node v22.23.5 y npm 10.9.9. Código 0: instalación de 48 paquetes; auditoría con `vulnerabilities: {}` e info, low, moderate, high, critical y total iguales a 0, incluyendo desarrollo. No usé exclusiones, overrides ni correcciones forzadas. `package.json:3-5` mantiene los scripts locales y las cinco versiones exactas aprobadas. Comprobación adicional del lockfile: todas las entradas de paquetes tienen resolved en https://registry.npmjs.org/ e integrity sha512; sin excepciones. Esto no garantiza ausencia de vulnerabilidades desconocidas.
2. **Avisos previos.** Leí la auditoría histórica `tests/e2e/vitest-4.1.12-blocked-baseline-audit.json` y contrasté las versiones realmente instaladas: vitest y @vitest/mocker 4.1.12, Vite 6.4.6 y @playwright/test 1.65.0. Los rangos históricos de GHSA-82fw-gwwq-j7x9 (`>=2.1.0 <4.1.11`) y GHSA-qxg6-89mg-rqv8 (`>=2.1.0-beta.7 <4.1.12`) no incluyen 4.1.12. La nueva auditoría no los informa. No comprobé el parche fuente ni ejecuté sus exploits; no afirmo una validación funcional independiente del parche.
3. **Secretos.** Revisión del contenido disponible y búsqueda automatizada de claves privadas, formatos habituales de tokens y asignaciones de credenciales sobre 58 archivos de texto de la sesión, excluyendo dependencias y build: cero coincidencias. No detecté credenciales en fuentes, configuración o logs revisados. Es una búsqueda acotada, no una garantía universal de detección.
4. **Inyección y entradas.** En `src/game/scenes.ts:79` y `:147` se utiliza innerHTML. Seguí sus fuentes: textos constantes del juego, valores numéricos de reglas y selecciones locales; no encontré datos de URL, mensajes entre ventanas, almacenamiento, formularios de texto libre ni respuestas remotas entrando a esas plantillas. La función `text` en línea 11 escapa los textos donde se aplica. No hay explotación remota identificada. Las acciones validan ángulo entero 45–90, esperas permitidas, recursos y precondiciones en `src/rules/index.ts`, funciones previewAction/applyAction. `Session.ts` vuelve a validar al completar y confirmar lanzamiento. No se detectan SQL, ejecución de comandos con entrada del jugador ni evaluación dinámica en el código de aplicación.
5. **Red y configuración.** `package.json:3` limita dev y preview a 127.0.0.1; `vite.config.ts:1` no relaja CORS, hosts o acceso al sistema de archivos. `playwright.config.ts:2` usa HTTP loopback. Arranqué preview con puerto 4187: anunció `http://127.0.0.1:4187/`; una petición con Origin externo no recibió Access-Control-Allow-Origin. Los gráficos se cargan desde la ruta local de assets (`src/game/scenes.ts:6,13-16`); el generador escribe nombres y rutas fijos y no descarga material externo.
6. **Pruebas auxiliares.** `npm test && npm run build`, código 0: 35 pruebas en 4 archivos y build con Vite 6.4.6. Permanece el aviso de tamaño de chunk superior a 500 kB, sin implicación de seguridad demostrada.

## Sugerencias no bloqueantes
- `src/game/scenes.ts:79,147`: centralizar el escape de todas las interpolaciones o usar textContent para los valores dinámicos reduciría el riesgo de introducir XSS al añadir en un pedido futuro datos externos o texto libre. Actualmente no identifiqué esa fuente no confiable; no es motivo para bloquear esta entrega.

## Límites y pendientes de verificación
- La adenda incorpora una spec base que no está disponible íntegra mediante las lecturas realizadas; `contrato` y `spec` no existen como registros separados. No reconstruí ni di por verificados criterios ausentes. La plantilla `plantillas/informe-auditoria.md` tampoco está disponible; utilizo secciones de identificación, hallazgos, evidencia y límites.
- La conversación y el diff suministrados están recortados; complementé con archivos individuales y búsqueda sobre los textos de la sesión. No recibí estado de checks alojados del PR y no afirmo que estén verdes. Los resultados anteriores son comandos propios registrados por Core, no checks de GitHub.
- La sesión no contiene .git: los intentos de rev-parse/status/diff fallaron. El vínculo con el commit se toma del contexto de Core, no de una comprobación local de Git.
- Intenté una comprobación adicional de navegación/red con Playwright. El servidor y la consulta CORS funcionaron, pero el comando terminó con código 1 porque falta Chromium Headless Shell v1254 en esta sesión. Por tanto, no afirmo navegación, inventario de solicitudes ni inspección de almacenamiento en navegador en esta ejecución. No reinstalé Chromium ni repetí la suite e2e; esta limitación no demuestra una vulnerabilidad.

No modifiqué archivos fuente ni solicité transiciones. El Manager debe conservar separados este veredicto de seguridad y las restricciones vigentes de consolidación de Core.
---
id: "issue-6/spec-solucion"
tipo: "spec-solucion"
titulo: "Spec revisada: Vite 6.4.6, Playwright 1.65.0 y resolución temporal con npm 11"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "7954760bff02f68deca69fc8d37c089194975a7d", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 27343, "tokens_salida": 2276, "monto_ia": 0.062787, "minutos_computo": 0, "monto_computo": 0.0}
---
# Solución: issue-6 — Revisión de dependencias y método de instalación

## Documento base
Esta adenda revisa la spec aprobada «Nivel 1 Despegue, preparación y fallos deterministas» y su revisión aprobada de Vitest 4.1.12. Ambos documentos se incorporan íntegramente salvo las sustituciones explícitas de esta adenda. Se conservan las reglas, tablas de balance, secuencias de referencia, contratos API reglas v1 y Assets v1, consolidación, criterios R1–R5, A1–A4 y J1–J7, exclusiones y requisitos de evidencia. No se sustituye la spec del juego por un resumen. Esta revisión no autoriza la entrega.

## Cerebro consultado
Consultadas C-2, C-3, C-4, C-5 y C-6 vigentes proporcionadas por Core. C-6 fija TypeScript 5, Phaser 3, Vite 6, Vitest 4 exacto 4.1.12 y Playwright 1 con Chromium. Se mantienen todas las versiones principales y las decisiones C-2 a C-5. Se propone reemplazar únicamente C-6 para añadir las versiones exactas solicitadas de Vite y Playwright.

## Decisiones para el cerebro
- Reemplaza a C-6: Juego web sin backend en TypeScript 5, con Phaser 3 para dibujo y entrada, Vite 6 (versión exacta 6.4.6 en package.json) para desarrollo y generación estática, Vitest 4 (versión exacta 4.1.12 en package.json) para pruebas de reglas y Playwright 1 (versión exacta 1.65.0 de @playwright/test en package.json) con Chromium para pruebas de navegador.

## Cambios respecto de la spec aprobada
- Vite pasa de 6.1.0 a 6.4.6 exacto y @playwright/test de 1.51.1 a 1.65.0 exacto, según la solicitud de la persona del 12 de noviembre. Vitest permanece en 4.1.12 exacto, como ya está aprobado. No cambian Phaser 3.90.0 ni TypeScript 5.7.3. Vitest 5 y los cambios de versión principal quedan excluidos.
- Se permite resolver e instalar mediante `npx npm@11 install` únicamente en la sesión aislada de pruebas, para diagnosticar el fallo `Cannot read properties of null (reading 'edgesOut')` reproducido con npm 10.9.9. No se instala npm globalmente ni se cambia la configuración del repositorio o del equipo de la persona. Se registra la versión exacta de npm 11 utilizada y su compatibilidad con la versión real de Node.js 22 de la sesión.
- El package-lock.json se regenera mediante instalación real. Debe permitir después una instalación limpia con `npm ci` usando el npm incluido con Node.js 22, no npm 11 invocado por npx. Se registra qué versiones de Node y npm se usaron en cada fase.
- Se incorpora como criterio de esta revisión que `npm audit --json` termine con código 0 y cero vulnerabilidades en todas las severidades, incluyendo dependencias de desarrollo, sobre el árbol final instalado desde el lockfile. No basta auditar solo producción ni omitir dependencias. Es un resultado exigido, todavía no verificado, y no garantiza ausencia universal de vulnerabilidades.
- Se permiten solamente las adaptaciones de configuración y pruebas necesarias para compatibilidad dentro del alcance existente, sin eliminar ni reducir comprobaciones. No se agregan dependencias directas, overrides ni exclusiones de auditoría para forzar el resultado. Los cambios transitivos resultantes de la instalación real se documentan.
- No cambian alcance, comportamiento del juego, balance, recursos gráficos, contratos, criterios previos ni presupuesto aprobado. La construcción sigue en foundry/issue-6 después de la aprobación registrada.

## Sustitución de Responsabilidad e infraestructura de la línea juego
El párrafo de versiones queda así:

«Integrar reglas y assets en un juego completo. Versiones exactas para package.json sin rangos: phaser 3.90.0, vite 6.4.6, vitest 4.1.12, typescript 5.7.3, @playwright/test 1.65.0. Node.js 22. Generar package-lock.json mediante instalación real; se permite `npx npm@11 install` solo en la sesión aislada, y el lockfile resultante debe pasar una instalación limpia mediante npm ci con el npm incluido con Node.js 22. Verificar disponibilidad y compatibilidad tras aprobar esta revisión. Si una versión no está disponible o no es compatible, detenerse sin sustituirla silenciosamente.»

Los scripts, escenas, interacción y demás requisitos de infraestructura del documento base permanecen intactos. npm test sigue ejecutando Vitest y npm run test:e2e sigue usando Playwright con Chromium.

# Línea: reglas
Alcance: `src/rules/`, `tests/rules/`

Responsabilidad, API reglas v1, criterios R1–R5, secuencias de referencia y verificación: se incorporan íntegramente del documento base sin cambios. Las pruebas se ejecutan con la infraestructura revisada y se conservan todas sus comprobaciones.

# Línea: graficos
Alcance: `public/assets/`, `docs/assets.md`, `scripts/assets/`, `tests/assets/`

Responsabilidad, contrato Assets v1, criterios A1–A4 y verificación: se incorporan íntegramente del documento base sin cambios. Esta revisión no solicita modificar recursos gráficos.

# Línea: juego
Alcance: `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `src/main.ts`, `src/game/`, `src/styles/`, `tests/game/`, `tests/e2e/`, `README.md`

Responsabilidad, pantalla e interacción, criterios J1–J7 y verificación: se incorporan íntegramente del documento base, con la sustitución de infraestructura descrita arriba. Solo se adaptan configuración o pruebas si es necesario para compatibilidad; no se amplía funcionalidad ni se alteran contratos.

### Criterios adicionales de esta revisión
- D1: package.json fija las cinco versiones exactas indicadas; el lockfile coincide con las dependencias directas y se genera mediante instalación real. No hay Vitest 5 ni nuevas dependencias directas. Una prueba automatizada comprueba estas condiciones, con evidencia roja antes de actualizar y verde después.
- D2: la resolución temporal con npm 11, si se usa, queda documentada con versión real, comando y resultado. Una instalación limpia del lockfile final pasa npm ci con el npm incluido con Node.js 22, registrando ambas versiones y salida real.
- D3: pasan npm test, npm run build y npm run test:e2e con Chromium compatible con @playwright/test 1.65.0, sin omitir ni debilitar pruebas. Se conservan las comprobaciones HTTP, visuales y funcionales de J1–J7 y la verificación independiente de la spec aprobada.
- D4: tras npm ci, npm audit --json devuelve código 0 y metadata.vulnerabilities total 0, con cero en cada severidad. Se conserva la salida real y se contrasta con la evidencia disponible la corrección de GHSA-82fw-gwwq-j7x9 y GHSA-qxg6-89mg-rqv8; si no se pueden verificar esas afirmaciones se informa y no se afirma su corrección.

## Contrato entre líneas y exclusiones
Se incorporan íntegramente API reglas v1, Assets v1 y Consolidación. Ninguna línea modifica archivos de otra. No se autoriza tocar .github/, Foundry, configuración del repositorio, publicación, hosting, balance ni comportamiento del juego. La autorización de npm 11 no cambia el método normal de ejecución local ni instala herramientas en el equipo de la persona.

## Condiciones para detenerse
Si npm 11 no puede usarse con Node.js 22, la instalación sigue fallando, una versión solicitada no existe o no es compatible, npm ci no acepta el lockfile, no pasan las pruebas o persisten hallazgos de auditoría que requieren otros cambios, se informa a la persona y se solicita su decisión. No se cambian versiones adicionales, alcance, presupuesto ni criterios de forma silenciosa; no se usa npm audit fix --force para ampliar la actualización.

## Evidencia y aprobación
Se leyeron discovery, spec guardada, conversación y decisiones vigentes. La evidencia previa registrada por Core muestra el fallo de resolución y la restauración de Vitest 3.2.7; no acredita la actualización aprobada. En esta ejecución no se modificó código, no se instalaron dependencias y no se ejecutaron pruebas o auditorías. La disponibilidad de las nuevas versiones, compatibilidad y objetivo de cero hallazgos siguen sin verificar. Riesgo declarado por Core: medium; esta revisión no incorpora publicación ni cambios de producción.

Se solicita SPECIFIED con rol manager-producto para que la persona apruebe exclusivamente los cambios descritos respecto de la spec aprobada. Su petición de continuar no sustituye esa aprobación. Solo después de que Core registre la aprobación continuará la construcción en la misma rama. La aprobación de esta revisión no aprueba la entrega ni declara satisfactorios resultados aún no obtenidos.
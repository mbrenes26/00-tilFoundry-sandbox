---
id: "issue-6/spec-solucion"
tipo: "spec-solucion"
titulo: "Spec revisada: Vitest 4.1.12 exacto; resto de la spec aprobada sin cambios"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "4a9d263fe3e02fd4c3fb0f718991666e4b21c09d", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 35085, "tokens_salida": 1765, "monto_ia": 0.033922, "minutos_computo": 0, "monto_computo": 0.0}
---
# Solución: issue-6 — Revisión de Vitest

## Documento base y estado
Esta revisión es una adenda a la spec aprobada «Spec: Nivel 1 Despegue, preparación y fallos deterministas», versión 1 de issue-6/spec-solucion. El documento base se incorpora íntegramente y esta adenda sustituye únicamente los pasajes indicados abajo. No elimina ni resume reglas, tablas de balance, secuencias de referencia, contratos, criterios R1–R5, A1–A4 y J1–J7, exclusiones ni requisitos de evidencia. La revisión debe evaluarse junto al documento base. Hasta que Core registre su aprobación, siguen rigiendo la spec aprobada y C-1 vigente.

## Cerebro consultado
Consultadas las decisiones C-1 a C-5 proporcionadas por Core. C-1 fija TypeScript 5, Phaser 3, Vite 6, Vitest 3 y Playwright 1 con Chromium. Solo se propone reemplazar la parte relativa a Vitest. C-2 a C-5 permanecen sin cambios. Esta sección sustituye «Cerebro consultado» del documento base para esta revisión.

## Decisiones para el cerebro
- Reemplaza a C-1: Juego web sin backend en TypeScript 5, con Phaser 3 para dibujo y entrada, Vite 6 para desarrollo y generación estática, Vitest 4 (versión exacta 4.1.12 en package.json) para pruebas de reglas y Playwright 1 con Chromium para pruebas de navegador.

Esta sección sustituye la sección correspondiente del documento base. No se vuelven a agregar C-2 a C-5 ni se modifica directamente el cerebro.

## Cambios respecto de la spec aprobada
- Se reemplaza Vitest 3 por Vitest 4, fijando 4.1.12 exacto en package.json, por la solicitud de la persona de atender GHSA-82fw-gwwq-j7x9 y GHSA-qxg6-89mg-rqv8. Vitest 5 queda expresamente excluido.
- Se permite regenerar package-lock.json mediante instalación real y adaptar únicamente las configuraciones o pruebas dentro del alcance existente que necesiten compatibilidad con esa versión, conservando todas sus comprobaciones.
- No cambian las demás tecnologías, las reglas, el balance, la interfaz, los contratos, los criterios de aceptación, las exclusiones ni el alcance. No se aprueba la entrega con esta revisión.
- La disponibilidad, compatibilidad y corrección de los avisos de seguridad son pendientes de verificación posterior a la aprobación, no resultados comprobados.

## Sustitución de Responsabilidad e infraestructura de la línea juego
El párrafo de versiones del documento base se sustituye por:

«Integrar reglas y assets en un juego completo. Versiones exactas para package.json sin rangos: phaser 3.90.0, vite 6.1.0, vitest 4.1.12, typescript 5.7.3, @playwright/test 1.51.1. Generar package-lock.json con instalación real. Node.js 22. La disponibilidad y compatibilidad de Vitest 4.1.12 deben verificarse durante la construcción, después de aprobar esta revisión; si no se puede usar, no sustituir silenciosamente ni usar Vitest 5.»

Los scripts, escenas, reglas, criterios de aceptación y demás requisitos de infraestructura del documento base permanecen intactos. Las pruebas de reglas, assets y juego siguen usando npm test con Vitest; las de navegador, Playwright con Chromium. No se añaden dependencias ni rutas al alcance.

# Línea: reglas
Alcance: `src/rules/`, `tests/rules/`

Responsabilidad, API reglas v1, criterios R1–R5 y verificación: se incorporan íntegramente del documento base, sin cambios. La infraestructura de juego ejecutará estas pruebas con la versión revisada de Vitest.

# Línea: graficos
Alcance: `public/assets/`, `docs/assets.md`, `scripts/assets/`, `tests/assets/`

Responsabilidad, Assets v1, criterios A1–A4 y verificación: se incorporan íntegramente del documento base, sin cambios.

# Línea: juego
Alcance: `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `src/main.ts`, `src/game/`, `src/styles/`, `tests/game/`, `tests/e2e/`, `README.md`

Responsabilidad e infraestructura: solo se sustituye el párrafo de versiones indicado. Pantalla e interacción, criterios J1–J7 y verificación: se incorporan íntegramente del documento base, sin cambios. Las adaptaciones por compatibilidad deben mantener sus comprobaciones y no ampliar funcionalidad ni contratos.

## Contrato entre líneas y exclusiones
Se conservan íntegramente API reglas v1, Assets v1 y Consolidación del documento base. Ninguna línea puede modificar archivos de otra. No se autoriza cambiar .github/, Foundry, configuración del repositorio, despliegue, balance ni comportamiento del juego.

## Verificación posterior a la aprobación
1. Comprobar disponibilidad de Vitest 4.1.12 y compatibilidad con Node.js 22 y la infraestructura aprobada. Si falla, detenerse para decisión humana, sin elegir otra versión.
2. Instalar la versión exacta y regenerar package-lock.json mediante instalación real; comprobar coherencia con package.json y ausencia de Vitest 5.
3. Ejecutar npm ci, npm test, npm run build y npm run test:e2e, y las comprobaciones HTTP y visuales de J1–J7, con evidencia real y verificación independiente. No desactivar pruebas para obtener resultados satisfactorios.
4. Contrastar las afirmaciones de corrección de GHSA-82fw-gwwq-j7x9 y GHSA-qxg6-89mg-rqv8 con evidencia de seguridad disponible y registrar comando y salida. El cambio de versión no prueba ausencia global de vulnerabilidades. Si quedan hallazgos que requieren cambios adicionales, detenerse para decisión humana.

## Evidencia y aprobación
La persona solicitó esta revisión y excluyó Vitest 5. En esta ejecución se leyeron el discovery y la revisión propuesta guardados en memoria, la conversación y el inventario de la rama. No se modificó código, no se instalaron dependencias y no se ejecutaron pruebas ni verificaciones de seguridad. Riesgo declarado por Core: medium; no se amplía a producción.

Core sitúa ahora issue-6 en DISCOVERING y permite solicitar SPECIFIED. Se solicita la aprobación de esta revisión: únicamente el reemplazo relativo a Vitest en C-1 y los ajustes de compatibilidad descritos, conservando el documento base. Core determinará si el comentario de aprobación ya recibido satisface la aprobación requerida; el agente no lo da por aprobado. La construcción continuará en la misma rama foundry/issue-6 solo después de la aprobación registrada.
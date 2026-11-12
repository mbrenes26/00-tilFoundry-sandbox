---
id: "issue-6/spec-solucion"
tipo: "spec-solucion"
titulo: "Revisión propuesta de la spec: Vitest 4.1.12, pendiente de aprobación"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "917b6974d33cb3ddc2c59bdab0229461f51298b7", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 44119, "tokens_salida": 1970, "monto_ia": 0.045059, "minutos_computo": 0, "monto_computo": 0.0}
---
# Solución: issue-6 — Revisión propuesta de Vitest

## Estado y documento base
Revisión propuesta, NO aprobada. Este documento es una adenda a la spec «Spec: Nivel 1 Despegue, preparación y fallos deterministas», versión 1 de issue-6/spec-solucion. La spec completa de esa versión se incorpora como documento base: esta adenda sustituye únicamente los pasajes identificados abajo. No elimina ni resume sus reglas, tablas de balance, secuencias de referencia, contratos, criterios R1–R5, A1–A4 y J1–J7, exclusiones ni requisitos de evidencia. Para aprobar esta revisión deben revisarse conjuntamente el documento base y esta adenda. La spec previamente aprobada y el cerebro siguen rigiendo hasta que Core registre una nueva aprobación.

## Origen
La persona autorizó proponer Vitest 4.1.12 el 12 de noviembre de 2026 a las 14:07:39 UTC y pidió retomar la revisión a las 14:16:57 UTC. Excluyó Vitest 5. Esa autorización permite preparar esta revisión; no se presenta como una aprobación SPECIFIED registrada.

## Cerebro consultado
Consultadas C-1 a C-5 vigentes, proporcionadas por Core en esta ejecución. C-1 fija actualmente TypeScript 5, Phaser 3, Vite 6, Vitest 3 y Playwright 1 con Chromium. Esta revisión propone reemplazar solo la parte de Vitest y conserva el resto de C-1. C-2 a C-5 permanecen vigentes sin cambios. La sección «Cerebro consultado» del documento base se sustituye por esta sección para esta revisión.

## Decisiones para el cerebro
- Reemplaza a C-1: Juego web sin backend en TypeScript 5, con Phaser 3 para dibujo y entrada, Vite 6 para desarrollo y generación estática, Vitest 4 (versión exacta 4.1.12 en package.json) para pruebas de reglas y Playwright 1 con Chromium para pruebas de navegador.

Esta sección sustituye la sección «Decisiones para el cerebro» del documento base para la nueva aprobación. No se vuelven a agregar C-2 a C-5 y no se modifica directamente el cerebro.

## Sustitución de Responsabilidad e infraestructura de la línea juego
El párrafo de versiones se sustituye por:

«Integrar reglas y assets en un juego completo. Versiones exactas para package.json sin rangos: phaser 3.90.0, vite 6.1.0, vitest 4.1.12, typescript 5.7.3, @playwright/test 1.51.1. Generar package-lock.json con instalación real. Node.js 22. La disponibilidad y compatibilidad de Vitest 4.1.12 deben verificarse durante la construcción, después de aprobar esta revisión; si no se puede usar, no sustituir silenciosamente ni usar Vitest 5.»

Los scripts, escenas, reglas, criterios de aceptación, contrato y demás requisitos de infraestructura del documento base se mantienen intactos. Las pruebas de reglas, assets y juego seguirán ejecutándose mediante npm test con Vitest; las de navegador seguirán usando Playwright con Chromium. No se añaden dependencias ni rutas al alcance.

# Línea: reglas
Alcance: `src/rules/`, `tests/rules/`

Responsabilidad, API reglas v1, criterios R1–R5 y verificación: sin cambios respecto del documento base. Las pruebas serán consumidas por la infraestructura de la línea juego con la versión propuesta de Vitest.

# Línea: graficos
Alcance: `public/assets/`, `docs/assets.md`, `scripts/assets/`, `tests/assets/`

Responsabilidad, Assets v1, criterios A1–A4 y verificación: sin cambios respecto del documento base.

# Línea: juego
Alcance: `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `src/main.ts`, `src/game/`, `src/styles/`, `tests/game/`, `tests/e2e/`, `README.md`

Responsabilidad e infraestructura: únicamente la sustitución textual indicada arriba. Pantalla e interacción, criterios J1–J7 y verificación: sin cambios respecto del documento base. Solo se podrán adaptar configuraciones o pruebas existentes dentro de estos alcances cuando sea necesario para compatibilidad con la versión aprobada, conservando sus comprobaciones y sin ampliar funcionalidad ni contratos.

## Contrato entre líneas y alcance común
Se conservan íntegramente API reglas v1, Assets v1 y Consolidación del documento base. Ninguna línea puede modificar archivos de otra. No se autoriza ningún cambio en .github/, Foundry, configuración del repositorio, despliegue, balance o comportamiento del juego.

## Verificación posterior a la aprobación
1. Comprobar que Vitest 4.1.12 está disponible y que sus requisitos son compatibles con Node.js 22 y la infraestructura aprobada. Si no lo son, detenerse y explicar la incompatibilidad sin elegir otra versión.
2. Instalar la versión exacta y regenerar package-lock.json mediante instalación real; comprobar coherencia con package.json y que no se introduce Vitest 5.
3. Ejecutar npm ci, npm test, npm run build y npm run test:e2e, así como las comprobaciones HTTP y visuales exigidas en J1–J7, con evidencia real y verificación independiente. No desactivar pruebas para forzar resultados satisfactorios.
4. Verificar mediante evidencia de seguridad disponible las afirmaciones de corrección de GHSA-82fw-gwwq-j7x9 y GHSA-qxg6-89mg-rqv8, y registrar comando y salida. No afirmar ausencia global de vulnerabilidades por cambiar una dependencia. Si quedan hallazgos que exigen cambios adicionales, detenerse para decisión humana.

## Evidencia y pendientes
La persona indicó que 4.1.12 corrige ambas vulnerabilidades. Esta ejecución no ha comprobado disponibilidad, compatibilidad ni corrección de seguridad, ni ha ejecutado pruebas. Se leyó package.json en el commit vigente: declara Vitest 3.2.7, no 4.1.12. No se modificó código ni dependencias. Riesgo declarado: medium, sin ampliación a producción.

## Aprobación y bloqueo vigente
La aprobación de esta revisión aceptará el reemplazo de C-1 relativo a Vitest y la versión exacta 4.1.12, conservando íntegramente el resto del documento base. No aprobará la entrega ni certificará resultados de seguridad o pruebas todavía pendientes.

Core mantiene issue-6 en BLOCKED y solo permite BUILDING, CANCELLED o FAILED. No permite solicitar SPECIFIED en esta ejecución. Por ello esta revisión se guarda como propuesta y no se solicita volver a BUILDING para implementar una tecnología que aún contradice C-1. Falta habilitar en Core el trámite de revisión y aprobación de la spec; la persona no necesita repetir su elección de versión.
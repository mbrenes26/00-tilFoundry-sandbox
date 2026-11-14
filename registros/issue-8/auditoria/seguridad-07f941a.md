---
id: "issue-8/auditoria/seguridad-07f941a"
tipo: "informe-auditoria"
titulo: "Auditoría de seguridad sobre 07f941a: aprobado"
version: 1
estado: "aprobado"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:seguridad", "commit": "07f941a655d5314c2c7b6959c0e9a0cb243d33ba", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 384588, "tokens_salida": 3454, "monto_ia": 0.954305, "minutos_computo": 1.78, "monto_computo": 0.003204}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "07f941a655d5314c2c7b6959c0e9a0cb243d33ba"}
---
## Auditoría de seguridad
- Trabajo: issue-8. PR #9. Commit auditado según Core: 07f941a655d5314c2c7b6959c0e9a0cb243d33ba.
- Criterio: spec-solucion aprobada-original, contrato incluido en ella y cerebro C-2/C-3/C-4/C-5/C-7/C-8. Auditoría de la solución ensamblada, únicamente seguridad.
- Resultado: aprobado; sin bloqueantes de seguridad identificados. No implica aprobación de entrega ni cambia el riesgo efectivo high calculado por Core.

## Hallazgos bloqueantes
- Ninguno. No se identificaron credenciales, ejecución de contenido importado, exfiltración ni modificaciones de Foundry/.github en los archivos del PR examinados.

## Evidencia
- Superficie local: package.json:8 y vite.config.ts:5-6 fijan 127.0.0.1 para desarrollo/vista previa; README.md:33 explica el límite local. Prueba real con createServer: escucha IPv4 127.0.0.1; solicitud HTTP con Host ajeno mediante node:http devuelve 403; allowedHosts permanece []. Una solicitud con Origin https://example.com no recibe Access-Control-Allow-Origin. Evidencia: salidas 7 y 10. El primer sondeo con fetch no sirvió para comprobar Host; se sustituyó por node:http antes de concluir.
- Importación: src/scenes/LaunchScene.ts:71-89 invalida la política previa durante la lectura, comprueba 2 MiB antes de file.text(), valida JSON y descarta respuestas obsoletas. Metadatos y errores se muestran con textContent; los innerHTML de LaunchScene/UIScene contienen únicamente plantillas constantes.
- Validación compartida: src/learning/policy-format.ts:13-43,60-68 exige campos exactos, versiones, dimensiones, enteros y números finitos, con límite UTF-8 antes de JSON.parse. src/learning/checkpoint.ts:63-120 valida configuración, capacidad fija y coherencia del replay; game-validation.ts valida el estado antes de restaurarlo. No se ejecutan los archivos importados.
- Persistencia: src/learning/files.ts:25-44 usa temporal con UUID y apertura exclusiva wx, sincronización y rename sin borrar primero el destino; valida tamaños y UTF-8. Las rutas proceden de argumentos locales, no de campos de políticas/checkpoints. No se encontraron invocaciones de shell construidas con esos argumentos.
- Datos/red: src/main.ts, escenas, src/learning/ y scripts/ no incorporan backend, autenticación, telemetría ni envío de políticas. BootScene carga arte del repositorio. No se detectaron endpoints externos en código propio; las coincidencias HTTP de los SVG corresponden al namespace XML.
- Dependencias: package-lock.json utiliza registry.npmjs.org; versiones directas alineadas con C-7. npm ci: código 0. npm audit --json: código 1, un aviso bajo; detalle en sugerencias.
- Pruebas independientes: vitest 4.1.12, persistence.test.ts + persistence-hardening.test.ts + checkpoint-coherence.test.ts: 97/97 aprobadas; node --test tests/game/config.test.mjs: 5/5 aprobadas, incluidas restricciones de loopback. Comando conjunto código 0, salida 8.

## Sugerencias no bloqueantes
- SEG-S1 — Dependencia transitiva: npm audit identifica GHSA-g7r4-m6w7-qqqr en esbuild 0.27.7, instalado por tsx 4.21.0; npm ls esbuild confirma que Vite usa otra copia, 0.25.12. El aviso afecta al servidor de desarrollo propio de esbuild en Windows; los comandos del proyecto utilizan tsx para ejecutar TypeScript y Vite como servidor, sin activar esbuild serve. No se identificó una ruta explotable en el uso implementado. Planificar actualización compatible del lockfile a una versión corregida y repetir pruebas, sin alterar unilateralmente C-7. No se afirma que el aviso esté resuelto ni que Windows haya sido verificado.
- SEG-S2 — Endurecimiento opcional de lectura: files.ts:41-42 separa stat y readFile. Un archivo local modificado entre ambas operaciones puede consumir memoria por encima del límite antes del segundo control, aunque se rechace antes de parsear. Para defensa adicional frente a archivos locales cambiantes, abrir una vez y leer como máximo límite+1 bytes. No se identificó un actor remoto ni cruce de privilegios en el modelo local aprobado.

## Límites de la comprobación
- leer_pr informa que el commit vigente no tiene checks; el cuerpo contiene evidencia de commits anteriores. Los resultados arriba corresponden a comandos ejecutados en esta sesión, no a checks de GitHub.
- La sesión no incluye .git: no pudo verificarse HEAD mediante git; la identidad del commit y el alcance se toman de Core.
- El primer intento de pruebas se hizo sin dependencias instaladas: npx intentó usar Vitest 5.1.0 y falló al cargar configuración. No se cuenta como prueba del producto. Después de npm ci se usó explícitamente el binario local 4.1.12 y se obtuvo el verde citado.
- No se ejecutaron Windows, comprobaciones del cortafuegos ni una nueva suite completa de navegador en esta auditoría. No se modificaron archivos fuente ni configuración del repositorio.
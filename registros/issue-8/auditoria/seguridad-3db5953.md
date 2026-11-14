---
id: "issue-8/auditoria/seguridad-3db5953"
tipo: "informe-auditoria"
titulo: "Auditoría de seguridad sobre 3db5953: cambios"
version: 1
estado: "aprobado"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:seguridad", "commit": "3db59530ee48827dfa89db2c6267382576959d1b", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 257635, "tokens_salida": 2601, "monto_ia": 0.728821, "minutos_computo": 1.551, "monto_computo": 0.002792}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "3db59530ee48827dfa89db2c6267382576959d1b"}
---
## Auditoría de seguridad
- Trabajo: issue-8. PR: #9. Commit: 3db59530ee48827dfa89db2c6267382576959d1b.
- Criterio: spec-solucion vigente, contrato incluido en ella y cerebro C-4/C-7/C-8. Revisión de configuración, importación JSON, persistencia, CLI, presentación y dependencias.

## Bloqueantes
- **SEG-1 — Exposición de red no necesaria para el uso local aprobado.** `package.json:8` ejecuta `vite --host 0.0.0.0`; `playwright.config.ts:5` reutiliza ese comando. El servidor escucha en todas las interfaces y permite descargar archivos del proyecto sin autenticación. C-4 y la spec requieren HTTP local; publicación y servicios quedan fuera del alcance. La advertencia de `README.md:33` no limita técnicamente la exposición.
  - Evidencia reproducida: comando de sesión, salida 6, arrancó `npm run dev -- --port 5179 --strictPort` y realizó peticiones a la IPv4 **no loopback** de la sesión. `/package.json` devolvió HTTP 200, 627 bytes; `/tests/learning/evidence/step-8-evaluation.json` devolvió HTTP 200, 14617 bytes. Vite anunció direcciones Network. Servidor detenido al terminar.
  - Impacto: cualquier equipo con conectividad al puerto puede acceder al servidor y a archivos servidos desde el proyecto. La comprobación fue desde la misma sesión usando su interfaz de red; no prueba accesibilidad a través del cortafuegos de Windows ni exposición a Internet.
  - Corrección: eliminar `--host 0.0.0.0` o fijar explícitamente loopback; ajustar la explicación del README. Mantener las pruebas de navegador en loopback. Añadir una regresión que verifique la configuración y comprobar que HTTP local funciona sin escuchar en interfaces de red. No requiere backend, autenticación ni cambios en `.github/`.

## Sugerencias no bloqueantes
- **SEG-2 — Dependencia de desarrollo con aviso de seguridad.** `npm audit --json` identificó GHSA-g7r4-m6w7-qqqr, severidad baja, en esbuild. Tras `npm ci`, `npm ls esbuild` confirmó `tsx@4.21.0 → esbuild@0.27.7`; Vite usa otra copia, `esbuild@0.25.12`. El aviso afecta al servidor de desarrollo de esbuild en Windows; no se encontró uso de esa API en el código del proyecto. No se demuestra una ruta explotable de ese aviso en los comandos aprobados, por lo que no es bloqueante. Recomiendo actualizar la resolución transitiva a una versión corregida compatible y repetir instalación, CLI y pruebas, sin alterar las versiones exactas exigidas por C-7.

## Controles comprobados
- `src/learning/policy-format.ts`: límite de 2 MiB, claves exactas, versiones, dimensiones y números finitos antes de aceptar políticas.
- `src/scenes/LaunchScene.ts:70–89`: tamaño comprobado antes de leer el archivo, revocación inmediata de la política anterior y control de importaciones concurrentes. Los mensajes variables usan `textContent`; el `innerHTML` observado contiene plantilla constante.
- `src/learning/files.ts:25–45`: temporales únicos con apertura exclusiva, sincronización y reemplazo sin borrar primero el destino; tamaño comprobado antes de lectura y después, antes del parseo.
- Checkpoints: validación de estructura, replay, reglas y estado antes de restaurar. No se encontró ejecución del contenido importado ni envío de políticas a servicios externos.
- Búsqueda de patrones de credenciales y revisión: no se detectaron secretos. No se observaron cambios en archivos de Foundry ni `.github/`.

## Evidencia y límites
- Salida 5: `npm ci` terminó con código 0; suite dirigida de persistencia, endurecimiento y coherencia: **97/97 pruebas**, Vitest 4.1.12, código 0.
- Salida 3: auditoría npm con un aviso bajo. Salida 6: reproducción de exposición HTTP, código 0.
- Primer intento de pruebas sin dependencias instaladas falló al cargar Vitest; no se contó como resultado del producto. Se repitió después con las dependencias fijadas por el lockfile.
- `leer_pr`: sin checks registrados para este commit. No se ejecutaron Chromium ni Windows en esta auditoría; no se atribuyen resultados de otras ejecuciones como propios.
- Veredicto: **cambios**, por SEG-1.
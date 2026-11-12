---
id: "issue-6/escalamiento"
tipo: "escalamiento"
titulo: "Revisión autorizada a Vitest 4.1.12 pendiente de aprobación de spec y actualización de C-1"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "3bbb7b40e7449b57fe59124c68ab26e33daf8316", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 25088, "tokens_salida": 759, "monto_ia": 0.043563, "minutos_computo": 0, "monto_computo": 0.0}
---
La persona autorizó en el issue #6 el 12 de noviembre de 2026 a las 14:07:39 UTC revisar la spec para utilizar exactamente Vitest 4.1.12 y excluir Vitest 5. Esta decisión sustituye su solicitud anterior de Vitest 3.2.7 registrada en la versión 1 de este escalamiento. La persona indica que 4.1.12 corrige GHSA-82fw-gwwq-j7x9 y GHSA-qxg6-89mg-rqv8; no se ha verificado aquí disponibilidad, compatibilidad ni corrección de esas vulnerabilidades.

C-1 sigue vigente con Vitest 3 según el contexto de Core. Pasar a Vitest 4 requiere una revisión de la spec y aprobación SPECIFIED que registre una decisión posterior, no una desviación de implementación. Texto propuesto para «Decisiones para el cerebro»: «Reemplaza a C-1: Juego web sin backend en TypeScript 5, con Phaser 3 para dibujo y entrada, Vite 6 para desarrollo y generación estática, Vitest 4 (versión exacta 4.1.12 en package.json) para pruebas de reglas y Playwright 1 con Chromium para pruebas de navegador.» La revisión también sustituirá vitest 3.0.5 por vitest 4.1.12 en Responsabilidad e infraestructura de la línea juego. C-2 a C-5, los criterios, contratos y rutas de alcance se mantienen sin cambios. Después de aprobarla corresponde regenerar el lockfile mediante instalación real y verificar pruebas, build y seguridad sin inventar resultados.

Core sitúa el trabajo en BLOCKED y permite BUILDING, CANCELLED y FAILED, pero no SPECIFIED. No se solicita BUILDING para implementar una tecnología que todavía contradice el cerebro ni se intenta actualizar el cerebro mediante este registro. Falta que Core habilite el trámite de revisión y aprobación de la spec con reemplazo de C-1. La persona ya decidió qué versión propone; no hace falta repetirle esa pregunta. No se modificó código ni la spec vigente y no se ejecutaron pruebas.
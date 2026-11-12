---
id: "issue-6/auditoria/ui-dea64d9"
tipo: "informe-auditoria"
titulo: "Auditoría de ui sobre dea64d9: cambios"
version: 1
estado: "aprobado"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:ui", "commit": "dea64d9c1a95dbb7af735fb9e60c6946fb062891", "modelo": "gpt-6-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 225600, "tokens_salida": 3038, "monto_ia": 0.15554, "minutos_computo": 4.946, "monto_computo": 0.008903}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "dea64d9c1a95dbb7af735fb9e60c6946fb062891"}
---
# Auditoría UI — PR #7, issue-6

## Qué revisé
Revisé la spec de solución revisada y el discovery (escritorio 16:9, 1600×900 y 1280×720; soporte móvil garantizado excluido), las decisiones C-3 y C-5, `src/game/scenes.ts`, `src/styles/game.css`, `src/main.ts`, `tests/e2e/game.spec.ts` y `README.md`. Instalé dependencias con `npm ci`, instalé Chromium, ejecuté `npm run test:e2e` (14/14 aprobadas), abrí la aplicación por HTTP en Chromium y tomé capturas de la base, Meteorología y confirmación a 1600×900, 1280×720 y 390×844 en `/tmp/issue6-ui-*.png`. Verifiqué tamaños, superposiciones y navegación de teclado con consultas del navegador; las capturas se generaron pero no dispongo de un visor de imágenes en esta sesión, por lo que no afirmo haberlas inspeccionado visualmente.

## Hallazgos bloqueantes
1. **Contenido del panel de objetivos se superpone con el panel inferior incluso a 1600×900.** En `src/styles/game.css`, `.objectives` mide 475 px y no limita su desbordamiento; Chromium mide `clientHeight=471`, `scrollHeight=630`. En la pantalla inicial, los párrafos «Ventana: 10:00–11:00 / Clima favorable: hasta 10:39» ocupan y=691–756 y «Fase orientativa» y=768–812, mientras `.parameters` empieza en y=715. `document.elementFromPoint` sobre la mitad de esos párrafos devuelve `.parameters panel`, no `.objectives panel`: contenido dibujado fuera de su panel y tapado por otro. A 1280×720 permanece el mismo problema en la resolución lógica escalada. Ajustar contenido, altura o distribución para que el panel completo y sus textos sean visibles sin superponerse, y añadir una prueba de geometría para *contenido* además de botones.
2. **Los cuadros de confirmación no son accesibles por teclado como cuadros de diálogo.** En `src/game/scenes.ts`, `render()` reemplaza todo `this.root.innerHTML` en cada acción y genera `.dialog` como `<section>` sin `role="dialog"`, nombre accesible ni `aria-modal`, sin mover o restaurar foco. Reproducción en escritorio: clic en `repair-pump` abre `data-testid="confirmation"`, el foco activo queda en `<body>`; al pulsar Tab se enfoca `room-design` detrás del cuadro, y hacen falta **20 Tab** para llegar a `confirm-action`. El teclado tampoco queda contenido en el diálogo mientras está abierto. Esto afecta una interacción obligatoria para progresar y falla la accesibilidad del escritorio exigido: asignar semántica de diálogo y título, llevar el foco dentro al abrir, gestionar su permanencia y devolverlo al control de origen al cerrar, sin destruir el foco innecesariamente en cada render. Cubrir el flujo de teclado tanto en confirmación como en aviso de riesgos.

## Sugerencias (no bloqueantes)
- La pantalla de teléfono de 390×844 comprime la vista lógica a ~24 %: el panel de objetivos mide ~61×116 px y su contenido rebasa ampliamente el contenedor. La spec/discovery excluye soporte móvil garantizado; dejar su adaptación para otro pedido, no bloquear por teléfono.
- Comprobar contraste con herramienta visual automatizada en una revisión posterior; aquí comprobé foco y geometría, no calculé una evaluación completa de contraste.

## Resultado
**Cambios requeridos.** Las 14 pruebas E2E pasan, pero no cubren el desbordamiento de texto del panel de objetivos ni la navegación de teclado en cuadros de confirmación. No evalué reglas ni seguridad fuera de UI.
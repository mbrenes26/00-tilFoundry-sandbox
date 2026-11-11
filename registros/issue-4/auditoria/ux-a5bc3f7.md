---
id: "issue-4/auditoria/ux-a5bc3f7"
tipo: "informe-auditoria"
titulo: "Auditoría de ux sobre a5bc3f7: aprobado"
version: 1
estado: "aprobado"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:ux", "commit": "a5bc3f7771bcbfc717ff0b068a8915eb1e208659", "modelo": "gpt-6-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 61065, "tokens_salida": 955, "monto_ia": 0.066983, "minutos_computo": 1.021, "monto_computo": 0.001838}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "a5bc3f7771bcbfc717ff0b068a8915eb1e208659"}
---
## Auditoría UX — PR #5, commit a5bc3f7771bcbfc717ff0b068a8915eb1e208659

**Resultado:** aprobado para la especificación de escritorio del issue #4.

### Bloqueantes
Ninguno en experiencia de uso. La persona confirmó en el issue que mantendrá teléfono y lector de pantalla fuera de esta entrega.

### Evidencia
- `index.html:17-19` muestra «Objetivo actual», la indicación de Flechas/WASD y E, y un espacio de mensaje; `game.js:47-58` permite moverse con ambos controles, detiene al soltar o perder foco y evita que las flechas desplacen la página. `game.js:24-46,97,158-163` muestra el nombre de la puerta cercana al pulsar E y oculta el mensaje al salir del radio.
- En esta auditoría ejecuté `node tests/game.test.js && node tests/browser.cjs`: salida 0, 12/12 pruebas locales y comprobaciones de Chromium aprobadas; recorrido automatizado por las seis puertas, apertura `file://` sin conexión, paneles y recursos sin cambios y escala sin scroll a 1280 × 720 y 1600 × 900. El navegador automatizado fue Chromium 156.0.8078.79; estas comprobaciones no sustituyen una inspección visual.
- La persona registró en el issue una revisión real en Chrome 157.0.8103.50, Windows, zoom 100 %: a 1280 × 720 comprobó visibilidad y fluidez; a 1600 × 900 y tras redimensionar comprobó nitidez, recorrido y las salas que probó; también comprobó que tras Alt+Tab el astronauta permanece detenido. El recorrido automatizado sí cubre las seis puertas, pero la última comprobación humana no afirma haber probado las seis después de redimensionar.
- El diff incluye únicamente `index.html`, `styles.css`, `game.js` y `tests/`, dentro del alcance. No se pudo consultar desde estas herramientas el estado de los checks del PR en GitHub; la ejecución local y la evidencia publicada en el issue no equivalen a confirmarlos.

### Sugerencias no bloqueantes
Ninguna de UX dentro de la especificación aprobada. La presentación para teléfonos y el recorrido con lector de pantalla quedaron explícitamente para un pedido distinto.
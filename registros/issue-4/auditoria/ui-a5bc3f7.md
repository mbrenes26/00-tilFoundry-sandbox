---
id: "issue-4/auditoria/ui-a5bc3f7"
tipo: "informe-auditoria"
titulo: "Auditoría de ui sobre a5bc3f7: cambios"
version: 1
estado: "aprobado"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:ui", "commit": "a5bc3f7771bcbfc717ff0b068a8915eb1e208659", "modelo": "gpt-6-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 124431, "tokens_salida": 3881, "monto_ia": 0.123431, "minutos_computo": 1.474, "monto_computo": 0.002653}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "a5bc3f7771bcbfc717ff0b068a8915eb1e208659"}
---
## Auditoría UI — PR #5, commit a5bc3f7771bcbfc717ff0b068a8915eb1e208659

### Qué revisé
Spec aprobada `issue-4/spec-solucion`, discovery, diff y archivos `index.html`, `styles.css`, `game.js` y `tests/EVIDENCIA.md`. No existe registro `cerebro` ni contrato entre líneas. Ejecuté `node tests/game.test.js && node tests/browser.cjs` en sesión aislada: salida 0, 12/12 y verificaciones automáticas de Chromium en verde a 1280 × 720 y 1600 × 900; se generaron capturas, pero esta herramienta no permite verlas ni hacer una inspección visual interactiva. Abrí también `index.html` mediante Chromium headless para medir el diseño a 1280 × 720, 1600 × 900 y 390 × 844 y consultar el árbol de accesibilidad. No tengo un estado independiente de checks del PR en las herramientas disponibles; no lo doy por aprobado. La persona confirmó inspección visual en Chrome 157.0.8103.50 a 1280 × 720, no a 1600 × 900 ni al redimensionar.

### Bloqueantes
1. **La interfaz no es legible o queda recortada en una ventana de teléfono.** `styles.css:4-5` fija `#stage` en 1200 × 675 y oculta el desbordamiento; `game.js:57,85` escala toda la escena a un único tamaño. En Chromium a 390 × 844 CSS sin emulación móvil, el escenario cabe, pero el texto de los recursos (`styles.css:12`) se representa a **4,55 px** y el panel de objetivos ocupa solo **77,35 px** de ancho. Con emulación móvil de 390 × 844, el área visual informa 390 × 844, pero el escenario va de x=−202,5 a x=592,5; recursos de x=−181,3 a 571,3 y objetivos de x=413,6 a 571,3: buena parte queda fuera del área visual. `html, body {overflow:hidden}` impide alcanzarla desplazándose. No pido controles táctiles (la spec los excluye); sí una presentación adaptable que no recorte y deje leer los paneles en ancho estrecho sin perder la vista de referencia de escritorio.
2. **El recorrido no es accesible para quien usa lector de pantalla.** `index.html:12` ofrece solo una descripción estática del canvas. La ubicación cambiante del astronauta, la puerta próxima y el indicador `[E]` se dibujan exclusivamente en canvas (`game.js:140-162`). Consulté `Accessibility.getFullAXTree` en Chromium: aparece un único nodo Canvas con los nombres generales de las salas y los textos de los paneles; no aparece la posición ni la proximidad a una puerta. El único anuncio dinámico accesible es `#message` (`index.html:16`), que recibe un nombre **después** de pulsar E. Sin saber cuándo está cerca de una puerta no se puede recorrer e identificar las seis salas de forma autónoma. Exponer una indicación accesible de posición/proximidad que se actualice de manera útil, además del letrero existente, y comprobar el recorrido con teclado y lector de pantalla.
3. **Falta la comprobación visual del escalado exigida por el criterio 7 de la spec.** `tests/EVIDENCIA.md` (apartados «Navegador y capturas» y «Pendiente sin verificar») indica que las capturas `tests/nave-1280x720.png` y `tests/nave-1600x900.png` no se han inspeccionado; la persona confirmó 1280 × 720, pero declaró pendiente la nitidez al redimensionar y la revisión visual a 1600 × 900. `node tests/browser.cjs` comprueba geometría y `image-rendering: pixelated`, no la nitidez real del texto y el arte. Hace falta inspeccionar visualmente 1600 × 900 y el redimensionamiento, registrar navegador, tamaño y resultado, y corregir cualquier defecto antes de dar por cumplido el criterio.

### Sugerencias (no bloqueantes)
- Quitar la declaración inválida `top: sixty` en `styles.css:10`; Chromium aplica el `top: 60px` que la sigue, por lo que no afecta al resultado actual.

**Veredicto:** cambios. Los controles automáticos y la inspección humana a 1280 × 720 son evidencia positiva, pero no resuelven los tres bloqueantes de UI indicados.
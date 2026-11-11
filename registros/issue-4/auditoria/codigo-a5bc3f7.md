---
id: "issue-4/auditoria/codigo-a5bc3f7"
tipo: "informe-auditoria"
titulo: "Auditoría de codigo sobre a5bc3f7: cambios"
version: 1
estado: "aprobado"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:codigo", "commit": "a5bc3f7771bcbfc717ff0b068a8915eb1e208659", "modelo": "gpt-6-astra"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 105106, "tokens_salida": 1918, "monto_ia": 0.519057, "minutos_computo": 1.329, "monto_computo": 0.002392}
aprobacion: {"por": "process:core", "fuente": "core", "commit_aprobado": "a5bc3f7771bcbfc717ff0b068a8915eb1e208659"}
---
# Auditoría de código — issue-4, PR #5

Commit auditado: `a5bc3f7771bcbfc717ff0b068a8915eb1e208659`.
Veredicto: **cambios**, por evidencia de aceptación incompleta; no detecté un fallo funcional en la lógica revisada.

## Base y alcance
Consulté `spec-solucion`, `discovery`, `escalamiento`, conversación, diff y archivos de implementación/pruebas. No existen registros `cerebro` ni `contrato`; la spec prescribe HTML/CSS/JavaScript local sin dependencias y una sola línea. El cambio respeta esa arquitectura y las rutas aprobadas. No hay modificaciones de Foundry en el diff examinado. La plantilla `plantillas/informe-auditoria.md` no está disponible; uso secciones explícitas de evidencia, bloqueantes y sugerencias.

## Evidencia y cobertura
- Ejecuté `node tests/game.test.js`: **12/12 aprobadas**. Ejecuté además `node --check game.js && node --check tests/browser.cjs && node --check tests/game.test.js`: salida **0**.
- C1: referencias locales y ausencia de dependencias externas comprobadas por pruebas de archivos. La evidencia registrada por Core incluye apertura `file://` offline en Chromium y cero solicitudes externas/errores de consola; no repetí esa batería de navegador en esta auditoría.
- C2–C3: las seis salas, disposición, recursos y objetivos están implementados. Los tests ejercen datos y la batería de navegador comprueba barras y objetivos en el DOM. Existe confirmación humana del aspecto a 1280 × 720 en Chrome 157.0.8103.50, Windows, zoom 100 %.
- C4–C5: `game.js:38–65` implementa tiempo transcurrido, diagonal normalizada, límites del cuerpo, liberación de teclas y pérdida de foco. Las pruebas ejercen ocho controles, intervalos distintos, bordes/esquinas y limpieza de entrada.
- C6: `game.js:24–37,46–47` implementa proximidad inclusiva, desempate estable por orden, sustitución y ocultamiento. Las pruebas ejercen las seis puertas y el límite de 48 unidades.
- C7: escala uniforme separada de coordenadas lógicas; hay pruebas de escala y evidencia automática de geometría en ambas ventanas, pero no aceptación completa del comportamiento escalado.
- TDD: Core registró el rojo `0/12` antes de implementar y posteriormente el verde `12/12`, además del navegador. La corroboración de navegador fue posterior, como declara `tests/EVIDENCIA.md`.

## Bloqueante
**COD-1 — Falta completar la verificación exigida por C4 y C7.**

Evidencia: `tests/browser.cjs:65` dispara un evento `blur` sintético; no realiza un cambio real de ventana. Las líneas 52–60 solo comprueban geometría a 1600 × 900 y vuelven a 1280 × 720 antes de recorrer los controles. `tests/game.test.js:95–98` comprueba factores de escala y que llamar a `fitScale` no muta el estado, pero no ejercita colisiones e interacción en la escena redimensionada. `tests/EVIDENCIA.md:31–41` reconoce estos límites. La persona confirmó expresamente el 2026-11-11 a las 21:43:38 UTC que no probó la pérdida real de foco ni la nitidez al redimensionar; `escalamiento` conserva esos requisitos, sin dispensarlos.

Acción: completar y registrar la prueba real de cambiar de ventana con una tecla mantenida y volver sin movimiento atascado; completar la inspección a 1600 × 900 y el recorrido con colisiones/interacción tras redimensionar, indicando navegador, versión, zoom y resultados. No hace falta repetir la revisión humana ya confirmada a 1280 × 720. Incorporar evidencia verificable y corregir únicamente si aparece un fallo. No sustituir estas comprobaciones por otro `blur` sintético o por la sola geometría DOM. Este hallazgo es de cobertura de aceptación, no un juicio sobre la calidad visual, que corresponde a UI/UX.

## Sugerencias no bloqueantes
- `tests/game.test.js:15–16,105–107`: en el ejecutor HTML, C1 retorna sin comprobar nada y aparece como APROBADO. Marcarlo como omitido/no aplicable o añadir una comprobación real de navegador; la prueba Node y la batería offline sí aportan cobertura independiente.
- `styles.css:10`: eliminar `top: sixty`, declaración inválida y sin efecto que queda antes de `top: 60px`.
- `tests/EVIDENCIA.md:28–29,44`: menciona dos PNG que no están en el inventario de la rama ni en la sesión actual. Publicarlos como evidencia accesible o aclarar que son salidas generadas del verificador, no archivos incluidos en el PR.

## Límites de esta auditoría
La herramienta del PR devolvió el diff, no su cuerpo ni el estado de sus checks; los registros `pr` y `checks` no existen. Por ello no puedo acreditar que el cuerpo del PR enlace el rojo/verde ni afirmar que sus checks estén en verde. El Manager debe verificar esos metadatos. No modifiqué archivos ni solicité transiciones.
---
id: "issue-4/escalamiento"
tipo: "escalamiento"
titulo: "Decisión humana comprobada y evidencia manual para retomar verificación"
version: 1
estado: "borrador"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "fb561d3957fa42da3a5073c9ac3942feafc92b1c", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 48849, "tokens_salida": 663, "monto_ia": 0.047046, "minutos_computo": 0, "monto_computo": 0.0}
---
Contexto vigente: issue-4 BLOCKED desde VERIFYING; PR #5; commit a5bc3f7771bcbfc717ff0b068a8915eb1e208659. Rol: manager-producto. Se consultaron conversación, spec-solucion e informes de seguridad, código, UX y UI. leer_registro(cerebro) devuelve No existe; se conserva el stack HTML/CSS/JavaScript local fijado por la spec, sin cambios arquitectónicos ni de alcance.

La conversación visible permite comprobar las respuestas humanas del 2026-11-11 a las 22:04:58 y 22:20:54 UTC, ratificadas a las 23:14:38: mantiene la spec de escritorio y deja UI-1 (teléfono) y UI-2 (lector de pantalla) para otro pedido. No se ha creado ese pedido en esta ejecución. Los comentarios anteriores que volvieron a pedir esta decisión no tuvieron en cuenta esas respuestas; el bloqueo por decisión pendiente ya no corresponde.

Evidencia manual declarada por mbrenes26: Chrome 157.0.8103.50, Windows, zoom 100 %. Mantuvo flecha derecha, cambió de ventana con Alt+Tab, soltó y volvió: astronauta quieto. A 1600 × 900 y al redimensionar observó nitidez, recorrió el pasillo de punta a punta sin atravesar paredes y E mostró los nombres de las salas que probó. Esta evidencia complementa la revisión anterior a 1280 × 720, el recorrido humano por las seis puertas previamente registrado y las pruebas automáticas publicadas por Core. No afirmar que el nuevo recorrido tras redimensionar incluyó individualmente las seis puertas: la persona dijo «las salas que probé».

Se solicita volver a VERIFYING para que auditoría reevalúe COD-1 y UI-3 con esta nueva evidencia y trate UI-1/UI-2 según la decisión de mantener la spec. No se detecta en los informes un fallo funcional bloqueante que requiera modificar código antes de retomar; no se modifica el PR ni se amplía el alcance. No se declaran automáticamente resueltos los veredictos ni aprobada la entrega. Los checks y demás requisitos de entrega siguen sujetos a la verificación de Core y del Manager de Auditoría.
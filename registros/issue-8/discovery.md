---
id: "issue-8/discovery"
tipo: "discovery"
titulo: "Discovery en curso: Pac-Man con aprendizaje neuronal"
version: 1
estado: "borrador"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "8add1395006a5241ac9f2caf85efb395f6d3e377", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 36870, "tokens_salida": 593, "monto_ia": 0.012398, "minutos_computo": 0, "monto_computo": 0.0}
---
## Lo que la persona dijo
- Quiere crear el juego desde cero y un jugador automático con una red neuronal que aprenda jugando, no estrategias programadas.
- Acepta el stack vigente del repositorio.
- Le interesa observar pastoreo de fantasmas, riesgo calculado y estrategias contraintuitivas orientadas a maximizar puntos; menciona alcanzar el nivel 256.
## Evidencia del repositorio y cerebro consultado
- Inventario leído: solo README.md, cuyo contenido es el título 00-tilFoundry-sandbox; no hay código ni pruebas.
- Proyecto nuevo propuesto en la conversación anterior; la persona confirma crear desde cero y acepta el stack, aunque no usa expresamente el término greenfield.
- Decisiones vigentes consultadas: C-2, C-3, C-4, C-5 y C-7. Juego web TypeScript 5, Phaser 3, Vite 6, Vitest 4 y Playwright 1; reglas puras independientes del renderizado, ejecución por HTTP local y gráficos originales con procedencia.
## Inferencias
- La necesidad central es experimentar y observar aprendizaje, no solo entregar un jugador competente.
- Los comportamientos descritos son aspiraciones de investigación; todavía no son criterios de aceptación medibles ni resultados garantizados.
## Supuestos
- Ninguno fijado sobre tecnología de aprendizaje, fidelidad al juego original, recursos o duración de entrenamiento.
## Pendiente de verificar y acordar
- Dónde se entrenará la red y recursos disponibles.
- Presupuesto de tiempo de entrenamiento y evaluación.
- Alcance inicial, reglas del juego, métricas, semillas y comparación para demostrar aprendizaje.
- Si el nivel 256 es requisito o referencia aspiracional.
- Confirmación del resumen completo del discovery antes de especificar.
## Límites comunicados
- No se promete que la red descubra espontáneamente pastoreo o sacrificios.
- Publicar el juego es un trabajo separado conforme a C-4.
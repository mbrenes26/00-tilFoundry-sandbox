---
id: "issue-8/discovery"
tipo: "discovery"
titulo: "Discovery: juego original de laberinto y aprendizaje en CPU"
version: 1
estado: "borrador"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "8fae73f24bec40c9f8d017e6d737d3ae5b805f27", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 18741, "tokens_salida": 912, "monto_ia": 0.015556, "minutos_computo": 0, "monto_computo": 0.0}
---
## Lo que la persona dijo
- Quiere crear desde cero un juego original de laberinto, con nombre, personajes y arte propios; conserva píldoras, píldoras de poder y enemigos con modos de persecución y dispersión.
- Quiere una red neuronal que aprenda jugando, no un jugador basado en estrategias programadas.
- Acepta el stack vigente del repositorio.
- Entrenará en Windows, con 4 GB de RAM y sin GPU. Dispone de seis horas para el entrenamiento.
- Le interesa observar pastoreo de enemigos, riesgo calculado y estrategias contraintuitivas para maximizar puntos. Mencionó el nivel 256 antes de precisar que quiere un juego original; no se ha acordado como requisito.
## Repositorio y cerebro consultado
- Inventario de la ejecución anterior: solo README.md con el título 00-tilFoundry-sandbox; no hay código ni pruebas. No se volvió a inspeccionar en esta ejecución.
- Se propuso tratarlo como proyecto nuevo; la persona pidió crearlo desde cero y aceptó el stack.
- C-2: reglas puras independientes de Phaser; renderizado sin duplicar reglas.
- C-3: BootScene, BaseScene, UIScene, LaunchScene y ResultScene; pixelArt, FIT, resolución lógica 1600×900 y temporizadores de Phaser.
- C-4: HTTP local con Node.js 22, npm run dev y build estático; publicación separada.
- C-5: pixel art original con inventario de procedencia e interfaz en español.
- C-7: TypeScript 5, Phaser 3, Vite 6.4.6, Vitest 4.1.12 y Playwright 1.65.0.
## Necesidad de fondo (inferencia pendiente de confirmación)
- Experimentar localmente con aprendizaje neuronal y observar cómo cambia el juego del agente, con mediciones de puntuación antes y después, más que reproducir Pac-Man o garantizar comportamientos específicos.
## Propuesta pendiente de aceptación
- Acotar el primer experimento a un laberinto original y medir el agente antes y después del entrenamiento frente a un jugador aleatorio usado solo como referencia.
- Tratar las seis horas como límite de entrenamiento, no como garantía de mejora ni de comportamiento emergente.
- No incluir llegar al nivel 256 ni reproducir el fallo del juego original en esta primera versión.
## Supuestos
- No se ha fijado biblioteca neuronal, algoritmo, tamaño de red ni presupuesto de memoria.
- No se asume que las seis horas deban consumirse durante la construcción ni que la sesión aislada equivalga al equipo de la persona.
## Pendiente de verificar y acordar
- Confirmación del resumen y del alcance inicial propuesto.
- Reglas concretas, progresión, métricas, semillas y criterios de aceptación reproducibles.
- Viabilidad y consumo real en Windows con 4 GB de RAM y sin GPU; no medidos.
- Cómo guardar y reanudar entrenamiento y observar al agente.
## Límites comunicados
- No se garantiza mejora tras seis horas, pastoreo, maniobras al límite o sacrificios aprendidos.
- Publicar el juego es un trabajo separado según C-4.
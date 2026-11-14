---
id: "issue-8/discovery"
tipo: "discovery"
titulo: "Discovery confirmado: laberinto original y aprendizaje neuronal local"
version: 1
estado: "borrador"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "aabbdfbaec0a89ee4ba98765970961588f7ebadd", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 28618, "tokens_salida": 893, "monto_ia": 0.017876, "minutos_computo": 0, "monto_computo": 0.0}
---
## Lo que la persona dijo y confirmó
- Crear desde cero un juego original de laberinto con nombre, personajes y arte propios, píldoras, píldoras de poder y enemigos con modos de persecución y dispersión.
- Usar una red neuronal que aprenda jugando, no estrategias programadas como jugador principal.
- Acepta el stack vigente del repositorio y el desarrollo desde cero.
- Entrenar localmente en Windows con 4 GB de RAM, sin GPU, con límite de seis horas.
- Confirmó el resumen y el alcance inicial: un solo laberinto original, guardar la red y verla jugar, comparar puntuación antes y después y frente a una referencia aleatoria; sin meta del nivel 256 ni reproducción del fallo original.
- Pastoreo, riesgo calculado y estrategias contraintuitivas son intereses de observación, no resultados garantizados.
## Repositorio y cerebro consultado
- Proyecto nuevo confirmado a partir del inventario anterior: solo README.md, sin código ni pruebas; no se volvió a inspeccionar en esta ejecución.
- C-2: reglas puras independientes de Phaser y renderizado sin duplicarlas.
- C-3: BootScene, BaseScene, UIScene, LaunchScene y ResultScene; pixelArt, FIT, resolución lógica 1600×900 y temporizadores de Phaser.
- C-4: HTTP local con Node.js 22, npm run dev y build estático; publicación separada.
- C-5: pixel art original con inventario de procedencia e interfaz en español.
- C-7: TypeScript 5, Phaser 3, Vite 6.4.6, Vitest 4.1.12 y Playwright 1.65.0.
## Necesidad de fondo
- Experimentar localmente con aprendizaje neuronal y observar cómo cambia el juego del agente mediante mediciones de puntuación, sin exigir una estrategia emergente concreta. El resumen que expresa esta necesidad fue confirmado por la persona.
## Propuesta para concretar reglas, pendiente de aceptación
- Partidas con tres vidas y cuatro enemigos; puntos por píldoras y por enemigos capturados durante un poder, con bonificación creciente en cadena.
- Terminar cada partida al limpiar el único laberinto o perder las tres vidas; sin niveles adicionales en esta versión.
- Entrenamiento acelerado sin dibujar cada partida, con pausa, guardado y reanudación; reproducción visual de la red guardada por separado.
## Supuestos y datos no verificados
- No se han fijado biblioteca neuronal, algoritmo, tamaño de red, tiempos de modos ni presupuesto de memoria.
- No se asume que deban consumirse seis horas durante la construcción ni que la sesión aislada equivalga al equipo de la persona.
- No se han medido rendimiento ni memoria en Windows con 4 GB de RAM.
## Pendiente de acordar
- Confirmar las reglas propuestas y la forma de entrenar y observar.
- Fijar métricas, semillas, recompensas y criterios de aceptación reproducibles en la spec.
## Límites
- Las seis horas son límite del experimento, no garantía de mejora, pastoreo, maniobras al límite ni sacrificios aprendidos.
- La publicación queda fuera según C-4.
---
id: "issue-8/discovery"
tipo: "discovery"
titulo: "Discovery confirmado: reglas y entrenamiento separado de la visualización"
version: 1
estado: "borrador"
solucion: "issue-8"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "2e38feb0560da5e2dd3b047e3e7ff339bca9a984", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 43785, "tokens_salida": 1183, "monto_ia": 0.023387, "minutos_computo": 0, "monto_computo": 0.0}
---
## Lo que la persona dijo y confirmó
- Juego original de laberinto desde cero, con nombre, personajes y pixel art propios, píldoras, poderes y enemigos con persecución/dispersión.
- Red neuronal que aprenda jugando como jugador principal; estrategias programadas solo para controlar enemigos y una referencia aleatoria para evaluar.
- Respeta el stack vigente. Confirma proyecto nuevo y un único laberinto, sin nivel 256 ni reproducción del fallo original.
- Entrenamiento local en Windows, 4 GB de RAM, sin GPU, con límite de seis horas.
- Confirmó tres vidas, cuatro enemigos, puntuación por píldoras y capturas con bonificación creciente; final al limpiar el laberinto o perder las vidas.
- Confirmó entrenamiento sin dibujar partidas, con pausa, guardado y reanudación, y visualización posterior de la red guardada.
## Necesidad de fondo
Experimentar con aprendizaje neuronal local y observar su evolución con mediciones de puntuación antes/después y frente a una referencia aleatoria, sin prometer comportamientos emergentes concretos.
## Repositorio y cerebro consultado
- Inventario actual: solo README.md, con título del repositorio; sin código, dependencias ni pruebas. Proyecto nuevo confirmado por la persona.
- Se respetan C-2, C-3, C-4, C-5 y C-7; no se propone migración.
## Inferencias
- Una red pequeña calculada en CPU y un entrenamiento independiente del renderizado son apropiados para explorar la viabilidad en ese equipo.
- La comparación debe usar semillas fijas y registrar resultados aunque no haya mejora.
## Supuestos y no verificado
- No se conocen CPU ni navegador instalado; no se ha medido rendimiento o consumo total en Windows de 4 GB.
- Las seis horas son un límite del experimento, no una promesa de convergencia, pastoreo o mejora.
- Algoritmo, recompensas, límites de episodios y contratos se proponen en la spec para aprobación, no se presentan como acuerdos previos.
## Límites
Un laberinto; sin niveles adicionales, backend, GPU, publicación ni garantía de maniobras al píxel o sacrificios aprendidos. La entrega será código y evidencia reproducible; la ejecución de seis horas en el equipo de la persona quedará pendiente si no se mide allí.
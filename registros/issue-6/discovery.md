---
id: "issue-6/discovery"
tipo: "discovery"
titulo: "Discovery en curso: requisitos completos y decisiones de tiempo y fallo pendientes"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "f7e1212f30daaeb3f2d9d90b9383fc114fb895bf", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 27242, "tokens_salida": 926, "monto_ia": 0.021769, "minutos_computo": 0, "monto_computo": 0.0}
---
## Lo que la persona dijo
- Público: jugadores casuales de 13 años en adelante; gestión ligera y espacio sin conocimientos técnicos previos.
- Experiencia: dirigir toda la base a la vista, decidir el orden de las acciones, observar consecuencias y disfrutar el despegue como recompensa. Aprender dependencias, priorización y utilidad de reparar y verificar.
- Primer nivel en español, pixel art original, partidas objetivo de 10 a 15 minutos, comprensión sin tutorial largo y fallos explicados para reintentar.
- Confirma proyecto desde cero, sin código ni gráficos externos. Todos los gráficos se crean y guardan en el repositorio.
- Ejecución local con npm run dev y generación estática con npm run build. Hosting no elegido; publicar queda para otro trabajo.
- Recuperó el resto del pedido: Phaser 3 con versión exacta estable, Vite, Vitest, reglas en módulos puros de TypeScript/JavaScript independientes de Phaser; escenas BootScene, BaseScene, UIScene, LaunchScene y ResultScene. Animaciones con spritesheets y this.anims; tweens para ascenso y progreso; eventos de this.time, sin setInterval.
- Base visual de 1600×900, pixelArt y escalado FIT; escritorio obligatorio, móvil deseable. Paleta azul marino/gris con cian, naranja, amarillo y verde; tipografía pixel o monoespaciada.
- Guardado en localStorage y audio elaborados opcionales. Sin niveles posteriores, multijugador, backend ni cuentas.
- Criterios recibidos completos: pantalla con todos los paneles y nueve salas; cuatro fases; reloj y ventana; descuento de recursos; dos reparaciones con efectos; ángulo y validación; habilitación del lanzamiento; despegue y resultado con puntaje; tests de reglas y README.
- La persona indica que la descripción textual completa del mockup sirve como referencia aunque no se pueda leer la imagen. Compartió enlace https://github.com/user-attachments/assets/2fb5fec0-284f-47fa-adf7-7c6f87cea68c.
## Evidencia del repositorio
Inventario previo: únicamente README.md con el título del proyecto. Sin implementación, dependencias ni pruebas. La persona confirmó greenfield.
## Inferencias
Conviene priorizar decisiones comprensibles y consecuencias visibles frente a una simulación exhaustiva. El tiempo por acciones y un resultado sin azar oculto podrían favorecer el aprendizaje; son propuestas, no acuerdos.
## Supuestos
No hay fórmulas de balance ni duración de acciones aprobadas. Los 10 a 15 minutos son una meta de experiencia, no una duración comprobada.
## No verificado y preguntas pendientes
- El enlace de la imagen está disponible como texto, pero la imagen no se ha visualizado con las herramientas disponibles. La descripción textual está autorizada como referencia.
- Falta acordar si el reloj avanza continuamente o solo por acciones y espera explícita.
- Falta elegir fallo o reprogramación al perder la ventana y resultado determinista o probabilístico.
- Después habrá que concretar costos, duraciones, diseño, clima, cálculo de consumo y puntaje.
## Estado del discovery
Requisitos recuperados. Sigue pendiente presentar y confirmar el resumen completo antes de escribir la spec. No hay spec aprobada y el cerebro está vacío; la primera spec fijará Phaser 3, Vite, pruebas y ejecución local/estática.
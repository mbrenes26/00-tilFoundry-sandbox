---
id: "issue-4/discovery"
tipo: "discovery"
titulo: "Discovery inicial: experiencia de exploración y estado del repositorio"
version: 1
estado: "borrador"
solucion: "issue-4"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "324751adcb0949519b34f3e457e737db47fe26c8", "modelo": "gpt-6.1-sol"}
---
Trabajo: issue-4. Estado vigente proporcionado por Core: DISCOVERING. Riesgo declarado: medium.

Lo que dijo la persona: quiere una primera vista de un juego de navegador en pixel art con toda la nave visible, seis salas nombradas (Puente de Mando, Laboratorio, Soporte Vital, Habitaciones, Almacén y Sala de Máquinas), astronauta con movimiento fluido mediante flechas, cinco barras de recursos con porcentajes, panel de objetivos e interacción mediante E al acercarse a una sala para mostrar su nombre. Debe funcionar abriendo un HTML sin instalar nada. Busca sensación de estar dentro de una nave, curiosidad por las salas y una misión sugerida por paneles que todavía no cambian. Excluye por ahora despegue, inventario, mapa adicional, consumo de recursos y objetivos completables.

Evidencia del repositorio: listar_archivos devolvió únicamente README.md; su contenido es el título «00-tilFoundry-sandbox». No se encontró implementación, stack, pruebas ni instrucciones de ejecución. Se propone clasificarlo como greenfield (proyecto desde cero), pendiente de confirmación humana.

Inferencia: esta entrega es un prototipo de exploración visual, no una simulación de recursos ni un sistema de misiones funcional.

Supuestos: ninguno aprobado sobre distribución espacial, valores de recursos, textos de tareas o comportamiento exacto de las puertas.

No verificado: se conocen los enlaces a las dos referencias adjuntas, pero no se ha inspeccionado su contenido visual con las herramientas disponibles. No existe un registro de cerebro accesible mediante leer_registro(tipo=cerebro). No existe spec-solucion.

Pendiente inmediato: confirmar que el proyecto empieza desde cero y definir si el astronauta permanece en el pasillo o entra también en las salas. Este registro es parcial y no constituye un discovery confirmado ni una spec aprobada.
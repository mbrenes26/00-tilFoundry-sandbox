---
id: "issue-6/discovery"
tipo: "discovery"
titulo: "Discovery confirmado: misión determinista con bloqueos y riesgos"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "545b26267f2621dc07d8f58527c4b086d137037c", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 36953, "tokens_salida": 1356, "monto_ia": 0.032655, "minutos_computo": 0, "monto_computo": 0.0}
---
## Necesidad de fondo
Crear un primer nivel de gestión espacial accesible para jugadores casuales de 13 años en adelante. El jugador debe sentirse al mando, aprender a priorizar tiempo y recursos y experimentar consecuencias explicables al omitir reparaciones o verificaciones.

## Lo que la persona confirmó
- Confirma el resumen presentado en el issue #6, salvo la propuesta de bloquear todos los lanzamientos inválidos: esa propuesta queda descartada.
- Bloqueos físicos: nave diseñada, trayectoria calculada y combustible cargado. Impiden lanzar y se explica qué falta.
- Riesgos: ángulo fuera de 72° ±2°, bomba o antena sin reparar y clima desfavorable. Permiten lanzar, pero causan fallo determinista.
- Las verificaciones revelan riesgos. Si se hicieron, lanzar con riesgos exige un aviso y confirmación; si se omitieron, no aparece ese aviso. Omitirlas por sí solo no es causa de fallo.
- Éxito sin bloqueos ni riesgos y dentro de 10:00–11:00; fallo al lanzar con riesgos; fallo al perder la ventana.
- Puntaje desglosado por presupuesto, repuestos, tiempo sobrante y precisión. Pruebas de una secuencia ganadora, cada riesgo y pérdida por tiempo.
- Reloj desde 08:30, solo por acciones y Esperar, duración visible antes de confirmar; pronóstico fijo visible. Partida real de 10–15 minutos como meta por comprobar.
- Pantalla completa descrita en el issue, nueve salas, cinco escenas Phaser, gráficos originales en pixel art, español y escritorio. Guardado local, móvil y audio elaborado no obligatorios.
- Greenfield confirmado: solo README.md, nuevamente leído en esta ejecución. Sin código, dependencias, recursos ni tests existentes. Ejecución local y build estático; publicación fuera del alcance.

## Inferencias
- Las fases deben orientar sin impedir saltarse reparaciones y verificaciones; la secuencia estrictamente obligatoria propuesta en el pedido inicial no puede impedir los lanzamientos arriesgados que la persona ahora solicita.
- Se puede ganar sin consultar el clima o ejecutar verificaciones si las condiciones reales son correctas. El checklist distingue objetivos realizados de condiciones de éxito.

## Propuestas para la spec, no aprobadas todavía
Costos, duraciones, perfiles de diseño, fórmulas, calendario climático, desglose de puntaje y contratos entre componentes se fijarán explícitamente en la spec. No son datos previamente acordados.

## Supuestos y no verificado
No se ha visualizado ninguna imagen adjunta. La persona autorizó usar la descripción textual. No hay implementación ni pruebas ejecutadas. Las versiones propuestas de dependencias y el balance deberán verificarse durante la construcción; la duración real requiere jugar.

## Estado
Discovery confirmado con cambio explícito de interpretación. Se prepara la primera spec para revisión humana, que iniciará el cerebro con el stack. Nada se construye antes de su aprobación.
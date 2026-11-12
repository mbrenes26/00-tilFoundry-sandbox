---
id: "issue-6/discovery"
tipo: "discovery"
titulo: "Discovery para confirmar: preparación determinista de una misión espacial"
version: 1
estado: "borrador"
solucion: "issue-6"
confidencialidad: "interna"
procedencia: {"rol": "agente:manager-producto", "commit": "187bc6ea51fab0ab066d733f3420e935f5e8b46c", "modelo": "gpt-6.1-sol"}
costo: {"proveedor": "azure-foundry", "tokens_entrada": 20325, "tokens_salida": 1338, "monto_ia": 0.027012, "minutos_computo": 0, "monto_computo": 0.0}
---
## Necesidad de fondo
Crear un primer nivel accesible de gestión espacial donde jugadores casuales de 13 años en adelante se sientan al mando, aprendan a priorizar dependencias y recursos y vean el despegue como recompensa de una preparación cuidadosa.

## Lo que la persona dijo
- Partidas objetivo de 10 a 15 minutos, interfaz en español, sin tutorial largo, consecuencias visibles y fallos concretos con reinicio.
- Base completa en una vista: barra superior y fases, seis recursos, ocho objetivos, nueve salas, plataforma y paneles inferiores descritos en el issue. Diseño base 1600×900, escritorio obligatorio, móvil deseable.
- Cuatro fases: planificación, preparación, verificaciones y lanzamiento. Dos reparaciones (bomba y antena) afectan propulsión, comunicación y estado general. Ángulo de 45° a 90°, recomendado 72° con tolerancia ±2°. Consumo y tiempo a órbita dependen del diseño y del ángulo.
- Recursos iniciales: presupuesto $1.000.000, combustible 120.000 L, oxígeno 30.000 L, agua 10.000 L, alimentos 2.000 kg y repuestos 50 u.
- Reloj desde Día 1, 08:30; avanza exclusivamente por acciones y Esperar, nunca por pensar o explorar. Antes de confirmar cada acción se muestra su duración. Reparaciones y carga muestran progreso.
- Ventana 10:00–11:00; perderla termina la partida, sin reprogramación. Resultado determinista, sin tirada de azar: preparación correcta implica éxito. Resultado explica causas concretas y ofrece reiniciar.
- Pronóstico climático fijo y visible en Meteorología, para decidir cuándo esperar. Viento en aumento después de 10:40 es un ejemplo, no un calendario definitivo aprobado.
- El balance debe permitir completar la preparación con un margen pequeño; un jugador cuidadoso siempre puede ganar y el orden de las decisiones debe importar.
- Proyecto desde cero confirmado; todos los gráficos originales se crean y guardan en el repositorio. La descripción textual completa del mockup está autorizada como referencia.
- Phaser 3 con versión exacta estable, Vite, Vitest y módulos puros de reglas en TypeScript/JavaScript independientes de Phaser. Escenas BootScene, BaseScene, UIScene, LaunchScene y ResultScene; spritesheets con this.anims, tweens para ascenso/progreso, temporizadores this.time sin setInterval, pixelArt y escalado FIT.
- Ejecución local con npm run dev y generación estática con npm run build. Hosting no elegido; despliegue fuera de alcance.
- Sin niveles posteriores, multijugador, backend ni cuentas. Guardado local, móvil y audio elaborado no obligatorios. Reprogramación y probabilidad de fallo reservadas para niveles posteriores.

## Repositorio y evidencia
Inventario actual: únicamente README.md. No hay implementación, dependencias, gráficos ni tests. La persona confirmó greenfield. Cerebro vacío; la primera spec deberá fijar stack, versiones mayores, pruebas y ejecución, respetando Phaser 3/Vite/Vitest y proponiendo TypeScript.

## Inferencias y propuesta que requieren confirmación
- La necesidad prioriza decisiones comprensibles sobre realismo físico exhaustivo.
- Para conciliar el botón habilitado solo cuando corresponde con los ejemplos de fallo, se propone bloquear un lanzamiento inválido y explicar sus impedimentos (ángulo, reparación, combustible, clima o ventana). Una preparación correcta no fallaría por azar; perder la ventana sí llevaría a resultado de fallo. Esta interpretación aún no está aprobada.
- La spec propondrá costos, duraciones, ajustes de diseño, fórmulas de consumo/órbita, calendario climático y puntaje explícitos y verificables, incluyendo una secuencia ganadora y margen. No se consideran acordados valores que no dio la persona.

## Supuestos y no verificado
- No se ha visualizado ninguna de las imágenes enlazadas; se trabajará con la descripción textual autorizada. Último enlace recibido: https://github.com/user-attachments/assets/61d5d7ca-5881-40ad-a992-72141a1847d8.
- Los 10 a 15 minutos son una meta que requiere comprobación jugando, no una duración garantizada.
- No hay balance, fórmulas ni versiones concretas de dependencias aprobadas; no hay pruebas ejecutadas ni implementación.

## Estado y próximo paso
Discovery presentado para confirmación. Todavía no hay spec aprobada. Tras confirmar el resumen y la interpretación del lanzamiento, se redactará la spec completa para aprobación humana, con alcance y criterios comprobables.
# I-1/I-2: tablero observable a 390 px

## Cambio de presentación
- `src/scenes/BaseScene.ts`: cámara desplazada (60,80) en teléfono, escala de actores 2,5; escritorio mantiene cámara (0,0) y escala 2. Listener de redimensionado retirado al cerrar escena. Coordenadas del mapa y reglas sin cambios.
- `src/style.css`: canvas FIT con ancho doble del teléfono; el contenedor recorta únicamente la zona derecha ajena al tablero. El tablero completo permanece visible. HUD y controles siguen en el flujo del documento, sin paneles con desplazamiento interno.
- Se conservan resolución lógica 1600×900, FIT, pixelArt, cinco escenas, animaciones, tweens y temporizadores Phaser. `src/main.ts`, motor, inferencia y pesos no se editaron. No cambia ninguna interfaz o contrato documentado; README no requiere actualización por este ajuste de presentación.

## TDD y comandos reales de esta ejecución
- `npm ci && npx playwright install chromium && npm run test:e2e -- tests/browser/presentation.spec.ts --grep 'arte opaco'`: salida 1. Instalación correcta; rojo del criterio: esperado ancho de tablero >=350, recibido 185,25.
- Tras implementar: `npm run test:e2e -- tests/browser/presentation.spec.ts --grep 'arte opaco'`: salida 0, 1 prueba aprobada.
- Primera ejecución conjunta de los tres archivos: 12 aprobadas, 4 fallidas. Dos aserciones móviles comparaban coordenadas medidas antes y después de desplazar el documento; las otras dos agotaron 30 segundos en importaciones. Corrección: comparar coordenadas del mismo snapshot y conceder 60 segundos a las pruebas de reproducción/importación. No se rebajaron los umbrales geométricos.
- `npm run test:e2e -- tests/browser/playback.spec.ts`: salida 0, 6 aprobadas.
- `npm test && npm run build && npm run test:e2e`: salida 2. `npm test` aprobó 4 pruebas de configuración y 200 Vitest (17 archivos); build detectó dos parámetros implícitos any en las nuevas aserciones. Se tipó el resultado de actores del helper.
- `npm run build && npm run test:e2e`: salida 0. Build correcto; 18 pruebas Chromium aprobadas (1,7 minutos). Aviso de Vite: bundle mayor de 500 kB, no error. La instalación informó una vulnerabilidad low existente; no se cambiaron dependencias.
- `node --version`: v22.23.5. Pruebas por HTTP en 127.0.0.1:5173, sesión aislada. Las salidas íntegras y códigos los registra Core; este documento no reconstruye evidencia histórica.

## Medidas CSS obtenidas en Chromium
El helper `geometry.ts` mide el tablero y el arte opaco: obtiene los píxeles alpha de cada frame del atlas y los proyecta a su escala CSS, sin contar márgenes transparentes como personaje.

| Medida | Rojo 390×844 | Verde 390×844 | Escritorio 1600×900 |
|---|---:|---:|---:|
| Tablero | 185,25×146,25 | 370,5×292,5 | 760×600 |
| Casilla | 9,75 | 19,5 | 40 |
| Frame de actor | 7,8 | 19,5 | 32 |
| Luciérnaga opaca, ancho según frame | 5,85 | 14,625–17,0625 | 24–28 |
| Luciérnaga opaca, alto | 5,85 | 14,625 | 24 |
| Cada guardián opaco | 4,875×5,3625 | 12,1875×13,40625 | 20×22 |

En teléfono el tablero ocupa x=9,75 a 380,25; no se recorta ninguna de las 19 columnas ni 15 filas. Canvas CSS 780×438,75, visible solo en el ancho del documento 390; no se deforma su relación 16:9. El HUD queda debajo del canvas. En escritorio tablero y panel permanecen separados y el HUD encima del tablero.

## Capturas finales revisadas visualmente
Las seis capturas siguientes se generaron por la suite final y se revisaron con `ver_captura`. Fixture PolicyV1 sintética de red inicial, sin entrenamiento; no evidencia de aprendizaje.

- `observable-390-import.png`: política válida, inicio habilitado y semilla 0. Tablero entero; luciérnaga de silueta estrecha/clara y guardianes naranja, amarillo, violeta y celeste identificables por color y posición. Las siluetas de los cuatro guardianes son similares, como en el arte original; sus detalles siguen siendo pequeños. HUD y controles completos y separados.
- `observable-390-playback.png`: paso 100, 720 puntos y una vida. Tablero entero y actores distinguibles; cinco indicadores legibles, pausa/reanudación, selector y botones separados.
- `observable-390-final.png`: final real, paso 114, 720 puntos y cero vidas. Tablero completo, cinco figuras visibles, resumen y reinicio legibles.
- `observable-1600-import.png`, `observable-1600-playback.png`, `observable-1600-final.png`: tablero, actores, HUD y panel completos y legibles, sin superposición. La revisión observó una franja negra sobre el panel en inicio/reproducción; no tapa contenido y no se atribuye su origen sin comprobación.
- Observación visual común en móvil: espacio vacío amplio entre tablero y HUD; no oculta información. No se afirma detalle perfecto de sprites ni diferenciación de guardianes por siluetas únicas.

## Regresiones y límites
- `presentation.spec.ts`: rojo/verde de tablero y cinco actores opacos visibles; mantiene verificaciones de cinco escenas, inventario original, APIs de presentación y dibujo sin mutar estado.
- `resize.spec.ts`: secuencia 390 → 1600 → 390 → 1600; tablero y actores completos, HUD/panel separados, sin desbordamiento horizontal y estado idéntico. Prueba de teclado: Tab y foco en semilla/inicio, Enter para iniciar, Space para pausar, flechas para 4×/1×, Tab/Enter para reinicio y `:focus-visible` confirmado.
- `playback.spec.ts`: cinco indicadores contrastados con motor puro; 100 acciones y trayectoria exactas; pesos intactos; pausa y velocidad sin alterar evolución, ritmo real 1×/4×, reinicio y final real conservados. Las capturas de reproducción se toman tras terminar tweens con la simulación pausada.
- Pendientes: ejecución y rendimiento Windows con 4 GB, entrenamiento de seis horas y aprendizaje efectivo. Chromium en la sesión no los verifica. La aceptación visual final corresponde a auditoría, no a esta evidencia del constructor.

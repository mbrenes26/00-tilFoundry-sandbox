# I-1/I-2 · revisión visual móvil del constructor

- Base: commit c608624; paso exclusivo `rework-ui-verificacion-visual-390`.
- **Reserva visual confirmada: no considero inequívoca la identidad de luciérnaga a tamaño real.** Tablero y cinco actores son localizables; los cuatro guardianes se distinguen por color y silueta compacta. La figura del jugador comparte tonos menta/celestes y apariencia de destello con los poderes. Sus salientes/alas y cuerpo vertical no resuelven consistentemente su reconocimiento como insecto en ambos frames.
- Coincide con la reserva histórica en `../identity-verificacion.md`; no ratifica la aceptación visual de `../rework-tablero-390.md`. Se conservan ambos documentos como historia. No es una nueva regresión funcional ni ausencia del sprite.

## Ejecución real

- Node v22.23.5; instalación local `npm ci --ignore-scripts` y `npx playwright install chromium`, sin cambiar dependencias. npm informó una vulnerabilidad baja; no se aplicó corrección fuera de alcance.
- Único diagnóstico ejecutado: `npm run test:e2e -- tests/browser/playback.spec.ts --grep 'rework 390px.*diagnóstico visual' --workers=1`.
- Salida 0: `1 passed (10.2s)`; prueba móvil, 7.3 s. Evidencia Core, salida 2.
- HTTP `http://127.0.0.1:5173`, Chromium 158.0.8127.18, viewport 390×844. PolicyV1 sintética válida (red semilla 123, cero entrenamiento), partida semilla 42. Validez comprobada por `#start` habilitado en la prueba, no deducida de la imagen.
- Diagnóstico existente: importa normalmente, avanza `LaunchScene.pulse()` del juego, pausa simulación y avanza presentación 100/200 ms. No fuerza estados, colores ni frames; no aprende ni explora. No se cambió test o implementación. Rojo/verde nuevo no aplica: revisión visual sin nuevas aserciones, no se inventa rojo.

## Medidas y estado

- Geometría ya medida y confirmada sobre c608624 (conversación del issue, evidencia del paso 2): tablero x=9.75, y=153, 370.5×292.5 px; casilla 19.5 px; arte opaco jugador 14.625×14.625 px y guardianes 12.1875×13.40625 px. No se repitió esa prueba en este paso ni se usa como prueba de reconocimiento.
- Medición nueva del diagnóstico: los cinco frames transparentes miden 19.5×19.5 px; todos `visible=true`; centros reales iguales a esperados en las seis muestras y cero tweens del jugador. JSON adjuntos y evidencia Core, salidas 2 y 3.
- Jugador: centro (39,182.25), casilla (1,1) en los tres estados. Inicio: frames 1/0; reproducción y final: 0/1.

| Estado | Tick | Puntos / vidas | Centros guardianes 1, 2, 3, 4 (px) |
| --- | --- | --- | --- |
| Inicio importado | 0 | 0 / 3 | (351,182.25), (39,416.25), (351,416.25), (195,299.25) |
| Reproducción pausada | 100 | 720 / 1 | (273,182.25), (78,377.25), (312,377.25), (136.5,279.75) |
| Final perdido | 114 | 720 / 0 | (351,182.25), (39,416.25), (351,416.25), (195,299.25) |

## Seis capturas revisadas a escala real, sin ampliaciones

Todas las rutas siguientes están en esta carpeta. Se revisaron únicamente los seis PNG de viewport 390×844 mediante la herramienta visual; no se inspeccionaron recortes ampliados ni escritorio.

| Captura | Observación visual |
| --- | --- |
| `identity-390-import-0-viewport.png` | Tablero completo; jugador claro con salientes laterales. Comparte color y aspecto pixelado con cruces menta; no inequívocamente luciérnaga. Cuatro guardianes separados. |
| `identity-390-import-1-viewport.png` | Cuerpo vertical claro con salientes superiores; no se resuelven rasgos finos. Diferencia respecto a poderes principalmente por silueta, no color. No resuelve ambigüedad. |
| `identity-390-playback-0-viewport.png` | Centro claro/amarillo y píxeles menta del jugador destacan, sin silueta inequívoca de insecto. Guardianes compactos con marcas oscuras internas y borde dentado perceptibles; HUD completo, 720 puntos y paso 100. |
| `identity-390-playback-1-viewport.png` | Figura localizable pero también interpretable como cruz/destello; alas sugeridas, antenas/abdomen no claramente reconocibles. Poderes comparten color/brillo. |
| `identity-390-final-0-viewport.png` | Cinco figuras separadas y tablero completo; jugador tiene silueta distinta pero identidad difícil. Resumen perdido y 720 puntos / 0 vidas / 114 pasos legibles. |
| `identity-390-final-1-viewport.png` | Silueta ramificada sugiere insecto y difiere de cruces compactas; aun así identidad específica de luciérnaga no inequívoca. No contradice la reserva común a las seis muestras. |

- Guardián 1 naranja/rojo: cuerpo ancho y compacto con detalles oscuros; contraste alto frente al suelo oscuro.
- Guardián 2 violeta: cuerpo compacto, separado de poderes y muros, reconocible por color en región inferior izquierda.
- Guardián 3 celeste: cuerpo compacto más ancho que cruces; comparte tonalidad con poderes, pero separación y silueta permiten diferenciarlo.
- Guardián 4 amarillo: cuerpo compacto en centro/centro-izquierda, contraste alto. Guardianes no tienen siluetas individuales claramente únicas a esta escala; su diferenciación principal es cromática. Colores/identidades se vinculan con centros registrados, no se asignan por el orden de enumeración visual.
- Los muros azulados permiten leer caminos; ningún actor ni borde del tablero está recortado o superpuesto. Los cinco indicadores se leen completos en los tres estados.
- La tarjeta inferior continúa fuera del viewport: inicio no muestra confirmación visible de política, reproducción corta texto inferior y final no muestra el cierre de tarjeta. Las imágenes no acreditan controles completos ni scroll; no se verificaron controles en este paso. No se diagnostica este recorte como superposición del tablero.
- Estimaciones visuales de tamaño no sustituyen mediciones numéricas; las medidas tampoco sustituyen este juicio de reconocimiento.

## Conservación, alcance y corte

- Evidencia antigua respaldada durante regeneración y restaurada byte a byte: `sha256sum -c` comprobó 100 archivos previos, salida 0. Los hashes de `src/scenes/BaseScene.ts`, `src/style.css` y `tests/browser/playback.spec.ts` permanecieron iguales, salidas 1/2.
- Se guardan en esta carpeta seis viewport PNG nuevos, seis JSON diagnósticos y `sha256.txt`. Documentos completos y recortes generados automáticamente no se revisaron ni se incorporaron a la entrega de este paso; las variantes históricas siguen intactas.
- **Corte: seis de seis capturas revisadas.** No se solicitan más inspecciones en esta ejecución. No se comprobó escritorio, resize, teclado ni suite completa/build: corresponden a pasos posteriores. Teléfono físico y Windows siguen sin verificar.
- Defecto comunicado al manager sin corregir: I-1/I-2 requiere reforzar reconocimiento de la luciérnaga respecto a los poderes (posible arte `public/assets/actors.svg` o presentación `src/scenes/BaseScene.ts`). Esos cambios no están permitidos en ESTE paso. No se solicita transición ni se aprueba la entrega.

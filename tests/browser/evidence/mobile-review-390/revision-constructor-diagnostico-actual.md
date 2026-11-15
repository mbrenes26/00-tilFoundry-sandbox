# I-1/I-2 · diagnóstico móvil sobre a3d909a

- Paso único: `rework-ui-verificacion-visual-390`. Conclusión del constructor: **tablero y cinco actores visibles, pero persiste la ambigüedad de la luciérnaga a escala nativa**; no se declara resuelto el bloqueo visual. Los guardianes se distinguen principalmente por color, no por cuatro siluetas únicas.
- Se inspeccionaron seis capturas existentes HTTP Chromium 390×844 de `mobile-review-390`, sin recortes ni ampliaciones. Su procedencia es el diagnóstico de Core del comentario #136. SHA-256 verificado en esta ejecución: doce archivos OK. No se inspeccionaron las imágenes regeneradas por el diagnóstico actual; se restauraron los originales para conservar evidencia.
- PolicyV1 válida sintética: red semilla 123, cero entrenamiento; partida semilla 42. `import` representa política cargada y estado inicial tick 0, no una partida ya iniciada por el botón. La reproducción y el final se producen mediante `LaunchScene.pulse()` del juego; no se inyectan posiciones ni frames. No es evidencia de aprendizaje.

## Inspección visual propia (seis de seis)

Rutas relativas a esta carpeta:

| Captura | Rasgos visibles y estado |
| --- | --- |
| `identity-390-import-0-viewport.png` | Jugador blanco/menta pequeño, con salientes horizontales y prolongación vertical; no se reconoce con seguridad como insecto. Guardianes naranja/violeta/celeste/amarillo compactos, con detalles interiores y base irregular. Tablero entero; HUD 0 puntos, 3 vidas, dispersión, poder 0, paso 0. Control inferior cortado por viewport. |
| `identity-390-import-1-viewport.png` | Jugador alargado claro, identidad de luciérnaga no inequívoca. Guardianes distinguibles por color/posición frente a marcas turquesa más pequeñas. Tablero y cinco indicadores completos; control inferior fuera de imagen. |
| `identity-390-playback-0-viewport.png` | Jugador verde claro separado del fondo, detalles finos insuficientes para reconocer insecto. Cuatro guardianes de cuerpo compacto, diferenciados por color. Tablero sin recortes; HUD 720 puntos, 1 vida, dispersión, poder 0, paso 100. Texto inferior de semilla cortado. |
| `identity-390-playback-1-viewport.png` | Jugador blanco/turquesa con forma de T/cruz y salientes laterales: comparte tono y cierta forma con poderes pequeños. Guardianes cuadrados, con detalles semejantes a ojos, completos. Cinco indicadores legibles iguales a muestra 0. |
| `identity-390-final-0-viewport.png` | Figuras pequeñas de colores separadas de símbolos menta; reconocimiento por forma limitado. Tablero completo. HUD 720 puntos, 0 vidas, paso 114; «Sin vidas restantes» y resumen coincidente legibles. Cierre inferior de tarjeta no visible. |
| `identity-390-final-1-viewport.png` | Jugador celeste con cuerpo/apéndices esquemáticos, aún ambiguo como luciérnaga. Guardianes naranja/violeta/celeste/amarillo visibles. HUD y resumen completos; tarjeta continúa fuera de imagen. |

- Guardián 1 naranja: cuerpo compacto, detalles oscuros, pequeñas prolongaciones inferiores; inicio/final arriba derecha, reproducción arriba hacia el centro.
- Guardián 2 violeta: cuerpo compacto y detalles claros interiores, abajo izquierda al inicio/final.
- Guardián 3 celeste: cuerpo compacto, interior oscuro y base irregular, abajo derecha al inicio/final; comparte tono con jugador/poderes, pero es más ancho.
- Guardián 4 amarillo: cuerpo compacto con detalles oscuros, zona central; buen contraste cromático.
- Poderes: símbolos turquesa simples más pequeños; la diferencia con guardianes es más evidente que con el jugador. No se exige ni se atribuyen poderes individuales a los guardianes.
- Los muros tienen contraste moderado; pasillos, puntos y perímetro se distinguen. No se ve ningún actor cortado ni superpuesto. Los cortes inferiores no prueban inaccesibilidad: controles y desplazamiento quedan para su paso.

## Medidas y localización, no aceptación visual

- Medición previa confirmada en c608624 / evidencia Core #134: tablero (9.75,153), 370.5×292.5 px; casilla 19.5 px; arte opaco jugador 14.625×14.625 px y guardianes 12.1875×13.40625 px. No se repitió la prueba geométrica en esta ejecución.
- Los seis JSON releídos aquí confirman viewport 390×844, frames de 19.5×19.5 px, todos los actores visibles, centros iguales a esperados y cero tweens del jugador. Estos datos permiten localizar, no reconocer, los personajes.
- Jugador (39,182.25) en los tres estados. Frames importación 1/0; reproducción y final 0/1. Inicio running tick 0, 0 puntos, 3 vidas; reproducción running tick 100, 720 puntos, 1 vida; final lost tick 114, 720 puntos, 0 vidas.
- Centros guardianes 1–4 inicio/final: (351,182.25), (39,416.25), (351,416.25), (195,299.25). Reproducción: (273,182.25), (78,377.25), (312,377.25), (136.5,279.75).
- Dos muestras estáticas no certifican reconocimiento durante movimiento continuo ni todas las situaciones de la partida.

## Comandos y resultados reales de esta ejecución

- `node --version`: v22.23.5. `sha256sum -c tests/browser/evidence/mobile-review-390/sha256.txt`: salida 0, doce OK.
- `npm ci --ignore-scripts` y `npx playwright install chromium`: salida 0; instalación local sin editar dependencias. npm informó una vulnerabilidad baja; no se aplicó reparación fuera del alcance.
- Único test ejecutado: `npm run test:e2e -- tests/browser/playback.spec.ts --grep 'rework 390px.*diagnóstico visual' --workers=1`: salida 0, **1 passed (9.7s)**, prueba 6.9s. El verde acredita ejecución del diagnóstico, no distinción visual. Core conserva el comando y sus seis registros de actores/estados.
- Copia temporal de `identity-390-*` antes del diagnóstico y restauración al terminar; `sha256sum -c /tmp/issue-8-step3-before.sha256`: salida 0, **115 archivos previos intactos**. Los SHA-256 de BaseScene, estilo y playback.spec.ts coinciden antes/después.
- Lectura Node de seis JSON: salida 0, estados/centros/frames indicados arriba.
- No se añadió regresión ni se cambió test/implementación: revisión documental, sin rojo/verde nuevo. Evidencia TDD previa conservada; no se fabrica un rojo para este diagnóstico.

## Alcance y pendientes para el manager

- Único archivo nuevo: `tests/browser/evidence/mobile-review-390/revision-constructor-diagnostico-actual.md`. Toda evidencia anterior conservada, incluidos los dos informes del constructor. Sin cambios en implementación, motor, aprendizaje, dependencias ni configuración.
- Corte: seis capturas revisadas, no se solicita ninguna más. No se ejecutó suite completa, escritorio, controles, redimensionado ni build; teléfono físico, Windows y rendimiento siguen sin verificar.
- I-1/I-2: no aceptar todavía la identidad visual del jugador. Una posible corrección requiere arte `public/assets/actors.svg` (con revisión de inventario) o presentación `src/scenes/BaseScene.ts`, fuera de los archivos de este paso; no se tocaron. El manager debe replanificar antes de implementar cualquier corrección.
- Esta es evidencia del constructor; no sustituye la revisión independiente del probador ni aprueba la entrega.

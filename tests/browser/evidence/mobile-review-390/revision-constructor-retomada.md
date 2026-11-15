# I-1/I-2 · revisión móvil retomada

- Base vigente: 5ca41106216d786e1e96bc715b31f914213acbad; paso `rework-ui-verificacion-visual-390` exclusivamente.
- Conclusión propia de esta ejecución: **persiste la ambigüedad de identidad de la luciérnaga a tamaño real**. El jugador está presente y es localizable, pero su pequeño dibujo menta/claro puede interpretarse como destello y comparte tonos con los poderes. No doy por resuelto el bloqueo visual.
- Se reutilizan las seis capturas HTTP Chromium 390×844 ya guardadas en esta carpeta; no se regeneran ni se alteran. Política PolicyV1 válida sintética, red semilla 123, cero entrenamiento; partida semilla 42. La validez y origen HTTP proceden del diagnóstico registrado por Core en el comentario #136, no se deducen visualmente.

## Evidencia de esta ejecución

- Comando `sha256sum -c tests/browser/evidence/mobile-review-390/sha256.txt`: salida 0, doce archivos OK (seis viewport PNG y seis JSON).
- Lectura mediante Node de los seis JSON: salida 0; todos los actores visibles, centros iguales a esperados, frames de 19.5×19.5 px y cero tweens del jugador. Comandos y salida completa registrados por Core en esta ejecución.
- Diagnóstico móvil reutilizado: `npm run test:e2e -- tests/browser/playback.spec.ts --grep 'rework 390px.*diagnóstico visual' --workers=1`; resultado histórico real `1 passed (10.2s)`, salida 0, comentario #136. **No se volvió a ejecutar en esta revisión**. No se ejecutó ningún otro test, escritorio ni build.
- No se añadieron aserciones ni regresiones: revisión documental y visual, sin rojo/verde nuevo. No se atribuye el verde histórico a esta ejecución.

## Seis inspecciones nuevas a escala nativa, sin recortes ni ampliaciones

Rutas relativas a esta carpeta. Se revisaron ambas muestras de los tres estados con la herramienta visual, no solo los informes anteriores.

| PNG | Observación real |
| --- | --- |
| `identity-390-import-0-viewport.png` | Tablero completo. Jugador menta ramificado, parecido a Y; localizable, no inequívocamente personaje/luciérnaga. Guardianes naranja, violeta, celeste y amarillo reconocibles como criaturas compactas. HUD 0 puntos/3 vidas/paso 0 legible. |
| `identity-390-import-1-viewport.png` | Centro claro amarillento y laterales cian; figura distinta de cruces, pero no identifica claramente insecto. Cuatro guardianes completos. Tarjeta de importación continúa debajo del viewport, control verde cortado. |
| `identity-390-playback-0-viewport.png` | Jugador estrecho y vertical con salientes; identidad de insecto no inequívoca. Guardianes más anchos con base dentada, diferenciados principalmente por color. HUD 720 puntos/1 vida/paso 100 completo. |
| `identity-390-playback-1-viewport.png` | Jugador claro ramificado y poderes menta pequeños: diferencia de tamaño/silueta, sin reconocimiento inmediato de luciérnaga. Cuatro guardianes completos; texto inferior de semilla continúa fuera del viewport. |
| `identity-390-final-0-viewport.png` | Figura clara turquesa distinta de poderes pero identidad difícil; cuatro guardianes visibles y tablero entero. Resumen «Sin vidas restantes», 720 puntos/0 vidas/114 pasos legible. |
| `identity-390-final-1-viewport.png` | Jugador pequeño blanco/turquesa, identidad ambigua. Guardianes tienen rasgos de criaturas/fantasmas más reconocibles. Resumen y párrafo completos; cierre inferior de tarjeta fuera de imagen. |

- Guardián 1 naranja: arriba derecha al inicio/final y arriba durante reproducción; silueta compacta con detalles oscuros.
- Guardián 2 violeta: abajo izquierda, contrasta con el suelo.
- Guardián 3 celeste: abajo derecha, comparte tonos con poderes/jugador pero cuerpo más ancho y compacto.
- Guardián 4 amarillo: zona central, contraste alto. No se reconocen cuatro siluetas individuales únicas a esta escala; la diferenciación es principalmente cromática.
- Ningún actor, borde ni fila del tablero se ve recortado o superpuesto. Caminos y puntos visibles; muros con contraste moderado. Los cinco indicadores se leen en las seis imágenes.

## Medidas, separadas del juicio visual

- Geometría confirmada previamente sobre c608624: tablero (9.75,153), 370.5×292.5 px; casilla 19.5 px. Arte opaco jugador 14.625×14.625 px; guardianes 12.1875×13.40625 px. No se repitió esa medición ni se toma como prueba de identidad.
- JSON reconsultados: jugador centro (39,182.25) en los tres estados, frames 1/0 en importación y 0/1 en reproducción/final. Inicio tick 0, 0 puntos, 3 vidas; reproducción tick 100, 720 puntos, 1 vida; final lost tick 114, 720 puntos, 0 vidas.
- Centros guardianes 1–4 en inicio/final: (351,182.25), (39,416.25), (351,416.25), (195,299.25). En reproducción: (273,182.25), (78,377.25), (312,377.25), (136.5,279.75). Coordenadas sirven para localizar actores, no para probar reconocimiento.

## Corte y alcance

- Seis de seis capturas inspeccionadas: corte cumplido, no se solicita ninguna más.
- Único archivo nuevo: este informe. Evidencia anterior conservada; implementación, test, motor, aprendizaje y dependencias intactos. Se conserva `revision-constructor.md` sin sustituirlo.
- No se verificaron controles completos, desplazamiento vertical, teclado, cambios de tamaño, escritorio ni teléfono físico. Los recortes inferiores no prueban inaccesibilidad; se requiere el paso de controles para comprobarlo. Windows y entrenamiento efectivo siguen sin verificar.
- Comunicar al manager el bloqueo persistente I-1/I-2: reforzar la identidad del jugador frente a poderes, posiblemente en `public/assets/actors.svg` (y revisar inventario si cambia el arte) o `src/scenes/BaseScene.ts`. No se cambian: quedan fuera de los archivos permitidos de ESTE paso. La corrección necesita replanificación antes de implementar. Esta revisión no reemplaza la revisión independiente del probador ni aprueba entrega.

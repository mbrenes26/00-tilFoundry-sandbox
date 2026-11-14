# I-1/I-2: reserva visual confirmada; paso pendiente de replanificación

## Conclusión
- **No se acepta la distinción inequívoca de la luciérnaga a 390 px.** Las revisiones de las capturas móviles a escala real encuentran un actor pequeño celeste/amarillo, con identidad ambigua frente a los poderes celestes. Guardianes, píldoras y tablero son visibles. No es ausencia, recorte ni superposición del jugador.
- La frase de aceptación en `rework-tablero-verificacion.md` queda contradicha por esta revisión; se conserva ese documento y todas las imágenes anteriores como evidencia histórica.
- El recorte 4× confirma cuerpo, alas y antenas, pero **no sustituye ni certifica legibilidad a escala real**. La revisión de los dos frames iniciales y de un frame final sigue encontrando ambigüedad.
- No se modificó implementación, motor, aprendizaje ni dependencias. Se requiere replanificar el renderizado/arte antes de considerar resuelto el bloqueo.

## Método reproducible y ubicación real
- `tests/browser/playback.spec.ts`: diagnóstico adicional sin nuevas aserciones funcionales; usa fixture sintética PolicyV1, red semilla 123 sin entrenamiento, partida semilla 42. Importación/inicio normales; `LaunchScene.pulse()` produce reproducción y final reales, sin inyectar estados ni forzar frames.
- `tests/browser/evidence/identity.ts`: pausa de simulación; avance de presentación 100 ms para terminar tween y otros 200 ms para muestrear animación natural de 5 fps. Registra estado, identidad, posición, frame, centro visual y centro esperado, tamaño y tweens activos. No altera sprites, colores, zoom de juego ni pesos.
- Inicio tick 0; reproducción tick 100 (720 puntos, una vida); final lost tick 114 (720 puntos, cero vidas). En estos tres estados la luciérnaga está realmente en (1,1), no en los poderes (3,1)/(15,1).
- A 390×844: centro real/esperado (39,182.25); a 1600×900: (140,297). En las 12 muestras los centros coinciden y no quedan tweens del jugador. Frames iniciales 1/0, reproducción y final 0/1. La coincidencia de centros solo identifica dónde revisar, no demuestra distinción visual.
- Móvil: tablero 370.5×292.5, casilla 19.5; frame transparente del jugador 19.5×19.5; arte opaco medido en suite focalizada aproximadamente 14.6 px. Estas medidas tampoco constituyen aceptación visual.
- `identity-{390,1600}-{import,playback,final}-{0,1}`: `-viewport.png` conserva escala/viewport; `-document.png` incluye scroll normal; `-crop.png` es un recorte 96×96 centrado en jugador; `-crop-4x.png` es ampliación adicional 384×384 con vecinos más próximos. JSON adjunto contiene estado y coordenadas. SHA-256 de los artefactos generados en `identity-sha256.txt`.
- `identity-layout-*.png` son nuevas capturas de las pruebas de controles. No se sobrescribieron `verification-*`, `observable-*`, `rework-*` ni las demás imágenes anteriores.

## Revisión visual efectuada
- `identity-390-import-0-viewport.png`: figura en (39,182.25) localizable, pero comparte color/brillo con poderes; diferencia de silueta sutil, no inequívocamente luciérnaga. Cuatro guardianes distinguibles, sin recortes de actores.
- `identity-390-import-1-viewport.png`: segundo frame mantiene parecido celeste/centro claro con poderes; no resuelve reserva.
- `identity-390-import-0-crop-4x.png`: cuerpo vertical verde, extremo amarillo, alas azul claro y antenas; poder en cruz separado. Solo diagnóstico ampliado.
- `identity-390-playback-0-viewport.png`: figuras visibles pero identidad del jugador no clara; cinco indicadores completos. Contenido inferior continúa fuera del viewport por scroll normal.
- `identity-390-final-1-viewport.png`: jugador menos reconocible como actor que guardianes; parecido con objetos turquesa; resumen visible legible, tarjeta continúa debajo del viewport.
- `identity-390-final-0-crop-4x.png`: jugador presente con cuerpo y alas, no tapado ni superpuesto; no acredita legibilidad móvil.
- Las revisiones anteriores se efectuaron tras la primera ejecución diagnóstica; la suite focalizada regeneró los archivos. El registro de ambas ejecuciones conserva frames, centros y resultados. No se afirma una segunda inspección visual de los archivos regenerados.

## Corte de revisión visual
- Core rechazó más inspecciones por límite de capturas de la ejecución. No se insistió.
- **Sin mirar en esta revisión**: escritorio, todas las variantes `identity-1600-*`; móvil, documentos completos, recortes 1×, `import-1-crop-4x`, `playback-1-viewport`, ambos recortes ampliados de reproducción, `final-0-viewport`, `final-1-crop-4x` y `identity-layout-*` nuevos. No se certifica visualmente escritorio, documento completo ni esas variantes. Manager debe dividir la revisión pendiente.

## Pruebas reales (no TDD nuevo)
- `npx playwright test tests/browser/playback.spec.ts --grep 'diagnóstico visual' --workers=1`: salida 0, 2 aprobadas, 15.8 s.
- `npx playwright test tests/browser/presentation.spec.ts tests/browser/playback.spec.ts tests/browser/resize.spec.ts --workers=1`: salida 0, 18 aprobadas, 1.7 min. Evidencia Core, salidas 16 y 18.
- Suite focalizada cubre cinco escenas/configuración, importaciones, cinco indicadores, trayectoria frente a motor puro, pesos intactos, pausa/reanudación, velocidades, reinicio, foco/teclado y redimensionado en ambos sentidos. Su verde **no resuelve** la reserva visual.
- No se añadió una nueva aserción funcional; se añadió captura/registro diagnóstico y se renombró la prueba de geometría para no afirmar distinción que no prueba. **Rojo/verde nuevo no aplica** a esta revisión visual; no se inventa un rojo automatizado. La evidencia visual anterior constituye el fallo de I-1/I-2.
- Suites completas/build reservados al cierre; no ejecutados aquí. Windows y teléfono físico siguen sin verificar.

## Cambio requerido fuera de este paso (no aplicado)
- Criterios I-1/I-2: reforzar la identidad visual de la luciérnaga respecto al poder y al guardián celeste a tamaño móvil.
- Archivo concreto que se propone cubrir en replanificación: `public/assets/actors.svg`, definición `firefly` y sus dos frames, para mejorar separación de color/silueta preservando animación original. Su documento de procedencia `public/assets/inventory.json` debe revisarse si cambian inventario/uso.
- Si el diseño elige una ayuda en renderizado en lugar del arte, tendría que cubrir `src/scenes/BaseScene.ts` (`playerSprite`/presentación), no modificarlo durante este paso. No se necesita cambiar reglas ni inferencia.
- Ninguno de esos archivos está dentro de los archivos asignados a ESTE paso: se detiene la solución del bloqueo para que el Manager replantee el cambio. No se solicita aprobación ni transición desde constructor.

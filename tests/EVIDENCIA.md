# Evidencia de construcción — issue-4, línea nave

## Uso local
Conserva `index.html`, `styles.css` y `game.js` juntos y abre `index.html` directamente en el navegador. No hay servidor, instalación ni dependencias remotas. El ejecutor legible se abre en `tests/index.html`.

Para desarrollo, si Node.js está disponible: `node tests/game.test.js`. La verificación adicional `node tests/browser.cjs` requiere Chromium en el entorno de pruebas, usa el puerto local 9222 y genera las dos capturas. No es un requisito para jugar. La conexión de depuración local es del verificador, no del juego.

## TDD ejecutado
Antes de crear los tres archivos de implementación se escribió `tests/game.test.js` y se ejecutó `node tests/game.test.js`: salida 1, `0/12 aprobadas`; cada prueba mostró `FAIL ...: game.js todavía no implementado`.

Después de implementar: `node tests/game.test.js && node tests/browser.cjs`, salida 0, `12/12 aprobadas` y todos los controles adicionales de Chromium en verde. Core conserva las salidas completas de estos comandos. Una ejecución intermedia tuvo las 12 pruebas verdes, pero el comando posterior `git diff --stat` falló porque la sesión no contiene un repositorio Git; no se atribuye a esa ejecución un código global de éxito.

| Criterio | Test rojo y verde (`tests/game.test.js`) | Verificación adicional real |
| --- | --- | --- |
| 1 | C1: entrada local sin dependencias externas | Ejecutores y juego abiertos por `file://` con red offline; sin excepciones de ejecución ni mensajes de consola de tipo error, 0 solicitudes HTTP externas del juego. |
| 2 | C2: seis salas en filas y astronauta inicialmente confinado | Geometría DOM de escena y paneles dentro de ambas ventanas; capturas PNG reales. No valida apariencia. |
| 3 | C3: recursos, orden, valores, iconos y objetivos exactos; C3: datos permanecen estáticos | Valores e iconos en DOM, proporciones de barras con tolerancia <0,01, objetivos exactos; recursos iguales tras todo el recorrido. |
| 4 | C4: flechas/WASD y soltar; C4: intervalos/diagonal; C4: captura, scroll, blur, visibilidad y E sin repetición | Ocho teclas mantenidas por el protocolo de entrada del navegador, soltar detiene, blur sintético detiene, página no se desplaza. No fue una operación manual ni un cambio real de ventana. |
| 5 | C5: cuatro bordes y cuatro esquinas | Cuatro esquinas recorridas con teclas mantenidas 7,4 segundos; posición observada del traje en canvas: centros (70,336), (70,396), (866,336), (866,396), cuerpo 20 × 28. |
| 6 | C6: seis nombres; C6: radio 48 inclusivo/cercanía/empate; C6: sustitución y ocultamiento | Recorrido con teclas y E por las seis puertas; nombres exactos, mensaje visible; al alejarse se oculta y E lejana no activa. |
| 7 | C7: escala uniforme e invariancia de coordenadas | Ventanas CSS 1280 × 720 y 1600 × 900, DPR 1, sin scroll; relación 1200/675 conservada e `image-rendering: pixelated`. Capturas reales, nitidez pendiente de inspección. |

El ejecutor de navegador es corroboración posterior, no se presenta como un test rojo previo. Las doce pruebas deterministas/de archivos sí se ejecutaron en rojo antes de implementar y en verde después.

## Navegador y capturas
Chromium 156.0.8078.79, Debian, modo headless; el protocolo informa Chrome/156.0.8078.79. Zoom de presentación equivalente al 100 %, DPR 1, ventanas CSS establecidas por el protocolo.

- `tests/nave-1280x720.png`: captura de la escena real en la ventana de referencia.
- `tests/nave-1600x900.png`: captura de la escena real redimensionada.

El recorrido de controles se realizó a 1280 × 720. A 1600 × 900 se verificaron geometría, proporciones y captura, no un segundo recorrido completo. No se ha probado otro navegador.

## Pendiente sin verificar
No hay una herramienta de inspección visual ni una sesión de navegador interactiva disponible para este constructor. Las capturas se generaron, pero no fueron inspeccionadas visualmente. No se acredita aún el cumplimiento visual completo de los criterios 2 y 7, ni la revisión manual pedida en 3–6. Las pruebas lógicas y la geometría DOM no sustituyen esa revisión.

Pasos para la revisión independiente:
1. Abrir `index.html` localmente con la red desconectada, a zoom 100 %, en 1280 × 720. Comprobar consola y red.
2. Revisar estrellas, casco cenital, seis nombres legibles, decoración pixel art, astronauta reconocible, pasillo y paneles sin recortes. Comparar recursos y objetivos con los textos aprobados; las barras deben reflejar 85/70/60/90/75.
3. Mantener y soltar flechas y WASD; combinar dos direcciones, mantener contra cuatro bordes/esquinas, y cambiar a otra ventana mientras se mantiene una tecla. Al volver no debe seguir moviéndose.
4. Recorrer las seis puertas con E; verificar cada nombre, sustitución al cambiar de puerta, ocultamiento al alejarse y ausencia de activación lejana. No se entra a las salas ni se completan objetivos.
5. Repetir la inspección visual y controles a 1600 × 900; comprobar que la nitidez y las colisiones corresponden a la escena escalada.

## Alcance
Archivos nuevos: `index.html`, `styles.css`, `game.js`, `tests/index.html`, `tests/game.test.js`, `tests/browser.cjs`, `tests/EVIDENCIA.md`, `tests/nave-1280x720.png`, `tests/nave-1600x900.png`.
No se modificó `README.md`, `.github/` ni configuración. No se necesitó salir del alcance. No se abrió PR ni se solicitó transición. No hay contrato entre líneas ni interfaz documentada preexistente que actualizar; las instrucciones locales y la interfaz de pruebas se documentan aquí, dentro del alcance aprobado.

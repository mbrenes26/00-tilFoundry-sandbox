# Evidencia visual de rework-ui-1

- Generación: `npx playwright test tests/browser/resize.spec.ts tests/browser/playback.spec.ts --workers=1`.
- Entorno comprobado: Node.js 22.23.5, Playwright 1.65.0, Chromium de la sesión aislada. No certifica Windows ni un teléfono físico.
- Reproducción: PolicyV1 sintética de `createNetwork(123)`, semilla de red 123, trainingSteps=0, updates=0; archivo `fixture-prueba-no-entrenada.json`. No es una política entrenada ni evidencia de aprendizaje. Partida con semilla 42.
- Rojo anterior al cambio CSS: 5 fallos y 4 pruebas correctas. Inicio/importación/reproducción/final móviles solapaban el canvas (panel y=171.03125; borde inferior canvas=333.375). HUD obtenido=9px, mínimo exigido=14px.
- Verde final: 9 pruebas correctas. Incluye trayectoria y pesos frente a motor/inferencia, ritmo real 1×/4×, pausa, reinicio, recuperación de importaciones inválidas y final real, tanto a 390×844 como a 1600×1000. También comprueba cinco escenas, resolución lógica 1600×900 y pixelArt.

## Capturas nuevas

- `rework-mobile-start-viewport.png`: viewport exacto 390×844.
- `rework-mobile-start.png`: inicio móvil, documento completo.
- `rework-390-import.png`, `rework-390-playback.png`, `rework-390-final.png`: documento completo a viewport 390×844.
- `rework-1600-import.png`, `rework-1600-playback.png`, `rework-1600-final.png`: documento completo a viewport 1600×1000.
- `rework-desktop-start.png`: documento completo a viewport 1920×600.

Las capturas de documento completo pueden superar la altura del viewport. En móvil se permite desplazar el documento; los paneles no tienen desplazamiento interno ni recortan controles. Las pruebas comprueban scrollHeight/clientHeight, ausencia de desbordamiento horizontal, separación del canvas, texto del panel >=14px y controles >=44px. HUD móvil: 14px; panel: 16px.

## Revisión visual

La revisión con `ver_captura` confirmó HUD y controles legibles, resultado completo y ausencia de superposición sobre el laberinto en móvil y escritorio. Señaló que las leyendas secundarias dibujadas dentro del canvas siguen siendo diminutas en móvil y que el laberinto ocupa solo la zona izquierda: se conserva el dibujo y escala FIT originales, sin modificar BaseScene. La lectura fiable en móvil de puntos, vidas, fase, poder y pasos se proporciona en el HUD externo. La imagen no demuestra interacción ni scroll: esa evidencia corresponde a las pruebas Chromium.

Sin cambios en contratos, reglas, inferencia, escenas ni documentación de comandos. No se ejecutó el cierre integral ni se solicitó VERIFYING en este paso; esa verificación y las auditorías del PR siguen pendientes.

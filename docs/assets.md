# Inventario de arte original — Assets v1

Todos los PNG son arte original creado para issue-6 mediante `scripts/assets/generate.mjs`, sin imágenes, fuentes ni bibliotecas gráficas de terceros. Autoría: constructor TIL Foundry de issue-6. No se ha inspeccionado el mockup adjunto; se siguió la descripción textual aprobada. Los títulos se renderizan en la interfaz, nunca dentro del PNG.

`npm run assets` reproduce los nueve PNG y `public/assets/manifest.json` usando Node.js 22 (Buffer, zlib y escritura de archivos). El generador rasteriza rectángulos, círculos y líneas en coordenadas enteras, RGBA 8 bits. No hay interpolación ni suavizado. Paleta azul marino/gris, blanco, cian, naranja, amarillo, verde y rojo. Phaser aplica filtro NEAREST y pixelArt.

| Clave / archivo PNG | Tamaño | Recortes / frames | Contenido original |
|---|---|---|---|
| base-rooms | 384×192 | nueve recortes 128×64, mapa `crops` | Plano de diseño, Tierra/control, estación de clima, herramientas/ingeniería, tanques/combustible, servidores/sistemas, cajas/almacén, esclusa y ventana/observación |
| rocket | 40×112 | imagen | Cohete blanco/naranja con dos propulsores |
| tower | 40×112 | imagen | Torre roja y travesaños |
| terrain | 224×224 | imagen | Atardecer, montañas y dos reflectores |
| technician | 64×24 | 4 frames 16×24 | idle [0,1], work [2,3], uniforme naranja |
| astronaut | 64×24 | 4 frames 16×24 | idle [0,1], work [2,3], traje blanco |
| smoke | 96×32 | 3 frames 32×32 | burn [0,1,2], humo gris |
| flame | 96×32 | 3 frames 32×32 | burn [0,1,2], llama naranja/amarilla |
| resource-icons | 96×16 | 6 frames 16×16 | Presupuesto, combustible, O₂, agua, alimentos, repuestos |

Todas las rutas del manifiesto son relativas a `public/assets/`. BootScene consume tamaños y metadatos, sin adivinar recortes. Las pruebas `tests/assets/assets.test.ts` decodifican los datos PNG comprimidos y validan dimensiones, recortes y frames. Las pruebas Chromium guardan capturas de la base en 1600×900 y 1280×720 y del ascenso. La inspección humana de legibilidad y estética sigue siendo necesaria: un test de geometría no la sustituye.

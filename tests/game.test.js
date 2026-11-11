/* Ejecutable con node tests/game.test.js o abriendo tests/index.html. */
(function () {
  'use strict';
  const node = typeof module !== 'undefined' && module.exports;
  let game;
  if (node) { try { game = require('../game.js'); } catch (_) {} }
  else game = globalThis.NaveGame;
  const results = [];
  function assert(condition, message) { if (!condition) throw new Error(message); }
  function near(a, b) { assert(Math.abs(a - b) < 1e-8, `${a} != ${b}`); }
  function test(name, fn) {
    try { assert(game, 'game.js todavía no implementado'); fn(); results.push({ name, ok: true }); }
    catch (error) { results.push({ name, ok: false, error: error.message }); }
  }
  test('C1: entrada local sin dependencias externas', () => {
    if (!node) return;
    const fs = require('node:fs');
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('src="game.js"') && html.includes('href="styles.css"'), 'faltan archivos locales');
    for (const file of ['index.html', 'styles.css', 'game.js']) {
      assert(!/https?:\/\/|@import|fetch\(|XMLHttpRequest|type="module"/.test(fs.readFileSync(file, 'utf8')), 'dependencia no local');
    }
  });
  test('C2: seis salas en filas y astronauta inicialmente confinado (no valida aspecto)', () => {
    assert(game.doors.map(d => d.name).join('|') === 'Puente de Mando|Laboratorio|Soporte Vital|Habitaciones|Almacén|Sala de Máquinas', 'orden de salas');
    assert(game.doors.slice(0, 3).every(d => d.y === game.corridor.y), 'fila superior');
    assert(game.doors.slice(3).every(d => d.y === game.corridor.y + game.corridor.height), 'fila inferior');
    const s = game.createState(); const c = game.corridor;
    assert(s.x - game.body.width / 2 >= c.x && s.y - game.body.height / 2 >= c.y, 'inicio inválido');
  });
  test('C3: recursos, orden, valores, iconos y objetivos exactos', () => {
    assert(game.resources.map(r => `${r.name}:${r.value}`).join('|') === 'Oxígeno:85|Energía:70|Combustible:60|Comida:90|Agua:75', 'recursos');
    assert(new Set(game.resources.map(r => r.icon)).size === 5, 'iconos no distinguibles');
    assert(game.objectives.join('|') === 'Revisar los sistemas de la nave|Recoger muestras lunares|Preparar el despegue', 'objetivos');
  });
  test('C3: datos permanecen estáticos al esperar, moverse e interactuar', () => {
    const before = JSON.stringify([game.resources, game.objectives]); const s = game.createState();
    for (let i = 0; i < 500; i++) { game.update(s, new Set(['d']), .016); game.interact(s); }
    game.update(s, new Set(), 1000);
    assert(JSON.stringify([game.resources, game.objectives]) === before, 'datos cambiaron');
  });
  test('C4: flechas y WASD en las cuatro direcciones, y soltar detiene', () => {
    for (const [key, dx, dy] of [['ArrowLeft', -1, 0], ['a', -1, 0], ['ArrowRight', 1, 0], ['d', 1, 0], ['ArrowUp', 0, -1], ['w', 0, -1], ['ArrowDown', 0, 1], ['s', 0, 1]]) {
      const s = game.createState(); const {x, y} = s; game.update(s, new Set([key]), .05);
      near(s.x, x + dx * game.speed * .05); near(s.y, y + dy * game.speed * .05);
      const stopped = {...s}; game.update(s, new Set(), 1); near(s.x, stopped.x); near(s.y, stopped.y);
    }
  });
  test('C4: desplazamiento independiente del intervalo y diagonal normalizada', () => {
    const a = game.createState(), b = game.createState(), d = game.createState();
    game.update(a, new Set(['d']), .1);
    for (let i = 0; i < 10; i++) game.update(b, new Set(['d']), .01);
    game.update(d, new Set(['d', 'w']), .1);
    near(a.x, b.x); near(Math.hypot(d.x - game.createState().x, d.y - game.createState().y), game.speed * .1);
  });
  test('C4: captura de teclas, evita scroll, limpia blur y oculta; E no repite', () => {
    const handlers = {}; const target = {addEventListener: (name, fn) => {handlers[name] = fn;}, removeEventListener: () => {}, hidden: false};
    let interactions = 0; const input = game.createInput(target, target, () => interactions++);
    let prevented = false;
    handlers.keydown({key: 'ArrowUp', repeat: false, preventDefault: () => {prevented = true;}});
    assert(input.keys.has('ArrowUp') && prevented, 'flecha/scroll');
    handlers.keyup({key: 'ArrowUp', preventDefault() {}}); assert(input.keys.size === 0, 'keyup');
    handlers.keydown({key: 'W', repeat: false, preventDefault() {}}); assert(input.keys.has('w'), 'mayúsculas');
    handlers.blur(); assert(input.keys.size === 0, 'blur');
    handlers.keydown({key: 'd', preventDefault() {}}); target.hidden = true; handlers.visibilitychange(); assert(input.keys.size === 0, 'pestaña oculta');
    handlers.keydown({key: 'e', repeat: false, preventDefault() {}}); handlers.keydown({key: 'e', repeat: true, preventDefault() {}}); assert(interactions === 1, 'E repetida');
  });
  test('C5: cuerpo completo contenido en cuatro bordes y cuatro esquinas', () => {
    const c = game.corridor;
    for (const keys of [['a'], ['d'], ['w'], ['s'], ['a','w'], ['a','s'], ['d','w'], ['d','s']]) {
      const s = game.createState(); for (let i = 0; i < 30; i++) game.update(s, new Set(keys), 1);
      assert(s.x - game.body.width / 2 >= c.x && s.x + game.body.width / 2 <= c.x + c.width, 'borde X');
      assert(s.y - game.body.height / 2 >= c.y && s.y + game.body.height / 2 <= c.y + c.height, 'borde Y');
    }
  });
  test('C6: cada puerta muestra nombre exacto dentro del pasillo', () => {
    for (const door of game.doors) {
      const s = game.createState(); s.x = door.x; s.y = door.y + (door.y === game.corridor.y ? 18 : -18);
      game.interact(s); assert(s.message === door.name && s.selectedDoor === door.id, door.name);
    }
  });
  test('C6: radio inclusivo 48, fuera no activa; cercanía y empate estables', () => {
    const doors = [{id:'a', name:'A', x:0, y:0}, {id:'b', name:'B', x:96, y:0}];
    assert(game.nearestDoor({x:48,y:0}, doors).id === 'a', 'empate');
    assert(game.nearestDoor({x:48.01,y:0}, doors).id === 'b', 'más cercana');
    assert(game.nearestDoor({x:0,y:48}, doors).id === 'a', 'radio inclusivo');
    assert(game.nearestDoor({x:0,y:48.001}, doors) === null, 'fuera del radio');
    const s = game.createState(); s.x = 70; game.interact(s); assert(s.message === '' && s.selectedDoor === null, 'activación lejana');
  });
  test('C6: sustituye mensaje y lo oculta al salir del radio seleccionado', () => {
    const s = game.createState(); s.x = game.doors[0].x; s.y = game.corridor.y + 18; game.interact(s);
    s.x = game.doors[1].x; game.interact(s); assert(s.message === game.doors[1].name, 'sustitución');
    game.update(s, new Set(['d']), 1); assert(s.message === '' && s.selectedDoor === null, 'ocultamiento');
  });
  test('C7: escalado uniforme 1280x720 y 1600x900, coordenadas invariantes (no valida nitidez)', () => {
    near(game.fitScale(1280,720), 1280 / 1200); near(game.fitScale(1600,900), 1600 / 1200);
    near(game.fitScale(600,900), .5); near(game.fitScale(1600,300), 300 / 675);
    const s = game.createState(); const before = JSON.stringify(s); game.fitScale(1600,900); assert(JSON.stringify(s) === before, 'escala modifica estado');
  });
  if (node) {
    for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.error ? ': ' + r.error : ''}`);
    console.log(`${results.filter(r => r.ok).length}/${results.length} aprobadas`);
    process.exitCode = results.every(r => r.ok) ? 0 : 1;
  } else {
    const list = document.getElementById('results');
    for (const r of results) { const item = document.createElement('li'); item.textContent = `${r.ok ? 'APROBADO' : 'FALLIDO'} — ${r.name}${r.error ? ': ' + r.error : ''}`; item.style.color = r.ok ? '#80efb0' : '#ff8e8e'; list.append(item); }
    document.getElementById('summary').textContent = `${results.filter(r => r.ok).length}/${results.length} aprobadas. Las pruebas lógicas no acreditan el aspecto visual ni el recorrido manual.`;
    globalThis.testResults = results;
  }
}());

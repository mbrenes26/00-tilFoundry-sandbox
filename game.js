/* Lógica en coordenadas de la cubierta; el escalado solo afecta la presentación. */
(function (root) {
  'use strict';
  const width = 1200, height = 675, speed = 160, radius = 48;
  const corridor = Object.freeze({x: 60, y: 322, width: 816, height: 88});
  const body = Object.freeze({width: 20, height: 28});
  const doors = Object.freeze([
    {id: 'bridge', name: 'Puente de Mando', x: 188, y: 322},
    {id: 'lab', name: 'Laboratorio', x: 468, y: 322},
    {id: 'life', name: 'Soporte Vital', x: 748, y: 322},
    {id: 'quarters', name: 'Habitaciones', x: 188, y: 410},
    {id: 'storage', name: 'Almacén', x: 468, y: 410},
    {id: 'engine', name: 'Sala de Máquinas', x: 748, y: 410}
  ].map(Object.freeze));
  const resources = Object.freeze([
    {name: 'Oxígeno', value: 85, icon: 'O₂', color: '#77d5f3'},
    {name: 'Energía', value: 70, icon: 'ϟ', color: '#f6d27d'},
    {name: 'Combustible', value: 60, icon: '▥', color: '#efa47c'},
    {name: 'Comida', value: 90, icon: '♧', color: '#9ed38b'},
    {name: 'Agua', value: 75, icon: '◆', color: '#889ff3'}
  ].map(Object.freeze));
  const objectives = Object.freeze(['Revisar los sistemas de la nave', 'Recoger muestras lunares', 'Preparar el despegue']);
  function createState() { return {x: 468, y: 366, selectedDoor: null, message: ''}; }
  function nearestDoor(position, candidates = doors) {
    let nearest = null, distance = radius;
    for (const door of candidates) {
      const d = Math.hypot(position.x - door.x, position.y - door.y);
      if (d <= radius && (!nearest || d < distance)) { nearest = door; distance = d; }
    }
    return nearest;
  }
  function clearMessage(state) { state.selectedDoor = null; state.message = ''; }
  function interact(state) {
    const door = nearestDoor(state);
    if (door) { state.selectedDoor = door.id; state.message = door.name; }
    else clearMessage(state);
  }
  function update(state, keys, seconds) {
    let dx = Number(keys.has('d') || keys.has('ArrowRight')) - Number(keys.has('a') || keys.has('ArrowLeft'));
    let dy = Number(keys.has('s') || keys.has('ArrowDown')) - Number(keys.has('w') || keys.has('ArrowUp'));
    const length = Math.hypot(dx, dy);
    if (length) { dx /= length; dy /= length; }
    const elapsed = Math.max(0, seconds);
    state.x = Math.max(corridor.x + body.width / 2, Math.min(corridor.x + corridor.width - body.width / 2, state.x + dx * speed * elapsed));
    state.y = Math.max(corridor.y + body.height / 2, Math.min(corridor.y + corridor.height - body.height / 2, state.y + dy * speed * elapsed));
    const selected = doors.find(door => door.id === state.selectedDoor);
    if (selected && Math.hypot(state.x - selected.x, state.y - selected.y) > radius) clearMessage(state);
    return state;
  }
  function fitScale(viewWidth, viewHeight) { return Math.min(viewWidth / width, viewHeight / height); }
  function createInput(target, visibilityTarget, onInteract) {
    const keys = new Set();
    const normalize = key => key.length === 1 ? key.toLowerCase() : key;
    const controls = new Set(['a', 'd', 'w', 's', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'e']);
    function keydown(event) {
      const key = normalize(event.key);
      if (!controls.has(key)) return;
      event.preventDefault();
      if (key === 'e') { if (!event.repeat) onInteract(); }
      else keys.add(key);
    }
    function keyup(event) { const key = normalize(event.key); if (controls.has(key)) { event.preventDefault(); keys.delete(key); } }
    function clear() { keys.clear(); }
    function visibility() { if (visibilityTarget.hidden) clear(); }
    target.addEventListener('keydown', keydown); target.addEventListener('keyup', keyup); target.addEventListener('blur', clear);
    visibilityTarget.addEventListener('visibilitychange', visibility);
    return {keys};
  }
  const api = Object.freeze({width, height, speed, radius, corridor, body, doors, resources, objectives, createState, update, interact, nearestDoor, fitScale, createInput});
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.NaveGame = api;
  if (typeof document === 'undefined' || !document.getElementById('scene')) return;

  const canvas = document.getElementById('scene'), ctx = canvas.getContext('2d');
  const state = createState();
  const input = createInput(window, document, () => { interact(state); showMessage(); });
  const stage = document.getElementById('stage');
  function resize() { stage.style.transform = `scale(${fitScale(window.innerWidth, window.innerHeight)})`; }
  window.addEventListener('resize', resize); resize();
  for (const resource of resources) {
    const card = document.createElement('div'); card.className = 'resource';
    card.style.setProperty('--accent', resource.color); card.style.setProperty('--value', `${resource.value}%`);
    const row = document.createElement('div'); row.className = 'resource-top';
    const icon = document.createElement('span'); icon.className = 'resource-icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = resource.icon;
    const name = document.createElement('span'); name.textContent = resource.name;
    const value = document.createElement('span'); value.className = 'resource-value'; value.textContent = `${resource.value} %`;
    row.append(icon, name, value);
    const bar = document.createElement('div'); bar.className = 'bar'; bar.setAttribute('role', 'meter'); bar.setAttribute('aria-label', resource.name); bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', '100'); bar.setAttribute('aria-valuenow', String(resource.value));
    const fill = document.createElement('div'); fill.className = 'bar-fill'; bar.append(fill); card.append(row, bar);
    document.getElementById('resources').append(card);
  }
  for (const objective of objectives) { const item = document.createElement('li'); item.textContent = objective; document.getElementById('objective-list').append(item); }
  function showMessage() { const label = document.getElementById('message'); label.textContent = state.message; label.hidden = !state.message; }
  function rect(x, y, w, h, color) { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); }
  function text(label, x, y, size = 14, color = '#dbe9ff', align = 'left') { ctx.fillStyle = color; ctx.font = `bold ${size}px "Courier New", monospace`; ctx.textAlign = align; ctx.fillText(label, x, y); }
  function consoleUnit(x, y, w, color) {
    rect(x + 4, y + 4, w, 30, '#07101e'); rect(x, y, w, 28, '#415b74'); rect(x + 4, y + 4, w - 8, 15, '#0b202c');
    rect(x + 8, y + 8, w - 22, 3, color); rect(x + 8, y + 14, 15, 2, color); rect(x + w - 12, y + 22, 4, 3, '#f4d28b');
  }
  function crate(x, y) { rect(x + 3, y + 3, 36, 29, '#0a101b'); rect(x, y, 36, 28, '#9d7962'); rect(x + 3, y + 3, 30, 22, '#665848'); rect(x + 16, y + 2, 4, 24, '#cba783'); rect(x + 3, y + 12, 30, 4, '#cba783'); }
  function room(index) {
    const col = index % 3, top = index < 3, x = 60 + col * 280, y = top ? 184 : 422, w = 256, h = 128;
    const accent = ['#76cce2', '#bb9fe3', '#91dba3', '#b2bfea', '#d7b481', '#ec9d72'][index];
    rect(x - 4, y - 4, w + 8, h + 8, '#08101f'); rect(x, y, w, h, '#25394c'); rect(x + 4, y + 4, w - 8, h - 8, '#182938');
    for (let xx = x + 8; xx < x + w - 8; xx += 16) for (let yy = y + 8; yy < y + h - 8; yy += 16) rect(xx, yy, 1, 1, '#304657');
    rect(x + 8, y + 8, 3, 16, accent); text(doors[index].name, x + 20, y + 22, 15, accent);
    if (index === 0) {
      consoleUnit(x + 24, y + 49, 62, accent); consoleUnit(x + 97, y + 43, 62, accent); consoleUnit(x + 170, y + 49, 62, accent);
      for (let i = 0; i < 3; i++) { rect(x + 43 + i * 73, y + 86, 20, 20, '#546783'); rect(x + 47 + i * 73, y + 88, 12, 12, '#8194af'); }
    } else if (index === 1) {
      consoleUnit(x + 20, y + 48, 58, accent); rect(x + 98, y + 52, 125, 42, '#536a7d'); rect(x + 102, y + 56, 117, 34, '#8493a4');
      for (let i = 0; i < 4; i++) { rect(x + 112 + i * 25, y + 63, 10, 20, '#d7ecf0'); rect(x + 114 + i * 25, y + 71, 6, 10, accent); }
    } else if (index === 2) {
      for (let i = 0; i < 3; i++) { const xx = x + 25 + i * 76; rect(xx, y + 47, 52, 59, '#3d6668'); rect(xx + 4, y + 51, 44, 50, '#102c36'); rect(xx + 10, y + 59, 32, 33, '#669986'); rect(xx + 23, y + 63, 7, 26, '#a5df9d'); }
    } else if (index === 3) {
      for (let i = 0; i < 3; i++) { const xx = x + 22 + i * 76; rect(xx + 3, y + 48, 57, 65, '#08101e'); rect(xx, y + 43, 56, 63, '#4a5c76'); rect(xx + 4, y + 47, 48, 15, '#dae0df'); rect(xx + 4, y + 65, 48, 36, '#7e94b2'); rect(xx + 8, y + 69, 40, 3, '#9cb6d3'); }
    } else if (index === 4) {
      for (let i = 0; i < 5; i++) crate(x + 20 + i * 43, y + 48 + (i % 2) * 22);
      text('CARGO / 05', x + 24, y + 109, 10, '#998b7e');
    } else {
      consoleUnit(x + 18, y + 50, 44, accent);
      rect(x + 83, y + 53, 135, 39, '#536574'); rect(x + 105, y + 40, 88, 65, '#405368'); rect(x + 111, y + 46, 76, 53, '#172332');
      for (let i = 0; i < 5; i++) rect(x + 120 + i * 12, y + 52, 6, 40, i % 2 ? '#aa755d' : '#efb57f');
      rect(x + 75, y + 65, 26, 12, '#dc936c'); rect(x + 197, y + 65, 28, 12, '#dc936c');
    }
  }
  function astronaut() {
    const x = Math.round(state.x) - 10, y = Math.round(state.y) - 14;
    // Todos los píxeles del traje están dentro del cuerpo lógico de 20 × 28.
    rect(x + 3, y + 9, 14, 14, '#a0acc4'); rect(x, y + 12, 3, 9, '#e0e6ed'); rect(x + 17, y + 12, 3, 9, '#e0e6ed');
    rect(x + 3, y + 23, 5, 5, '#dbe5ed'); rect(x + 12, y + 23, 5, 5, '#dbe5ed');
    rect(x + 4, y, 12, 2, '#a9bed0'); rect(x + 2, y + 2, 16, 11, '#edf3ef'); rect(x + 4, y + 4, 12, 7, '#123143'); rect(x + 5, y + 5, 7, 2, '#73d2e5');
    rect(x + 5, y + 14, 10, 7, '#eff2e9'); rect(x + 7, y + 15, 5, 3, '#e6ab68');
  }
  function draw() {
    rect(0, 0, width, height, '#090f20');
    for (let i = 0; i < 165; i++) { const x = (i * 173 + 29) % width, y = (i * 97 + 13) % height; rect(x, y, i % 7 ? 1 : 2, i % 7 ? 1 : 2, i % 4 ? '#34445f' : '#7f99b4'); }
    text('SELENE-01 / PLANO DE CUBIERTA', 40, 167, 10, '#8296b4');
    // Casco escalonado y mamparos.
    rect(48, 170, 840, 391, '#07101d'); rect(40, 190, 856, 350, '#40566e'); rect(52, 176, 832, 379, '#40566e'); rect(56, 180, 824, 371, '#101e2d');
    rect(60, 322, 816, 88, '#354858');
    for (let x = 60; x < 876; x += 24) { rect(x, 323, 1, 86, '#263b4c'); rect(x + 5, 361, 12, 2, '#5d7281'); }
    rect(60, 324, 816, 2, '#708796'); rect(60, 406, 816, 2, '#708796');
    for (let i = 0; i < 6; i++) room(i);
    for (const door of doors) {
      const y = door.y === 322 ? 310 : 410;
      rect(door.x - 23, y, 46, 12, '#091724'); rect(door.x - 19, y + 2, 38, 8, '#6a8a99'); rect(door.x - 2, y + 2, 4, 8, '#142c3c');
      rect(door.x - 25, y + 2, 4, 8, '#83dfba'); rect(door.x + 21, y + 2, 4, 8, '#83dfba');
    }
    const near = nearestDoor(state);
    if (near) { text('[E]', near.x + 34, near.y === 322 ? 344 : 396, 11, '#acffdb'); }
    astronaut();
  }
  let previous;
  function frame(now) {
    const elapsed = previous === undefined ? 0 : (now - previous) / 1000; previous = now;
    update(state, input.keys, elapsed); showMessage(); draw(); requestAnimationFrame(frame);
  }
  // Le temps caché ne doit pas créer de saut au retour de la fenêtre.
  window.addEventListener('blur', () => { previous = undefined; });
  document.addEventListener('visibilitychange', () => { previous = undefined; });
  requestAnimationFrame(frame);
}(typeof globalThis !== 'undefined' ? globalThis : this));

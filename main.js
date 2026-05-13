const { LANGUAGES, NODES, EDGES, TRANSLATIONS } = window.HARAM_DATA;
let latestSteps = [];
let latestPath = [];

function buildAdjacency() {
  const adj = {};
  Object.keys(NODES).forEach(id => adj[id] = []);
  EDGES.forEach(edge => {
    adj[edge.from].push({ ...edge, to: edge.to });
    adj[edge.to].push({ ...edge, to: edge.from, from: edge.to, floorChange: -(edge.floorChange || 0) });
  });
  return adj;
}

function shortestPath(start, end, accessibleOnly = true) {
  const adj = buildAdjacency();
  const distances = Object.fromEntries(Object.keys(NODES).map(id => [id, Infinity]));
  const previous = {};
  const visited = new Set();
  distances[start] = 0;

  while (visited.size < Object.keys(NODES).length) {
    let current = null;
    let best = Infinity;
    for (const [node, dist] of Object.entries(distances)) {
      if (!visited.has(node) && dist < best) {
        current = node;
        best = dist;
      }
    }
    if (!current) break;
    if (current === end) break;
    visited.add(current);

    for (const edge of adj[current]) {
      if (accessibleOnly && edge.accessible === false) continue;
      const weight = edge.distance + (edge.kind === 'elevator' ? 5 : 0);
      const nd = distances[current] + weight;
      if (nd < distances[edge.to]) {
        distances[edge.to] = nd;
        previous[edge.to] = { node: current, edge };
      }
    }
  }

  if (!previous[end] && start !== end) return null;
  const nodes = [end];
  const edges = [];
  let cursor = end;
  while (cursor !== start) {
    const item = previous[cursor];
    if (!item) return null;
    edges.unshift(item.edge);
    cursor = item.node;
    nodes.unshift(cursor);
  }
  return { nodes, edges, distance: edges.reduce((s, e) => s + e.distance, 0) };
}

function fillSelects() {
  const lang = document.getElementById('language');
  const start = document.getElementById('start');
  const destination = document.getElementById('destination');

  Object.entries(LANGUAGES).forEach(([code, label]) => {
    lang.add(new Option(`${label} (${code})`, code));
  });
  lang.value = 'ar';

  Object.entries(NODES).forEach(([id, node]) => {
    start.add(new Option(node.label, id));
    if (node.type === 'destination' || node.type === 'facility' || node.type === 'gate') {
      destination.add(new Option(node.label, id));
    }
  });
  start.value = 'gate_100';
  destination.value = 'mataf_2';
}

function format(template, values) {
  return Object.entries(values).reduce((txt, [k, v]) => txt.replaceAll(`{${k}}`, v), template);
}

function generateSteps(result, langCode) {
  const tr = TRANSLATIONS[langCode] || TRANSLATIONS.ar;
  let currentFloor = NODES[result.nodes[0]].floor || 0;
  const steps = result.edges.map((edge, index) => {
    const nextId = result.nodes[index + 1];
    const dest = NODES[nextId].label;
    if (edge.kind === 'elevator') {
      currentFloor += edge.floorChange || 0;
      return format(tr.elevator, { floor: currentFloor });
    }
    return `${format(tr.walk_to, { destination: dest })} (${format(tr.meters, { distance: edge.distance })}).`;
  });
  steps.push(tr.arrive);
  return steps;
}

function renderRoute(result, steps, langCode) {
  latestSteps = steps;
  latestPath = result.nodes;
  const list = document.getElementById('steps');
  list.innerHTML = '';
  steps.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    list.appendChild(li);
  });
  const tr = TRANSLATIONS[langCode] || TRANSLATIONS.ar;
  document.getElementById('routeSummary').textContent = format(tr.route, { distance: result.distance, count: steps.length });
  document.getElementById('instructions').classList.remove('hidden');
  drawMap(result.nodes);
}

function drawMap(pathNodes = []) {
  const svg = document.getElementById('routeMap');
  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';

  for (const edge of EDGES) {
    const a = NODES[edge.from];
    const b = NODES[edge.to];
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', '#b0bec5');
    line.setAttribute('stroke-width', '3');
    svg.appendChild(line);
  }

  for (let i = 0; i < pathNodes.length - 1; i++) {
    const a = NODES[pathNodes[i]];
    const b = NODES[pathNodes[i + 1]];
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
    line.setAttribute('stroke', '#00897b');
    line.setAttribute('stroke-width', '8');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
  }

  Object.entries(NODES).forEach(([id, node]) => {
    const g = document.createElementNS(ns, 'g');
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', node.x); c.setAttribute('cy', node.y);
    c.setAttribute('r', pathNodes.includes(id) ? '13' : '9');
    c.setAttribute('fill', pathNodes.includes(id) ? '#00897b' : '#ffffff');
    c.setAttribute('stroke', '#004d40');
    c.setAttribute('stroke-width', '3');
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', node.x); t.setAttribute('y', node.y - 18);
    t.setAttribute('font-size', '15');
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', '#263238');
    t.textContent = node.label;
    g.appendChild(c); g.appendChild(t); svg.appendChild(g);
  });
}

function calculate() {
  const start = document.getElementById('start').value;
  const destination = document.getElementById('destination').value;
  const lang = document.getElementById('language').value;
  const accessibleOnly = document.getElementById('accessibleRoute').checked;
  if (start === destination) {
    alert('الموقع والوجهة متطابقان.');
    return;
  }
  const result = shortestPath(start, destination, accessibleOnly);
  if (!result) {
    alert('لم يتم العثور على مسار في البيانات الحالية.');
    return;
  }
  renderRoute(result, generateSteps(result, lang), lang);
}

function understandQuestion() {
  const text = document.getElementById('guestQuestion').value.toLowerCase();
  const understanding = document.getElementById('understanding');
  const pairs = Object.entries(NODES);
  const hit = pairs.find(([id, node]) => node.aliases?.some(alias => text.includes(alias.toLowerCase())));
  if (hit) {
    document.getElementById('destination').value = hit[0];
    understanding.textContent = `تم التعرف على الوجهة المحتملة: ${hit[1].label}`;
  } else {
    understanding.textContent = 'لم أتعرف على وجهة محددة. اختر الوجهة يدوياً ثم احسب المسار.';
  }
}

function speak() {
  if (!latestSteps.length) calculate();
  if (!('speechSynthesis' in window)) {
    alert('النطق الصوتي غير مدعوم في هذا المتصفح.');
    return;
  }
  const lang = document.getElementById('language').value;
  const utterance = new SpeechSynthesisUtterance(latestSteps.join('\n'));
  utterance.lang = lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

window.addEventListener('DOMContentLoaded', () => {
  fillSelects();
  drawMap();
  document.getElementById('compute').addEventListener('click', calculate);
  document.getElementById('understand').addEventListener('click', understandQuestion);
  document.getElementById('speak').addEventListener('click', speak);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('service-worker.js').catch(console.warn);
  }
});

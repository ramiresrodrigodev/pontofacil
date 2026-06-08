// ── Formatação ────────────────────────────────────────────────────

export const toMin = t => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

export const fmtH = min => {
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}h${m > 0 ? String(m).padStart(2, '0') + 'min' : ''}`;
};

export const ini = nome =>
  nome.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();

export const fmtTime = d =>
  d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export const calcMins = p => {
  if (!p.entrada || !p.saida) return 0;
  let m = toMin(p.saida) - toMin(p.entrada);
  if (p.alSaida && p.alRetorno) m -= toMin(p.alRetorno) - toMin(p.alSaida);
  return m;
};

// ── Criação de elementos DOM ──────────────────────────────────────

/**
 * Cria um elemento HTML com atributos e filhos.
 * Filhos podem ser strings, Nodes ou arrays de Nodes.
 */
export const h = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (c === null || c === undefined) return;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return el;
};

/** Atalho para criar uma div com classe, filhos e estilos inline opcionais. */
export const div = (cls, children = [], style = {}) =>
  h('div', { class: cls, style }, children);

/** Atalho para criar um botão estilizado. */
export const btn = (cls, children, onClick) =>
  h('button', { class: `btn ${cls}`, onclick: onClick }, children);

/** Ícone Tabler. */
export const icon = name => h('i', { class: `ti ${name}` });

/** Avatar com iniciais. */
export const av = (nome, size = 32, fs = 11) => {
  const d = document.createElement('div');
  d.className = 'av';
  Object.assign(d.style, { width: size + 'px', height: size + 'px', fontSize: fs + 'px' });
  d.textContent = ini(nome);
  return d;
};

// ── Badges ────────────────────────────────────────────────────────

export const badge = (txt, cls) => {
  const el = document.createElement('span');
  el.className = `badge ${cls}`;
  el.textContent = txt;
  return el;
};

export const badgeStatus = s =>
  badge(s, s === 'Ativo' || s === 'Aprovado' ? 'bg' : s === 'Inativo' || s === 'Recusado' ? 'br' : 'by');

export const badgeContrato = c =>
  badge(c, c === 'CLT' ? 'bb' : c === 'PJ' ? 'bp' : 'bc');

// ── Helpers de formulário ─────────────────────────────────────────

/**
 * Campo de input com label.
 * @param {string} stateKey - chave no state (ex: 'formFunc')
 * @param {string} label
 * @param {string} type     - tipo do input
 * @param {string} val      - valor atual
 * @param {string} field    - campo dentro do stateKey
 * @param {object} state    - referência ao state
 */
export const formInput = (stateKey, label, type, val, field, state) => {
  const el = document.createElement('input');
  el.className = 'inp';
  el.type = type;
  el.value = val || '';
  el.addEventListener('change', e => { state[stateKey] = { ...state[stateKey], [field]: e.target.value }; });
  const wrap = document.createElement('div');
  wrap.className = 'fg';
  const lbl = document.createElement('label');
  lbl.className = 'fl';
  lbl.textContent = label;
  wrap.append(lbl, el);
  return wrap;
};

/**
 * Select com label.
 */
export const formSelect = (stateKey, label, val, field, opts, state) => {
  const el = document.createElement('select');
  el.className = 'sel';
  opts.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o; opt.textContent = o;
    if (o === val) opt.selected = true;
    el.appendChild(opt);
  });
  el.addEventListener('change', e => { state[stateKey] = { ...state[stateKey], [field]: e.target.value }; });
  const wrap = document.createElement('div');
  wrap.className = 'fg';
  const lbl = document.createElement('label');
  lbl.className = 'fl';
  lbl.textContent = label;
  wrap.append(lbl, el);
  return wrap;
};

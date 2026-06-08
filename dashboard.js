import { state, setState } from '../state.js';
import { av, badge, calcMins, ini } from '../helpers.js';

export function buildDashboard() {
  const { funcs, pontos, folgas } = state;

  const ativos        = funcs.filter(f => f.status === 'Ativo').length;
  const totalMin      = pontos.reduce((a, p) => a + calcMins(p), 0);
  const pendentes     = folgas.filter(f => f.status === 'Pendente').length;
  const recentes      = [...pontos].reverse().slice(0, 4);
  const proxFolgas    = folgas.filter(f => f.status === 'Aprovado').slice(0, 3);

  const wrap = document.createElement('div');

  // ── Stats ──
  const stats = document.createElement('div');
  stats.className = 'g4';
  stats.style.marginBottom = '14px';
  [
    ['Ativos',     String(ativos),                   funcs.length + ' total'],
    ['Horas/mês',  Math.floor(totalMin / 60) + 'h',  'registradas'],
    ['Pendentes',  String(pendentes),                 'folgas',       pendentes > 0 ? 'var(--yellow)' : ''],
    ['Pontos',     String(pontos.length),             'registros'],
  ].forEach(([label, val, sub, color]) => {
    const card = document.createElement('div');
    card.className = 'scard';
    const lEl = document.createElement('div'); lEl.className = 'slabel'; lEl.textContent = label;
    const vEl = document.createElement('div'); vEl.className = 'sval';   vEl.textContent = val;
    if (color) vEl.style.color = color;
    const sEl = document.createElement('div'); sEl.className = 'ssub';   sEl.textContent = sub;
    card.append(lEl, vEl, sEl);
    stats.appendChild(card);
  });

  // ── Últimos pontos ──
  const cardPontos = document.createElement('div');
  cardPontos.className = 'card';
  cardPontos.style.marginBottom = '12px';
  const t1 = document.createElement('div'); t1.className = 'sec'; t1.textContent = 'Últimos registros';
  cardPontos.appendChild(t1);

  recentes.forEach(p => {
    const f = funcs.find(f => f.id === p.fid);
    const row = document.createElement('div');
    Object.assign(row.style, { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border)' });

    const left = document.createElement('div');
    Object.assign(left.style, { display:'flex', alignItems:'center', gap:'8px' });
    const info = document.createElement('div');
    const n = document.createElement('div'); n.style.cssText = 'font-size:13px;font-weight:500'; n.textContent = f?.nome || '—';
    const d = document.createElement('div'); d.style.cssText = 'font-size:11px;color:var(--text3)'; d.textContent = p.data;
    info.append(n, d);
    left.append(av(f?.nome || '?', 28, 10), info);

    const right = document.createElement('div');
    right.style.textAlign = 'right';
    const hrs = document.createElement('div'); hrs.style.cssText = 'font-size:12px;color:var(--text2)'; hrs.textContent = p.entrada + ' → ' + (p.saida || '—');
    const b = badge(p.status, p.status === 'Completo' ? 'bg' : 'by'); b.style.fontSize = '10px';
    right.append(hrs, b);

    row.append(left, right);
    cardPontos.appendChild(row);
  });

  const btnVer = document.createElement('button');
  btnVer.className = 'btn btn-s btn-full';
  btnVer.style.marginTop = '10px';
  btnVer.textContent = 'Ver todos';
  btnVer.addEventListener('click', () => setState({ page: 'ponto' }));
  cardPontos.appendChild(btnVer);

  // ── Próximas folgas ──
  const cardFolgas = document.createElement('div');
  cardFolgas.className = 'card';
  cardFolgas.style.marginBottom = '12px';
  const t2 = document.createElement('div'); t2.className = 'sec'; t2.textContent = 'Próximas folgas';
  cardFolgas.appendChild(t2);

  proxFolgas.forEach(f => {
    const func = funcs.find(fu => fu.id === f.fid);
    const row = document.createElement('div');
    Object.assign(row.style, { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border)' });
    const info = document.createElement('div');
    const n = document.createElement('div'); n.style.cssText = 'font-size:13px;font-weight:500'; n.textContent = func?.nome || '—';
    const d = document.createElement('div'); d.style.cssText = 'font-size:11px;color:var(--text3)'; d.textContent = f.inicio + ' • ' + f.tipo;
    info.append(n, d);
    row.append(info, badge('Aprovado', 'bg'));
    cardFolgas.appendChild(row);
  });

  // ── Equipe ativa ──
  const cardEquipe = document.createElement('div');
  cardEquipe.className = 'card';
  const t3 = document.createElement('div'); t3.className = 'sec'; t3.textContent = 'Equipe ativa';
  const chips = document.createElement('div');
  Object.assign(chips.style, { display:'flex', flexWrap:'wrap', gap:'8px' });
  funcs.filter(f => f.status === 'Ativo').forEach(f => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.append(av(f.nome, 18, 8), document.createTextNode(f.nome.split(' ')[0]));
    chips.appendChild(chip);
  });
  cardEquipe.append(t3, chips);

  wrap.append(stats, cardPontos, cardFolgas, cardEquipe);
  return wrap;
}

import { state, setState, showAlert, recarregarPontos, recarregarEmpresa } from '../state.js';
import { av, badge, calcMins, fmtH, fmtTime, icon } from '../helpers.js';
import * as api from '../api.js';

export function buildPonto() {
  const { funcs, pontos, pa, selFunc, tab } = state;

  const wrap = document.createElement('div');

  // ── Tabs ──
  const tabsEl = document.createElement('div');
  tabsEl.className = 'tabs';
  [['registrar','Registrar'],['equipe','Equipe hoje'],['historico','Histórico']].forEach(([id, label]) => {
    const t = document.createElement('button');
    t.className = `tab${tab === id ? ' active' : ''}`;
    t.textContent = label;
    t.addEventListener('click', () => setState({ tab: id }));
    tabsEl.appendChild(t);
  });
  wrap.appendChild(tabsEl);

  // ── Conteúdo por aba ──
  if (tab === 'registrar') wrap.appendChild(buildRegistrar(funcs, pa, selFunc));
  else if (tab === 'equipe') wrap.appendChild(buildEquipe(funcs, pontos, pa));
  else wrap.appendChild(buildHistorico(funcs, pontos));

  return wrap;
}

// ── Aba Registrar ─────────────────────────────────────────────────
function buildRegistrar(funcs, pa, selFunc) {
  const wrap = document.createElement('div');
  const ativo = selFunc ? pa[parseInt(selFunc)] : null;

  // card de marcação
  const card = document.createElement('div');
  card.className = 'card'; card.style.marginBottom = '12px';

  const fgFunc = document.createElement('div'); fgFunc.className = 'fg';
  const lbl = document.createElement('label'); lbl.className = 'fl'; lbl.textContent = 'Funcionário';
  const sel = document.createElement('select'); sel.className = 'sel';
  sel.append(Object.assign(document.createElement('option'), { value:'', textContent:'Selecione...' }));
  funcs.filter(f => f.status === 'Ativo').forEach(f => {
    const o = document.createElement('option');
    o.value = f.id; o.textContent = f.nome;
    if (String(f.id) === selFunc) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener('change', e => setState({ selFunc: e.target.value }));
  fgFunc.append(lbl, sel);

  const btns = [
    { tipo:'entrada',    label:'Entrada',      icon:'ti-login',        dis: !!(ativo?.entrada) },
    { tipo:'alSaida',    label:'Saída Almoço', icon:'ti-soup',         dis: !ativo?.entrada || !!(ativo?.alSaida) },
    { tipo:'alRetorno',  label:'Retorno',      icon:'ti-arrow-back-up',dis: !ativo?.alSaida  || !!(ativo?.alRetorno) },
    { tipo:'saida',      label:'Saída Final',  icon:'ti-logout',       dis: !ativo?.entrada },
  ];
  const grid = document.createElement('div'); grid.className = 'pgrid';
  btns.forEach(b => {
    const pb = document.createElement('button');
    pb.className = `pbtn ${b.dis ? 'btn-s' : 'btn-p'}`;
    pb.style.opacity = b.dis ? '0.4' : '1';
    pb.style.cursor  = b.dis ? 'not-allowed' : 'pointer';
    const ic = icon(b.icon); ic.style.cssText = 'display:block;font-size:20px;margin-bottom:4px';
    pb.append(ic, document.createTextNode(b.label));
    if (!b.dis) pb.addEventListener('click', () => registrarPonto(b.tipo));
    grid.appendChild(pb);
  });
  card.append(fgFunc, grid);

  // status do dia
  let statusCard = null;
  if (selFunc && ativo) {
    statusCard = document.createElement('div');
    statusCard.className = 'card'; statusCard.style.marginBottom = '12px';
    const t = document.createElement('div'); t.className = 'sec'; t.textContent = 'Status de hoje';
    statusCard.appendChild(t);
    [['entrada','Entrada'],['alSaida','Saída almoço'],['alRetorno','Retorno']].forEach(([k, l]) => {
      const row = document.createElement('div');
      Object.assign(row.style, { display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' });
      const lEl = document.createElement('span'); lEl.style.cssText = 'font-size:13px;color:var(--text2)'; lEl.textContent = l;
      const vEl = document.createElement('span'); vEl.style.cssText = `font-weight:600;color:${ativo[k] ? 'var(--green)' : 'var(--text3)'}`;
      vEl.textContent = ativo[k] || '—';
      row.append(lEl, vEl);
      statusCard.appendChild(row);
    });
  }

  // botão manual
  const btnManual = document.createElement('button');
  btnManual.className = 'btn btn-s btn-full';
  btnManual.append(icon('ti-edit'), document.createTextNode(' Registro Manual (Gestor)'));
  btnManual.addEventListener('click', () => setState({ modal:'manual', formManual:{ fid:'', data:'', entrada:'', alSaida:'', alRetorno:'', saida:'', obs:'' } }));

  wrap.append(card, ...(statusCard ? [statusCard] : []), btnManual, buildGeofenceCard());
  return wrap;
}

// ── Card: cerca virtual (geofence) ────────────────────────────────
function buildGeofenceCard() {
  const empresa = state.empresa || {};
  const ativo = !!empresa.geofenceAtivo;
  let raio = empresa.raioMetros || 200;

  const card = document.createElement('div');
  card.className = 'card'; card.style.marginTop = '12px';

  const title = document.createElement('div'); title.className = 'sec';
  title.append(icon('ti-map-pin'), document.createTextNode(' Cerca virtual (local da empresa)'));
  card.appendChild(title);

  const statusRow = document.createElement('div');
  statusRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap';
  statusRow.appendChild(ativo ? badge('Ativa', 'bg') : badge('Desativada', 'by'));
  const desc = document.createElement('span');
  desc.style.cssText = 'font-size:12px;color:var(--text3)';
  desc.textContent = ativo
    ? `Ponto só dentro de ${empresa.raioMetros} m do local definido.`
    : 'O ponto pode ser registrado de qualquer lugar.';
  statusRow.appendChild(desc);
  card.appendChild(statusRow);

  if (ativo && empresa.latitude != null) {
    const link = document.createElement('a');
    link.href = `https://www.google.com/maps?q=${empresa.latitude},${empresa.longitude}`;
    link.target = '_blank'; link.rel = 'noopener';
    link.style.cssText = 'font-size:12px;color:var(--accent);display:inline-flex;align-items:center;gap:4px;margin-bottom:10px';
    link.append(icon('ti-external-link'), document.createTextNode(
      `${empresa.latitude.toFixed(5)}, ${empresa.longitude.toFixed(5)}`));
    card.appendChild(link);
  }

  // raio
  const fgRaio = document.createElement('div'); fgRaio.className = 'fg';
  const lblRaio = document.createElement('label'); lblRaio.className = 'fl'; lblRaio.textContent = 'Raio permitido (metros)';
  const inpRaio = document.createElement('input'); inpRaio.className = 'inp'; inpRaio.type = 'number';
  inpRaio.min = '20'; inpRaio.max = '50000'; inpRaio.value = String(raio);
  inpRaio.addEventListener('change', e => { raio = parseInt(e.target.value) || 200; });
  fgRaio.append(lblRaio, inpRaio);
  card.appendChild(fgRaio);

  // botões
  const acoes = document.createElement('div');
  acoes.style.cssText = 'display:flex;gap:8px;margin-top:4px';

  const btnUsar = document.createElement('button');
  btnUsar.className = 'btn btn-p'; btnUsar.style.flex = '1';
  btnUsar.append(icon('ti-current-location'), document.createTextNode(ativo ? ' Atualizar local' : ' Usar minha localização'));
  btnUsar.addEventListener('click', async () => {
    try {
      showAlert('Obtendo sua localização…', 'y');
      const c = await api.obterLocalizacao();
      await api.definirGeofence({ latitude: c.latitude, longitude: c.longitude, raioMetros: raio });
      await recarregarEmpresa();
      showAlert('Cerca virtual definida!');
    } catch (err) { showAlert(err.message, 'r'); }
  });
  acoes.appendChild(btnUsar);

  if (ativo) {
    const btnOff = document.createElement('button');
    btnOff.className = 'btn btn-d';
    btnOff.append(icon('ti-x'), document.createTextNode(' Desativar'));
    btnOff.addEventListener('click', async () => {
      try {
        await api.removerGeofence();
        await recarregarEmpresa();
        showAlert('Cerca virtual desativada.', 'r');
      } catch (err) { showAlert(err.message, 'r'); }
    });
    acoes.appendChild(btnOff);
  }

  card.appendChild(acoes);
  return card;
}

// ── Aba Equipe hoje ───────────────────────────────────────────────
function buildEquipe(funcs, pontos, pa) {
  const hoje = new Date().toISOString().slice(0, 10);
  const wrap = document.createElement('div');
  Object.assign(wrap.style, { display:'flex', flexDirection:'column', gap:'8px' });

  funcs.filter(f => f.status === 'Ativo').forEach(f => {
    const p2 = pa[f.id];
    const ph = pontos.find(p => p.fid === f.id && p.data === hoje && p.status === 'Completo');
    const d  = p2 || ph;

    const mc = document.createElement('div'); mc.className = 'mc';

    const row1 = document.createElement('div');
    Object.assign(row1.style, { display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' });
    const info = document.createElement('div'); info.style.flex = '1';
    const n = document.createElement('div'); n.style.fontWeight = '600'; n.textContent = f.nome;
    const s = document.createElement('div'); s.style.cssText = 'font-size:11px;color:var(--text3)'; s.textContent = f.cargo;
    info.append(n, s);
    const statusBadge = ph ? badge('Finalizado','bg') : p2 ? badge('Em andamento','by') : badge('Ausente','br');
    row1.append(av(f.nome), info, statusBadge);

    const row2 = document.createElement('div');
    Object.assign(row2.style, { display:'flex', flexWrap:'wrap', fontSize:'12px' });
    [['Entrada', d?.entrada],['Almoço', d?.alSaida],['Retorno', d?.alRetorno]].forEach(([label, val]) => {
      const sp = document.createElement('span'); sp.style.cssText = 'color:var(--text2);margin-right:12px';
      sp.textContent = label + ': ';
      const st = document.createElement('strong'); st.textContent = val || '—';
      sp.appendChild(st);
      row2.appendChild(sp);
    });

    mc.append(row1, row2);
    wrap.appendChild(mc);
  });

  return wrap;
}

// ── Aba Histórico ─────────────────────────────────────────────────
function buildHistorico(funcs, pontos) {
  const wrap = document.createElement('div');

  // mobile
  const ml = document.createElement('div'); ml.className = 'ml';
  [...pontos].reverse().forEach(p => {
    const f = funcs.find(f => f.id === p.fid);
    const m = calcMins(p); const ex = m > 480 ? m - 480 : 0;
    const mc = document.createElement('div'); mc.className = 'mc';

    const row1 = document.createElement('div');
    Object.assign(row1.style, { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' });
    const left = document.createElement('div');
    Object.assign(left.style, { display:'flex', alignItems:'center', gap:'8px' });
    const info = document.createElement('div');
    const n = document.createElement('div'); n.style.cssText = 'font-weight:600;font-size:13px'; n.textContent = f?.nome || '—';
    const d = document.createElement('div'); d.style.cssText = 'font-size:11px;color:var(--text3)'; d.textContent = p.data;
    info.append(n, d); left.append(av(f?.nome || '?', 26, 9), info);
    row1.append(left, badge(p.status, p.status === 'Completo' ? 'bg' : 'by'));

    const row2 = document.createElement('div');
    Object.assign(row2.style, { display:'flex', flexWrap:'wrap', fontSize:'12px' });
    [['Entrada', p.entrada],['Saída', p.saida]].forEach(([l, v]) => {
      const sp = document.createElement('span'); sp.style.cssText = 'color:var(--text2);margin-right:12px';
      sp.textContent = l + ': '; const st = document.createElement('strong'); st.textContent = v || '—';
      sp.appendChild(st); row2.appendChild(sp);
    });
    if (m > 0) {
      const sp = document.createElement('span'); sp.style.cssText = 'color:var(--text2);margin-right:12px';
      sp.textContent = 'Total: '; const st = document.createElement('strong');
      st.style.color = ex > 0 ? 'var(--green)' : '';
      st.textContent = fmtH(m) + (ex > 0 ? ` (+${fmtH(ex)})` : '');
      sp.appendChild(st); row2.appendChild(sp);
    }
    mc.append(row1, row2);
    ml.appendChild(mc);
  });

  // desktop
  const table = document.createElement('table'); table.className = 'tbl';
  const thead = document.createElement('thead'); const trH = document.createElement('tr');
  ['Funcionário','Data','Entrada','Almoço','Retorno','Saída','Total','Status'].forEach(t => {
    const th = document.createElement('th'); th.textContent = t; trH.appendChild(th);
  });
  thead.appendChild(trH);
  const tbody = document.createElement('tbody');
  [...pontos].reverse().forEach(p => {
    const f = funcs.find(f => f.id === p.fid); const m = calcMins(p);
    const tr = document.createElement('tr');
    [f?.nome||'—', p.data, p.entrada||'—', p.alSaida||'—', p.alRetorno||'—', p.saida||'—'].forEach(v => {
      const td = document.createElement('td'); td.textContent = v; tr.appendChild(td);
    });
    const tdT = document.createElement('td'); tdT.style.color = m > 480 ? 'var(--green)' : ''; tdT.textContent = m > 0 ? fmtH(m) : '—';
    const tdS = document.createElement('td'); tdS.appendChild(badge(p.status, p.status === 'Completo' ? 'bg' : 'by'));
    tr.append(tdT, tdS); tbody.appendChild(tr);
  });
  table.append(thead, tbody);
  const card = document.createElement('div'); card.className = 'card'; card.style.padding = '0';
  card.appendChild(table);
  const dt = document.createElement('div'); dt.className = 'dt'; dt.appendChild(card);

  wrap.append(ml, dt);
  return wrap;
}

// ── Ação registrar ponto ──────────────────────────────────────────
async function registrarPonto(tipo) {
  const { selFunc, empresa } = state;
  if (!selFunc) { showAlert('Selecione um funcionário', 'r'); return; }
  const id = parseInt(selFunc);

  // Se a cerca virtual está ativa, captura a localização antes de marcar.
  let coords = null;
  if (empresa?.geofenceAtivo) {
    try {
      showAlert('Obtendo sua localização…', 'y');
      coords = await api.obterLocalizacao();
    } catch (err) {
      showAlert(err.message, 'r');
      return;
    }
  }

  try {
    const ponto = await api.marcarPonto(id, tipo, coords);
    await recarregarPontos();
    if (tipo === 'saida') {
      showAlert('Jornada finalizada!');
    } else {
      const label = tipo === 'entrada' ? 'Entrada' : tipo === 'alSaida' ? 'Saída almoço' : 'Retorno';
      showAlert(`${label} às ${ponto[tipo]}`);
    }
  } catch (err) {
    showAlert(err.message, 'r');
  }
}

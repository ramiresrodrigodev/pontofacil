import { state, setState, showAlert } from '../state.js';
import { av, badge, calcMins, fmtH, icon, toMin } from '../helpers.js';
import { exportarPDF, exportarExcel } from '../export.js';

export function buildRelatorios() {
  const { funcs, pontos, folgas, relFunc, relMes } = state;

  const wrap = document.createElement('div');

  // ── Seletores ──
  const selF = document.createElement('select'); selF.className = 'sel'; selF.style.marginBottom = '8px';
  selF.append(Object.assign(document.createElement('option'), { value:'', textContent:'Selecione o funcionário...' }));
  funcs.forEach(f => {
    const o = document.createElement('option'); o.value = f.id; o.textContent = f.nome;
    if (String(f.id) === relFunc) o.selected = true;
    selF.appendChild(o);
  });
  selF.addEventListener('change', e => setState({ relFunc: e.target.value }));

  const selM = document.createElement('input'); selM.className = 'inp'; selM.type = 'month'; selM.value = relMes; selM.style.marginBottom = '16px';
  selM.addEventListener('change', e => setState({ relMes: e.target.value }));

  wrap.append(selF, selM);

  if (!relFunc) {
    const empty = document.createElement('div'); empty.className = 'empty'; empty.style.paddingTop = '60px';
    const ic = icon('ti-chart-bar'); ic.style.cssText = 'font-size:48px;color:var(--text3);display:block;margin-bottom:12px';
    empty.append(ic, document.createTextNode('Selecione um funcionário e mês'));
    wrap.appendChild(empty);
    return wrap;
  }

  // ── Cálculo ──
  const fid  = parseInt(relFunc);
  const func = funcs.find(f => f.id === fid);
  const pf   = pontos.filter(p => p.fid === fid && p.data.startsWith(relMes));
  let tot = 0, ext = 0, fal = 0, atr = 0;
  pf.forEach(p => {
    const m = calcMins(p); tot += m;
    if (m > 480) ext += (m - 480); else if (m < 480) fal += (480 - m);
    if (toMin(p.entrada) > 8 * 60 + 5) atr++;
  });
  const dt = pf.filter(p => p.status === 'Completo').length;
  const df = folgas.filter(f => f.fid === fid && f.status === 'Aprovado' && f.inicio.startsWith(relMes)).length;
  const bh = ext - fal;

  // dados consolidados para exportação
  const rel = {
    funcNome: func.nome, funcCargo: func.cargo, mes: relMes,
    tot, ext, fal, atr, dt, df, bh, registros: pf,
  };

  // ── Botões de exportação ──
  const exportRow = document.createElement('div');
  Object.assign(exportRow.style, { display: 'flex', gap: '8px', marginBottom: '12px' });

  const exportar = async (fn, btn, rotulo) => {
    const original = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Gerando…';
    try {
      await fn(rel);
    } catch (err) {
      showAlert(err.message || `Falha ao exportar ${rotulo}.`, 'r');
    } finally {
      btn.disabled = false; btn.innerHTML = original;
    }
  };

  const btnPdf = document.createElement('button');
  btnPdf.className = 'btn btn-s'; btnPdf.style.flex = '1';
  btnPdf.append(icon('ti-file-type-pdf'), document.createTextNode(' Exportar PDF'));
  btnPdf.addEventListener('click', () => exportar(exportarPDF, btnPdf, 'PDF'));

  const btnXls = document.createElement('button');
  btnXls.className = 'btn btn-s'; btnXls.style.flex = '1';
  btnXls.append(icon('ti-file-type-xls'), document.createTextNode(' Exportar Excel'));
  btnXls.addEventListener('click', () => exportar(exportarExcel, btnXls, 'Excel'));

  exportRow.append(btnPdf, btnXls);

  // ── Card cabeçalho ──
  const cardHeader = document.createElement('div'); cardHeader.className = 'card'; cardHeader.style.marginBottom = '12px';

  const top = document.createElement('div');
  Object.assign(top.style, { display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' });
  const info = document.createElement('div'); info.style.flex = '1';
  const n = document.createElement('div'); n.style.cssText = 'font-weight:600;font-size:14px'; n.textContent = func.nome;
  const s = document.createElement('div'); s.style.cssText = 'font-size:12px;color:var(--text3)'; s.textContent = func.cargo + ' • ' + func.contrato;
  info.append(n, s);
  const mesBadge = document.createElement('span'); mesBadge.className = 'badge bb'; mesBadge.textContent = relMes;
  top.append(av(func.nome, 40, 14), info, mesBadge);

  // stats principais
  const g2 = document.createElement('div'); g2.className = 'g2'; g2.style.cssText = 'gap:8px;margin-bottom:8px';
  [
    ['Trabalhadas', fmtH(tot), '', 'var(--accent)', Math.min(100, Math.round(tot / (160 * 60) * 100))],
    ['Extras',      fmtH(ext), '', 'var(--green)',  null],
    ['Faltantes',   fmtH(fal), '', fal > 0 ? 'var(--red)' : '', null],
    ['Banco horas', (bh >= 0 ? '+' : '') + fmtH(Math.abs(bh)), '', bh >= 0 ? 'var(--green)' : 'var(--red)', null],
  ].forEach(([label, val, , color, pct]) => {
    const sc = document.createElement('div'); sc.className = 'scard';
    const l = document.createElement('div'); l.className = 'slabel'; l.textContent = label;
    const v = document.createElement('div'); v.className = 'sval'; v.style.cssText = `font-size:20px;color:${color}`; v.textContent = val;
    sc.append(l, v);
    if (pct !== null) {
      const bar = document.createElement('div'); bar.className = 'hbar';
      const fill = document.createElement('div'); fill.className = 'hfill'; fill.style.cssText = `width:${pct}%;background:var(--accent)`;
      bar.appendChild(fill); sc.appendChild(bar);
    }
    g2.appendChild(sc);
  });

  const g3 = document.createElement('div'); g3.className = 'g3'; g3.style.gap = '8px';
  [['Dias trab.', String(dt), ''],['Dias folga', String(df), ''],['Atrasos', String(atr), atr > 0 ? 'var(--yellow)' : '']].forEach(([l, v, c]) => {
    const sc = document.createElement('div'); sc.className = 'scard';
    const lEl = document.createElement('div'); lEl.className = 'slabel'; lEl.textContent = l;
    const vEl = document.createElement('div'); vEl.className = 'sval'; vEl.style.cssText = `font-size:20px;color:${c}`; vEl.textContent = v;
    sc.append(lEl, vEl); g3.appendChild(sc);
  });

  cardHeader.append(top, g2, g3);

  // ── Registros mobile ──
  const ml = document.createElement('div'); ml.className = 'ml';
  if (pf.length === 0) {
    const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = 'Nenhum registro neste mês'; ml.appendChild(empty);
  } else {
    [...pf].sort((a, b) => a.data.localeCompare(b.data)).forEach(p => {
      const m = calcMins(p);
      const mc = document.createElement('div'); mc.className = 'mc';
      const r1 = document.createElement('div');
      Object.assign(r1.style, { display:'flex', justifyContent:'space-between', marginBottom:'6px' });
      const dateEl = document.createElement('strong'); dateEl.style.fontSize = '13px'; dateEl.textContent = p.data;
      r1.append(dateEl, badge(p.status, p.status === 'Completo' ? 'bg' : 'by'));
      const r2 = document.createElement('div'); Object.assign(r2.style, { display:'flex', flexWrap:'wrap', fontSize:'12px' });
      [['Entrada', p.entrada],['Saída', p.saida]].forEach(([l, v]) => {
        const sp = document.createElement('span'); sp.style.cssText = 'color:var(--text2);margin-right:12px';
        sp.textContent = l + ': '; const st = document.createElement('strong'); st.textContent = v || '—';
        sp.appendChild(st); r2.appendChild(sp);
      });
      if (m > 0) {
        const sp = document.createElement('span'); sp.style.cssText = 'color:var(--text2);margin-right:12px';
        sp.textContent = 'Total: '; const st = document.createElement('strong'); st.style.color = m > 480 ? 'var(--green)' : ''; st.textContent = fmtH(m);
        sp.appendChild(st); r2.appendChild(sp);
      }
      mc.append(r1, r2); ml.appendChild(mc);
    });
  }

  // ── Registros desktop ──
  const table = document.createElement('table'); table.className = 'tbl';
  const thead = document.createElement('thead'); const trH = document.createElement('tr');
  ['Data','Entrada','S.Almoço','Retorno','Saída','Total','Status'].forEach(t => {
    const th = document.createElement('th'); th.textContent = t; trH.appendChild(th);
  });
  thead.appendChild(trH);
  const tbody = document.createElement('tbody');
  [...pf].sort((a, b) => a.data.localeCompare(b.data)).forEach(p => {
    const m = calcMins(p); const tr = document.createElement('tr');
    [p.data, p.entrada||'—', p.alSaida||'—', p.alRetorno||'—', p.saida||'—'].forEach(v => {
      const td = document.createElement('td'); td.textContent = v; tr.appendChild(td);
    });
    const tdT = document.createElement('td'); tdT.style.color = m > 480 ? 'var(--green)' : ''; tdT.textContent = m > 0 ? fmtH(m) : '—';
    const tdS = document.createElement('td'); tdS.appendChild(badge(p.status, p.status === 'Completo' ? 'bg' : 'by'));
    tr.append(tdT, tdS); tbody.appendChild(tr);
  });
  table.append(thead, tbody);
  const card2 = document.createElement('div'); card2.className = 'card'; card2.style.padding = '0'; card2.appendChild(table);
  const dt2 = document.createElement('div'); dt2.className = 'dt'; dt2.appendChild(card2);

  wrap.append(exportRow, cardHeader, ml, dt2);
  return wrap;
}

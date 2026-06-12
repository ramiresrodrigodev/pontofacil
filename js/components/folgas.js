import { state, setState, showAlert, recarregarFolgas } from '../state.js';
import { av, badge, icon } from '../helpers.js';
import { TIPOS_FOLGA } from '../data.js';
import * as api from '../api.js';

export function buildFolgas() {
  const { funcs, folgas, filtroFolga } = state;
  const pendentes = folgas.filter(f => f.status === 'Pendente');
  const lista     = folgas.filter(f => filtroFolga === 'Todos' || f.status === filtroFolga);

  const wrap = document.createElement('div');

  // ── Alerta de pendentes ──
  if (pendentes.length > 0) {
    const alertEl = document.createElement('div');
    alertEl.className = 'alert ay';
    alertEl.textContent = `${pendentes.length} solicitação(ões) pendente(s) de aprovação.`;
    wrap.appendChild(alertEl);
  }

  // ── Filtro + botão novo ──
  const barraFiltro = document.createElement('div');
  Object.assign(barraFiltro.style, { display:'flex', gap:'8px', marginBottom:'12px' });

  const sel = document.createElement('select'); sel.className = 'sel'; sel.style.flex = '1';
  ['Todos','Pendente','Aprovado','Recusado'].forEach(o => {
    const opt = document.createElement('option'); opt.value = o; opt.textContent = o;
    if (o === filtroFolga) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', e => setState({ filtroFolga: e.target.value }));

  const btnNova = document.createElement('button'); btnNova.className = 'btn btn-p';
  btnNova.append(icon('ti-plus'), document.createTextNode(' Nova'));
  btnNova.addEventListener('click', () => setState({
    modal: 'nova-folga',
    formFolga: { fid:'', tipo:'Folga semanal', inicio:'', fim:'', obs:'' },
  }));
  barraFiltro.append(sel, btnNova);

  // ── Cards de folgas ──
  const lista2 = document.createElement('div');
  Object.assign(lista2.style, { display:'flex', flexDirection:'column', gap:'8px' });

  if (lista.length === 0) {
    const empty = document.createElement('div'); empty.className = 'empty'; empty.textContent = 'Nenhuma folga encontrada';
    lista2.appendChild(empty);
  } else {
    lista.forEach(f => {
      const func = funcs.find(fu => fu.id === f.fid);
      const mc = document.createElement('div'); mc.className = 'mc';

      const row1 = document.createElement('div');
      Object.assign(row1.style, { display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' });
      const info = document.createElement('div'); info.style.flex = '1';
      const n = document.createElement('div'); n.style.cssText = 'font-weight:600;font-size:13px'; n.textContent = func?.nome || '—';
      const d = document.createElement('div'); d.style.cssText = 'font-size:11px;color:var(--text3)';
      d.textContent = f.inicio + (f.fim && f.fim !== f.inicio ? ` → ${f.fim}` : '');
      info.append(n, d);
      const statusB = f.status === 'Aprovado' ? badge('Aprovado','bg') : f.status === 'Recusado' ? badge('Recusado','br') : badge('Pendente','by');
      row1.append(av(func?.nome || '?', 28, 10), info, statusB);

      const row2 = document.createElement('div');
      Object.assign(row2.style, { display:'flex', justifyContent:'space-between', alignItems:'center' });
      const tipoBadge = document.createElement('span'); tipoBadge.className = 'badge bb'; tipoBadge.textContent = f.tipo;
      row2.appendChild(tipoBadge);

      if (f.status === 'Pendente') {
        const acoes = document.createElement('div'); acoes.style.cssText = 'display:flex;gap:6px';
        const bAp = document.createElement('button'); bAp.className = 'btn btn-ok btn-sm';
        bAp.append(icon('ti-check'), document.createTextNode(' Aprovar'));
        bAp.addEventListener('click', async () => {
          try {
            await api.atualizarStatusFolga(f.id, 'Aprovado');
            await recarregarFolgas();
            showAlert('Folga aprovada!');
          } catch (err) { showAlert(err.message, 'r'); }
        });
        const bRe = document.createElement('button'); bRe.className = 'btn btn-d btn-sm';
        bRe.appendChild(icon('ti-x'));
        bRe.addEventListener('click', async () => {
          try {
            await api.atualizarStatusFolga(f.id, 'Recusado');
            await recarregarFolgas();
            showAlert('Folga recusada.', 'r');
          } catch (err) { showAlert(err.message, 'r'); }
        });
        acoes.append(bAp, bRe);
        row2.appendChild(acoes);
      }

      mc.append(row1, row2);
      if (f.obs) {
        const obs = document.createElement('div'); obs.style.cssText = 'font-size:11px;color:var(--text3);margin-top:6px'; obs.textContent = f.obs;
        mc.appendChild(obs);
      }
      lista2.appendChild(mc);
    });
  }

  wrap.append(barraFiltro, lista2);
  return wrap;
}

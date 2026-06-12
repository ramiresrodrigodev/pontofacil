import { state, showAlert, recarregarFuncionarios } from '../state.js';
import { icon } from '../helpers.js';
import { ESCALAS_DEF } from '../data.js';
import * as api from '../api.js';

export function buildEscalas() {
  const { funcs } = state;
  const wrap = document.createElement('div');

  // ── Cards de escalas ──
  const cardsWrap = document.createElement('div');
  Object.assign(cardsWrap.style, { display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' });

  Object.entries(ESCALAS_DEF).forEach(([key, e]) => {
    const membros = funcs.filter(f => f.escala === key && f.status === 'Ativo');
    const card = document.createElement('div'); card.className = 'card';

    // header
    const header = document.createElement('div');
    Object.assign(header.style, { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' });
    const hLeft = document.createElement('div');
    const hTitle = document.createElement('div'); hTitle.style.cssText = 'font-weight:600;font-size:14px'; hTitle.textContent = e.label;
    const hSub   = document.createElement('div'); hSub.style.cssText   = 'font-size:11px;color:var(--text3)'; hSub.textContent = e.carga > 0 ? `${e.carga}h/semana` : 'Configurável';
    hLeft.append(hTitle, hSub);
    const keyBadge = document.createElement('span'); keyBadge.className = 'badge bb'; keyBadge.textContent = key;
    header.append(hLeft, keyBadge);

    // detalhes
    const details = document.createElement('div');
    Object.assign(details.style, { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px', fontSize:'12px', marginBottom:'10px' });
    [['Entrada', e.entrada],['Saída', e.saida],['Almoço', e.almoco],['Dias', e.dias]].forEach(([l, v]) => {
      const d = document.createElement('div');
      d.innerHTML = `<span style="color:var(--text3)">${l}: </span><strong>${v}</strong>`;
      details.appendChild(d);
    });

    // membros
    const membrosWrap = document.createElement('div');
    Object.assign(membrosWrap.style, { display:'flex', flexWrap:'wrap', gap:'4px' });
    if (membros.length === 0) {
      const empty = document.createElement('span'); empty.style.cssText = 'font-size:12px;color:var(--text3)'; empty.textContent = 'Nenhum funcionário';
      membrosWrap.appendChild(empty);
    } else {
      membros.forEach(f => {
        const chip = document.createElement('span'); chip.className = 'chip'; chip.style.fontSize = '11px'; chip.textContent = f.nome.split(' ')[0];
        membrosWrap.appendChild(chip);
      });
    }

    card.append(header, details, membrosWrap);
    cardsWrap.appendChild(card);
  });

  // ── Card alterar escala ──
  let feState = '', neState = '5x2';

  const cardAlt = document.createElement('div'); cardAlt.className = 'card';
  const title = document.createElement('div'); title.className = 'sec'; title.textContent = 'Alterar escala';

  const fgFunc = document.createElement('div'); fgFunc.className = 'fg';
  const lblF = document.createElement('label'); lblF.className = 'fl'; lblF.textContent = 'Funcionário';
  const selF = document.createElement('select'); selF.className = 'sel';
  selF.append(Object.assign(document.createElement('option'), { value:'', textContent:'Selecione...' }));
  funcs.filter(f => f.status === 'Ativo').forEach(f => {
    const o = document.createElement('option'); o.value = f.id; o.textContent = `${f.nome} (${f.escala})`;
    selF.appendChild(o);
  });
  selF.addEventListener('change', e => { feState = e.target.value; });
  fgFunc.append(lblF, selF);

  const fgEsc = document.createElement('div'); fgEsc.className = 'fg';
  const lblE = document.createElement('label'); lblE.className = 'fl'; lblE.textContent = 'Nova escala';
  const selE = document.createElement('select'); selE.className = 'sel';
  Object.keys(ESCALAS_DEF).forEach(k => {
    const o = document.createElement('option'); o.value = k; o.textContent = k; selE.appendChild(o);
  });
  selE.addEventListener('change', e => { neState = e.target.value; });
  fgEsc.append(lblE, selE);

  const btnAplicar = document.createElement('button'); btnAplicar.className = 'btn btn-p btn-full';
  btnAplicar.append(icon('ti-check'), document.createTextNode(' Aplicar Escala'));
  btnAplicar.addEventListener('click', async () => {
    if (!feState) { showAlert('Selecione um funcionário', 'r'); return; }
    const func = state.funcs.find(f => f.id === parseInt(feState));
    if (!func) { showAlert('Funcionário não encontrado', 'r'); return; }
    try {
      await api.atualizarFuncionario(func.id, { ...func, escala: neState });
      await recarregarFuncionarios();
      showAlert('Escala atualizada!');
    } catch (err) { showAlert(err.message, 'r'); }
  });

  cardAlt.append(title, fgFunc, fgEsc, btnAplicar);
  wrap.append(cardsWrap, cardAlt);
  return wrap;
}

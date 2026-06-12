import { state, setState, showAlert, recarregarFuncionarios } from '../state.js';
import { av, badge, badgeStatus, badgeContrato, icon } from '../helpers.js';
import * as api from '../api.js';

export function buildFuncionarios() {
  const { funcs, filtro, filtroStatus } = state;

  const lista = funcs.filter(f =>
    (filtroStatus === 'Todos' || f.status === filtroStatus) &&
    (f.nome.toLowerCase().includes(filtro.toLowerCase()) ||
     f.cargo.toLowerCase().includes(filtro.toLowerCase()))
  );

  const wrap = document.createElement('div');

  // ── Barra de busca ──
  const searchRow = document.createElement('div');
  Object.assign(searchRow.style, { display:'flex', gap:'8px', marginBottom:'12px' });

  const inpBusca = document.createElement('input');
  inpBusca.className = 'inp'; inpBusca.placeholder = 'Buscar...'; inpBusca.value = filtro;
  inpBusca.style.flex = '1';
  inpBusca.addEventListener('input', e => setState({ filtro: e.target.value }));

  const selStatus = document.createElement('select');
  selStatus.className = 'sel'; selStatus.style.width = '110px';
  ['Todos','Ativo','Inativo'].forEach(o => {
    const opt = document.createElement('option');
    opt.value = o; opt.textContent = o;
    if (o === filtroStatus) opt.selected = true;
    selStatus.appendChild(opt);
  });
  selStatus.addEventListener('change', e => setState({ filtroStatus: e.target.value }));

  searchRow.append(inpBusca, selStatus);

  // ── Botão novo ──
  const btnNovo = document.createElement('button');
  btnNovo.className = 'btn btn-p btn-full';
  btnNovo.style.marginBottom = '12px';
  btnNovo.append(icon('ti-plus'), document.createTextNode(' Novo Funcionário'));
  btnNovo.addEventListener('click', () => setState({
    modal: 'novo-func',
    formFunc: { nome:'', cargo:'', departamento:'', salario:'', contrato:'CLT', status:'Ativo', email:'', telefone:'', dataAdmissao:'', escala:'5x2' },
  }));

  // ── Mobile cards ──
  const mCards = document.createElement('div');
  mCards.className = 'ml';

  if (lista.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty'; empty.textContent = 'Nenhum funcionário encontrado';
    mCards.appendChild(empty);
  } else {
    lista.forEach(f => {
      const mc = document.createElement('div'); mc.className = 'mc';

      const row1 = document.createElement('div');
      Object.assign(row1.style, { display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' });
      const info = document.createElement('div'); info.style.flex = '1';
      const nome = document.createElement('div'); nome.style.cssText = 'font-weight:600;font-size:14px'; nome.textContent = f.nome;
      const sub  = document.createElement('div'); sub.style.cssText  = 'font-size:12px;color:var(--text3)'; sub.textContent = f.cargo + ' • ' + f.departamento;
      info.append(nome, sub);
      row1.append(av(f.nome), info, badgeStatus(f.status));

      const row2 = document.createElement('div');
      Object.assign(row2.style, { display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px' });
      const chipEsc = document.createElement('span'); chipEsc.className = 'chip'; chipEsc.style.fontSize = '11px'; chipEsc.textContent = f.escala;
      const salSpan = document.createElement('span'); salSpan.style.cssText = 'font-size:12px;color:var(--text2)'; salSpan.textContent = 'R$ ' + Number(f.salario).toLocaleString('pt-BR');
      row2.append(badgeContrato(f.contrato), chipEsc, salSpan);

      const row3 = document.createElement('div');
      Object.assign(row3.style, { display:'flex', gap:'8px' });
      const bEdit = document.createElement('button'); bEdit.className = 'btn btn-s btn-sm'; bEdit.style.flex = '1'; bEdit.style.justifyContent = 'center';
      bEdit.append(icon('ti-edit'), document.createTextNode(' Editar'));
      bEdit.addEventListener('click', () => abrirEditar(f));
      const bDel = document.createElement('button'); bDel.className = 'btn btn-d btn-sm';
      bDel.appendChild(icon('ti-trash'));
      bDel.addEventListener('click', () => excluir(f.id));
      row3.append(bEdit, bDel);

      mc.append(row1, row2, row3);
      mCards.appendChild(mc);
    });
  }

  // ── Desktop table ──
  const table = document.createElement('table'); table.className = 'tbl';
  const thead = document.createElement('thead');
  const trH   = document.createElement('tr');
  ['Funcionário','Cargo','Contrato','Salário','Escala','Status',''].forEach(t => {
    const th = document.createElement('th'); th.textContent = t; trH.appendChild(th);
  });
  thead.appendChild(trH);

  const tbody = document.createElement('tbody');
  lista.forEach(f => {
    const tr = document.createElement('tr');

    const tdN = document.createElement('td');
    const wN  = document.createElement('div'); Object.assign(wN.style, { display:'flex', alignItems:'center', gap:'8px' });
    const iDiv = document.createElement('div');
    const n1 = document.createElement('div'); n1.style.fontWeight = '500'; n1.textContent = f.nome;
    const n2 = document.createElement('div'); n2.style.cssText = 'font-size:11px;color:var(--text3)'; n2.textContent = f.email;
    iDiv.append(n1, n2); wN.append(av(f.nome), iDiv); tdN.appendChild(wN);

    const tdC  = document.createElement('td'); tdC.textContent = f.cargo;
    const tdCt = document.createElement('td'); tdCt.appendChild(badgeContrato(f.contrato));
    const tdS  = document.createElement('td'); tdS.textContent = 'R$ ' + Number(f.salario).toLocaleString('pt-BR');
    const tdE  = document.createElement('td'); const chipE = document.createElement('span'); chipE.className = 'chip'; chipE.textContent = f.escala; tdE.appendChild(chipE);
    const tdSt = document.createElement('td'); tdSt.appendChild(badgeStatus(f.status));

    const tdA = document.createElement('td'); tdA.style.textAlign = 'right';
    const bE  = document.createElement('button'); bE.className = 'btn btn-s btn-sm'; bE.style.marginRight = '4px';
    bE.appendChild(icon('ti-edit')); bE.addEventListener('click', () => abrirEditar(f));
    const bD  = document.createElement('button'); bD.className = 'btn btn-d btn-sm';
    bD.appendChild(icon('ti-trash')); bD.addEventListener('click', () => excluir(f.id));
    tdA.append(bE, bD);

    tr.append(tdN, tdC, tdCt, tdS, tdE, tdSt, tdA);
    tbody.appendChild(tr);
  });

  table.append(thead, tbody);
  const cardTable = document.createElement('div'); cardTable.className = 'card'; cardTable.style.padding = '0';
  cardTable.appendChild(table);
  const dt = document.createElement('div'); dt.className = 'dt'; dt.appendChild(cardTable);

  wrap.append(searchRow, btnNovo, mCards, dt);
  return wrap;
}

function abrirEditar(f) {
  setState({ modal: 'editar-func', formFunc: { ...f, salario: String(f.salario) } });
}

async function excluir(id) {
  if (!confirm('Remover este funcionário?')) return;
  try {
    await api.deletarFuncionario(id);
    await recarregarFuncionarios();
    showAlert('Funcionário removido.', 'r');
  } catch (err) {
    showAlert(err.message, 'r');
  }
}

export async function salvarFunc() {
  const { formFunc, modal } = state;
  if (!formFunc.nome || !formFunc.cargo) { showAlert('Preencha nome e cargo.', 'r'); return; }
  try {
    if (modal === 'novo-func') {
      await api.criarFuncionario(formFunc);
      await recarregarFuncionarios();
      setState({ modal: null });
      showAlert('Funcionário cadastrado!');
    } else {
      await api.atualizarFuncionario(formFunc.id, formFunc);
      await recarregarFuncionarios();
      setState({ modal: null });
      showAlert('Atualizado!');
    }
  } catch (err) {
    showAlert(err.message, 'r');
  }
}

import { state, setState, showAlert, recarregarPontos, recarregarFolgas } from '../state.js';
import { icon } from '../helpers.js';
import { TIPOS_FOLGA } from '../data.js';
import { salvarFunc } from './funcionarios.js';
import * as api from '../api.js';

export function buildModal() {
  const { modal } = state;
  if (!modal) return null;

  const overlay = document.createElement('div'); overlay.className = 'ov';
  overlay.addEventListener('click', e => { if (e.target === overlay) setState({ modal: null }); });

  const modalEl = document.createElement('div'); modalEl.className = 'modal';
  modalEl.addEventListener('click', e => e.stopPropagation());

  const title = document.createElement('div'); title.className = 'modal-t';

  if (modal === 'novo-func' || modal === 'editar-func') {
    title.textContent = modal === 'novo-func' ? 'Novo Funcionário' : 'Editar Funcionário';
    modalEl.appendChild(title);
    modalEl.append(
      row2(
        formField('formFunc', 'Nome *',       'text',   state.formFunc.nome,          'nome'),
        formField('formFunc', 'Cargo *',       'text',   state.formFunc.cargo,         'cargo'),
      ),
      row2(
        formField('formFunc', 'Departamento',  'text',   state.formFunc.departamento,  'departamento'),
        formField('formFunc', 'Salário (R$)',  'number', state.formFunc.salario,       'salario'),
      ),
      row2(
        formField('formFunc', 'Email',         'email',  state.formFunc.email,         'email'),
        formField('formFunc', 'Telefone',      'text',   state.formFunc.telefone,      'telefone'),
      ),
      row2(
        formSel('formFunc', 'Contrato', state.formFunc.contrato, 'contrato', ['CLT','PJ','Estágio']),
        formSel('formFunc', 'Escala',   state.formFunc.escala,   'escala',   ['5x2','6x1','12x36','Personalizada']),
      ),
      row2(
        formField('formFunc', 'Admissão', 'date', state.formFunc.dataAdmissao, 'dataAdmissao'),
        formSel('formFunc', 'Status', state.formFunc.status, 'status', ['Ativo','Inativo']),
      ),
      actions(salvarFunc),
    );

  } else if (modal === 'manual') {
    title.textContent = 'Registro Manual';
    modalEl.appendChild(title);

    const fgFunc = document.createElement('div'); fgFunc.className = 'fg';
    const lbl = document.createElement('label'); lbl.className = 'fl'; lbl.textContent = 'Funcionário *';
    const sel = document.createElement('select'); sel.className = 'sel';
    sel.append(Object.assign(document.createElement('option'), { value:'', textContent:'Selecione...' }));
    state.funcs.forEach(f => {
      const o = document.createElement('option'); o.value = f.id; o.textContent = f.nome;
      if (String(f.id) === state.formManual.fid) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', e => { state.formManual = { ...state.formManual, fid: e.target.value }; });
    fgFunc.append(lbl, sel);

    modalEl.append(
      fgFunc,
      formField('formManual', 'Data *',        'date', state.formManual.data,        'data'),
      row2(
        formField('formManual', 'Entrada *',   'time', state.formManual.entrada,     'entrada'),
        formField('formManual', 'Saída almoço','time', state.formManual.alSaida,     'alSaida'),
      ),
      row2(
        formField('formManual', 'Retorno',     'time', state.formManual.alRetorno,   'alRetorno'),
        formField('formManual', 'Saída final', 'time', state.formManual.saida,       'saida'),
      ),
      formField('formManual', 'Observação', 'text', state.formManual.obs, 'obs'),
      actions(salvarManual),
    );

  } else if (modal === 'nova-folga') {
    title.textContent = 'Nova Solicitação de Folga';
    modalEl.appendChild(title);

    const fgFunc = document.createElement('div'); fgFunc.className = 'fg';
    const lbl = document.createElement('label'); lbl.className = 'fl'; lbl.textContent = 'Funcionário *';
    const sel = document.createElement('select'); sel.className = 'sel';
    sel.append(Object.assign(document.createElement('option'), { value:'', textContent:'Selecione...' }));
    state.funcs.filter(f => f.status === 'Ativo').forEach(f => {
      const o = document.createElement('option'); o.value = f.id; o.textContent = f.nome;
      if (String(f.id) === state.formFolga.fid) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener('change', e => { state.formFolga = { ...state.formFolga, fid: e.target.value }; });
    fgFunc.append(lbl, sel);

    modalEl.append(
      fgFunc,
      formSel('formFolga', 'Tipo', state.formFolga.tipo, 'tipo', TIPOS_FOLGA),
      row2(
        formField('formFolga', 'Início *', 'date', state.formFolga.inicio, 'inicio'),
        formField('formFolga', 'Fim',      'date', state.formFolga.fim,    'fim'),
      ),
      formField('formFolga', 'Observação', 'text', state.formFolga.obs, 'obs'),
      actions(salvarFolga),
    );
  }

  overlay.appendChild(modalEl);
  return overlay;
}

// ── Helpers internos do modal ─────────────────────────────────────

function formField(stateKey, label, type, val, field) {
  const wrap = document.createElement('div'); wrap.className = 'fg';
  const lbl = document.createElement('label'); lbl.className = 'fl'; lbl.textContent = label;
  const inp = document.createElement('input'); inp.className = 'inp'; inp.type = type; inp.value = val || '';
  inp.addEventListener('change', e => { state[stateKey] = { ...state[stateKey], [field]: e.target.value }; });
  wrap.append(lbl, inp);
  return wrap;
}

function formSel(stateKey, label, val, field, opts) {
  const wrap = document.createElement('div'); wrap.className = 'fg';
  const lbl = document.createElement('label'); lbl.className = 'fl'; lbl.textContent = label;
  const sel = document.createElement('select'); sel.className = 'sel';
  opts.forEach(o => {
    const opt = document.createElement('option'); opt.value = o; opt.textContent = o;
    if (o === val) opt.selected = true;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', e => { state[stateKey] = { ...state[stateKey], [field]: e.target.value }; });
  wrap.append(lbl, sel);
  return wrap;
}

function row2(a, b) {
  const d = document.createElement('div'); d.className = 'g2'; d.append(a, b); return d;
}

function actions(onSave) {
  const d = document.createElement('div'); d.className = 'modal-a';
  const bCancel = document.createElement('button'); bCancel.className = 'btn btn-s'; bCancel.textContent = 'Cancelar';
  bCancel.addEventListener('click', () => setState({ modal: null }));
  const bSave = document.createElement('button'); bSave.className = 'btn btn-p'; bSave.textContent = 'Salvar';
  bSave.addEventListener('click', onSave);
  d.append(bCancel, bSave);
  return d;
}

async function salvarManual() {
  const { formManual } = state;
  if (!formManual.fid || !formManual.data || !formManual.entrada) {
    showAlert('Preencha os campos obrigatórios', 'r'); return;
  }
  try {
    await api.criarPontoManual(formManual);
    await recarregarPontos();
    setState({ modal: null });
    showAlert('Ponto registrado!');
  } catch (err) {
    showAlert(err.message, 'r');
  }
}

async function salvarFolga() {
  const { formFolga } = state;
  if (!formFolga.fid || !formFolga.inicio) {
    showAlert('Preencha os campos obrigatórios', 'r'); return;
  }
  try {
    await api.criarFolga(formFolga);
    await recarregarFolgas();
    setState({ modal: null });
    showAlert('Solicitação criada!');
  } catch (err) {
    showAlert(err.message, 'r');
  }
}

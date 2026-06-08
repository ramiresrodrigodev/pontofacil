import { INI_FUNCS, INI_PONTOS, INI_FOLGAS } from './data.js';

export let state = {
  page:         'dashboard',
  funcs:        INI_FUNCS,
  pontos:       INI_PONTOS,
  folgas:       INI_FOLGAS,
  pa:           {},           // pontos ativos (em andamento)
  alert:        null,
  clock:        new Date(),
  modal:        null,
  tab:          'registrar',  // aba ativa na página Ponto
  selFunc:      '',           // funcionário selecionado no Ponto
  filtro:       '',           // busca em Funcionários
  filtroStatus: 'Todos',
  filtroFolga:  'Todos',
  relFunc:      '',           // funcionário no Relatório
  relMes:       '2025-06',
  formFunc:     { nome:'', cargo:'', departamento:'', salario:'', contrato:'CLT', status:'Ativo', email:'', telefone:'', dataAdmissao:'', escala:'5x2' },
  formManual:   { fid:'', data:'', entrada:'', alSaida:'', alRetorno:'', saida:'', obs:'' },
  formFolga:    { fid:'', tipo:'Folga semanal', inicio:'', fim:'', obs:'' },
  _alertTimer:  null,
};

/**
 * Atualiza o estado e re-renderiza a aplicação.
 * Importa render de app.js em runtime para evitar dependência circular.
 */
export function setState(patch) {
  Object.assign(state, patch);
  // importação dinâmica evita circular: state ← app ← state
  import('./app.js').then(m => m.render());
}

/**
 * Exibe uma notificação temporária.
 * @param {string} msg  - Texto da mensagem
 * @param {string} type - 'g' (verde), 'r' (vermelho), 'y' (amarelo)
 */
export function showAlert(msg, type = 'g') {
  clearTimeout(state._alertTimer);
  state.alert = { msg, type };
  state._alertTimer = setTimeout(() => {
    state.alert = null;
    import('./app.js').then(m => m.render());
  }, 3000);
  import('./app.js').then(m => m.render());
}

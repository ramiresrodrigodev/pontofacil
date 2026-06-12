import * as api from './api.js';

const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM

export let state = {
  page:         'dashboard',
  funcs:        [],
  pontos:       [],
  folgas:       [],
  pa:           {},           // pontos do dia em andamento (derivado da API)
  alert:        null,
  clock:        new Date(),
  modal:        null,
  tab:          'registrar',  // aba ativa na página Ponto
  selFunc:      '',           // funcionário selecionado no Ponto
  filtro:       '',           // busca em Funcionários
  filtroStatus: 'Todos',
  filtroFolga:  'Todos',
  relFunc:      '',           // funcionário no Relatório
  relMes:       mesAtual,
  formFunc:     { nome:'', cargo:'', departamento:'', salario:'', contrato:'CLT', status:'Ativo', email:'', telefone:'', dataAdmissao:'', escala:'5x2' },
  formManual:   { fid:'', data:'', entrada:'', alSaida:'', alRetorno:'', saida:'', obs:'' },
  formFolga:    { fid:'', tipo:'Folga semanal', inicio:'', fim:'', obs:'' },
  // Auth / carregamento
  view:         api.isLogged() ? 'app' : 'login',
  usuario:      api.getUser(),
  loading:      false,
  loginErro:    null,
  _alertTimer:  null,
};

/**
 * Atualiza o estado e re-renderiza a aplicação.
 * Importa render de app.js em runtime para evitar dependência circular.
 */
export function setState(patch) {
  Object.assign(state, patch);
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

/** Recalcula os pontos do dia "em andamento" (sem saída) por funcionário. */
function recalcPontosAtivos() {
  const hoje = new Date().toISOString().slice(0, 10);
  const pa = {};
  state.pontos.forEach(p => {
    if (p.data === hoje && p.status !== 'Completo') pa[p.fid] = p;
  });
  state.pa = pa;
}

/** Carrega todos os dados do backend para o estado. */
export async function carregarDados() {
  const [funcs, pontos, folgas] = await Promise.all([
    api.getFuncionarios(),
    api.getPontos(),
    api.getFolgas(),
  ]);
  state.funcs  = funcs;
  state.pontos = pontos;
  state.folgas = folgas;
  recalcPontosAtivos();
}

/** Recarrega apenas a lista de pontos (após marcar/registrar). */
export async function recarregarPontos() {
  state.pontos = await api.getPontos();
  recalcPontosAtivos();
}

/** Recarrega apenas a lista de folgas. */
export async function recarregarFolgas() {
  state.folgas = await api.getFolgas();
}

/** Recarrega apenas a lista de funcionários. */
export async function recarregarFuncionarios() {
  state.funcs = await api.getFuncionarios();
}

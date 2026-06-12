// ── Cliente da API PontoFácil ─────────────────────────────────────
// Centraliza chamadas HTTP, autenticação e o mapeamento entre o
// formato do backend (enums em MAIÚSCULAS) e o formato usado pela UI.

// Portas tipicas de servidores estaticos de desenvolvimento (Live Server, etc.)
const DEV_STATIC_PORTS = ['5500', '5501', '3000', '8000', '5173', '4200'];

/**
 * Base da API.
 * - Sobrescrita manual via localStorage('pf_api').
 * - Servido pelo proprio backend (mesma origem): usa caminho relativo ('').
 * - Servido por um static server de dev (ex: Live Server:5500) ou file://: aponta para localhost:8080.
 */
export const apiBase = () => {
  const override = localStorage.getItem('pf_api');
  if (override !== null) return override;
  if (location.protocol === 'file:') return 'http://localhost:8080';
  if (DEV_STATIC_PORTS.includes(location.port)) return 'http://localhost:8080';
  return ''; // mesma origem
};

export const getToken = () => localStorage.getItem('pf_token');
export const getUser  = () => { try { return JSON.parse(localStorage.getItem('pf_user')); } catch { return null; } };
export const isLogged = () => !!getToken();

export function logout() {
  localStorage.removeItem('pf_token');
  localStorage.removeItem('pf_user');
}

/** Requisição genérica com token e tratamento de erro. */
async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(apiBase() + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('Não foi possível conectar ao servidor. O backend está rodando?');
  }

  if (res.status === 401 || res.status === 403) {
    if (token) logout();
    let msg = 'Sessão expirada ou credenciais inválidas.';
    try { const j = await res.json(); if (j.message) msg = j.message; } catch {}
    throw new Error(msg);
  }

  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try { const j = await res.json(); if (j.message) msg = j.message; } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) return null;

  let text;
  try {
    text = await res.text();
  } catch (e) {
    throw new Error('Falha ao ler a resposta do servidor. Verifique a conexão e tente novamente.');
  }
  return text ? JSON.parse(text) : null;
}

// ── Mapeadores backend ↔ UI ───────────────────────────────────────

const CONTRATO_PT  = { CLT: 'CLT', PJ: 'PJ', ESTAGIO: 'Estágio' };
const CONTRATO_API = { CLT: 'CLT', PJ: 'PJ', 'Estágio': 'ESTAGIO' };
const STATUS_PT    = { ATIVO: 'Ativo', INATIVO: 'Inativo' };
const STATUS_API   = { Ativo: 'ATIVO', Inativo: 'INATIVO' };
const FSTATUS_PT   = { PENDENTE: 'Pendente', APROVADO: 'Aprovado', RECUSADO: 'Recusado' };
const FSTATUS_API  = { Pendente: 'PENDENTE', Aprovado: 'APROVADO', Recusado: 'RECUSADO' };
const PSTATUS_PT   = { COMPLETO: 'Completo', INCOMPLETO: 'Incompleto' };
const TIPO_PONTO_API = { entrada: 'ENTRADA', alSaida: 'AL_SAIDA', alRetorno: 'AL_RETORNO', saida: 'SAIDA' };

const hhmm = t => (t ? String(t).slice(0, 5) : null);

const funcFromApi = f => ({
  id: f.id, nome: f.nome, cargo: f.cargo || '', departamento: f.departamento || '',
  salario: f.salario != null ? Number(f.salario) : 0,
  contrato: CONTRATO_PT[f.contrato] || f.contrato || 'CLT',
  status: STATUS_PT[f.status] || f.status || 'Ativo',
  email: f.email || '', telefone: f.telefone || '',
  dataAdmissao: f.dataAdmissao || '', escala: f.escala || '5x2',
});

const funcToApi = f => ({
  nome: f.nome, cargo: f.cargo, departamento: f.departamento,
  salario: f.salario === '' || f.salario == null ? null : Number(f.salario),
  contrato: CONTRATO_API[f.contrato] || f.contrato,
  escala: f.escala,
  status: STATUS_API[f.status] || f.status,
  dataAdmissao: f.dataAdmissao || null,
  email: f.email || null, telefone: f.telefone || null,
});

const pontoFromApi = p => ({
  id: p.id, fid: p.funcionarioId, data: p.data,
  entrada: hhmm(p.entrada), alSaida: hhmm(p.alSaida),
  alRetorno: hhmm(p.alRetorno), saida: hhmm(p.saida),
  status: PSTATUS_PT[p.status] || p.status, obs: p.observacao || '',
});

const folgaFromApi = f => ({
  id: f.id, fid: f.funcionarioId, tipo: f.tipo,
  inicio: f.inicio, fim: f.fim,
  status: FSTATUS_PT[f.status] || f.status, obs: f.observacao || '',
});

// ── Endpoints ─────────────────────────────────────────────────────

export async function login(email, senha) {
  const data = await request('/api/auth/login', { method: 'POST', body: { email, senha } });
  localStorage.setItem('pf_token', data.token);
  localStorage.setItem('pf_user', JSON.stringify({ nome: data.nome, perfil: data.perfil }));
  return data;
}

export const getFuncionarios = () =>
  request('/api/funcionarios').then(l => l.map(funcFromApi));

export const criarFuncionario = f =>
  request('/api/funcionarios', { method: 'POST', body: funcToApi(f) }).then(funcFromApi);

export const atualizarFuncionario = (id, f) =>
  request(`/api/funcionarios/${id}`, { method: 'PUT', body: funcToApi(f) }).then(funcFromApi);

export const deletarFuncionario = id =>
  request(`/api/funcionarios/${id}`, { method: 'DELETE' });

export const getPontos = () =>
  request('/api/pontos').then(l => l.map(pontoFromApi));

export const marcarPonto = (fid, tipo) =>
  request('/api/pontos/marcar', { method: 'POST', body: { funcionarioId: fid, tipo: TIPO_PONTO_API[tipo] || tipo } }).then(pontoFromApi);

export const criarPontoManual = m =>
  request('/api/pontos/manual', { method: 'POST', body: {
    funcionarioId: Number(m.fid), data: m.data, entrada: m.entrada,
    alSaida: m.alSaida || null, alRetorno: m.alRetorno || null,
    saida: m.saida || null, observacao: m.obs || null,
  } }).then(pontoFromApi);

export const getFolgas = () =>
  request('/api/folgas').then(l => l.map(folgaFromApi));

export const criarFolga = f =>
  request('/api/folgas', { method: 'POST', body: {
    funcionarioId: Number(f.fid), tipo: f.tipo, inicio: f.inicio,
    fim: f.fim || null, observacao: f.obs || null,
  } }).then(folgaFromApi);

export const atualizarStatusFolga = (id, statusPt) =>
  request(`/api/folgas/${id}/status`, { method: 'PATCH', body: { status: FSTATUS_API[statusPt] || statusPt } }).then(folgaFromApi);

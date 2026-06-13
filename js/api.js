// ── Cliente da API PontoFácil ─────────────────────────────────────
// Centraliza chamadas HTTP, autenticação e o mapeamento entre o
// formato do backend (enums em MAIÚSCULAS) e o formato usado pela UI.
//
// MODO DEMONSTRAÇÃO: quando não há backend acessível (ex.: GitHub Pages,
// que serve só estático), o app cai automaticamente para dados locais em
// memória — restaurando o comportamento standalone do MVP. Com um backend
// rodando, usa a API real normalmente.

import { INI_FUNCS, INI_PONTOS, INI_FOLGAS } from './data.js';

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

// ── Modo demonstração (sem backend) ───────────────────────────────

const DEMO_TOKEN = 'demo';
let DEMO = getToken() === DEMO_TOKEN;
let demo = DEMO ? freshDemo() : null;

export const isDemo = () => DEMO;

function freshDemo() {
  return {
    funcs:  JSON.parse(JSON.stringify(INI_FUNCS)),
    pontos: JSON.parse(JSON.stringify(INI_PONTOS)),
    folgas: JSON.parse(JSON.stringify(INI_FOLGAS)),
    empresa: { id: 1, nome: 'Minha Empresa (demo)', cnpj: '12.345.678/0001-90',
               latitude: null, longitude: null, raioMetros: null, geofenceAtivo: false },
    seq: 1000,
  };
}

function entrarDemo() {
  DEMO = true;
  demo = freshDemo();
  localStorage.setItem('pf_token', DEMO_TOKEN);
  localStorage.setItem('pf_user', JSON.stringify({ nome: 'Gestor (demo)', perfil: 'GESTOR' }));
  return { token: DEMO_TOKEN, nome: 'Gestor (demo)', perfil: 'GESTOR' };
}

const nid    = () => (++demo.seq);
const clone  = x => JSON.parse(JSON.stringify(x));
const nowHHMM = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
};

/** Distância em metros entre dois pontos (Haversine). */
function distanciaMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Obtém a localização atual do dispositivo.
 * @returns {Promise<{latitude:number, longitude:number, accuracy:number}>}
 */
export function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste navegador.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      err => {
        const msg = err.code === 1 ? 'Permissão de localização negada.'
                  : err.code === 3 ? 'Tempo esgotado ao obter a localização.'
                  : 'Não foi possível obter sua localização.';
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  });
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
  let res;
  try {
    res = await fetch(apiBase() + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
  } catch (e) {
    // Sem backend acessível (ex.: GitHub Pages) → modo demonstração
    return entrarDemo();
  }

  // Se a resposta não é JSON, não é a nossa API (host estático devolvendo
  // 404/405/501 em HTML, como o GitHub Pages) → modo demonstração.
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return entrarDemo();

  const data = await res.json();
  if (res.status === 401 || res.status === 403) {
    throw new Error(data.message || 'E-mail ou senha inválidos');
  }
  if (!res.ok) {
    throw new Error(data.message || `Erro ${res.status}`);
  }

  DEMO = false;
  localStorage.setItem('pf_token', data.token);
  localStorage.setItem('pf_user', JSON.stringify({ nome: data.nome, perfil: data.perfil }));
  return data;
}

export const getFuncionarios = () =>
  DEMO ? Promise.resolve(clone(demo.funcs))
       : request('/api/funcionarios').then(l => l.map(funcFromApi));

export function criarFuncionario(f) {
  if (DEMO) {
    const novo = { ...f, id: nid(), salario: Number(f.salario) || 0 };
    demo.funcs.push(novo);
    return Promise.resolve(clone(novo));
  }
  return request('/api/funcionarios', { method: 'POST', body: funcToApi(f) }).then(funcFromApi);
}

export function atualizarFuncionario(id, f) {
  if (DEMO) {
    const atualizado = { ...f, id, salario: Number(f.salario) || 0 };
    demo.funcs = demo.funcs.map(x => x.id === id ? atualizado : x);
    return Promise.resolve(clone(atualizado));
  }
  return request(`/api/funcionarios/${id}`, { method: 'PUT', body: funcToApi(f) }).then(funcFromApi);
}

export function deletarFuncionario(id) {
  if (DEMO) {
    demo.funcs  = demo.funcs.filter(x => x.id !== id);
    demo.pontos = demo.pontos.filter(p => p.fid !== id);
    demo.folgas = demo.folgas.filter(f => f.fid !== id);
    return Promise.resolve(null);
  }
  return request(`/api/funcionarios/${id}`, { method: 'DELETE' });
}

export const getPontos = () =>
  DEMO ? Promise.resolve(clone(demo.pontos))
       : request('/api/pontos').then(l => l.map(pontoFromApi));

export function marcarPonto(fid, tipo, coords = null) {
  if (DEMO) {
    const e = demo.empresa;
    if (e.latitude != null && e.longitude != null && e.raioMetros != null) {
      if (!coords) return Promise.reject(new Error('Ative a localização do dispositivo para registrar o ponto.'));
      const dist = distanciaMetros(e.latitude, e.longitude, coords.latitude, coords.longitude);
      if (dist > e.raioMetros) {
        return Promise.reject(new Error(`Fora do local permitido: você está a ${Math.round(dist)} m da empresa (limite de ${e.raioMetros} m).`));
      }
    }
    const hoje = new Date().toISOString().slice(0, 10);
    let p = demo.pontos.find(x => x.fid === fid && x.data === hoje && x.status !== 'Completo');
    if (!p) { p = { id: nid(), fid, data: hoje, entrada: null, alSaida: null, alRetorno: null, saida: null, status: 'Incompleto', obs: '' }; demo.pontos.push(p); }
    p[tipo] = nowHHMM();
    if (coords) { p.latitude = coords.latitude; p.longitude = coords.longitude; }
    p.status = p.saida ? 'Completo' : 'Incompleto';
    return Promise.resolve(clone(p));
  }
  return request('/api/pontos/marcar', { method: 'POST', body: {
    funcionarioId: fid, tipo: TIPO_PONTO_API[tipo] || tipo,
    latitude: coords ? coords.latitude : null,
    longitude: coords ? coords.longitude : null,
  } }).then(pontoFromApi);
}

// ── Empresa / cerca virtual (geofence) ────────────────────────────

export function getEmpresa() {
  if (DEMO) return Promise.resolve(clone(demo.empresa));
  return request('/api/empresa');
}

export function definirGeofence({ latitude, longitude, raioMetros }) {
  if (DEMO) {
    Object.assign(demo.empresa, { latitude, longitude, raioMetros, geofenceAtivo: true });
    return Promise.resolve(clone(demo.empresa));
  }
  return request('/api/empresa/geofence', { method: 'PUT', body: { latitude, longitude, raioMetros } });
}

export function removerGeofence() {
  if (DEMO) {
    Object.assign(demo.empresa, { latitude: null, longitude: null, raioMetros: null, geofenceAtivo: false });
    return Promise.resolve(clone(demo.empresa));
  }
  return request('/api/empresa/geofence', { method: 'DELETE' });
}

export function criarPontoManual(m) {
  if (DEMO) {
    const novo = {
      id: nid(), fid: Number(m.fid), data: m.data,
      entrada: m.entrada || null, alSaida: m.alSaida || null,
      alRetorno: m.alRetorno || null, saida: m.saida || null,
      status: m.saida ? 'Completo' : 'Incompleto', obs: m.obs || '',
    };
    demo.pontos.push(novo);
    return Promise.resolve(clone(novo));
  }
  return request('/api/pontos/manual', { method: 'POST', body: {
    funcionarioId: Number(m.fid), data: m.data, entrada: m.entrada,
    alSaida: m.alSaida || null, alRetorno: m.alRetorno || null,
    saida: m.saida || null, observacao: m.obs || null,
  } }).then(pontoFromApi);
}

export const getFolgas = () =>
  DEMO ? Promise.resolve(clone(demo.folgas))
       : request('/api/folgas').then(l => l.map(folgaFromApi));

export function criarFolga(f) {
  if (DEMO) {
    const novo = {
      id: nid(), fid: Number(f.fid), tipo: f.tipo,
      inicio: f.inicio, fim: f.fim || f.inicio,
      status: 'Pendente', obs: f.obs || '',
    };
    demo.folgas.push(novo);
    return Promise.resolve(clone(novo));
  }
  return request('/api/folgas', { method: 'POST', body: {
    funcionarioId: Number(f.fid), tipo: f.tipo, inicio: f.inicio,
    fim: f.fim || null, observacao: f.obs || null,
  } }).then(folgaFromApi);
}

export function atualizarStatusFolga(id, statusPt) {
  if (DEMO) {
    demo.folgas = demo.folgas.map(x => x.id === id ? { ...x, status: statusPt } : x);
    return Promise.resolve(clone(demo.folgas.find(x => x.id === id)));
  }
  return request(`/api/folgas/${id}/status`, { method: 'PATCH', body: { status: FSTATUS_API[statusPt] || statusPt } }).then(folgaFromApi);
}

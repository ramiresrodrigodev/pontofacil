import { state, setState, carregarDados } from '../state.js';
import * as api from '../api.js';

const LOGO_SVG = `
<svg width="44" height="44" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="9" fill="#4f46e5"/>
  <circle cx="16" cy="15" r="6" stroke="white" stroke-width="2" fill="none"/>
  <path d="M16 11.5V15L18.5 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="16" cy="15" r="1" fill="white"/>
  <path d="M9 24h14" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
</svg>`;

export function buildLogin() {
  let email = 'gestor@pontofacil.com';
  let senha = '123456';

  const wrap = document.createElement('div');
  wrap.className = 'login-wrap';

  const card = document.createElement('div');
  card.className = 'login-card';

  const logo = document.createElement('div');
  logo.style.cssText = 'display:flex;justify-content:center;margin-bottom:10px';
  logo.innerHTML = LOGO_SVG;

  const title = document.createElement('div');
  title.style.cssText = 'text-align:center;font-size:20px;font-weight:700;color:var(--accent);letter-spacing:-.3px';
  title.textContent = 'PontoFácil';

  const sub = document.createElement('div');
  sub.style.cssText = 'text-align:center;font-size:13px;color:var(--text3);margin-bottom:20px';
  sub.textContent = 'Acesse o painel de RH';

  const form = document.createElement('form');

  const fgE = document.createElement('div'); fgE.className = 'fg';
  const lE = document.createElement('label'); lE.className = 'fl'; lE.textContent = 'E-mail';
  const iE = document.createElement('input'); iE.className = 'inp'; iE.type = 'email'; iE.value = email; iE.autocomplete = 'username';
  iE.addEventListener('input', e => email = e.target.value);
  fgE.append(lE, iE);

  const fgS = document.createElement('div'); fgS.className = 'fg';
  const lS = document.createElement('label'); lS.className = 'fl'; lS.textContent = 'Senha';
  const iS = document.createElement('input'); iS.className = 'inp'; iS.type = 'password'; iS.value = senha; iS.autocomplete = 'current-password';
  iS.addEventListener('input', e => senha = e.target.value);
  fgS.append(lS, iS);

  const erro = document.createElement('div');
  if (state.loginErro) {
    erro.className = 'alert ar';
    erro.style.marginBottom = '12px';
    erro.textContent = state.loginErro;
  }

  const btn = document.createElement('button');
  btn.className = 'btn btn-p btn-full';
  btn.type = 'submit';
  btn.style.marginTop = '6px';
  btn.textContent = state.loading ? 'Entrando...' : 'Entrar';
  btn.disabled = state.loading;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (state.loading) return;
    setState({ loading: true, loginErro: null });
    try {
      await api.login(email, senha);
      await carregarDados();
      setState({ view: 'app', usuario: api.getUser(), loading: false, page: 'dashboard' });
    } catch (err) {
      setState({ loading: false, loginErro: err.message });
    }
  });

  const dica = document.createElement('div');
  dica.style.cssText = 'text-align:center;font-size:11px;color:var(--text3);margin-top:16px';
  dica.textContent = 'Demo: gestor@pontofacil.com / 123456';

  form.append(fgE, fgS, erro, btn);
  card.append(logo, title, sub, form, dica);
  wrap.appendChild(card);
  return wrap;
}

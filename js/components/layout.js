import { state, setState } from '../state.js';
import { icon, fmtTime, ini } from '../helpers.js';
import { PAGES } from '../data.js';
import { logout, isDemo } from '../api.js';

const LOGO_SVG = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="9" fill="#4f46e5"/>
  <rect x="6" y="6" width="20" height="20" rx="5" fill="white" fill-opacity="0.15"/>
  <circle cx="16" cy="15" r="6" stroke="white" stroke-width="2" fill="none"/>
  <path d="M16 11.5V15L18.5 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="16" cy="15" r="1" fill="white"/>
  <path d="M9 24h14" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
</svg>`;

export function buildSidebar() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  // ── Logo ──
  const logo = document.createElement('div');
  logo.className = 'logo';

  const logoIcon = document.createElement('div');
  logoIcon.innerHTML = LOGO_SVG;
  logoIcon.style.cssText = 'flex-shrink:0;line-height:0';

  const logoText = document.createElement('div');
  const name = document.createElement('div');
  name.style.cssText = 'font-size:15px;font-weight:700;color:var(--accent);letter-spacing:-.3px';
  name.textContent = 'PontoFácil';
  const sub = document.createElement('div');
  sub.className = 'logo-sub';
  sub.textContent = 'Sistema de RH';
  logoText.append(name, sub);
  logo.append(logoIcon, logoText);

  // ── Nav ──
  const nav = document.createElement('div');
  nav.className = 'snav';

  PAGES.forEach(p => {
    const item = document.createElement('button');
    item.className = `snav-item${state.page === p.id ? ' active' : ''}`;
    const ic = icon(p.icon);
    const label = document.createElement('span');
    label.textContent = p.label;
    item.append(ic, label);
    item.addEventListener('click', () => setState({ page: p.id }));
    nav.appendChild(item);
  });

  // ── Footer ──
  const foot = document.createElement('div');
  foot.style.cssText = 'padding:12px 8px;border-top:1px solid var(--border)';
  const cfg = document.createElement('button');
  cfg.className = 'snav-item';
  cfg.append(icon('ti-settings'), Object.assign(document.createElement('span'), { textContent: 'Configurações' }));
  foot.appendChild(cfg);

  sidebar.append(logo, nav, foot);
  return sidebar;
}

export function buildTopbar() {
  const label = PAGES.find(p => p.id === state.page)?.label || '';

  const topbar = document.createElement('div');
  topbar.className = 'topbar';

  // Lado esquerdo — logo mobile + título
  const left = document.createElement('div');
  left.style.cssText = 'display:flex;align-items:center;gap:10px';

  // Logo mini visível só no mobile
  const logoMini = document.createElement('div');
  logoMini.innerHTML = LOGO_SVG;
  logoMini.style.cssText = 'line-height:0;flex-shrink:0';
  Object.assign(logoMini.querySelector('svg').style, { width:'28px', height:'28px' });

  // Esconde logo mini no desktop via CSS inline (sidebar já mostra)
  logoMini.style.cssText = 'line-height:0;flex-shrink:0';
  const style = document.createElement('style');
  style.textContent = '@media(min-width:768px){.logo-mini{display:none!important}}';
  document.head.appendChild(style);
  logoMini.classList.add('logo-mini');

  const title = document.createElement('div');
  title.className = 'topbar-title';
  title.textContent = label;
  left.append(logoMini, title);

  // Lado direito — clock + avatar
  const right = document.createElement('div');
  right.style.cssText = 'display:flex;align-items:center;gap:10px';

  if (isDemo()) {
    const demoChip = document.createElement('span');
    demoChip.className = 'badge by';
    demoChip.style.cssText = 'font-size:11px;font-weight:600';
    demoChip.title = 'Sem backend conectado — usando dados locais de demonstração';
    demoChip.textContent = 'Modo demo';
    right.appendChild(demoChip);
  }

  const clockWrap = document.createElement('div');
  clockWrap.style.cssText = 'display:flex;align-items:center;gap:5px;background:var(--bg3);border:1px solid var(--border);padding:5px 10px;border-radius:20px';
  const clockIcon = icon('ti-clock');
  clockIcon.style.cssText = 'font-size:13px;color:var(--text3)';
  const clockEl = document.createElement('span');
  clockEl.id = 'clock-display';
  clockEl.style.cssText = 'font-size:12px;font-weight:500;color:var(--text2)';
  clockEl.textContent = fmtTime(state.clock);
  clockWrap.append(clockIcon, clockEl);

  const nomeUser = state.usuario?.nome || 'Gestor';
  const avatar = document.createElement('div');
  avatar.className = 'av';
  Object.assign(avatar.style, { width:'32px', height:'32px', fontSize:'11px', cursor:'pointer' });
  avatar.title = `${nomeUser} — sair`;
  avatar.textContent = ini(nomeUser);
  avatar.addEventListener('click', () => {
    if (confirm(`Sair da conta de ${nomeUser}?`)) {
      logout();
      setState({ view: 'login', usuario: null, page: 'dashboard', funcs: [], pontos: [], folgas: [], pa: {} });
    }
  });

  right.append(clockWrap, avatar);
  topbar.append(left, right);
  return topbar;
}

export function buildBottomNav() {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';

  PAGES.forEach(p => {
    const item = document.createElement('button');
    item.className = `bnav-item${state.page === p.id ? ' active' : ''}`;

    const ic = icon(p.icon);
    const label = document.createElement('span');
    label.textContent = p.label;

    // Indicador ativo
    if (state.page === p.id) {
      const dot = document.createElement('div');
      dot.style.cssText = 'width:4px;height:4px;border-radius:50%;background:var(--accent);position:absolute;top:6px';
      item.style.position = 'relative';
      item.append(dot);
    }

    item.append(ic, label);
    item.addEventListener('click', () => setState({ page: p.id }));
    nav.appendChild(item);
  });

  return nav;
}

import { state, setState } from '../state.js';
import { icon, fmtTime } from '../helpers.js';
import { PAGES } from '../data.js';

export function buildSidebar() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';

  // Logo
  const logo = document.createElement('div');
  logo.className = 'logo';
  logo.innerHTML = '<div class="logo-text">PontoFácil</div><div class="logo-sub">Sistema de RH</div>';

  // Nav items
  const nav = document.createElement('div');
  nav.className = 'snav';
  PAGES.forEach(p => {
    const item = document.createElement('button');
    item.className = `snav-item${state.page === p.id ? ' active' : ''}`;
    item.append(icon(p.icon), Object.assign(document.createElement('span'), { textContent: p.label }));
    item.addEventListener('click', () => setState({ page: p.id }));
    nav.appendChild(item);
  });

  // Footer
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

  const title = document.createElement('div');
  title.className = 'topbar-title';
  title.textContent = label;

  const right = document.createElement('div');
  right.style.cssText = 'display:flex;align-items:center;gap:8px';

  const clock = document.createElement('span');
  clock.id = 'clock-display';
  clock.style.cssText = 'font-size:12px;color:var(--text3)';
  clock.textContent = fmtTime(state.clock);

  const avatar = document.createElement('div');
  avatar.className = 'av';
  Object.assign(avatar.style, { width: '28px', height: '28px', fontSize: '10px' });
  avatar.textContent = 'GE';

  right.append(clock, avatar);
  topbar.append(title, right);
  return topbar;
}

export function buildBottomNav() {
  const nav = document.createElement('nav');
  nav.className = 'bottom-nav';

  PAGES.forEach(p => {
    const item = document.createElement('button');
    item.className = `bnav-item${state.page === p.id ? ' active' : ''}`;
    item.append(icon(p.icon), Object.assign(document.createElement('span'), { textContent: p.label }));
    item.addEventListener('click', () => setState({ page: p.id }));
    nav.appendChild(item);
  });

  return nav;
}

import { state }              from './state.js';
import { fmtTime }            from './helpers.js';
import { buildSidebar, buildTopbar, buildBottomNav } from './components/layout.js';
import { buildDashboard }     from './components/dashboard.js';
import { buildFuncionarios }  from './components/funcionarios.js';
import { buildPonto }         from './components/ponto.js';
import { buildEscalas }       from './components/escalas.js';
import { buildFolgas }        from './components/folgas.js';
import { buildRelatorios }    from './components/relatorios.js';
import { buildModal }         from './components/modals.js';

const PAGES_MAP = {
  dashboard:    buildDashboard,
  funcionarios: buildFuncionarios,
  ponto:        buildPonto,
  escalas:      buildEscalas,
  folgas:       buildFolgas,
  relatorios:   buildRelatorios,
};

export function render() {
  const root = document.getElementById('app');
  root.innerHTML = '';

  const app  = document.createElement('div'); app.className = 'app';
  const main = document.createElement('div'); main.className = 'main';

  app.appendChild(buildSidebar());
  main.appendChild(buildTopbar());

  // Alerta global
  if (state.alert) {
    const aw = document.createElement('div'); aw.style.padding = '10px 16px 0';
    const alertEl = document.createElement('div'); alertEl.className = `alert a${state.alert.type}`; alertEl.textContent = state.alert.msg;
    aw.appendChild(alertEl); main.appendChild(aw);
  }

  // Conteúdo da página atual
  const content = document.createElement('div'); content.className = 'content';
  const builder = PAGES_MAP[state.page] || buildDashboard;
  content.appendChild(builder());
  main.appendChild(content);

  app.appendChild(main);
  app.appendChild(buildBottomNav());

  // Modal
  const modal = buildModal();
  if (modal) app.appendChild(modal);

  root.appendChild(app);
}

// ── Clock — atualiza só o elemento sem re-render completo ─────────
setInterval(() => {
  state.clock = new Date();
  const el = document.getElementById('clock-display');
  if (el) el.textContent = fmtTime(state.clock);
}, 1000);

// ── Inicialização ─────────────────────────────────────────────────
render();

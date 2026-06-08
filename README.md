# PontoFácil

> Sistema web de RH e controle de ponto para pequenas e médias empresas. MVP funcional, responsivo e pronto para demonstração comercial.

![Status](https://img.shields.io/badge/status-MVP-4f46e5?style=flat-square) ![Tech](https://img.shields.io/badge/tech-Vanilla%20JS-f59e0b?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-16a34a?style=flat-square)

---

## 🔗 Demo ao vivo

**[ramiresrodrigodev.github.io/pontofacil](https://ramiresrodrigodev.github.io/pontofacil/)**

---

## ✨ Funcionalidades

### 👤 Gestão de Funcionários
- Cadastro completo: nome, cargo, departamento, salário e admissão
- Tipos de contrato: CLT, PJ e Estágio
- Status ativo/inativo com filtro e busca em tempo real
- Edição e exclusão de registros

### ⏰ Controle de Ponto
- Marcação em 4 etapas: entrada → saída almoço → retorno → saída final
- Registro manual para gestores com justificativa
- Painel em tempo real com situação de toda a equipe
- Histórico com cálculo automático de horas extras

### 📅 Escalas de Trabalho
- **5x2** — Segunda a Sexta, 08h–17h (40h/semana)
- **6x1** — Segunda a Sábado, 08h–16h (44h/semana)
- **12x36** — Jornada alternada, 07h–19h (42h/semana)
- **Personalizada** — Configurável por empresa
- Troca de escala por funcionário com um clique

### 🌴 Controle de Folgas
- Tipos: Folga semanal, Banco de horas, Férias, Atestado, Feriado e Licença
- Fluxo de aprovação: Pendente → Aprovado / Recusado
- Alertas visuais de solicitações pendentes

### 📊 Relatório Mensal
- Horas trabalhadas, extras e faltantes
- Banco de horas acumulado (crédito ou débito)
- Dias trabalhados, dias de folga e atrasos
- Tabela detalhada de todos os registros do período

---

## 📱 Layout Responsivo

| Dispositivo | Layout |
|---|---|
| Mobile (< 768px) | Bottom navigation + cards empilhados |
| Desktop (≥ 768px) | Sidebar lateral + tabelas |

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 + CSS3 | Estrutura e estilo |
| JavaScript ES Modules | Lógica, estado e renderização |
| Inter (Google Fonts) | Tipografia |
| Tabler Icons | Ícones via CDN |
| GitHub Pages | Hospedagem |

Zero frameworks. Zero dependências de build. Código organizado em módulos nativos do browser.

---

## 📁 Estrutura do Projeto

```
pontofacil/
├── index.html                  # Entry point
├── css/
│   └── styles.css              # Estilos globais e design tokens
└── js/
    ├── app.js                  # Render principal + clock
    ├── data.js                 # Dados iniciais e constantes
    ├── helpers.js              # Utilitários de DOM e formatação
    ├── state.js                # Estado global, setState, showAlert
    └── components/
        ├── layout.js           # Sidebar, Topbar, BottomNav, Logo
        ├── dashboard.js        # Página Dashboard
        ├── funcionarios.js     # Página Funcionários
        ├── ponto.js            # Página Controle de Ponto
        ├── escalas.js          # Página Escalas
        ├── folgas.js           # Página Folgas
        ├── relatorios.js       # Página Relatórios
        └── modals.js           # Modais de cadastro
```

---

## 🚀 Como rodar localmente

O projeto usa ES Modules — não funciona via `file://`. Use um servidor local:

**VS Code (recomendado)**
1. Instale a extensão **Live Server**
2. Clique com botão direito no `index.html`
3. Selecione **Open with Live Server**

**Python**
```bash
git clone https://github.com/ramiresrodrigodev/pontofacil.git
cd pontofacil
python -m http.server 8080
# Acesse http://localhost:8080
```

---

## 🗺️ Roadmap

O MVP usa dados em memória — resetam ao recarregar. Próximos passos:

- [ ] Backend com Java 21 + Spring Boot + PostgreSQL
- [ ] Autenticação JWT por perfil (Gestor / Funcionário)
- [ ] Geolocalização no registro de ponto
- [ ] Exportação de relatório em PDF e Excel
- [ ] Persistência de dados em banco
- [ ] Suporte multi-empresa

---

## 👨‍💻 Autor

**Rodrigo Ramires** — Desenvolvedor Back-End Java
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/ramiresrodrigodev)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/ramiresrodrigodev)

---

## 📄 Licença

MIT — veja [LICENSE](LICENSE) para detalhes.

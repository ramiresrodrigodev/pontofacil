# PontoFácil — Sistema de RH e Controle de Ponto

> MVP web para gestão de recursos humanos e controle de ponto, desenvolvido como demonstração comercial. Roda direto no navegador, sem instalação ou servidor.

![Status](https://img.shields.io/badge/status-MVP-blue) ![Tech](https://img.shields.io/badge/tech-Vanilla%20JS-yellow) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Demonstração

🔗 **[pontofacil ao vivo](https://ramiresrodrigodev.github.io/pontofacil/)**

---

## Funcionalidades

### 👤 Gestão de Funcionários
- Cadastro completo com nome, cargo e departamento
- Tipo de contrato: CLT, PJ ou Estágio
- Salário, e-mail, telefone e data de admissão
- Status ativo/inativo com filtro por status
- Busca em tempo real por nome ou cargo
- Edição e exclusão de registros

### ⏰ Controle de Ponto
- Marcação em 4 etapas: entrada → saída para almoço → retorno → saída final
- Registro manual para gestores com campo de justificativa
- Painel de situação em tempo real da equipe
- Histórico completo com cálculo automático de horas trabalhadas
- Detecção de horas extras (acima de 8h/dia) destacadas em verde

### 📅 Escalas de Trabalho
- **5x2** — Segunda a Sexta, 08h às 17h (40h/semana)
- **6x1** — Segunda a Sábado, 08h às 16h (44h/semana)
- **12x36** — Jornada alternada 07h às 19h (42h/semana)
- **Personalizada** — Configurável por empresa
- Visualização dos funcionários vinculados a cada escala
- Alteração de escala por funcionário com um clique

### 🌴 Controle de Folgas
- Tipos suportados: Folga semanal, Banco de horas, Férias, Atestado, Feriado e Licença
- Fluxo de aprovação: Pendente → Aprovado / Recusado
- Alerta visual de solicitações pendentes
- Filtro por status
- Registro de período com data de início e fim

### 📊 Relatório Mensal
- Seleção por funcionário e mês
- Horas trabalhadas com barra de progresso
- Horas extras e horas faltantes
- Banco de horas acumulado (crédito ou débito)
- Dias trabalhados, dias de folga e atrasos
- Tabela detalhada de todos os registros do mês

---

## Layout

O sistema é totalmente responsivo:

| Dispositivo | Layout |
|---|---|
| Mobile (< 768px) | Bottom navigation + cards empilhados |
| Desktop (≥ 768px) | Sidebar lateral + tabelas |

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 + CSS3 | Estrutura e estilo |
| JavaScript (ES6+) | Lógica e renderização |
| Tabler Icons | Ícones via CDN |
| GitHub Pages | Hospedagem gratuita |

Sem frameworks, sem build step, sem dependências de compilação. O arquivo `index.html` abre diretamente no navegador.

---

## Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/ramiresrodrigodev/pontofacil.git

# Acesse a pasta
cd pontofacil

# Abra no navegador
# Opção 1 — VS Code com extensão Live Server: clique direito > Open with Live Server
# Opção 2 — Python (já vem no Windows/Mac/Linux):
python -m http.server 8080
# Acesse: http://localhost:8080
```

> ⚠️ Não abrir via `file://` diretamente — alguns CDNs bloqueiam requisições sem servidor HTTP.

---

## Estrutura do Projeto

```
pontofacil/
├── index.html     # Aplicação completa (HTML + CSS + JS)
└── README.md      # Documentação
```

---

## Roadmap

O MVP atual usa dados em memória (resetam ao recarregar a página). Os próximos passos planejados são:

- [ ] **Backend** — API REST com Java 21 + Spring Boot + PostgreSQL
- [ ] **Autenticação** — Login com JWT, perfis Gestor e Funcionário
- [ ] **Geolocalização** — Registro de ponto com coordenadas GPS
- [ ] **Exportação** — Relatório mensal em PDF e Excel
- [ ] **Notificações** — Alertas de folgas pendentes e atrasos
- [ ] **Multi-empresa** — Suporte a múltiplas empresas na mesma instância

---

## Autor

**Rodrigo Ramires**
Desenvolvedor Back-End Java em formação

[![LinkedIn](https://img.shields.io/badge/LinkedIn-blue?logo=linkedin)](https://linkedin.com/in/seu-perfil)
[![GitHub](https://img.shields.io/badge/GitHub-black?logo=github)](https://github.com/ramiresrodrigodev)

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

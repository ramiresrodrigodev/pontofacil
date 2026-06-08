# PontoFácil — Sistema de RH e Controle de Ponto

MVP web para gestão de RH e controle de ponto, desenvolvido como demonstração comercial.

## Funcionalidades

- **Gestão de Funcionários** — Cadastro completo com cargo, departamento, salário, tipo de contrato (CLT, PJ, Estágio) e status
- **Controle de Ponto** — Entrada, saída para almoço, retorno e saída final; registro manual para gestores; histórico de marcações
- **Escalas de Trabalho** — 5x2, 6x1, 12x36 e escalas personalizadas
- **Controle de Folgas** — Férias, banco de horas, atestados, feriados e licenças; fluxo de aprovação
- **Relatório Mensal** — Horas trabalhadas, extras, faltantes, atrasos, dias trabalhados, banco de horas acumulado

## Como usar

Abra o arquivo `index.html` diretamente no navegador. Nenhuma instalação necessária.

## Tecnologias

- React 18 (via CDN)
- JavaScript puro (sem build step)
- Tabler Icons

## Status

MVP funcional com dados em memória. Próximos passos:
- [ ] Backend com Spring Boot + PostgreSQL
- [ ] Autenticação JWT por perfil (Gestor / Funcionário)
- [ ] Geolocalização no registro de ponto
- [ ] Exportação de relatório em PDF

## Autor

Rodrigo — Java Back-End Developer em formação  
[LinkedIn](https://linkedin.com/in/seu-perfil)

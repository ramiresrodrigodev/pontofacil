export const INI_FUNCS = [
  { id:1, nome:'Ana Lima', cargo:'Desenvolvedora', departamento:'TI', salario:8500, contrato:'CLT', status:'Ativo', email:'ana@empresa.com', telefone:'11 99999-0001', dataAdmissao:'2022-03-01', escala:'5x2' },
  { id:2, nome:'Bruno Costa', cargo:'Designer', departamento:'Marketing', salario:6200, contrato:'CLT', status:'Ativo', email:'bruno@empresa.com', telefone:'11 99999-0002', dataAdmissao:'2021-07-15', escala:'5x2' },
  { id:3, nome:'Carla Souza', cargo:'Analista Financeiro', departamento:'Financeiro', salario:7800, contrato:'CLT', status:'Ativo', email:'carla@empresa.com', telefone:'11 99999-0003', dataAdmissao:'2023-01-10', escala:'5x2' },
  { id:4, nome:'Daniel Rocha', cargo:'Estágio em TI', departamento:'TI', salario:1800, contrato:'Estágio', status:'Ativo', email:'daniel@empresa.com', telefone:'11 99999-0004', dataAdmissao:'2024-02-01', escala:'5x2' },
  { id:5, nome:'Emília Nunes', cargo:'Consultora PJ', departamento:'Comercial', salario:12000, contrato:'PJ', status:'Inativo', email:'emilia@empresa.com', telefone:'11 99999-0005', dataAdmissao:'2020-05-20', escala:'5x2' },
];

export const INI_PONTOS = [
  { id:1, fid:1, data:'2025-06-02', entrada:'08:02', alSaida:'12:05', alRetorno:'13:10', saida:'17:30', status:'Completo' },
  { id:2, fid:1, data:'2025-06-03', entrada:'08:15', alSaida:'12:00', alRetorno:'13:05', saida:'17:45', status:'Completo' },
  { id:3, fid:2, data:'2025-06-02', entrada:'09:00', alSaida:'12:30', alRetorno:'13:30', saida:'18:00', status:'Completo' },
  { id:4, fid:2, data:'2025-06-03', entrada:'09:20', alSaida:'12:30', alRetorno:'13:30', saida:'18:10', status:'Completo' },
  { id:5, fid:3, data:'2025-06-03', entrada:'07:55', alSaida:'12:00', alRetorno:'13:00', saida:'17:00', status:'Completo' },
];

export const INI_FOLGAS = [
  { id:1, fid:1, tipo:'Férias', inicio:'2025-07-01', fim:'2025-07-15', status:'Aprovado', obs:'Férias anuais' },
  { id:2, fid:2, tipo:'Atestado', inicio:'2025-06-01', fim:'2025-06-01', status:'Aprovado', obs:'Consulta médica' },
  { id:3, fid:3, tipo:'Folga semanal', inicio:'2025-06-07', fim:'2025-06-07', status:'Aprovado', obs:'' },
  { id:4, fid:4, tipo:'Banco de horas', inicio:'2025-06-05', fim:'2025-06-05', status:'Pendente', obs:'Compensação horas extras' },
];

export const ESCALAS_DEF = {
  '5x2':        { label:'5x2 — Seg a Sex',      entrada:'08:00', saida:'17:00', almoco:'1h', dias:'5 dias',    carga:40 },
  '6x1':        { label:'6x1 — Seg a Sáb',      entrada:'08:00', saida:'16:00', almoco:'1h', dias:'6 dias',    carga:44 },
  '12x36':      { label:'12x36 — Dia sim/não',   entrada:'07:00', saida:'19:00', almoco:'1h', dias:'alternado', carga:42 },
  'Personalizada':{ label:'Personalizada',       entrada:'—',     saida:'—',     almoco:'—',  dias:'—',         carga:0  },
};

export const TIPOS_FOLGA = ['Folga semanal','Banco de horas','Férias','Atestado','Feriado','Licença'];

export const PAGES = [
  { id:'dashboard',    icon:'ti-layout-dashboard', label:'Início' },
  { id:'funcionarios', icon:'ti-users',             label:'Funcionários' },
  { id:'ponto',        icon:'ti-clock',             label:'Ponto' },
  { id:'folgas',       icon:'ti-beach',             label:'Folgas' },
  { id:'relatorios',   icon:'ti-chart-bar',         label:'Relatórios' },
  { id:'escalas',      icon:'ti-calendar-month',    label:'Escalas' },
];

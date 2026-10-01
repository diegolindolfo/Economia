import { Category, CategoryInfo } from '../../types';

export const CATEGORIES: Record<Category, CategoryInfo> = {
  receita: {
    id: 'receita',
    label: 'Receitas',
    color: '#2E6B4F',
    bgColor: 'rgba(46, 107, 79, 0.12)',
    borderColor: 'rgba(46, 107, 79, 0.28)',
    iconName: 'ArrowDownLeft',
    description: 'Salários, reembolsos, Pix recebidos e rendimentos'
  },
  moradia: {
    id: 'moradia',
    label: 'Moradia',
    color: '#A0522D',
    bgColor: 'rgba(160, 82, 45, 0.12)',
    borderColor: 'rgba(160, 82, 45, 0.28)',
    iconName: 'Home',
    description: 'Aluguel, condomínio, luz, água, gás e IPTU'
  },
  delivery: {
    id: 'delivery',
    label: 'Delivery',
    color: '#D97706',
    bgColor: 'rgba(217, 119, 6, 0.12)',
    borderColor: 'rgba(217, 119, 6, 0.28)',
    iconName: 'Bike',
    description: 'iFood, Rappi, restaurantes, lanchonetes e bares'
  },
  mercado: {
    id: 'mercado',
    label: 'Mercado',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.12)',
    borderColor: 'rgba(5, 150, 105, 0.28)',
    iconName: 'ShoppingCart',
    description: 'Supermercados, feiras, padarias, hortifrútis e açougues'
  },
  transporte: {
    id: 'transporte',
    label: 'Transporte',
    color: '#0284C7',
    bgColor: 'rgba(2, 132, 199, 0.12)',
    borderColor: 'rgba(2, 132, 199, 0.28)',
    iconName: 'Car',
    description: 'Uber, 99, combustível, postos, pedágio, metrô e estacionamento'
  },
  lazer: {
    id: 'lazer',
    label: 'Lazer',
    color: '#E11D48',
    bgColor: 'rgba(225, 29, 72, 0.12)',
    borderColor: 'rgba(225, 29, 72, 0.28)',
    iconName: 'Gamepad2',
    description: 'Cinemas, shows, bares, eventos, passeios e jogos'
  },
  servicos: {
    id: 'servicos',
    label: 'Serviços',
    color: '#7C3AED',
    bgColor: 'rgba(124, 58, 237, 0.12)',
    borderColor: 'rgba(124, 58, 237, 0.28)',
    iconName: 'Wrench',
    description: 'Manutenção, salão/barbearia, diarista, oficinas e reparos'
  },
  educacao: {
    id: 'educacao',
    label: 'Educação',
    color: '#3A5A80',
    bgColor: 'rgba(58, 90, 128, 0.12)',
    borderColor: 'rgba(58, 90, 128, 0.28)',
    iconName: 'GraduationCap',
    description: 'Cursos, faculdade, escolas, livros e materiais'
  },
  investimento: {
    id: 'investimento',
    label: 'Investimentos',
    color: '#1F6672',
    bgColor: 'rgba(31, 102, 114, 0.12)',
    borderColor: 'rgba(31, 102, 114, 0.28)',
    iconName: 'TrendingUp',
    description: 'Aplicação/Resgate RDB, Caixinhas e Poupança'
  },
  saude: {
    id: 'saude',
    label: 'Saúde',
    color: '#DC2626',
    bgColor: 'rgba(220, 38, 38, 0.12)',
    borderColor: 'rgba(220, 38, 38, 0.28)',
    iconName: 'HeartPulse',
    description: 'Farmácias, clínicas, hospitais, consultas e academias'
  },
  compras: {
    id: 'compras',
    label: 'Compras',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.28)',
    iconName: 'ShoppingBag',
    description: 'E-commerce, vestuário, eletrônicos e presentes'
  },
  assinaturas: {
    id: 'assinaturas',
    label: 'Assinaturas & Contas',
    color: '#2563EB',
    bgColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: 'rgba(37, 99, 235, 0.28)',
    iconName: 'Tv',
    description: 'Streaming, internet, celular e serviços recorrentes'
  },
  alimentacao: {
    id: 'alimentacao',
    label: 'Alimentação Geral',
    color: '#B96A28',
    bgColor: 'rgba(185, 106, 40, 0.12)',
    borderColor: 'rgba(185, 106, 40, 0.28)',
    iconName: 'Utensils',
    description: 'Refeições gerais e gastos alimentares'
  },
  transferencia: {
    id: 'transferencia',
    label: 'Transferências',
    color: '#64748B',
    bgColor: 'rgba(100, 116, 139, 0.12)',
    borderColor: 'rgba(100, 116, 139, 0.28)',
    iconName: 'ArrowUpRight',
    description: 'Pix para pessoas físicas e transferências entre contas'
  },
  outros: {
    id: 'outros',
    label: 'Outros',
    color: '#78716C',
    bgColor: 'rgba(120, 113, 108, 0.12)',
    borderColor: 'rgba(120, 113, 108, 0.28)',
    iconName: 'CircleEllipsis',
    description: 'Despesas diversas não classificadas'
  },
};

export const CATEGORY_LIST: CategoryInfo[] = [
  CATEGORIES.moradia,
  CATEGORIES.mercado,
  CATEGORIES.delivery,
  CATEGORIES.transporte,
  CATEGORIES.lazer,
  CATEGORIES.servicos,
  CATEGORIES.educacao,
  CATEGORIES.saude,
  CATEGORIES.compras,
  CATEGORIES.assinaturas,
  CATEGORIES.investimento,
  CATEGORIES.transferencia,
  CATEGORIES.receita,
  CATEGORIES.outros,
];

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
  alimentacao: {
    id: 'alimentacao',
    label: 'Alimentação',
    color: '#B96A28',
    bgColor: 'rgba(185, 106, 40, 0.12)',
    borderColor: 'rgba(185, 106, 40, 0.28)',
    iconName: 'Utensils',
    description: 'Restaurantes, delivery, supermercados e feiras'
  },
  saude: {
    id: 'saude',
    label: 'Saúde',
    color: '#AE3B2B',
    bgColor: 'rgba(174, 59, 43, 0.12)',
    borderColor: 'rgba(174, 59, 43, 0.28)',
    iconName: 'HeartPulse',
    description: 'Farmácias, clínicas, hospitais e consultas'
  },
  compras: {
    id: 'compras',
    label: 'Compras',
    color: '#6B4E85',
    bgColor: 'rgba(107, 78, 133, 0.12)',
    borderColor: 'rgba(107, 78, 133, 0.28)',
    iconName: 'ShoppingBag',
    description: 'E-commerce, vestuário, eletrônicos e presentes'
  },
  assinaturas: {
    id: 'assinaturas',
    label: 'Assinaturas & Contas',
    color: '#2E5F8A',
    bgColor: 'rgba(46, 95, 138, 0.12)',
    borderColor: 'rgba(46, 95, 138, 0.28)',
    iconName: 'Tv',
    description: 'Streaming, internet, celular e serviços recorrentes'
  },
  transferencia: {
    id: 'transferencia',
    label: 'Transferências',
    color: '#63665C',
    bgColor: 'rgba(99, 102, 92, 0.12)',
    borderColor: 'rgba(99, 102, 92, 0.28)',
    iconName: 'ArrowUpRight',
    description: 'Pix para pessoas físicas e transferências entre contas'
  },
  outros: {
    id: 'outros',
    label: 'Outros',
    color: '#7C7A68',
    bgColor: 'rgba(124, 122, 104, 0.12)',
    borderColor: 'rgba(124, 122, 104, 0.28)',
    iconName: 'CircleEllipsis',
    description: 'Despesas diversas não classificadas'
  },
};

export const CATEGORY_LIST: CategoryInfo[] = [
  CATEGORIES.moradia,
  CATEGORIES.alimentacao,
  CATEGORIES.educacao,
  CATEGORIES.compras,
  CATEGORIES.assinaturas,
  CATEGORIES.saude,
  CATEGORIES.investimento,
  CATEGORIES.transferencia,
  CATEGORIES.receita,
  CATEGORIES.outros,
];

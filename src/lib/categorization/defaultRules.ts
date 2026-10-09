import { CategoryRule } from '../../types';

/**
 * Regras pré-aprendidas de estabelecimentos e transferências recorrentes.
 * Inclui os padrões do extrato Nubank já mapeados com categorias limpas
 * (especialmente distinguindo Mercado vs. Delivery).
 */
export const DEFAULT_LEARNED_RULES: Record<string, CategoryRule> = {
  // Moradia (Aluguel, Condomínio, Energia)
  'TALITA DE FATIMA TEIXEIRA DA SILVA': {
    merchantKey: 'TALITA DE FATIMA TEIXEIRA DA SILVA',
    category: 'moradia',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'CONDOMINIO EDIFICIO SOLAR': {
    merchantKey: 'CONDOMINIO EDIFICIO SOLAR',
    category: 'moradia',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'ENEL DISTRIBUICAO SP': {
    merchantKey: 'ENEL DISTRIBUICAO SP',
    category: 'moradia',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Mercado (Supermercados, feiras, padarias e hortifrútis)
  'PADARIA REAL CENTRO': {
    merchantKey: 'PADARIA REAL CENTRO',
    category: 'mercado',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'PAO DE ACUCAR': {
    merchantKey: 'PAO DE ACUCAR',
    category: 'mercado',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'CARREFOUR': {
    merchantKey: 'CARREFOUR',
    category: 'mercado',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'ASSAI': {
    merchantKey: 'ASSAI',
    category: 'mercado',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'ATACADAO': {
    merchantKey: 'ATACADAO',
    category: 'mercado',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Delivery & Restaurantes (iFood, Rappi, refeições e restaurantes)
  'IFOOD COM AGENCIA': {
    merchantKey: 'IFOOD COM AGENCIA',
    category: 'delivery',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'IFOOD': {
    merchantKey: 'IFOOD',
    category: 'delivery',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'RESTAURANTE COCO BAMBU': {
    merchantKey: 'RESTAURANTE COCO BAMBU',
    category: 'delivery',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'RAPPI': {
    merchantKey: 'RAPPI',
    category: 'delivery',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'ZE DELIVERY': {
    merchantKey: 'ZE DELIVERY',
    category: 'delivery',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Transporte & Mobilidade (Uber, combustíveis, 99)
  'POSTO IPIRANGA': {
    merchantKey: 'POSTO IPIRANGA',
    category: 'transporte',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'UBER BRASIL TECNOLOGIA': {
    merchantKey: 'UBER BRASIL TECNOLOGIA',
    category: 'transporte',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'UBER': {
    merchantKey: 'UBER',
    category: 'transporte',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  '99APP': {
    merchantKey: '99APP',
    category: 'transporte',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Lazer & Entretenimento (Cinemas, ingressos)
  'CINEMARK SHOPPING': {
    merchantKey: 'CINEMARK SHOPPING',
    category: 'lazer',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Serviços Gerais (Barbearia, oficinas)
  'BARBEARIA RETRO CLUB': {
    merchantKey: 'BARBEARIA RETRO CLUB',
    category: 'servicos',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Educação (Cursos, livros)
  'ALURA CURSOS ONLINE': {
    merchantKey: 'ALURA CURSOS ONLINE',
    category: 'educacao',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'LIVRARIA LEITURA SHOPPING': {
    merchantKey: 'LIVRARIA LEITURA SHOPPING',
    category: 'educacao',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Saúde (Drogarias, farmácias)
  'PANVEL FARMACIAS': {
    merchantKey: 'PANVEL FARMACIAS',
    category: 'saude',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'DROGARIA SAO PAULO': {
    merchantKey: 'DROGARIA SAO PAULO',
    category: 'saude',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'FARMACIA DROGASIL': {
    merchantKey: 'FARMACIA DROGASIL',
    category: 'saude',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'DROGA RAIA': {
    merchantKey: 'DROGA RAIA',
    category: 'saude',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Compras & E-commerce
  'AMAZON BR': {
    merchantKey: 'AMAZON BR',
    category: 'compras',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'ZARA BRASIL VESTUARIO': {
    merchantKey: 'ZARA BRASIL VESTUARIO',
    category: 'compras',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'MERCADO LIVRE': {
    merchantKey: 'MERCADO LIVRE',
    category: 'compras',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Assinaturas Recorrentes
  'SPOTIFY BRASIL': {
    merchantKey: 'SPOTIFY BRASIL',
    category: 'assinaturas',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'NETFLIX COM': {
    merchantKey: 'NETFLIX COM',
    category: 'assinaturas',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },

  // Receitas & Investimentos
  'EMPRESA DE TECNOLOGIA LTDA': {
    merchantKey: 'EMPRESA DE TECNOLOGIA LTDA',
    category: 'receita',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'MARCOS AURELIO SOUZA': {
    merchantKey: 'MARCOS AURELIO SOUZA',
    category: 'receita',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'APLICACAO RDB': {
    merchantKey: 'APLICACAO RDB',
    category: 'investimento',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
  'RESGATE RDB': {
    merchantKey: 'RESGATE RDB',
    category: 'investimento',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
};

import { Category, CategoryRule, CategorySource } from '../../types';

interface HeuristicRule {
  regex: RegExp;
  category: Category;
}

export const HEURISTIC_RULES: HeuristicRule[] = [
  // 1. Investimentos
  {
    regex: /\b(APLICACAO RDB|RESGATE RDB|INVESTIMENTO|CAIXINHA|TESOURO DIRETO|CDB|LCI|LCA|DEPOSITO RDB)\b/i,
    category: 'investimento',
  },
  // 2. Moradia (Aluguel, condomínio, concessionárias e utilidades)
  {
    regex: /\b(ALUGUEL|CONDOMINIO|CONDOMÍNIO|ENEL|LIGHT|SABESP|COPASA|SANEPAR|CEDAE|CPFL|COELBA|ENERGISA|CEMIG|AGUA|ÁGUA|ENERGIA|GAS|GÁS|COMGAS|ULTRAGAZ|NACIONAL GAS|LIQUIGAS|IPTU|TAXA DE CONDOMINIO|IMOBILIARIA|IMOBILIÁRIA|QUINTO ANDAR|QUINTOANDAR|LOFT|LPS BRASIL|HABITACAO|HABITAÇÃO|MORADIA)\b/i,
    category: 'moradia',
  },
  // 3. Educação (Cursos, faculdades, escolas, livros, plataformas)
  {
    regex: /\b(FACULDADE|UNIVERSIDADE|COLEGIO|COLÉGIO|ESCOLA|CURSO|CURSOS|UDEMY|ALURA|COURSERA|ROCKETSEAT|HOTMART|EDUZZ|KROTON|ESTACIO|ESTÁCIO|ANHANGUERA|PUC|FGV|SENAC|SENAI|CNA|WIZARD|CCAA|FISK|KUMON|LIVRARIA|SARAIVA|LEITURA|LIVROS|PAPELARIA|ENSINO|IDIOMAS|MBA|POS-GRADUACAO|PÓS-GRADUAÇÃO)\b/i,
    category: 'educacao',
  },
  // 4. Saúde
  {
    regex: /\b(DROGARIA|FARMACIA|FARMÁCIA|CLINIC|CLINICA|CLÍNICA|LABORATORIO|LABORATÓRIO|HOSPITAL|ODONTO|DENTISTA|MEDIC|MEDICO|MÉDICO|CONSULTORIO|CONSULTÓRIO|UNIMED|RAIA|DROGA RAIA|PAGUE MENOS|PANVEL|DROGASIL|SAO JOAO|ULTRAFARMA|EXAME|BIO RITMO|SMART FIT|ACADEMIA)\b/i,
    category: 'saude',
  },
  // 5. Compras & E-commerce
  {
    regex: /\b(AMAZON|AMERICANAS|MERCADO LIVRE|MERCADOLIVRE|SHOPEE|MAGAZINE LUIZA|MAGALU|SHEIN|ALIEXPRESS|ZARA|RENNER|C&A|RIACHUELO|KABUM|FAST SHOP|CASAS BAHIA|PONTO FRIO|CENTAURO|DECATHLON|LEROY MERLIN|KALUNGA|ENJOEI)\b/i,
    category: 'compras',
  },
  // 6. Assinaturas & Serviços Recorrentes
  {
    regex: /\b(NETFLIX|SPOTIFY|BRISANET|CLARO|VIVO|TIM|OI FIBRA|DISNEY|HBO|MAX|YOUTUBE|PRIME VIDEO|APPLE|ICLOUD|CHATGPT|OPENAI|GOOGLE STORAGE|GOOGLE CLOUD|DROPBOX|CANVA|DEEZER|GLOBOPLAY|STARZ|AMAZON PRIME)\b/i,
    category: 'assinaturas',
  },
  // 7. Alimentação & Mercado
  {
    regex: /\b(PIZZARIA|BURGUER|BURGER|LANCHE|RESTAURANTE|PADARIA|ACOUGUE|AÇOUGUE|SUPERMERCADO|MERCADINHO|MERCADO|HORTIFRUTI|IFOOD|RAPPI|UBER EATS|CARREFOUR|PAO DE ACUCAR|PÃO DE AÇÚCAR|ASSAI|ASSAÍ|ATACADAO|ATACADÃO|BAR|CAFETERIA|CAFE|CAFÉ|SUSHI|CHOPP|BAKERY|MCDONALD|BURGER KING|SUBWAY|HABIB|OUTBACK|COCO BAMBU|STARBUCKS|DOCERIA|SORVETES|SORVETERIA|EXTRA|ZAFFARI|GUANABARA|HIROTA|CHOCOLATES|CACAU SHOW)\b/i,
    category: 'alimentacao',
  },
];

/**
 * Determine the category for a transaction given existing user rules and heuristics.
 */
export function determineCategory(
  merchantKey: string,
  fullDesc: string,
  valor: number,
  rules: Record<string, CategoryRule>
): { category: Category; source: CategorySource } {
  // 1. Direct rule match
  if (rules[merchantKey]) {
    return {
      category: rules[merchantKey].category,
      source: 'regra',
    };
  }

  // 2. Fuzzy match against saved rules (Section 5.4: prefix or substring match with min length >= 6)
  const fuzzyCategory = findFuzzyRuleMatch(merchantKey, rules);
  if (fuzzyCategory) {
    return {
      category: fuzzyCategory,
      source: 'regra',
    };
  }

  // 3. Heuristics over description + merchantKey
  const textToScan = `${merchantKey} ${fullDesc}`.toUpperCase();

  for (const rule of HEURISTIC_RULES) {
    if (rule.regex.test(textToScan)) {
      return {
        category: rule.category,
        source: 'heuristica',
      };
    }
  }

  // 4. Positive amount fallback: Receita
  if (valor > 0) {
    return {
      category: 'receita',
      source: 'heuristica',
    };
  }

  // 5. Transfer / Pix fallback
  if (/\b(TRANSFERENCIA|PIX|TED|DOC)\b/i.test(textToScan)) {
    return {
      category: 'transferencia',
      source: 'heuristica',
    };
  }

  // 6. Default
  return {
    category: 'outros',
    source: 'heuristica',
  };
}

/**
 * Fuzzy prefix / substring fallback for slightly truncated merchant names
 */
function findFuzzyRuleMatch(
  merchantKey: string,
  rules: Record<string, CategoryRule>
): Category | null {
  if (merchantKey.length < 6) return null;

  for (const [savedKey, rule] of Object.entries(rules)) {
    if (savedKey.length < 6) continue;

    // Is one a prefix of the other?
    if (merchantKey.startsWith(savedKey) || savedKey.startsWith(merchantKey)) {
      return rule.category;
    }

    // Is one contained in the other with high overlap?
    if (merchantKey.includes(savedKey) || savedKey.includes(merchantKey)) {
      return rule.category;
    }
  }

  return null;
}

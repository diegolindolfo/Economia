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
  // 3. Transporte & Mobilidade (Uber, 99, combustível, postos, pedágio, metrô e passagens)
  {
    regex: /\b(UBER|99APP|99 TECNOLOGIA|99 POP|99TAXI|99 TAXI|TAXI|TÁXI|POSTO|IPIRANGA|SHELL|BR PETROBRAS|PETROBRAS|ALE COMBUSTIVEIS|AUTO POSTO|COMBUSTIVEL|COMBUSTÍVEL|GASOLINA|ETANOL|DIESEL|GNV|SEM PARAR|VELOE|CONECTCAR|TAGGY|PEDAGIO|PEDÁGIO|CCR|ECOVIAS|AUTOBAN|VIAROESTE|METRO|METRÔ|CPTM|BILHETE UNICO|BILHETE ÚNICO|TOP TRANSPORTE|ESTACIONAMENTO|ESTAPAR|ROTATIVO|PASSAGEM|RODOVIARIA|RODOVIÁRIA|LATAM|GOL LINHAS|AZUL LINHAS|VOEGOL|123 MILHAS|MAXMILHAS|BUSER|CLICKBUS|DECOLAR)\b/i,
    category: 'transporte',
  },
  // 4. Alimentação Delivery & Restaurantes (iFood, Rappi, lanches, bares, restaurantes)
  {
    regex: /\b(IFOOD|RAPPI|UBER EATS|DELIVERY|AIQFOME|ZE DELIVERY|ZÉ DELIVERY|PEDIDOSJA|RESTAURANTE|PIZZARIA|BURGUER|BURGER|LANCHE|LANCHONETE|MCDONALD|BURGER KING|SUBWAY|HABIB|OUTBACK|COCO BAMBU|STARBUCKS|DOCERIA|SORVETES|SORVETERIA|SUSHI|TEMAKERIA|CHOPP|PIZZA|ROTISSERIE|CHURRASCARIA|CANTINA|BISTRÔ|BISTRO|CAFETERIA|GELATERIA|GELATO|CREPERIA|TORTAS|GRELHADOS|STEAKHOUSE)\b/i,
    category: 'delivery',
  },
  // 5. Supermercado & Feira (Mercados, feiras, açougues, padarias, hortifrútis)
  {
    regex: /\b(SUPERMERCADO|MERCADINHO|MERCADO|HYPERMERCADO|HIPERMERCADO|HORTIFRUTI|CARREFOUR|PAO DE ACUCAR|PÃO DE AÇÚCAR|ASSAI|ASSAÍ|ATACADAO|ATACADÃO|EXTRA|ZAFFARI|GUANABARA|HIROTA|SAMS CLUB|SAM'S CLUB|DIA BRASIL|SONDA|PADARIA|PANIFICADORA|ACOUGUE|AÇOUGUE|FEIRA|MERCEARIA|SACOLÃO|SACOLAO|CHOCOLATES|CACAU SHOW|CASA DE CARNES|PEIXARIA|EMPORIO|EMPÓRIO)\b/i,
    category: 'mercado',
  },
  // 6. Lazer & Entretenimento (Cinemas, shows, ingressos, jogos, passeios)
  {
    regex: /\b(CINEMA|CINEMARK|CINEPOLIS|CINÉPOLIS|UCI CINEMAS|INGRESSO|INGRESSE|SYMPLA|EVENTIM|TEATRO|SHOW|EVENTO|PARQUE|HOT BEACH|THERMAS|BETOPARRERO|BETO CARRERO|ZOOLOGICO|MUSEU|BAR|PUB|BOATE|FESTA|STRIKE|BOLICHE|ESCAPE 60|STEAM|PLAYSTATION|PSN|XBOX|NINTENDO|BLIZZARD|RIOT GAMES|EPIC GAMES|VALVE|TWITCH|BILHETERIA|PASSEIO|EXCURSAO|EXCURSÃO)\b/i,
    category: 'lazer',
  },
  // 7. Serviços Gerais (Barbearia, manutenção, diarista, oficinas e reparos)
  {
    regex: /\b(BARBEARIA|BARBEIRO|CABELEIREIRO|SALAO|SALÃO|LAVANDERIA|5ASEC|LAVA RAPIDO|LAVA JATO|OFICINA|MECANICA|MECÂNICA|DESPACHANTE|CARTORIO|CARTÓRIO|DIARISTA|FAXINA|COSTURA|SAPATEIRO|CHAVEIRO|SERRALHERIA|VIDRAÇARIA|VIDRACARIA|GETNINJAS|DEDETIZACAO|DEDETIZAÇÃO|MANUTENCAO|MANUTENÇÃO|ELETRICISTA|ENCANADOR|PINTOR|REFORMA|SERVICO|SERVIÇO|CONSULTORIA|SERVICOS GERAIS)\b/i,
    category: 'servicos',
  },
  // 8. Educação (Cursos, faculdades, escolas, livros, plataformas)
  {
    regex: /\b(FACULDADE|UNIVERSIDADE|COLEGIO|COLÉGIO|ESCOLA|CURSO|CURSOS|UDEMY|ALURA|COURSERA|ROCKETSEAT|HOTMART|EDUZZ|KROTON|ESTACIO|ESTÁCIO|ANHANGUERA|PUC|FGV|SENAC|SENAI|CNA|WIZARD|CCAA|FISK|KUMON|LIVRARIA|SARAIVA|LEITURA|LIVROS|PAPELARIA|ENSINO|IDIOMAS|MBA|POS-GRADUACAO|PÓS-GRADUAÇÃO)\b/i,
    category: 'educacao',
  },
  // 9. Saúde (Drogarias, hospitais, consultas, odontologia, academias)
  {
    regex: /\b(DROGARIA|FARMACIA|FARMÁCIA|CLINIC|CLINICA|CLÍNICA|LABORATORIO|LABORATÓRIO|HOSPITAL|ODONTO|DENTISTA|MEDIC|MEDICO|MÉDICO|CONSULTORIO|CONSULTÓRIO|UNIMED|RAIA|DROGA RAIA|PAGUE MENOS|PANVEL|DROGASIL|SAO JOAO|ULTRAFARMA|EXAME|BIO RITMO|SMART FIT|ACADEMIA|PILATES|PSICOLOGO|PSICÓLOGO|NUTRICIONISTA|OTICA|ÓTICA)\b/i,
    category: 'saude',
  },
  // 10. Compras & E-commerce
  {
    regex: /\b(AMAZON|AMERICANAS|MERCADO LIVRE|MERCADOLIVRE|SHOPEE|MAGAZINE LUIZA|MAGALU|SHEIN|ALIEXPRESS|ZARA|RENNER|C&A|RIACHUELO|KABUM|FAST SHOP|CASAS BAHIA|PONTO FRIO|CENTAURO|DECATHLON|LEROY MERLIN|KALUNGA|ENJOEI)\b/i,
    category: 'compras',
  },
  // 11. Assinaturas & Serviços Recorrentes
  {
    regex: /\b(NETFLIX|SPOTIFY|BRISANET|CLARO|VIVO|TIM|OI FIBRA|DISNEY|HBO|MAX|YOUTUBE|PRIME VIDEO|APPLE|ICLOUD|CHATGPT|OPENAI|GOOGLE STORAGE|GOOGLE CLOUD|DROPBOX|CANVA|DEEZER|GLOBOPLAY|STARZ|AMAZON PRIME)\b/i,
    category: 'assinaturas',
  },
  // 12. Alimentação Geral (Fallback)
  {
    regex: /\b(ALIMENTACAO|ALIMENTAÇÃO|REFEICAO|REFEIÇÃO|RESTAURANTE)\b/i,
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

export type Category =
  | 'receita'
  | 'investimento'
  | 'moradia'
  | 'educacao'
  | 'alimentacao'
  | 'saude'
  | 'compras'
  | 'assinaturas'
  | 'transferencia'
  | 'outros';

export type CategorySource = 'regra' | 'heuristica' | 'manual';

export interface Transaction {
  id: string;              // Identificador do CSV (UUID do Nubank)
  date: string;            // ISO yyyy-mm-dd
  dateBR: string;          // dd/mm/aaaa original
  valor: number;           // positivo = entrada, negativo = saída
  desc: string;            // Descrição original completa do CSV
  merchantKey: string;     // chave normalizada (ex: IFOOD, AMAZON BR, TALITA SILVA)
  displayName: string;     // Nome limpo para exibição na UI
  category: Category;
  categorySource: CategorySource;
}

export interface CategoryRule {
  merchantKey: string;     // normalizado
  category: Category;
  updatedAt: string;       // ISO datetime
}

export interface Settings {
  openingBalance: number | null;     // saldo inicial informado manualmente
  openingBalanceDate: string | null; // a partir de quando esse saldo vale (ISO yyyy-mm-dd)
}

export interface CategoryInfo {
  id: Category;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
  description: string;
}

export interface ParseResult {
  transactions: Transaction[];
  totalParsed: number;
  newCount: number;
  duplicateCount: number;
  errors: string[];
}

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  SlidersHorizontal,
  Bookmark,
  Trash2,
  Download,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Info,
  Calendar,
  DollarSign,
  Tag,
} from 'lucide-react';
import { CategoryRule, Settings, Transaction, Category } from '../../types';
import { CATEGORIES, CATEGORY_LIST } from '../../lib/categorization/categories';
import { formatCurrency, formatDateBR } from '../../lib/format';
import { CategoryChip } from '../CategoryChip';
import { SAMPLE_NUBANK_CSV } from '../../data/sampleData';

interface ManageMenuViewProps {
  transactions: Transaction[];
  rules: Record<string, CategoryRule>;
  settings: Settings;
  onImportCSV: (csvContent: string) => void;
  onSaveSettings: (settings: Settings) => void;
  onDeleteRule: (merchantKey: string) => void;
  onUpdateRuleCategory: (merchantKey: string, newCategory: Category) => void;
  onLoadSample: () => void;
  onClearAllData: () => void;
}

export const ManageMenuView: React.FC<ManageMenuViewProps> = ({
  transactions,
  rules,
  settings,
  onImportCSV,
  onSaveSettings,
  onDeleteRule,
  onUpdateRuleCategory,
  onLoadSample,
  onClearAllData,
}) => {
  // Tabs inside Menu: 'import' | 'settings' | 'rules' | 'backup'
  const [activeSection, setActiveSection] = useState<'import' | 'settings' | 'rules' | 'backup'>('import');

  // CSV paste text state
  const [csvText, setCsvText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings form state
  const [balanceInput, setBalanceInput] = useState(
    settings.openingBalance !== null && settings.openingBalance !== undefined
      ? String(settings.openingBalance)
      : ''
  );
  const [dateInput, setDateInput] = useState(settings.openingBalanceDate || '');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Filter for rules search
  const [rulesSearch, setRulesSearch] = useState('');

  // Handle file drop/select
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
      setImportStatus('Por favor, selecione um arquivo .csv válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onImportCSV(content);
        setImportStatus('Extrato importado com sucesso!');
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteSubmit = () => {
    if (!csvText.trim()) return;
    onImportCSV(csvText);
    setCsvText('');
    setImportStatus('Extrato importado a partir do texto colado!');
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = balanceInput.trim() === '' ? null : parseFloat(balanceInput.replace(',', '.'));
    onSaveSettings({
      openingBalance: parsed !== null && !isNaN(parsed) ? parsed : null,
      openingBalanceDate: dateInput.trim() || null,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      transactions,
      rules,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extrato-gestao-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter rules
  const rulesList: CategoryRule[] = Object.values(rules);
  const filteredRules = rulesList.filter((r) =>
    r.merchantKey.toLowerCase().includes(rulesSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sub-menu bar */}
      <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-1.5 shadow-xs flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveSection('import')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 justify-center sm:flex-none ${
            activeSection === 'import'
              ? 'bg-[#141A15] text-[#FAF8F2] shadow-sm'
              : 'text-[#555C54] hover:text-[#141A15] hover:bg-[#EFECE0]'
          }`}
        >
          <UploadCloud size={16} />
          <span>Importar CSV</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('settings')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 justify-center sm:flex-none ${
            activeSection === 'settings'
              ? 'bg-[#141A15] text-[#FAF8F2] shadow-sm'
              : 'text-[#555C54] hover:text-[#141A15] hover:bg-[#EFECE0]'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span>Saldo Inicial</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('rules')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 justify-center sm:flex-none ${
            activeSection === 'rules'
              ? 'bg-[#141A15] text-[#FAF8F2] shadow-sm'
              : 'text-[#555C54] hover:text-[#141A15] hover:bg-[#EFECE0]'
          }`}
        >
          <Bookmark size={16} />
          <span>Regras Aprendidas</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#E5E0CF] text-[#141A15]">
            {rulesList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('backup')}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 justify-center sm:flex-none ${
            activeSection === 'backup'
              ? 'bg-[#141A15] text-[#FAF8F2] shadow-sm'
              : 'text-[#555C54] hover:text-[#141A15] hover:bg-[#EFECE0]'
          }`}
        >
          <Trash2 size={16} />
          <span>Dados & Backup</span>
        </button>
      </div>

      {/* SECTION 1: IMPORT CSV */}
      {activeSection === 'import' && (
        <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE4D2]">
            <div>
              <h2 className="font-receipt-display font-bold text-lg text-[#141A15]">
                Importar Extrato do Nubank
              </h2>
              <p className="text-xs text-[#555C54] mt-0.5">
                Faça o download do arquivo CSV no app ou internet banking do Nubank e carregue aqui.
              </p>
            </div>
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFECE0] hover:bg-[#E2DDCB] text-xs font-semibold text-[#141A15] border border-[#D8D2C0] transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-[#B96A28]" />
              <span>Carregar Exemplo</span>
            </button>
          </div>

          {importStatus && (
            <div className="p-3.5 rounded-xl bg-[#2E6B4F]/10 border border-[#2E6B4F]/30 text-[#2E6B4F] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[#141A15] bg-[#EFECE0]'
                : 'border-[#D3CCA] hover:border-[#141A15] bg-[#F5F2E8]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            <div className="w-12 h-12 rounded-full bg-[#E5E0CF] text-[#141A15] flex items-center justify-center mx-auto mb-3">
              <UploadCloud size={24} />
            </div>
            <p className="font-semibold text-sm sm:text-base text-[#141A15]">
              Arraste seu arquivo CSV do Nubank ou toque para selecionar
            </p>
            <p className="text-xs text-[#636A60] mt-1">
              Formato padrão Nubank: <code className="font-mono bg-[#E8E3D2] px-1.5 py-0.5 rounded">Data,Valor,Identificador,Descrição</code>
            </p>
            <div className="mt-4">
              <span className="inline-block px-4 py-2 rounded-xl bg-[#141A15] text-[#FAF8F2] text-xs font-bold shadow-xs">
                Selecionar Arquivo .CSV
              </span>
            </div>
          </div>

          {/* Paste CSV Text Area */}
          <div className="space-y-2 pt-2 border-t border-[#EAE4D2]">
            <label className="block text-xs font-bold text-[#141A15] uppercase tracking-wider">
              Ou Cole o Conteúdo do CSV Diretamente:
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Data,Valor,Identificador,Descrição&#10;15/08/2026,-35.90,uuid-1234,Compra no débito - RESTAURANTE EXEMPLO"
              className="w-full p-3 rounded-xl bg-[#F5F2E8] border border-[#D3CCA] text-xs font-mono text-[#141A15] focus:outline-none focus:ring-2 focus:ring-[#141A15]"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!csvText.trim()}
                onClick={handlePasteSubmit}
                className="px-4 py-2 rounded-xl bg-[#141A15] disabled:opacity-40 text-[#FAF8F2] text-xs font-bold transition-all cursor-pointer"
              >
                Processar e Importar Texto
              </button>
            </div>
          </div>

          {/* Nubank CSV Instructions */}
          <div className="bg-[#EFECE0] p-4 rounded-xl border border-[#D8D2C0] text-xs text-[#555C54] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#141A15]">
              <Info size={14} />
              <span>Como exportar o extrato no Nubank:</span>
            </div>
            <p>1. No aplicativo do Nubank, acesse sua <strong>Conta</strong>.</p>
            <p>2. Toque em <strong>Pedir extrato</strong> e selecione o período desejado.</p>
            <p>3. Escolha o formato <strong>CSV</strong> e exporte o arquivo.</p>
          </div>
        </div>
      )}

      {/* SECTION 2: OPENING BALANCE & SETTINGS */}
      {activeSection === 'settings' && (
        <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-[#EAE4D2]">
            <h2 className="font-receipt-display font-bold text-lg text-[#141A15]">
              Configurar Saldo Inicial da Conta
            </h2>
            <p className="text-xs text-[#555C54] mt-0.5">
              O arquivo CSV do Nubank contém apenas os lançamentos de débito e crédito, sem o saldo absoluto da conta. Configure aqui o saldo real da sua conta no primeiro dia do extrato.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3.5 rounded-xl bg-[#2E6B4F]/10 border border-[#2E6B4F]/30 text-[#2E6B4F] text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Configurações de saldo salvas com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-[#141A15] mb-1.5">
                Saldo em Conta Inicial (R$):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#636A60] font-bold text-sm">
                  R$
                </div>
                <input
                  type="text"
                  value={balanceInput}
                  onChange={(e) => setBalanceInput(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F5F2E8] border border-[#D3CCA] text-sm font-receipt-mono font-bold text-[#141A15] focus:outline-none focus:ring-2 focus:ring-[#141A15]"
                />
              </div>
              <p className="text-[11px] text-[#636A60] mt-1">
                Deixe em branco para exibir o saldo relativo calculado do extrato.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#141A15] mb-1.5">
                Data de Referência do Saldo Inicial:
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F5F2E8] border border-[#D3CCA] text-sm text-[#141A15] focus:outline-none focus:ring-2 focus:ring-[#141A15]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#141A15] hover:bg-[#253027] text-[#FAF8F2] font-bold text-sm shadow-sm transition-colors cursor-pointer"
            >
              Salvar Saldo Inicial
            </button>
          </form>
        </div>
      )}

      {/* SECTION 3: LEARNED CATEGORIZATION RULES */}
      {activeSection === 'rules' && (
        <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE4D2]">
            <div>
              <h2 className="font-receipt-display font-bold text-lg text-[#141A15]">
                Regras de Categorização Aprendidas
              </h2>
              <p className="text-xs text-[#555C54] mt-0.5">
                Sempre que você altera uma categoria, o sistema memoriza para categorizar automaticamente estabelecimentos com o mesmo nome.
              </p>
            </div>

            <input
              type="text"
              placeholder="Buscar estabelecimento..."
              value={rulesSearch}
              onChange={(e) => setRulesSearch(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F5F2E8] border border-[#D3CCA] text-xs text-[#141A15] focus:outline-none focus:ring-2 focus:ring-[#141A15]"
            />
          </div>

          {rulesList.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7A8277]">
              Nenhuma regra personalizada aprendida ainda. Basta tocar na categoria de qualquer lançamento no extrato para classificar e criar regras automáticas.
            </div>
          ) : (
            <div className="divide-y divide-[#EFECE0]">
              {filteredRules.map((rule) => {
                return (
                  <div
                    key={rule.merchantKey}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-[#F5F2E8] px-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-[#141A15] truncate">
                        {rule.merchantKey}
                      </div>
                      <div className="text-[11px] text-[#636A60] mt-0.5">
                        Atualizado em {formatDateBR(rule.updatedAt.slice(0, 10))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={rule.category}
                        onChange={(e) =>
                          onUpdateRuleCategory(rule.merchantKey, e.target.value as Category)
                        }
                        className="text-xs px-2.5 py-1.5 rounded-lg bg-[#EFECE0] border border-[#D8D2C0] font-semibold text-[#141A15] cursor-pointer"
                      >
                        {CATEGORY_LIST.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => onDeleteRule(rule.merchantKey)}
                        className="p-1.5 rounded-lg text-[#C84B31] hover:bg-[#C84B31]/10 transition-colors cursor-pointer"
                        title="Excluir regra"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: DATA & BACKUP */}
      {activeSection === 'backup' && (
        <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-[#EAE4D2]">
            <h2 className="font-receipt-display font-bold text-lg text-[#141A15]">
              Gerenciamento de Dados & Backup
            </h2>
            <p className="text-xs text-[#555C54] mt-0.5">
              Todos os seus dados e extratos são armazenados 100% no seu navegador (localStorage) para sua privacidade e segurança.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export Backup Card */}
            <div className="p-4 rounded-xl bg-[#F5F2E8] border border-[#D3CCA] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#141A15]">
                  <Download size={16} />
                  <span>Exportar Backup (JSON)</span>
                </div>
                <p className="text-xs text-[#555C54] mt-1.5">
                  Baixe um arquivo contendo todas as {transactions.length} transações, {rulesList.length} regras de categorização e configurações.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="mt-4 w-full py-2 rounded-xl bg-[#141A15] hover:bg-[#253027] text-[#FAF8F2] font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Baixar Arquivo de Backup
              </button>
            </div>

            {/* Clear All Data Card */}
            <div className="p-4 rounded-xl bg-[#C84B31]/10 border border-[#C84B31]/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#C84B31]">
                  <AlertTriangle size={16} />
                  <span>Limpar Dados Locais</span>
                </div>
                <p className="text-xs text-[#555C54] mt-1.5">
                  Apaga todas as transações importadas, regras aprendidas e saldo configurado deste dispositivo.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja apagar todos os dados salvos? Esta ação não pode ser desfeita.')) {
                    onClearAllData();
                  }
                }}
                className="mt-4 w-full py-2 rounded-xl bg-[#C84B31] hover:bg-[#A83720] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Limpar Todos os Dados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

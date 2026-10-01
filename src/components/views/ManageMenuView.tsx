import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  SlidersHorizontal,
  Bookmark,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Info,
  Calendar,
  DollarSign,
  Tag,
  Smartphone,
  Wifi,
  Share,
  PlusSquare,
  Layers,
} from 'lucide-react';
import { CategoryRule, Settings, Transaction, Category, ParseResult } from '../../types';
import { CATEGORIES, CATEGORY_LIST } from '../../lib/categorization/categories';
import { formatCurrency, formatDateBR, parseLocalizedAmount } from '../../lib/format';
import { validateBackupPayload } from '../../lib/backup/validateBackup';
import { CategoryChip } from '../CategoryChip';
import { SAMPLE_NUBANK_CSV } from '../../data/sampleData';
import {
  subscribeToInstallPrompt,
  promptPWAInstall,
  isAppInstalled,
} from '../../serviceWorkerRegistration';

interface ManageMenuViewProps {
  transactions: Transaction[];
  rules: Record<string, CategoryRule>;
  settings: Settings;
  onImportCSV: (csvContent: string) => ParseResult;
  onSaveSettings: (settings: Settings) => void;
  onDeleteRule: (merchantKey: string) => void;
  onUpdateRuleCategory: (merchantKey: string, newCategory: Category) => void;
  onLoadSample: () => void;
  onClearAllData: () => void;
  onReprocessTransactions?: () => void;
  onRestoreBackup?: (backupData: {
    transactions: Transaction[];
    rules: Record<string, CategoryRule>;
    settings: Settings;
    mode: 'replace' | 'merge';
  }) => void;
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
  onReprocessTransactions,
  onRestoreBackup,
}) => {
  // Tabs inside Menu: 'import' | 'settings' | 'rules' | 'backup'
  const [activeSection, setActiveSection] = useState<'import' | 'settings' | 'rules' | 'backup'>('import');

  // JSON Restore state
  const [restoreModalData, setRestoreModalData] = useState<{
    transactions: Transaction[];
    rules: Record<string, CategoryRule>;
    settings: Settings;
    fileName: string;
    exportedAt?: string;
  } | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // PWA Install state
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    setIsInstalled(isAppInstalled());
    const unsubscribe = subscribeToInstallPrompt((canInstall) => {
      setCanInstallPWA(canInstall);
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    const installed = await promptPWAInstall();
    if (installed) {
      setIsInstalled(true);
      setCanInstallPWA(false);
    }
  };

  // CSV paste text state
  const [csvText, setCsvText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importStatusKind, setImportStatusKind] = useState<'success' | 'warning' | 'error' | 'info'>('info');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings form state
  const [balanceInput, setBalanceInput] = useState(
    settings.openingBalance !== null && settings.openingBalance !== undefined
      ? String(settings.openingBalance)
      : ''
  );
  const [dateInput, setDateInput] = useState(settings.openingBalanceDate || '');
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    setBalanceInput(settings.openingBalance !== null && settings.openingBalance !== undefined
      ? String(settings.openingBalance)
      : '');
    setDateInput(settings.openingBalanceDate || '');
    setSettingsError(null);
  }, [settings.openingBalance, settings.openingBalanceDate]);

  // Filter for rules search
  const [rulesSearch, setRulesSearch] = useState('');

  const showImportResult = (result: ParseResult) => {
    if (result.newCount > 0) {
      const rowErrors = result.errors.length > 0 ? ` ${result.errors.length} problema(s): ${result.errors[0]}` : '';
      setImportStatus(`${result.newCount} lançamento(s) importado(s).${rowErrors}`);
      setImportStatusKind(result.errors.length > 0 ? 'warning' : 'success');
    } else if (result.duplicateCount > 0) {
      const rowErrors = result.errors.length > 0 ? ` ${result.errors.length} problema(s): ${result.errors[0]}` : '';
      setImportStatus(`${result.duplicateCount} lançamento(s) já estavam cadastrados.${rowErrors}`);
      setImportStatusKind(result.errors.length > 0 ? 'warning' : 'info');
    } else {
      setImportStatus(result.errors[0] || 'Nenhum lançamento válido foi encontrado.');
      setImportStatusKind('error');
    }
    setTimeout(() => setImportStatus(null), 6000);
  };

  // Handle file drop/select
  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
      setImportStatus('Por favor, selecione um arquivo .csv válido.');
      setImportStatusKind('error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        showImportResult(onImportCSV(content));
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
    const result = onImportCSV(csvText);
    if (result.errors.length === 0) setCsvText('');
    showImportResult(result);
  };

  const handleSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseLocalizedAmount(balanceInput);
    if (balanceInput.trim() && parsed === null) {
      setSettingsError('Informe um saldo válido, como 1.250,50 ou 1250.50.');
      return;
    }
    setSettingsError(null);
    onSaveSettings({
      openingBalance: parsed,
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

  // Handle JSON file selection for Restore
  const handleJsonFileSelected = (file: File) => {
    setRestoreError(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = validateBackupPayload(JSON.parse(text));
        if (!result.data) {
          setRestoreError(result.errors.join(' '));
          return;
        }

        setRestoreModalData({
          transactions: result.data.transactions,
          rules: result.data.rules,
          settings: result.data.settings,
          fileName: file.name,
          exportedAt: result.data.exportedAt,
        });
      } catch (err) {
        setRestoreError('Erro ao ler o arquivo JSON. Certifique-se de que é um JSON válido.');
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmRestore = (mode: 'replace' | 'merge') => {
    if (!restoreModalData || !onRestoreBackup) return;
    onRestoreBackup({
      transactions: restoreModalData.transactions,
      rules: restoreModalData.rules,
      settings: restoreModalData.settings,
      mode,
    });
    setRestoreModalData(null);
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
          <Smartphone size={16} />
          <span>App & Backup</span>
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
            <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              importStatusKind === 'success'
                ? 'bg-[#2E6B4F]/10 border border-[#2E6B4F]/30 text-[#2E6B4F]'
                : importStatusKind === 'error'
                ? 'bg-[#C84B31]/10 border border-[#C84B31]/30 text-[#C84B31]'
                : 'bg-[#B96A28]/10 border border-[#B96A28]/30 text-[#8A4F1E]'
            }`}>
              {importStatusKind === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
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
              Informe o saldo da conta no fim da data de referência. O cálculo soma a esse valor apenas os lançamentos posteriores à data escolhida.
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
                  onChange={(e) => {
                    setBalanceInput(e.target.value);
                    setSettingsError(null);
                  }}
                  placeholder="1.250,50"
                  aria-invalid={Boolean(settingsError)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#F5F2E8] border border-[#D3CCA] text-sm font-receipt-mono font-bold text-[#141A15] focus:outline-none focus:ring-2 focus:ring-[#141A15]"
                />
              </div>
              {settingsError && <p className="text-[11px] text-[#C84B31] mt-1">{settingsError}</p>}
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
              <p className="text-[11px] text-[#636A60] mt-1">
                Sem uma data, todo o histórico será somado ao saldo base.
              </p>
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

            <div className="flex items-center gap-2 flex-wrap">
              {onReprocessTransactions && transactions.length > 0 && (
                <button
                  type="button"
                  onClick={onReprocessTransactions}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDE8DC] hover:bg-[#E2DDCB] text-xs font-semibold text-[#141A15] border border-[#D8D2C0] transition-colors cursor-pointer"
                  title="Reavalia todos os lançamentos com base nas regras e novas categorias aprendidas"
                >
                  <Sparkles size={13} className="text-[#1F6672]" />
                  <span>Reclassificar Extrato</span>
                </button>
              )}

              <input
                type="text"
                placeholder="Buscar estabelecimento..."
                value={rulesSearch}
                onChange={(e) => setRulesSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#F5F2E8] border border-[#D3CCA] text-xs text-[#141A15] focus:outline-none focus:ring-2 focus:ring-[#141A15]"
              />
            </div>
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

      {/* SECTION 4: DATA, APP & BACKUP */}
      {activeSection === 'backup' && (
        <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-6">
          <div className="pb-3 border-b border-[#EAE4D2]">
            <h2 className="font-receipt-display font-bold text-lg text-[#141A15]">
              Aplicativo PWA & Gerenciamento de Dados
            </h2>
            <p className="text-xs text-[#555C54] mt-0.5">
              Instale o aplicativo na sua tela de início, acesse offline sem internet e gerencie seus backups.
            </p>
          </div>

          {/* PWA / App Installation Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#161C17] text-[#FAF8F2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1.5 max-w-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="text-[#8FB397]" size={20} />
                <span className="font-receipt-display font-bold text-base text-white">
                  Instalar no Celular ou Computador (PWA)
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  isOnline ? 'bg-[#2E6B4F] text-[#FAF8F2]' : 'bg-[#B96A28] text-white'
                }`}>
                  {isOnline ? 'Pronto Offline' : 'Modo Offline'}
                </span>
              </div>
              <p className="text-xs text-[#B2BBB4] leading-relaxed">
                Funciona como um aplicativo nativo rápido, sem ocupar espaço, 100% offline e com ícone na tela de início.
              </p>
            </div>

            <div className="w-full sm:w-auto shrink-0">
              {isInstalled ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E6B4F]/40 border border-[#2E6B4F] text-xs font-bold text-[#A7D7BC]">
                  <CheckCircle2 size={16} />
                  <span>Aplicativo Instalado</span>
                </div>
              ) : canInstallPWA ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E6B4F] hover:bg-[#255740] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <PlusSquare size={16} />
                  <span>Instalar Aplicativo</span>
                </button>
              ) : (
                <div className="text-[11px] text-[#A2ADA5] bg-[#222A23] p-2.5 rounded-xl border border-[#303B31]">
                  <span className="font-semibold text-white block mb-0.5">No iPhone / Safari:</span>
                  Toque em <Share size={12} className="inline mx-1" /> <strong>Compartilhar</strong> e selecione <strong>Adicionar à Tela de Início</strong>.
                </div>
              )}
            </div>
          </div>

          {/* Restore Error Banner */}
          {restoreError && (
            <div className="p-3.5 rounded-xl bg-[#C84B31]/10 border border-[#C84B31]/30 text-[#C84B31] text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{restoreError}</span>
            </div>
          )}

          {/* Restore Confirmation Preview Card */}
          {restoreModalData && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141A15] text-[#FAF8F2] border border-[#2D3930] shadow-md space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#2C382E]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2E6B4F]/30 text-[#A7D7BC] flex items-center justify-center border border-[#2E6B4F]/40">
                    <Upload size={17} />
                  </div>
                  <div>
                    <h3 className="font-receipt-display font-bold text-base text-white">
                      Confirmar Restauração de Backup
                    </h3>
                    <p className="text-xs text-[#A2ADA5]">
                      Arquivo: <span className="font-mono text-[#D8D4C5] font-semibold">{restoreModalData.fileName}</span>
                      {restoreModalData.exportedAt && (
                        <span> · Exportado em {formatDateBR(restoreModalData.exportedAt.slice(0, 10))}</span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setRestoreModalData(null)}
                  className="text-xs text-[#A2ADA5] hover:text-white px-2 py-1 rounded hover:bg-[#253027] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              {/* Data summary pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#1D251F] border border-[#2E3A30]">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#8E9B90] block">
                    Transações a Restaurar
                  </span>
                  <div className="font-receipt-mono text-xl font-bold text-[#FAF8F2] mt-0.5">
                    {restoreModalData.transactions.length}
                  </div>
                  <span className="text-[10px] text-[#A2ADA5]">lançamentos financeiros</span>
                </div>

                <div className="p-3 rounded-xl bg-[#1D251F] border border-[#2E3A30]">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#8E9B90] block">
                    Regras de Categorização
                  </span>
                  <div className="font-receipt-mono text-xl font-bold text-[#FAF8F2] mt-0.5">
                    {Object.keys(restoreModalData.rules).length}
                  </div>
                  <span className="text-[10px] text-[#A2ADA5]">estabelecimentos aprendidos</span>
                </div>

                <div className="p-3 rounded-xl bg-[#1D251F] border border-[#2E3A30]">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#8E9B90] block">
                    Saldo Inicial
                  </span>
                  <div className="font-receipt-mono text-xl font-bold text-[#FAF8F2] mt-0.5">
                    {restoreModalData.settings.openingBalance !== null
                      ? formatCurrency(restoreModalData.settings.openingBalance)
                      : 'Não configurado'}
                  </div>
                  <span className="text-[10px] text-[#A2ADA5]">
                    {restoreModalData.settings.openingBalanceDate
                      ? `Ref: ${formatDateBR(restoreModalData.settings.openingBalanceDate)}`
                      : 'Calculado do extrato'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleConfirmRestore('replace')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#2E6B4F] hover:bg-[#255740] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer text-center"
                >
                  Substituir Dados Atuais (Recomendado)
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmRestore('merge')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#242D26] hover:bg-[#303D33] text-[#D8D4C5] font-semibold text-xs border border-[#3C4D3F] transition-colors cursor-pointer text-center"
                >
                  Mesclar com Dados Atuais (Sem duplicar)
                </button>

                <button
                  type="button"
                  onClick={() => setRestoreModalData(null)}
                  className="py-2.5 px-4 rounded-xl bg-transparent hover:bg-[#222A23] text-[#A2ADA5] font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}

          {/* Hidden JSON file input */}
          <input
            ref={jsonFileInputRef}
            type="file"
            accept=".json,application/json,text/plain"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleJsonFileSelected(e.target.files[0]);
                e.target.value = '';
              }
            }}
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Export Backup Card */}
            <div className="p-4 rounded-xl bg-[#F5F2E8] border border-[#D3CCA] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#141A15]">
                  <Download size={16} />
                  <span>Exportar Backup (JSON)</span>
                </div>
                <p className="text-xs text-[#555C54] mt-1.5 leading-relaxed">
                  Baixe um arquivo contendo todas as {transactions.length} transações, {rulesList.length} regras de categorização e configurações.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportBackup}
                className="mt-4 w-full py-2 rounded-xl bg-[#141A15] hover:bg-[#253027] text-[#FAF8F2] font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Baixar Arquivo JSON
              </button>
            </div>

            {/* Restore Backup Card */}
            <div className="p-4 rounded-xl bg-[#F5F2E8] border border-[#D3CCA] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#1F6672]">
                  <Upload size={16} />
                  <span>Restaurar Backup (JSON)</span>
                </div>
                <p className="text-xs text-[#555C54] mt-1.5 leading-relaxed">
                  Carregue um arquivo JSON baixado anteriormente para recuperar extratos, regras aprendidas e saldos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => jsonFileInputRef.current?.click()}
                className="mt-4 w-full py-2 rounded-xl bg-[#1F6672] hover:bg-[#184F58] text-[#FAF8F2] font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Selecionar Arquivo JSON
              </button>
            </div>

            {/* Clear All Data Card */}
            <div className="p-4 rounded-xl bg-[#C84B31]/10 border border-[#C84B31]/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-[#C84B31]">
                  <AlertTriangle size={16} />
                  <span>Limpar Dados Locais</span>
                </div>
                <p className="text-xs text-[#555C54] mt-1.5 leading-relaxed">
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

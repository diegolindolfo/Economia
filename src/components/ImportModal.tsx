import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Sparkles, AlertCircle, CheckCircle2, Database, ArrowRight } from 'lucide-react';
import { CategoryRule, ParseResult, Settings, Transaction } from '../types';
import { SAMPLE_NUBANK_CSV } from '../data/sampleData';
import { validateBackupPayload } from '../lib/backup/validateBackup';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCSV: (csvString: string) => ParseResult;
  onRestoreBackup?: (backupData: {
    transactions: Transaction[];
    rules: Record<string, CategoryRule>;
    settings: Settings;
    mode: 'replace' | 'merge';
  }) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportCSV,
  onRestoreBackup,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [lastResult, setLastResult] = useState<ParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jsonBackupPreview, setJsonBackupPreview] = useState<{
    transactions: Transaction[];
    rules: Record<string, CategoryRule>;
    settings: Settings;
    fileName: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    setErrorMessage(null);
    setJsonBackupPreview(null);

    const isJson = file.name.toLowerCase().endsWith('.json') || file.type === 'application/json';

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content?.trim()) {
        setErrorMessage('O arquivo está vazio.');
        return;
      }

      if (isJson || content.trim().startsWith('{') || content.trim().startsWith('[')) {
        try {
          const validation = validateBackupPayload(JSON.parse(content));
          if (!validation.data) {
            setErrorMessage(validation.errors.join(' '));
            return;
          }
          setJsonBackupPreview({ ...validation.data, fileName: file.name });
          return;
        } catch (_) {
          setErrorMessage('Não foi possível ler o arquivo JSON. Verifique se ele está íntegro.');
          return;
        }
      }

      handleParse(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleParse = (csvText: string) => {
    setErrorMessage(null);
    setJsonBackupPreview(null);

    // Check if pasted text is JSON backup
    const trimmed = csvText.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const validation = validateBackupPayload(JSON.parse(trimmed));
        if (!validation.data) {
          setErrorMessage(validation.errors.join(' '));
          return;
        }
        setJsonBackupPreview({ ...validation.data, fileName: 'texto_colado.json' });
        return;
      } catch (_) {
        setErrorMessage('O texto parece JSON, mas não está bem formado.');
        return;
      }
    }

    try {
      const result = onImportCSV(csvText);
      setLastResult(result);
      if (result.totalParsed === 0) {
        setErrorMessage(result.errors.join(' ') || 'Nenhum lançamento válido foi encontrado no CSV.');
      } else if (result.errors.length > 0) {
        setErrorMessage(result.errors.join(' '));
      } else {
        setTimeout(() => {
          onClose();
          setLastResult(null);
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar CSV.');
    }
  };

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      setErrorMessage('Cole o conteúdo do CSV ou JSON de backup no campo de texto.');
      return;
    }
    handleParse(pastedText);
  };

  const handleUseSample = () => {
    handleParse(SAMPLE_NUBANK_CSV);
  };

  const handleExecuteRestore = (mode: 'replace' | 'merge') => {
    if (!jsonBackupPreview || !onRestoreBackup) return;
    onRestoreBackup({
      transactions: jsonBackupPreview.transactions,
      rules: jsonBackupPreview.rules,
      settings: jsonBackupPreview.settings,
      mode,
    });
    setJsonBackupPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E241F]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-lg bg-[#FBF9F2] text-[#1E241F] rounded-2xl shadow-2xl border border-[#D6D0BC] overflow-hidden z-10 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#D6D0BC]/80 bg-[#F5F2E7]">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#63665C] block">
              Entrada de Dados
            </span>
            <h3 className="font-receipt-display text-lg sm:text-xl font-bold text-[#1E241F] leading-tight">
              Importar Extrato Nubank ou Backup
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#63665C] hover:text-[#1E241F] hover:bg-[#EAE6D9] active:scale-95 transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-[#D6D0BC]/50">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#1E241F] text-[#1E241F]'
                : 'border-transparent text-[#63665C] hover:text-[#1E241F]'
            }`}
          >
            Arquivo CSV ou JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'border-[#1E241F] text-[#1E241F]'
                : 'border-transparent text-[#63665C] hover:text-[#1E241F]'
            }`}
          >
            Colar Texto
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[75vh]">
          {/* JSON Backup Detected Dialog */}
          {jsonBackupPreview && (
            <div className="p-4 rounded-xl bg-[#1E241F] text-[#FAF8F2] border border-[#3A463B] space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-[#8FB397]">
                <Database size={17} />
                <span>Arquivo de Backup JSON Detectado!</span>
              </div>
              <p className="text-xs text-[#C9C4B5] leading-relaxed">
                Este arquivo <strong>{jsonBackupPreview.fileName}</strong> contém{' '}
                <strong className="text-white">{jsonBackupPreview.transactions.length} lançamentos</strong> e{' '}
                <strong className="text-white">{Object.keys(jsonBackupPreview.rules).length} regras</strong> de categorização.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteRestore('replace')}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#2E6B4F] hover:bg-[#255740] text-white font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Restaurar Tudo (Substituir)
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteRestore('merge')}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#2A352C] hover:bg-[#38483B] text-[#D8D4C5] font-semibold text-xs border border-[#445547] transition-colors cursor-pointer text-center"
                >
                  Mesclar com Atuais
                </button>
                <button
                  type="button"
                  onClick={() => setJsonBackupPreview(null)}
                  className="py-2 px-3 rounded-lg text-xs text-[#8E9B90] hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Feedback states */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#AE3B2B]/10 border border-[#AE3B2B]/30 flex items-start gap-2.5 text-xs text-[#AE3B2B]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>Atenção:</strong> {errorMessage}
              </div>
            </div>
          )}

          {lastResult && lastResult.newCount > 0 && (
            <div className="p-3 rounded-xl bg-[#2E6B4F]/10 border border-[#2E6B4F]/30 flex items-start gap-2.5 text-xs text-[#2E6B4F] animate-in fade-in">
              <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>Sucesso!</strong> {lastResult.newCount} novas transações importadas com aprendizado de categoria.
                {lastResult.duplicateCount > 0 && (
                  <span className="block text-[11px] opacity-80">
                    ({lastResult.duplicateCount} duplicatas ignoradas automaticamente)
                  </span>
                )}
              </div>
            </div>
          )}

          {lastResult && lastResult.newCount === 0 && lastResult.duplicateCount > 0 && !errorMessage && (
            <div className="p-3 rounded-xl bg-[#1F6672]/10 border border-[#1F6672]/30 text-xs text-[#1F6672]">
              {lastResult.duplicateCount} transação(ões) já estavam cadastradas; nenhum dado foi duplicado.
            </div>
          )}

          {activeTab === 'upload' ? (
            <div>
              {/* Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                  dragActive
                    ? 'border-[#1E241F] bg-[#EAE6D9]'
                    : 'border-[#D6D0BC] hover:border-[#1E241F]/40 bg-[#F5F2E7]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,text/csv,application/json,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-[#EAE6D9] text-[#1E241F] flex items-center justify-center border border-[#D6D0BC]">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1E241F]">
                    Clique para selecionar ou arraste seu arquivo
                  </p>
                  <p className="text-xs text-[#63665C] mt-0.5">
                    Extrato CSV do Nubank ou arquivo JSON de backup
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#63665C]">
                Cole o conteúdo do arquivo CSV ou JSON de backup:
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Data,Valor,Identificador,Descrição&#10;15/08/2026,-98.50,6a6dcab1...,RESTAURANTE COCO BAMBU&#10;ou cole o JSON de backup {...}"
                className="w-full p-3 rounded-xl bg-[#F5F2E7] border border-[#D6D0BC] text-xs font-mono text-[#1E241F] focus:outline-none focus:ring-2 focus:ring-[#1E241F] resize-none"
              />
              <button
                type="button"
                onClick={handlePasteSubmit}
                className="w-full py-2.5 rounded-xl bg-[#1E241F] hover:bg-[#2C362E] text-[#FBF9F2] font-bold text-xs transition-colors cursor-pointer min-h-[40px]"
              >
                Processar e Importar
              </button>
            </div>
          )}

          {/* Sample data shortcut */}
          <div className="pt-2 border-t border-[#D6D0BC]/60 flex items-center justify-between text-xs text-[#63665C]">
            <span>Quer apenas testar?</span>
            <button
              type="button"
              onClick={handleUseSample}
              className="inline-flex items-center gap-1 font-bold text-[#B96A28] hover:underline cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Usar Extrato de Exemplo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

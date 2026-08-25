import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Sparkles, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { ParseResult } from '../types';
import { SAMPLE_NUBANK_CSV } from '../data/sampleData';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCSV: (csvString: string) => ParseResult;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportCSV,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [lastResult, setLastResult] = useState<ParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        handleParse(content);
      }
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
    try {
      const result = onImportCSV(csvText);
      setLastResult(result);
      if (result.totalParsed === 0 && result.errors.length > 0) {
        setErrorMessage(result.errors.join(', '));
      } else {
        // Success
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
      setErrorMessage('Cole o conteúdo do CSV no campo de texto.');
      return;
    }
    handleParse(pastedText);
  };

  const handleUseSample = () => {
    handleParse(SAMPLE_NUBANK_CSV);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E241F]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-[#FBF9F2] text-[#1E241F] rounded-2xl shadow-2xl border border-[#D6D0BC] overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#D6D0BC]/80 bg-[#F5F2E7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E241F] text-[#FBF9F2] flex items-center justify-center">
              <UploadCloud size={18} />
            </div>
            <div>
              <h3 className="font-receipt-display text-lg font-bold text-[#1E241F] leading-tight">
                Importar Extrato CSV Nubank
              </h3>
              <span className="text-xs text-[#63665C]">
                Padrão Data, Valor, Identificador, Descrição
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#63665C] hover:text-[#1E241F] hover:bg-[#EAE6D9] cursor-pointer"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#D6D0BC] bg-[#EAE6D9]/50 px-5 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#1E241F] text-[#1E241F]'
                : 'border-transparent text-[#63665C] hover:text-[#1E241F]'
            }`}
          >
            Arquivo CSV
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
        <div className="p-5 overflow-y-auto space-y-4">
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
                  accept=".csv,text/csv,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-[#EAE6D9] text-[#1E241F] flex items-center justify-center border border-[#D6D0BC]">
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1E241F]">
                    Clique para selecionar ou arraste o arquivo CSV
                  </p>
                  <p className="text-xs text-[#63665C] mt-1">
                    Exportado direto do app ou site do Nubank
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#63665C] uppercase tracking-wider mb-1.5">
                Cole as linhas do extrato CSV:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Data,Valor,Identificador,Descrição\n01/08/2026,8040.90,uuid-1,Transferência recebida pelo Pix...\n01/08/2026,-1330.00,uuid-2,Aplicação RDB`}
                rows={7}
                className="w-full p-3 font-mono text-xs bg-[#F5F2E7] border border-[#D6D0BC] rounded-xl text-[#1E241F] focus:outline-none focus:border-[#1E241F] focus:ring-1 focus:ring-[#1E241F]/30"
              />
              <button
                type="button"
                onClick={handlePasteSubmit}
                className="mt-2 w-full py-2.5 bg-[#1E241F] text-[#FBF9F2] rounded-xl font-semibold text-xs hover:bg-[#2A332B] transition-all cursor-pointer"
              >
                Processar Texto Colado
              </button>
            </div>
          )}

          {/* Quick sample button */}
          <div className="p-3.5 rounded-xl bg-[#EAE6D9]/70 border border-[#D6D0BC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#B96A28] shrink-0" />
              <div className="text-xs text-[#1E241F]">
                <span className="font-semibold">Não tem um CSV agora?</span> Teste instantaneamente com dados realistas.
              </div>
            </div>
            <button
              type="button"
              onClick={handleUseSample}
              className="px-3 py-1.5 rounded-lg bg-[#FBF9F2] hover:bg-[#EAE6D9] text-[#1E241F] font-semibold text-xs border border-[#D6D0BC] shrink-0 cursor-pointer shadow-2xs"
            >
              Usar Exemplo
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-[#D6D0BC] bg-[#F5F2E7] text-[11px] text-[#63665C] flex items-center justify-between">
          <span>🔒 Todos os dados ficam 100% salvos no seu navegador.</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-[#1E241F] hover:underline cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

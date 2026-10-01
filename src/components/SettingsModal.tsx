import React, { useEffect, useState } from 'react';
import { X, SlidersHorizontal, Trash2, Check, AlertTriangle, Coins } from 'lucide-react';
import { Settings } from '../types';
import { parseLocalizedAmount } from '../lib/format';

interface SettingsModalProps {
  isOpen: boolean;
  settings: Settings;
  onClose: () => void;
  onSaveSettings: (settings: Settings) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSaveSettings,
  onClearAllData,
}) => {
  const [openingBalanceStr, setOpeningBalanceStr] = useState<string>(() => {
    return settings.openingBalance !== null && settings.openingBalance !== undefined
      ? settings.openingBalance.toString()
      : '';
  });
  const [openingDate, setOpeningDate] = useState<string>(() => {
    return settings.openingBalanceDate || '';
  });
  const [confirmClear, setConfirmClear] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  useEffect(() => {
    setOpeningBalanceStr(settings.openingBalance !== null && settings.openingBalance !== undefined
      ? settings.openingBalance.toString()
      : '');
    setOpeningDate(settings.openingBalanceDate || '');
    setBalanceError(null);
  }, [settings.openingBalance, settings.openingBalanceDate]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseLocalizedAmount(openingBalanceStr);
    if (openingBalanceStr.trim() && parsed === null) {
      setBalanceError('Informe um valor válido, como 1.250,50 ou 1250.50.');
      return;
    }
    setBalanceError(null);
    onSaveSettings({
      openingBalance: parsed,
      openingBalanceDate: openingDate || null,
    });
    onClose();
  };

  const handleRemoveOpeningBalance = () => {
    setOpeningBalanceStr('');
    setOpeningDate('');
    onSaveSettings({
      openingBalance: null,
      openingBalanceDate: null,
    });
    onClose();
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
        className="relative w-full max-w-md bg-[#FBF9F2] text-[#1E241F] rounded-2xl shadow-2xl border border-[#D6D0BC] overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#D6D0BC]/80 bg-[#F5F2E7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E241F] text-[#FBF9F2] flex items-center justify-center">
              <SlidersHorizontal size={16} />
            </div>
            <div>
              <h3 className="font-receipt-display text-lg font-bold text-[#1E241F] leading-tight">
                Configurações & Saldo Inicial
              </h3>
              <span className="text-xs text-[#63665C]">
                Ajuste fino do seu extrato
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#63665C] hover:text-[#1E241F] hover:bg-[#EAE6D9] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#63665C] mb-1">
                Saldo Inicial da Conta (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[#63665C]">
                  R$
                </span>
                <input
                  type="text"
                  value={openingBalanceStr}
                  onChange={(e) => {
                    setOpeningBalanceStr(e.target.value);
                    setBalanceError(null);
                  }}
                  placeholder="Ex: 1.250,50"
                  aria-invalid={Boolean(balanceError)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[#F5F2E7] border border-[#D6D0BC] rounded-xl font-mono text-[#1E241F] focus:outline-none focus:border-[#1E241F] focus:ring-1 focus:ring-[#1E241F]/30"
                />
                {balanceError && <p className="text-[11px] text-[#AE3B2B] mt-1">{balanceError}</p>}
              </div>
              <p className="text-[11px] text-[#63665C] mt-1">
                Informe o saldo válido no fim da data escolhida abaixo. O app somará apenas as movimentações posteriores a essa data.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#63665C] mb-1">
                Data de referência do saldo (Opcional)
              </label>
              <input
                type="date"
                value={openingDate}
                onChange={(e) => setOpeningDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F5F2E7] border border-[#D6D0BC] rounded-xl font-mono text-[#1E241F] focus:outline-none focus:border-[#1E241F]"
              />
              <p className="text-[11px] text-[#63665C] mt-1">
                Sem uma data, o saldo base será combinado com todo o histórico importado.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#D6D0BC]/60">
            {settings.openingBalance !== null && (
              <button
                type="button"
                onClick={handleRemoveOpeningBalance}
                className="text-xs text-[#AE3B2B] hover:underline font-semibold cursor-pointer"
              >
                Remover saldo inicial
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-[#63665C] hover:text-[#1E241F] font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1E241F] text-[#FBF9F2] text-xs font-semibold rounded-xl hover:bg-[#2A332B] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </form>

        {/* Clear Data Section */}
        <div className="px-5 py-4 border-t border-[#D6D0BC] bg-[#EAE6D9]/40 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-[#1E241F] flex items-center gap-1.5">
                <Trash2 size={13} className="text-[#AE3B2B]" />
                <span>Limpar todos os dados locais</span>
              </h4>
              <p className="text-[10px] text-[#63665C]">
                Apaga extratos e regras aprendidas salvas no navegador.
              </p>
            </div>

            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-2.5 py-1 text-xs text-[#AE3B2B] bg-[#AE3B2B]/10 hover:bg-[#AE3B2B]/20 border border-[#AE3B2B]/30 rounded-lg font-semibold transition-all cursor-pointer"
              >
                Limpar
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 text-xs text-[#63665C] hover:text-[#1E241F]"
                >
                  Não
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs bg-[#AE3B2B] text-white rounded-lg font-semibold hover:bg-[#902E20] cursor-pointer"
                >
                  Sim, apagar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

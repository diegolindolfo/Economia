import React from 'react';
import { UploadCloud, PlusCircle, Calendar, Sparkles, SlidersHorizontal, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Settings, Transaction } from '../types';
import { formatCurrency, formatDateBR } from '../lib/format';

interface BalanceStripProps {
  transactions: Transaction[];
  settings: Settings;
  onOpenImport: () => void;
  onLoadSample: () => void;
  onOpenSettings: () => void;
}

export const BalanceStrip: React.FC<BalanceStripProps> = ({
  transactions,
  settings,
  onOpenImport,
  onLoadSample,
  onOpenSettings,
}) => {
  // Calculate period dates
  let dateRangeText = 'Nenhum extrato importado';
  let totalNet = 0;
  let totalIncomes = 0;
  let totalExpenses = 0;

  if (transactions.length > 0) {
    const dates = transactions.map((t) => t.date).sort();
    const minDate = dates[0];
    const maxDate = dates[dates.length - 1];
    dateRangeText = `${formatDateBR(minDate)} a ${formatDateBR(maxDate)}`;

    transactions.forEach((t) => {
      totalNet += t.valor;
      if (t.valor > 0) totalIncomes += t.valor;
      else totalExpenses += Math.abs(t.valor);
    });
  }

  // Calculate final displayed balance
  const hasOpeningBalance = settings.openingBalance !== null && settings.openingBalance !== undefined;
  
  // If opening balance exists, calculate real balance
  let displayBalance = totalNet;
  if (hasOpeningBalance) {
    displayBalance = (settings.openingBalance || 0) + totalNet;
  }

  return (
    <div className="w-full bg-[#1E241F] text-[#FBF9F2] shadow-lg relative">
      <div className="max-w-5xl mx-auto px-4 py-5 sm:px-6 sm:py-6">
        {/* Top bar with app stamp & actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#38433A]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#FBF9F2] text-[#1E241F] flex items-center justify-center font-receipt-display font-bold text-base shadow-xs">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-receipt-display font-bold tracking-tight text-base sm:text-lg text-[#FBF9F2]">
                  Extrato & Gestão
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#2A332B] text-[#D6D0BC] border border-[#38433A]">
                  Zero Fricção
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#A6A292] mt-0.5">
                <Calendar size={11} />
                <span>{dateRangeText}</span>
                {transactions.length > 0 && (
                  <span className="ml-1 opacity-80">({transactions.length} lançamentos)</span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {transactions.length === 0 && (
              <button
                type="button"
                onClick={onLoadSample}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A332B] hover:bg-[#38433A] text-xs text-[#EAE6D9] border border-[#445044] transition-all cursor-pointer min-h-[38px] active:scale-95"
              >
                <Sparkles size={14} className="text-[#B96A28]" />
                <span className="font-medium">Carregar Exemplo</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#2A332B] hover:bg-[#38433A] text-xs text-[#D6D0BC] border border-[#38433A] transition-all cursor-pointer min-h-[38px] active:scale-95"
              title="Configurar Saldo Inicial da Conta"
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline font-medium">Saldo Inicial</span>
            </button>

            <button
              type="button"
              onClick={onOpenImport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FBF9F2] hover:bg-[#EAE6D9] text-[#1E241F] font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer min-h-[38px] active:scale-95"
            >
              <UploadCloud size={16} />
              <span>Importar CSV</span>
            </button>
          </div>
        </div>

        {/* Main Balance Display */}
        <div className="pt-4 sm:pt-5 pb-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#A6A292]">
                {hasOpeningBalance ? 'Saldo Real em Conta' : 'Movimentação do Período'}
              </span>
              {!hasOpeningBalance ? (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#38433A] text-[#D6D0BC]" title="Saldo somando apenas os lançamentos do extrato">
                  Estimado
                </span>
              ) : (
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#2E6B4F]/40 text-[#6ee7b7] border border-[#2E6B4F]" title="Calculado com base no saldo inicial informado">
                  Real
                </span>
              )}
            </div>

            <div className="font-receipt-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FBF9F2] flex items-baseline gap-2">
              <span>{formatCurrency(displayBalance)}</span>
              {hasOpeningBalance && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="text-xs text-[#A6A292] hover:text-[#FBF9F2] underline cursor-pointer font-sans"
                >
                  Editar
                </button>
              )}
            </div>

            <p className="text-xs text-[#A6A292] mt-1.5 max-w-lg">
              {hasOpeningBalance
                ? `Saldo inicial de ${formatCurrency(settings.openingBalance || 0)} + movimentações do extrato.`
                : 'Dica: informe seu saldo inicial em "Saldo Inicial" para ver o saldo real exato da conta.'}
            </p>
          </div>

          {/* Quick Net Movement Pills */}
          {transactions.length > 0 && (
            <div className="flex items-center gap-3 bg-[#2A332B] p-2.5 sm:p-3 rounded-xl border border-[#38433A] shrink-0">
              <div className="pr-3 border-r border-[#38433A]">
                <div className="flex items-center gap-1 text-[11px] text-[#A6A292]">
                  <ArrowDownRight size={12} className="text-[#6ee7b7]" />
                  <span>Entradas</span>
                </div>
                <div className="font-receipt-mono font-bold text-sm text-[#6ee7b7]">
                  {formatCurrency(totalIncomes)}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 text-[11px] text-[#A6A292]">
                  <ArrowUpRight size={12} className="text-[#fca5a5]" />
                  <span>Saídas</span>
                </div>
                <div className="font-receipt-mono font-bold text-sm text-[#fca5a5]">
                  {formatCurrency(totalExpenses)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dotted Perforation Line between dark strip and body */}
      <div className="receipt-perforation-dark w-full" />
    </div>
  );
};

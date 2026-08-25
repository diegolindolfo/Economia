import React, { useEffect } from 'react';
import { X, Sparkles, Check, Info } from 'lucide-react';
import { Category, Transaction } from '../types';
import { CATEGORIES, CATEGORY_LIST } from '../lib/categorization/categories';
import { CategoryIcon } from './CategoryChip';

interface CategorySheetProps {
  isOpen: boolean;
  transaction: Transaction | null;
  affectedCount: number;
  onClose: () => void;
  onSelectCategory: (category: Category, merchantKey: string) => void;
}

export const CategorySheet: React.FC<CategorySheetProps> = ({
  isOpen,
  transaction,
  affectedCount,
  onClose,
  onSelectCategory,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !transaction) return null;

  const currentCat = transaction.category;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E241F]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet / Modal Container */}
      <div
        className="relative w-full max-w-lg bg-[#FBF9F2] text-[#1E241F] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-[#D6D0BC] overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-250 sm:zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-[#D6D0BC] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-4 border-b border-[#D6D0BC]/80 bg-[#F5F2E7]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#63665C] block">
                Classificação em 1 clique
              </span>
              <h3 className="font-receipt-display text-lg sm:text-xl font-bold text-[#1E241F] leading-tight mt-0.5">
                {transaction.displayName || transaction.merchantKey}
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

          {/* Recursive Categorization explanation banner */}
          <div className="mt-3 p-2.5 rounded-lg bg-[#EAE6D9]/80 border border-[#D6D0BC] flex items-start gap-2 text-xs text-[#1E241F]">
            <Sparkles size={16} className="text-[#B96A28] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#1E241F]">Aprendizado Recursivo:</span> Ao escolher uma categoria abaixo,{' '}
              <strong>{affectedCount} {affectedCount === 1 ? 'lançamento' : 'lançamentos'}</strong> deste mesmo estabelecimento ({transaction.merchantKey}) serão atualizados e as próximas importações aprenderão automaticamente.
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-1.5">
          {CATEGORY_LIST.map((cat) => {
            const isSelected = cat.id === currentCat;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat.id, transaction.merchantKey);
                }}
                className={`w-full min-h-[52px] p-3 rounded-xl border flex items-center justify-between text-left transition-all duration-150 cursor-pointer active:scale-[0.99] ${
                  isSelected
                    ? 'border-[#1E241F] bg-[#EAE6D9] shadow-xs'
                    : 'border-[#D6D0BC]/70 hover:border-[#1E241F]/40 hover:bg-[#F5F2E7]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: cat.bgColor,
                      color: cat.color,
                      borderColor: cat.borderColor,
                    }}
                  >
                    <CategoryIcon category={cat.id} size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#1E241F] flex items-center gap-1.5">
                      {cat.label}
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#1E241F] text-[#FBF9F2]">
                          Atual
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#63665C] line-clamp-1">{cat.description}</div>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#1E241F] text-white flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-[#D6D0BC] group-hover:border-[#1E241F]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-[#D6D0BC] bg-[#F5F2E7] flex items-center justify-between text-xs text-[#63665C]">
          <div className="flex items-center gap-1.5">
            <Info size={13} />
            <span>Chave normalizada: <code className="font-receipt-mono bg-[#EAE6D9] px-1 py-0.5 rounded text-[11px]">{transaction.merchantKey}</code></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold underline text-[#1E241F] hover:text-[#B96A28] py-1 px-2 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  PieChart,
  TrendingUp,
  SlidersHorizontal,
  UploadCloud,
  Sparkles,
} from 'lucide-react';

export type TabType = 'home' | 'statement' | 'categories' | 'investments' | 'menu';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  transactionCount: number;
  rulesCount: number;
  onOpenImportModal: () => void;
  onOpenFocusMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  transactionCount,
  onOpenImportModal,
  onOpenFocusMode,
}) => {
  const tabs = [
    {
      id: 'home' as TabType,
      label: 'Início',
      icon: LayoutDashboard,
    },
    {
      id: 'statement' as TabType,
      label: 'Extrato',
      icon: ReceiptText,
      badge: transactionCount > 0 ? String(transactionCount) : undefined,
    },
    {
      id: 'categories' as TabType,
      label: 'Categorias',
      icon: PieChart,
    },
    {
      id: 'investments' as TabType,
      label: 'Investimentos',
      icon: TrendingUp,
    },
    {
      id: 'menu' as TabType,
      label: 'Importar / Menu',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <>
      {/* Top Header & Desktop Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#161C17] text-[#FAF8F2] border-b border-[#2C362E] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* App Brand */}
            <div
              className="flex items-center gap-2.5 cursor-pointer select-none"
              onClick={() => onSelectTab('home')}
            >
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F2] text-[#161C17] flex items-center justify-center font-receipt-display font-bold text-lg shadow-sm">
                N
              </div>
              <div>
                <span className="font-receipt-display font-bold text-base sm:text-lg tracking-tight text-[#FAF8F2] block leading-tight">
                  Extrato & Gestão
                </span>
                <span className="text-[11px] font-sans text-[#A39E8E] hidden sm:block leading-none mt-0.5">
                  Finanças Pessoais Nubank
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-[#222A23] p-1 rounded-xl border border-[#344036]">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FAF8F2] text-[#161C17] shadow-sm font-semibold'
                        : 'text-[#C9C4B5] hover:text-[#FAF8F2] hover:bg-[#2C362E]'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive
                            ? 'bg-[#E3DEC9] text-[#161C17]'
                            : 'bg-[#344036] text-[#C9C4B5]'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenFocusMode}
                title="Ativar Modo Foco & Resumo Sem Distrações"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2E6B4F] hover:bg-[#255740] text-[#FAF8F2] font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[40px] active:scale-95 border border-[#3E8061]"
              >
                <Sparkles size={15} className="text-[#A7D7BC]" />
                <span>Modo Foco</span>
              </button>

              <button
                type="button"
                onClick={onOpenImportModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D9] text-[#161C17] font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[40px] active:scale-95"
              >
                <UploadCloud size={16} />
                <span className="hidden sm:inline">Importar CSV</span>
                <span className="sm:hidden">Importar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for 1-thumb touch ease) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#161C17] border-t border-[#2C362E] pb-safe shadow-2xl">
        <nav className="flex items-center justify-around h-16 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all cursor-pointer active:scale-95 ${
                  isActive ? 'text-[#FAF8F2]' : 'text-[#8E998F] hover:text-[#C9C4B5]'
                }`}
              >
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? 'bg-[#2E3B30] text-[#FAF8F2]' : ''
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.3 : 1.8} />
                </div>
                <span
                  className={`text-[11px] mt-0.5 tracking-tight font-medium leading-none ${
                    isActive ? 'font-bold text-[#FAF8F2]' : ''
                  }`}
                >
                  {tab.id === 'menu' ? 'Menu' : tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

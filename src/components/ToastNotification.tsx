import React, { useEffect } from 'react';
import { Sparkles, Check, X } from 'lucide-react';

export interface ToastData {
  id: string;
  message: string;
  count?: number;
  merchantKey?: string;
  type?: 'success' | 'info';
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-in slide-in-from-bottom duration-250">
      <div className="bg-[#1E241F] text-[#FBF9F2] p-3.5 sm:p-4 rounded-xl shadow-2xl border border-[#38433A] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#2E6B4F] text-white flex items-center justify-center shrink-0">
            <Sparkles size={16} className="text-[#6ee7b7]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-[#FBF9F2] leading-tight">
              {toast.message}
            </p>
            {toast.merchantKey && (
              <p className="text-[11px] text-[#A6A292] truncate mt-0.5">
                Regra aprendida salva para futuras importações.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-[#A6A292] hover:text-[#FBF9F2] hover:bg-[#38433A] cursor-pointer shrink-0"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

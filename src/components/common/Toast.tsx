import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'warning' ? AlertTriangle : Info;
        const borderStyle =
          toast.type === 'success'
            ? 'border-emerald-500/40 shadow-[0_10px_35px_rgba(16,185,129,0.15)]'
            : toast.type === 'warning'
            ? 'border-amber-500/40 shadow-[0_10px_35px_rgba(245,158,11,0.15)]'
            : 'border-cyan-500/40 shadow-[0_10px_35px_rgba(0,242,254,0.15)]';

        const iconColor =
          toast.type === 'success'
            ? 'text-emerald-400'
            : toast.type === 'warning'
            ? 'text-amber-400'
            : 'text-cyan-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border bg-[#0D1426]/95 backdrop-blur-2xl text-white shadow-2xl transition-all animate-in slide-in-from-bottom-3 duration-200 ${borderStyle}`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
              <p className="mt-0.5 text-[11px] text-slate-300 leading-normal">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

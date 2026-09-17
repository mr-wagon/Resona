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
        const colorStyles =
          toast.type === 'success'
            ? 'bg-white border-emerald-200 text-emerald-950 shadow-emerald-500/10'
            : toast.type === 'warning'
            ? 'bg-white border-amber-200 text-amber-950 shadow-amber-500/10'
            : 'bg-white border-sky-200 text-slate-900 shadow-sky-500/10';

        const iconColor =
          toast.type === 'success'
            ? 'text-emerald-500'
            : toast.type === 'warning'
            ? 'text-amber-500'
            : 'text-sky-500';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 ${colorStyles}`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <h5 className="text-xs font-bold leading-tight">{toast.title}</h5>
              <p className="mt-0.5 text-[11px] text-slate-600 leading-normal">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { CheckCircle2, AlertOctagon, X } from 'lucide-react';

interface NotificationBannerProps {
  message: string | null;
  type: 'success' | 'danger' | 'info';
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type,
  onDismiss,
}) => {
  if (!message) return null;

  const bgStyle =
    type === 'danger'
      ? 'bg-rose-950/90 border-rose-500 text-rose-200'
      : type === 'success'
      ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
      : 'bg-cyan-950/90 border-cyan-500 text-cyan-200';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div className={`p-4 rounded-xl border shadow-2xl flex items-start space-x-3 backdrop-blur-xl ${bgStyle}`}>
        {type === 'danger' ? (
          <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 text-xs font-mono leading-relaxed">{message}</div>
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

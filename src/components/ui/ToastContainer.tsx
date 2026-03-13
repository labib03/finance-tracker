'use client';

import { useFinanceStore } from '@/lib/store';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
    const toasts = useFinanceStore((s) => s.toasts);
    const removeToast = useFinanceStore((s) => s.removeToast);

    if (toasts.length === 0) return null;

    const iconMap = {
        success: <CheckCircle size={18} />,
        error: <XCircle size={18} />,
        info: <Info size={18} />,
    };

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    {iconMap[toast.type]}
                    <span className="flex-1">{toast.message}</span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                        aria-label="Tutup notifikasi"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}

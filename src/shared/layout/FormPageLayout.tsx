'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormPageLayoutProps {
    title: string;
    description?: string;
    isDirty?: boolean;
    previewPanel: React.ReactNode;
    formPanel: React.ReactNode;
    onCancel?: () => void;
    showSuccessModal?: boolean;
    onSuccessConfirm?: () => void;
    successMessage?: string;
}

export default function FormPageLayout({
    title,
    description,
    isDirty = false,
    previewPanel,
    formPanel,
    onCancel,
    showSuccessModal = false,
    onSuccessConfirm,
    successMessage = "Data Anda berhasil disimpan."
}: FormPageLayoutProps) {
    const router = useRouter();
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const handleBackClick = () => {
        if (isDirty) {
            setShowCancelConfirm(true);
        } else {
            if (onCancel) onCancel();
            else router.back();
        }
    };

    const handleCancelConfirm = () => {
        setShowCancelConfirm(false);
        if (onCancel) onCancel();
        else router.back();
    };

    return (
        <div className="min-h-screen text-slate-900 flex flex-col relative overflow-hidden pb-12">

            {/* Header / Navigation bar */}
            <header className="w-full px-6 py-5 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBackClick}
                        className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-xs"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-widest text-slate-900">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content grid */}
            <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative z-10">
                {/* Left Panel: Preview/Insights */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', duration: 0.8, bounce: 0.1 }}
                    className="w-full lg:sticky lg:top-[96px] h-auto lg:h-[calc(100vh-160px)] flex flex-col justify-between gap-6"
                >
                    {previewPanel}
                </motion.div>

                {/* Right Panel: Bento Form Grid */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', duration: 0.8, bounce: 0.1, delay: 0.15 }}
                    className="w-full"
                >
                    {formPanel}
                </motion.div>
            </main>

            {/* Cancel Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showCancelConfirm}
                onClose={() => setShowCancelConfirm(false)}
                onConfirm={handleCancelConfirm}
                title="Batalkan Perubahan?"
                description="Anda memiliki perubahan yang belum disimpan. Apakah Anda yakin ingin membatalkan dan keluar? Data yang telah diisi akan hilang."
                confirmText="Ya, Batalkan"
                cancelText="Kembali"
                variant="destructive"
            />

            {/* Premium Dynamic Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl text-center relative overflow-hidden"
                        >
                            {/* Sparkling orb */}
                            <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

                            <div className="w-20 h-20 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/5">
                                <CheckCircle2 size={40} strokeWidth={2} />
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-wider mb-3">
                                Sukses Menyimpan!
                            </h3>
                            <p className="text-sm font-semibold text-slate-500 leading-relaxed mb-8 px-4">
                                {successMessage}
                            </p>

                            <Button
                                onClick={onSuccessConfirm}
                                className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 border-none transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-[0.98] text-xs uppercase tracking-widest"
                            >
                                Selesai
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

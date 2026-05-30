'use client';

import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => {
                if (onSuccessConfirm) {
                    onSuccessConfirm();
                } else {
                    router.back();
                }
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [showSuccessModal, onSuccessConfirm, router]);

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
                    className="w-full lg:sticky lg:top-[96px] h-fit flex flex-col gap-6"
                >
                    {previewPanel}
                </motion.div>

                {/* Right Panel: Bento Form Grid */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', duration: 0.8, bounce: 0.1, delay: 0.15 }}
                    className="w-full flex flex-col gap-6"
                >
                    {formPanel}

                    <AnimatePresence>
                        {showSuccessModal && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="border border-emerald-200 bg-emerald-50 rounded-[2rem] shadow-sm"
                            >
                                <div className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
                                            <CheckCircle2 size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-left flex-1">
                                            <h4 className="text-sm font-black uppercase tracking-wider text-emerald-800">
                                                Sukses Menyimpan!
                                            </h4>
                                            <p className="text-xs text-emerald-700/80 font-bold mt-0.5">
                                                {successMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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
        </div>
    );
}

'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { AlertTriangle, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'default' | 'info';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Hapus",
    cancelText = "Batal",
    variant = 'destructive',
    isLoading = false
}: ConfirmDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] border-none shadow-2xl overflow-hidden p-0" showCloseButton={!isLoading}>
                <div className="p-6 pb-2">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm animate-in zoom-in-50 duration-300",
                            variant === 'destructive' ? 'bg-red-50 text-red-600 border border-red-100' :
                                variant === 'info' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        )}>
                            {variant === 'destructive' ? <Trash2 size={28} /> :
                                variant === 'info' ? <Info size={28} /> :
                                    <AlertTriangle size={28} />}
                        </div>
                        <DialogTitle className="text-xl font-black text-foreground">{title}</DialogTitle>
                        <DialogDescription className="pt-2 text-sm text-balance font-medium text-muted-foreground leading-relaxed">
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <DialogFooter className="flex sm:flex-row gap-0 p-6 pt-0 bg-muted/30 border-t border-border/50">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-none font-bold hover:bg-background h-11"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        disabled={isLoading}
                        onClick={onConfirm}
                        className={cn(
                            "flex-1 rounded-none border-none font-bold h-11 transition-all active:scale-95",
                            variant === 'default' ? 'bg-indigo-600 hover:bg-indigo-700' :
                                variant === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''
                        )}
                    >
                        {isLoading ? "Memproses..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

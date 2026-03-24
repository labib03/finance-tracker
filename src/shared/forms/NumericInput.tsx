'use client';

import React from 'react';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { useController, type UseControllerProps } from 'react-hook-form';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn, formatRupiah } from '@/lib/utils';
import { Calculator, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet';
import { Button } from '@/shared/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = NumericFormatProps & UseControllerProps<any> & {
    label?: string;
    error?: string;
    hideCalculator?: boolean;
};

export default function NumericInput({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
    label,
    error,
    className,
    hideCalculator,
    ...inputProps
}: Props) {
    const {
        field: { onChange, onBlur, name: fieldName, value, ref },
    } = useController({
        name,
        control,
        defaultValue,
        rules,
        shouldUnregister,
    });

    const isDesktop = useMediaQuery("(min-width: 768px)");

    const [currentVal, setCurrentVal] = React.useState('0');
    const [prevVal, setPrevVal] = React.useState<number | null>(null);
    const [operation, setOperation] = React.useState<string | null>(null);
    const [history, setHistory] = React.useState<string[]>([]);
    const [isCalcOpen, setIsCalcOpen] = React.useState(false);
    const [shouldResetScreen, setShouldResetScreen] = React.useState(false);

    const calculate = (first: number, second: number, op: string): number => {
        switch (op) {
            case '+': return first + second;
            case '-': return first - second;
            case '*': return first * second;
            case '/': return second !== 0 ? first / second : 0;
            default: return second;
        }
    };

    const handleDigit = (digit: string) => {
        if (shouldResetScreen) {
            setCurrentVal(digit);
            setShouldResetScreen(false);
        } else {
            setCurrentVal(prev => prev === '0' ? digit : prev + digit);
        }
    };

    const handleOperator = (op: string) => {
        const current = parseFloat(currentVal);
        
        if (prevVal === null) {
            setPrevVal(current);
            setHistory([`${formatRupiah(current)} ${op}`]);
        } else if (operation) {
            const result = calculate(prevVal, current, operation);
            setPrevVal(result);
            setHistory(prev => [...prev.slice(-2), `${formatRupiah(current)} = ${formatRupiah(result)}`, `${formatRupiah(result)} ${op}`]);
            setCurrentVal(result.toString());
        }
        
        setOperation(op);
        setShouldResetScreen(true);
    };

    const handleEqual = () => {
        const current = parseFloat(currentVal);
        if (prevVal !== null && operation) {
            const result = calculate(prevVal, current, operation);
            setCurrentVal(result.toString());
            setHistory(prev => [...prev.slice(-2), `${formatRupiah(current)} = ${formatRupiah(result)}`]);
            setPrevVal(result);
            setOperation(null);
            setShouldResetScreen(true);
        }
    };

    const clearCalc = () => {
        setCurrentVal('0');
        setPrevVal(null);
        setOperation(null);
        setHistory([]);
    };

    const applyCalc = () => {
        const finalVal = parseFloat(currentVal);
        if (!isNaN(finalVal)) {
            onChange(finalVal);
            setIsCalcOpen(false);
            clearCalc();
        }
    };

    const calculatorUI = (
        <div className={cn("flex flex-col bg-white", isDesktop ? "min-h-[420px]" : "h-[85vh] sm:h-[80vh] pb-4")}>
            {/* Header for Mobile only */}
            {!isDesktop && (
                <div className="flex items-center justify-between p-6 bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1rem] bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                            <Calculator size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Alat Bantu</p>
                            <p className="text-base font-black text-slate-900 leading-tight">Kalkulator Pintar</p>
                        </div>
                    </div>
                </div>
            )}

            {/* History Display */}
            <div className={cn(
                "bg-slate-50/90 p-6 overflow-y-auto flex flex-col justify-end gap-1.5 text-right border-b border-slate-100 custom-scrollbar shadow-inner",
                isDesktop ? "h-28" : "flex-1 min-h-[120px]"
            )}>
                {history.length === 0 && <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.15em]">Siap Menghitung</span>}
                {history.map((h, i) => (
                    <span key={i} className={cn(
                        "font-mono font-bold tracking-tight",
                        isDesktop ? "text-[11px] text-slate-500" : "text-sm text-slate-600"
                    )}>{h}</span>
                ))}
            </div>

            {/* Main Screen */}
            <div className={cn("p-6 bg-white text-right shrink-0", isDesktop ? "py-4" : "py-6")}>
                <div className="text-[10px] uppercase font-black tracking-[0.15em] text-indigo-400 mb-2">Total Saat Ini</div>
                <div className={cn("font-black text-indigo-600 font-mono break-all leading-none", isDesktop ? "text-3xl" : "text-4xl")}>
                    {formatRupiah(parseFloat(currentVal))}
                </div>
            </div>

            {/* Keypad */}
            <div className={cn("grid grid-cols-4 gap-2.5 p-6 bg-white shrink-0", isDesktop ? "pt-2 pb-6" : "pt-2")}>
                <Button type="button" variant="secondary" className="h-12 md:h-12 text-sm md:text-sm font-black rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 border-none shadow-sm shadow-rose-100/50" onClick={clearCalc}>C</Button>
                <Button type="button" variant="secondary" className="h-12 md:h-12 text-sm md:text-sm font-black rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 border-none col-span-2 shadow-sm shadow-slate-200/50" onClick={() => setCurrentVal(prev => prev.length > 1 ? prev.slice(0, -1) : '0')}>Hapus</Button>
                <Button type="button" variant="secondary" className="h-12 md:h-12 text-lg md:text-lg font-black rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 border-none shadow-sm shadow-amber-100/50" onClick={() => handleOperator('/')}>÷</Button>
                
                {[7, 8, 9].map(n => (
                    <Button key={n} type="button" variant="ghost" className="h-14 md:h-12 text-xl md:text-lg font-black rounded-2xl hover:bg-slate-50 hover:text-indigo-600 border border-slate-100 shadow-sm" onClick={() => handleDigit(n.toString())}>{n}</Button>
                ))}
                <Button type="button" variant="secondary" className="h-14 md:h-12 text-xl md:text-lg font-black rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 border-none shadow-sm shadow-amber-100/50" onClick={() => handleOperator('*')}>×</Button>
                
                {[4, 5, 6].map(n => (
                    <Button key={n} type="button" variant="ghost" className="h-14 md:h-12 text-xl md:text-lg font-black rounded-2xl hover:bg-slate-50 hover:text-indigo-600 border border-slate-100 shadow-sm" onClick={() => handleDigit(n.toString())}>{n}</Button>
                ))}
                <Button type="button" variant="secondary" className="h-14 md:h-12 text-xl md:text-lg font-black rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 border-none shadow-sm shadow-amber-100/50" onClick={() => handleOperator('-')}>-</Button>
                
                {[1, 2, 3].map(n => (
                    <Button key={n} type="button" variant="ghost" className="h-14 md:h-12 text-xl md:text-lg font-black rounded-2xl hover:bg-slate-50 hover:text-indigo-600 border border-slate-100 shadow-sm" onClick={() => handleDigit(n.toString())}>{n}</Button>
                ))}
                <Button type="button" variant="secondary" className="h-14 md:h-12 text-xl md:text-lg font-black rounded-2xl bg-amber-50 text-amber-600 hover:bg-amber-100 border-none shadow-sm shadow-amber-100/50" onClick={() => handleOperator('+')}>+</Button>
                
                <Button type="button" variant="ghost" className="h-14 md:h-12 text-xl md:text-lg font-black rounded-2xl hover:bg-slate-50 hover:text-indigo-600 col-span-2 border border-slate-100 shadow-sm" onClick={() => handleDigit('0')}>0</Button>
                <Button type="button" variant="ghost" className="h-14 md:h-12 text-xl md:text-lg font-black rounded-2xl hover:bg-slate-50 hover:text-indigo-600 border border-slate-100 shadow-sm" onClick={() => !currentVal.includes('.') && setCurrentVal(prev => prev + '.')}>.</Button>
                <Button type="button" variant="secondary" className="h-14 md:h-12 text-xl md:text-lg font-black rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 border-none shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all" onClick={handleEqual}>=</Button>
            </div>

            {/* Final Action */}
            <div className={cn("grid grid-cols-3 gap-3 px-6 pb-6 bg-white shrink-0", isDesktop ? "pt-0" : "pt-2")}>
                <Button 
                    type="button"
                    variant="outline"
                    className="col-span-1 h-14 rounded-[1.25rem] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-[0.98] text-[10px] sm:text-xs shadow-sm"
                    onClick={() => {
                        setIsCalcOpen(false);
                        clearCalc();
                    }}
                >
                    Batal
                </Button>
                <Button 
                    type="button"
                    className="col-span-2 h-14 bg-indigo-950 hover:bg-indigo-900 text-white rounded-[1.25rem] font-black uppercase tracking-widest shadow-xl shadow-indigo-950/20 transition-all active:scale-[0.98] text-[10px] sm:text-xs"
                    onClick={applyCalc}
                >
                    <Check size={18} strokeWidth={3} className="mr-2 text-indigo-400" />
                    Terapkan {formatRupiah(parseFloat(currentVal))}
                </Button>
            </div>
        </div>
    );

    const triggerClass = "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-[0.75rem] border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer outline-none shadow-sm hover:shadow-md hover:scale-105 active:scale-95 duration-300";

    const triggerContent = (
        <>
            <Calculator size={12} strokeWidth={2.5} />
            Kalkulator
        </>
    );

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
                {label && <Label className="text-sm font-medium">{label}</Label>}
                {!hideCalculator && (
                    isDesktop ? (
                        <Popover open={isCalcOpen} onOpenChange={(open) => {
                            setIsCalcOpen(open);
                            if (!open) clearCalc();
                        }}>
                            <PopoverTrigger className={triggerClass}>
                                {triggerContent}
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 overflow-hidden shadow-2xl border-none ring-1 ring-black/5 rounded-[2rem]" align="end" sideOffset={12}>
                                {calculatorUI}
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <Sheet open={isCalcOpen} onOpenChange={(open) => {
                            setIsCalcOpen(open);
                            if (!open) clearCalc();
                        }}>
                            <SheetTrigger className={triggerClass}>
                                {triggerContent}
                            </SheetTrigger>
                            <SheetContent side="bottom" showCloseButton={true} className="p-0 overflow-hidden border-none rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] outline-none bg-white">
                                {calculatorUI}
                            </SheetContent>
                        </Sheet>
                    )
                )}
            </div>
            <NumericFormat
                {...inputProps}
                getInputRef={ref}
                name={fieldName}
                value={value ?? ''}
                onBlur={onBlur}
                onValueChange={(values) => {
                    onChange(values.floatValue ?? 0);
                }}
                thousandSeparator=","
                decimalSeparator="."
                allowNegative={false}
                prefix="Rp "
                displayType="input"
                customInput={Input}
                className={cn(
                    "display-number text-2xl font-black h-14 bg-slate-50 border-slate-200/60 rounded-xl px-5 transition-all focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 self-center",
                    error && "border-rose-500 focus:ring-rose-100",
                    className
                )}
            />
            {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{error}</p>}
        </div>
    );
}

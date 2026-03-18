'use client';

import React from 'react';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { useController, type UseControllerProps } from 'react-hook-form';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn, formatRupiah } from '@/lib/utils';
import { Calculator, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Button } from '@/shared/ui/button';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = NumericFormatProps & UseControllerProps<any> & {
    label?: string;
    error?: string;
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

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between">
                {label && <Label className="text-sm font-medium">{label}</Label>}
                <Popover open={isCalcOpen} onOpenChange={(open) => {
                    setIsCalcOpen(open);
                    if (!open) clearCalc();
                }}>
                    <PopoverTrigger className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50 hover:bg-indigo-100 transition-colors cursor-pointer outline-none">
                        <Calculator size={10} />
                        Kalkulator
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 overflow-hidden shadow-2xl border-none ring-1 ring-black/5 rounded-[1.25rem] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40" align="end" sideOffset={12}>
                        <div className="flex flex-col min-h-[420px] bg-white">
                            {/* History Display */}
                            <div className="bg-slate-50/80 p-6 h-28 overflow-y-auto flex flex-col justify-end gap-1 text-right border-b border-slate-100">
                                {history.length === 0 && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Riwayat Kosong</span>}
                                {history.map((h, i) => (
                                    <span key={i} className="text-[11px] font-mono text-slate-500">{h}</span>
                                ))}
                            </div>

                            {/* Main Screen */}
                            <div className="p-4 bg-white text-right">
                                <div className="text-[10px] uppercase font-black tracking-widest text-indigo-400 mb-1">Total Saat Ini</div>
                                <div className="text-3xl font-black text-indigo-600 font-mono break-all truncate">
                                    {formatRupiah(parseFloat(currentVal))}
                                </div>
                            </div>

                            {/* Keypad */}
                            <div className="grid grid-cols-4 gap-2.5 p-6 bg-white flex-1">
                                <Button type="button" variant="secondary" className="h-12 text-sm font-black rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none" onClick={clearCalc}>C</Button>
                                <Button type="button" variant="secondary" className="h-12 text-sm font-black rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 border-none col-span-2 shadow-none" onClick={() => setCurrentVal(prev => prev.length > 1 ? prev.slice(0, -1) : '0')}>Hapus</Button>
                                <Button type="button" variant="secondary" className="h-12 text-lg font-black rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 border-none shadow-none" onClick={() => handleOperator('/')}>÷</Button>
                                
                                {[7, 8, 9].map(n => (
                                    <Button key={n} type="button" variant="ghost" className="h-12 text-lg font-bold rounded-xl hover:bg-slate-50 border-none shadow-none" onClick={() => handleDigit(n.toString())}>{n}</Button>
                                ))}
                                <Button type="button" variant="secondary" className="h-12 text-lg font-black rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 border-none shadow-none" onClick={() => handleOperator('*')}>×</Button>
                                
                                {[4, 5, 6].map(n => (
                                    <Button key={n} type="button" variant="ghost" className="h-12 text-lg font-bold rounded-xl hover:bg-slate-50 border-none shadow-none" onClick={() => handleDigit(n.toString())}>{n}</Button>
                                ))}
                                <Button type="button" variant="secondary" className="h-12 text-lg font-black rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 border-none shadow-none" onClick={() => handleOperator('-')}>-</Button>
                                
                                {[1, 2, 3].map(n => (
                                    <Button key={n} type="button" variant="ghost" className="h-12 text-lg font-bold rounded-xl hover:bg-slate-50 border-none shadow-none" onClick={() => handleDigit(n.toString())}>{n}</Button>
                                ))}
                                <Button type="button" variant="secondary" className="h-12 text-lg font-black rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 border-none shadow-none" onClick={() => handleOperator('+')}>+</Button>
                                
                                <Button type="button" variant="ghost" className="h-12 text-lg font-bold rounded-xl hover:bg-slate-50 col-span-2 border-none shadow-none" onClick={() => handleDigit('0')}>0</Button>
                                <Button type="button" variant="ghost" className="h-12 text-lg font-bold rounded-xl hover:bg-slate-50 border-none shadow-none" onClick={() => !currentVal.includes('.') && setCurrentVal(prev => prev + '.')}>.</Button>
                                <Button type="button" variant="secondary" className="h-12 text-lg font-black rounded-xl bg-primary text-white hover:bg-primary/90 border-none shadow-lg shadow-primary/20" onClick={handleEqual}>=</Button>
                            </div>

                            {/* Final Action */}
                            <div className="p-4 bg-indigo-50/50 border-t border-indigo-100">
                                <Button 
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-[1.25rem] font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                                    onClick={applyCalc}
                                >
                                    <Check size={20} strokeWidth={3} className="mr-2" />
                                    Terapkan {formatRupiah(parseFloat(currentVal))}
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
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
                    "display-number text-2xl font-black h-14 bg-muted/20 border-border/50 rounded-xl px-5 transition-all focus:bg-background focus:ring-4 focus:ring-primary/10 self-center",
                    error && "border-destructive focus:ring-destructive/10",
                    className
                )}
            />
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>
    );
}

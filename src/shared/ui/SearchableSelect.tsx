'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    error?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Pilih item...",
    searchPlaceholder = "Cari...",
    emptyMessage = "Tidak ditemukan.",
    className,
    error,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (open) {
            // Focus input after a small delay to ensure positioning is done
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [open]);

    const filteredOptions = React.useMemo(() => {
        if (!search) return options;
        return options.filter((option) =>
            option.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    const selectedOption = React.useMemo(() =>
        options.find((option) => option.value === value),
        [options, value]
    );

    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger
                type="button"
                className={cn(
                    "flex h-11 w-full items-center justify-between rounded-xl border border-input bg-muted/20 px-4 py-2 text-sm whitespace-nowrap transition-all outline-none focus:bg-background focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                    !value && "text-muted-foreground/50",
                    error && "border-destructive focus:ring-destructive/10 focus:border-destructive",
                    className
                )}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent
                className="w-(--anchor-width) p-0 overflow-hidden bg-popover/95 backdrop-blur-sm border shadow-2xl rounded-[0.8rem] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40"
                align="start"
                sideOffset={8}
            >
                <div className="flex items-center border-b px-4 h-12 sticky top-0 bg-popover z-10">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-40" />
                    <input
                        ref={inputRef}
                        className="flex h-full w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-1 px-1 py-1.5 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
                    {filteredOptions.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            Tidak ada data ditemukan
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={cn(
                                    "relative flex w-full cursor-default select-none items-center rounded-lg px-3 py-1.5 text-sm outline-none hover:bg-primary/5 hover:text-primary transition-all text-left group",
                                    value === option.value && "bg-primary/5 text-primary font-bold"
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onValueChange(option.value);
                                    setOpen(false);
                                    setSearch('');
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        value === option.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span className="truncate">{option.label}</span>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

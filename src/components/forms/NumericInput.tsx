'use client';

import React from 'react';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { useController, type UseControllerProps } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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

    return (
        <div className="w-full space-y-2">
            {label && <Label className="text-sm font-medium">{label}</Label>}
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
                    "display-number text-lg font-semibold",
                    error && "border-destructive focus-visible:ring-destructive",
                    className
                )}
            />
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>
    );
}

'use client';

import React from 'react';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { useController, type UseControllerProps } from 'react-hook-form';

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
        <div className="w-full">
            {label && <label className="input-label">{label}</label>}
            <NumericFormat
                {...inputProps}
                getInputRef={ref}
                name={fieldName}
                value={value ?? ''}
                onBlur={onBlur}
                onValueChange={(values) => {
                    // values.floatValue is the raw number (e.g., 1000)
                    // values.formattedValue is the string with commas (e.g., "1,000")
                    onChange(values.floatValue ?? 0);
                }}
                thousandSeparator=","
                decimalSeparator="."
                allowNegative={false}
                prefix="Rp "
                displayType="input"
                className={`input-field display-number ${error ? 'input-error' : ''} ${className || ''}`}
            />
            {error && <p className="input-error-text">{error}</p>}
        </div>
    );
}

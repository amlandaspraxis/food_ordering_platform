import React, { forwardRef } from 'react';

export const Input = forwardRef(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className={`w-full ${className}`}>
                {label && <label className="label-text">{label}</label>}
                <input
                    ref={ref}
                    className={`input-field ${error ? 'border-error focus:ring-error focus:border-error' : ''}`}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-error">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';

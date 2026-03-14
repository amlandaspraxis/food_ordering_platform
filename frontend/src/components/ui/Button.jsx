import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
    children,
    variant = 'primary',
    isLoading,
    className = '',
    ...props
}) => {
    const baseClass =
        variant === 'primary' ? 'btn-primary' :
            variant === 'secondary' ? 'btn-secondary' :
                variant === 'danger' ? 'bg-error text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors' :
                    'btn-outline';

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`${baseClass} flex items-center justify-center ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <span className="animate-spin h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full" />
            ) : null}
            {children}
        </motion.button>
    );
};

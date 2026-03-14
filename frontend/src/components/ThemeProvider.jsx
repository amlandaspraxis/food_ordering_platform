"use client";

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeProvider({ children }) {
    const { theme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            const root = document.documentElement;
            if (theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [theme, mounted]);

    return <>{children}</>;
}

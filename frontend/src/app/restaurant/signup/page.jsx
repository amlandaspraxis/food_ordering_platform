"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RestaurantSignupRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to main signup with owner role pre-selected
        router.replace('/signup?role=restaurant_owner');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
    );
}

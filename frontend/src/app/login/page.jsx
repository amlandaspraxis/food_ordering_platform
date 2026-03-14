"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const res = await api.post('/auth/login', data);

            const { user, token, refreshToken } = res.data;
            setAuth(user, token, refreshToken);

            toast.success('Logged in successfully!');

            if (user.role === 'admin') router.push('/admin/dashboard');
            else if (user.role === 'restaurant_owner') router.push('/restaurant/dashboard');
            else router.push('/');

        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="card max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-textPrimary">Welcome Back</h2>
                    <p className="mt-2 text-textMuted text-sm">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        error={errors.email?.message}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        {...register('password')}
                        error={errors.password?.message}
                    />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-primary focus:ring-primary border-borderColor rounded bg-darkBg"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-textMuted">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary hover:text-secondary">
                                Forgot your password?
                            </a>
                        </div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
                        Sign in
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-textMuted border-b border-borderColor pb-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="font-medium text-primary hover:text-secondary transition-colors">
                        Sign up
                    </Link>
                </div>

            </div>
        </div>
    );
}

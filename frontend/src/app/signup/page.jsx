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

const signupSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    phone: z.string().min(10, 'Valid phone number is required'),
    role: z.enum(['customer', 'restaurant_owner']).default('customer'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const neStates = [
    'Arunachal Pradesh',
    'Assam',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Sikkim',
    'Tripura'
];

export default function SignupPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: { role: 'customer' }
    });

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            const payload = {
                name: data.name,
                email: data.email,
                password: data.password,
                phone: data.phone,
                role: data.role,
                address: {
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode
                }
            };

            const res = await api.post('/auth/register', payload);
            const { user, token, refreshToken } = res.data;

            setAuth(user, token, refreshToken);
            toast.success('Account created successfully!');

            if (user.role === 'restaurant_owner') {
                router.push('/restaurant/dashboard');
            } else {
                router.push('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="card max-w-2xl w-full p-8 md:p-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-textPrimary">Create an Account</h2>
                    <p className="mt-2 text-textMuted text-sm">Join us to explore the best food</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            {...register('name')}
                            error={errors.name?.message}
                        />
                        <Input
                            label="Phone Number"
                            placeholder="+1234567890"
                            {...register('phone')}
                            error={errors.phone?.message}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            {...register('email')}
                            error={errors.email?.message}
                        />
                        <div className="flex flex-col">
                            <label className="label-text">Select Account Type</label>
                            <select
                                {...register('role')}
                                className="input-field"
                            >
                                <option value="customer">Customer</option>
                                <option value="restaurant_owner">Restaurant Owner</option>
                            </select>
                        </div>
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            error={errors.password?.message}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="••••••••"
                            {...register('confirmPassword')}
                            error={errors.confirmPassword?.message}
                        />
                    </div>

                    <div className="border-t border-borderColor pt-6 mt-6">
                        <h3 className="text-lg font-semibold mb-4 text-textPrimary">Address Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-3">
                                <Input
                                    label="Street Address"
                                    placeholder="123 Main St, Apt 4B"
                                    {...register('street')}
                                    error={errors.street?.message}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    label="City"
                                    placeholder="Guwahati"
                                    {...register('city')}
                                    error={errors.city?.message}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Input
                                    label="Zip Code"
                                    placeholder="781001"
                                    {...register('zipCode')}
                                    error={errors.zipCode?.message}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <div className="flex flex-col">
                                    <label className="label-text">State</label>
                                    <select
                                        {...register('state')}
                                        className={`input-field ${errors.state ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
                                    >
                                        <option value="" disabled>Select State</option>
                                        {neStates.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    {errors.state && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.state.message}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full mt-8" isLoading={isLoading}>
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-textMuted">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-primary hover:text-secondary transition-colors">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}

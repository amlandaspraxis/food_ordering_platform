"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, setAuth } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        const fetchProfile = async () => {
            try {
                const res = await api.get('/customer/profile');
                setProfile(res.data.data);
                reset({
                    name: res.data.data.name,
                    phone: res.data.data.phone,
                    street: res.data.data.address?.street || '',
                    city: res.data.data.address?.city || '',
                    state: res.data.data.address?.state || '',
                    zipCode: res.data.data.address?.zipCode || '',
                });
            } catch (error) {
                toast.error('Failed to load profile');
            }
        };
        fetchProfile();
    }, [isAuthenticated, reset]);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const payload = {
                name: data.name,
                phone: data.phone,
                address: {
                    street: data.street,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                }
            };
            const res = await api.put('/customer/profile', payload);
            setProfile(res.data.data);
            // Update store user name
            if (user) {
                setAuth({ ...user, name: res.data.data.name }, useAuthStore.getState().token, useAuthStore.getState().refreshToken);
            }
            toast.success('Profile updated successfully');

            router.push('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!profile) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8 text-textPrimary">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="card p-6 flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full bg-secondary text-white flex items-center justify-center text-5xl font-bold mb-4">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-textPrimary mb-1">{profile.name}</h2>
                        <p className="text-textMuted text-sm mb-4">{profile.email}</p>
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider">
                            {profile.role.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="card p-6">
                        <h3 className="text-xl font-bold border-b border-borderColor pb-4 mb-6">Personal Information</h3>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input label="Full Name" {...register('name')} />
                                <Input label="Phone Number" {...register('phone')} />
                            </div>

                            <h3 className="text-xl font-bold border-b border-borderColor pb-4 mb-6 mt-8">Default Address</h3>

                            <Input label="Street Address" {...register('street')} />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                                <Input label="City" {...register('city')} />
                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-textPrimary">State</label>
                                    <select
                                        {...register('state')}
                                        className="w-full px-4 py-2 border border-borderColor rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all bg-white text-textPrimary"
                                    >
                                        <option value="" disabled>Select State</option>
                                        {neStates.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input label="Zip Code" {...register('zipCode')} />
                            </div>

                            <div className="flex justify-end mt-8 border-t border-borderColor pt-6">
                                <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

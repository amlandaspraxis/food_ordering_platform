"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RestaurantProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, setAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'restaurant_owner') {
            window.location.href = '/login';
            return;
        }
        const fetchProfile = async () => {
            try {
                const res = await api.get('/restaurant/profile');
                const data = res.data.data;
                if (data) {
                    reset({
                        name: data.name,
                        email: data.email,
                        licenseNumber: data.licenseNumber,
                        description: data.description,
                        phone: data.phone,
                        street: data.address?.street,
                        city: data.address?.city,
                        zipCode: data.address?.zipCode,
                        cuisines: data.cuisines?.join(', '),
                        image: data.image,
                        banner: data.banner,
                        deliveryFee: data.deliveryFee,
                        deliveryTime: data.deliveryTime,
                        isCurrentlyOpen: data.isCurrentlyOpen
                    });
                }
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                name: data.name,
                email: data.email,
                licenseNumber: data.licenseNumber,
                description: data.description,
                phone: data.phone,
                address: {
                    street: data.street,
                    city: data.city,
                    zipCode: data.zipCode,
                },
                cuisines: data.cuisines.split(',').map((c) => c.trim()).filter(Boolean),
                image: data.image,
                banner: data.banner,
                deliveryFee: parseFloat(data.deliveryFee) || 0,
                deliveryTime: parseInt(data.deliveryTime, 10) || 30,
                isCurrentlyOpen: data.isCurrentlyOpen === 'true' || data.isCurrentlyOpen === true
            };

            const res = await api.put('/restaurant/profile', payload);
            toast.success('Profile updated successfully');

            // If store username changed
            if (user && data.name !== user.name) {
                const { token, refreshToken } = useAuthStore.getState();
                setAuth({ ...user, name: data.name }, token, refreshToken);
            }

            router.push('/restaurant/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8 text-textPrimary">Restaurant Profile</h1>

            <div className="card p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-borderColor pb-4 mb-6">
                        <h2 className="text-xl font-bold text-textPrimary">Basic Information</h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-textMuted">Store Status:</span>
                            <select className="input-field py-1" {...register('isCurrentlyOpen')}>
                                <option value="true">Open</option>
                                <option value="false">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Restaurant Name" {...register('name', { required: true })} />
                        <Input label="Phone Number" {...register('phone', { required: true })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Business Email" type="email" {...register('email', { required: true })} />
                        <Input label="License Number (FSSAI/Local)" {...register('licenseNumber', { required: true })} />
                    </div>

                    <div>
                        <label className="label-text">Description</label>
                        <textarea
                            className="input-field min-h-[100px]"
                            placeholder="Tell customers about your restaurant..."
                            {...register('description', { required: true })}
                        />
                    </div>

                    <Input
                        label="Cuisines (comma separated)"
                        placeholder="Pizza, Italian, Fast Food..."
                        {...register('cuisines')}
                    />

                    <h2 className="text-xl font-bold border-b border-borderColor pb-4 mb-6 mt-8">Location Details</h2>

                    <Input label="Street Address" {...register('street', { required: true })} />
                    <div className="grid grid-cols-2 gap-6 mt-6">
                        <Input label="City" {...register('city', { required: true })} />
                        <Input label="Zip Code" {...register('zipCode', { required: true })} />
                    </div>

                    <h2 className="text-xl font-bold border-b border-borderColor pb-4 mb-6 mt-8">Delivery & Media Settings</h2>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <Input
                            label="Standard Delivery Fee ($)"
                            type="number" step="0.01"
                            {...register('deliveryFee')}
                        />
                        <Input
                            label="Estimated Delivery Time (mins)"
                            type="number"
                            {...register('deliveryTime')}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Main Image URL (Square)"
                            placeholder="https://..."
                            {...register('image')}
                        />
                        <Input
                            label="Banner Image URL (Wide)"
                            placeholder="https://..."
                            {...register('banner')}
                        />
                    </div>

                    <div className="flex justify-end pt-6 border-t border-borderColor mt-8">
                        <Button type="submit" isLoading={isSubmitting} className="px-8">
                            Save Profile
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

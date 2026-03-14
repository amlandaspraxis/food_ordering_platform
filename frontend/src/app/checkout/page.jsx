"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

const checkoutSchema = z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    zipCode: z.string().min(1, 'Zip code is required'),
    instructions: z.string().optional(),
    paymentMethod: z.enum(['cod', 'online_mock']),
});

export default function CheckoutPage() {
    const { items, restaurantId, deliveryFee: storeDeliveryFee, getSubtotal, clearCart } = useCartStore();
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            paymentMethod: 'cod',
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            zipCode: user?.address?.zipCode || '',
        }
    });

    const subtotal = getSubtotal();
    const deliveryFee = storeDeliveryFee || 0;
    const taxes = subtotal * 0.1;
    const total = subtotal + deliveryFee + taxes;

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);

            const payload = {
                restaurantId,
                items,
                deliveryAddress: {
                    street: data.street,
                    city: data.city,
                    zipCode: data.zipCode,
                    instructions: data.instructions,
                },
                paymentMethod: data.paymentMethod,
                subtotal,
                deliveryFee,
                totalAmount: total,
            };

            const res = await api.post('/customer/orders', payload);

            clearCart();
            toast.success('Order placed successfully!');
            router.push(`/orders/${res.data.data._id}`);

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8 text-textPrimary">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 card p-6">
                        <h2 className="text-xl font-semibold mb-4 border-b border-borderColor pb-2">Delivery Details</h2>

                        <Input
                            label="Street Address"
                            placeholder="123 Main St"
                            {...register('street')}
                            error={errors.street?.message}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="City"
                                placeholder="New York"
                                {...register('city')}
                                error={errors.city?.message}
                            />
                            <Input
                                label="Zip Code"
                                placeholder="10001"
                                {...register('zipCode')}
                                error={errors.zipCode?.message}
                            />
                        </div>

                        <Input
                            label="Delivery Instructions (Optional)"
                            placeholder="Leave at the door..."
                            {...register('instructions')}
                        />

                        <h2 className="text-xl font-semibold mb-4 mt-8 border-b border-borderColor pb-2">Payment Method</h2>

                        <div className="space-y-3">
                            <label className="flex items-center p-4 border border-borderColor rounded-lg cursor-pointer hover:bg-darkBg transition-colors">
                                <input
                                    type="radio"
                                    value="cod"
                                    {...register('paymentMethod')}
                                    className="w-4 h-4 text-primary focus:ring-primary bg-darkBg border-borderColor"
                                />
                                <span className="ml-3 font-medium">Cash on Delivery</span>
                            </label>
                            <label className="flex items-center p-4 border border-borderColor rounded-lg cursor-pointer hover:bg-darkBg transition-colors">
                                <input
                                    type="radio"
                                    value="online_mock"
                                    {...register('paymentMethod')}
                                    className="w-4 h-4 text-primary focus:ring-primary bg-darkBg border-borderColor"
                                />
                                <span className="ml-3 font-medium">Online Payment (Mock Card)</span>
                            </label>
                            {errors.paymentMethod && <p className="text-error text-sm mt-1">{errors.paymentMethod.message}</p>}
                        </div>
                    </form>
                </div>

                <div>
                    <div className="card p-6 bg-darkBg/50 relative sticky top-24">
                        <h2 className="text-xl font-semibold mb-4 border-b border-borderColor pb-2">Order Summary</h2>

                        <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
                            {items.map(item => (
                                <div key={item.foodId} className="flex justify-between text-sm">
                                    <span className="text-textPrimary"><span className="text-primary font-bold">{item.quantity}x</span> {item.name}</span>
                                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-borderColor/50 text-sm">
                            <div className="flex justify-between text-textMuted">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-textMuted">
                                <span>Delivery Fee</span>
                                <span>${deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-textMuted">
                                <span>Taxes</span>
                                <span>${taxes.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-textPrimary pt-4 border-t border-borderColor/50">
                                <span>Total</span>
                                <span className="text-primary">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            form="checkout-form"
                            className="w-full mt-8 py-4 text-lg"
                            isLoading={isLoading}
                        >
                            Place Order
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

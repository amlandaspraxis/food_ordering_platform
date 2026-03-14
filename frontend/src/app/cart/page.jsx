"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
    const { items, deliveryFee: storeDeliveryFee, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();
    const router = useRouter();

    const subtotal = getSubtotal();
    const deliveryFee = storeDeliveryFee || 0;
    const taxes = subtotal * 0.1;
    const total = subtotal + deliveryFee + taxes;

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-textPrimary mb-4">Your cart is empty</h2>
                <p className="text-textMuted mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link href="/">
                    <Button>Browse Restaurants</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8 text-textPrimary">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-textMuted">Items ({items.reduce((a, b) => a + b.quantity, 0)})</h2>
                        <button onClick={clearCart} className="text-sm text-error hover:underline transition-all">Clear Cart</button>
                    </div>

                    <div className="card overflow-hidden">
                        {items.map((item) => (
                            <div key={item.foodId} className="p-4 border-b last:border-0 border-borderColor flex items-center justify-between hover:bg-darkBg transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-16 h-16 bg-darkBg rounded-lg flex-shrink-0 overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-textMuted">Image</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-textPrimary">{item.name}</h3>
                                        <p className="text-primary font-bold">${item.price.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center border border-borderColor rounded-lg bg-darkBg">
                                        <button
                                            onClick={() => updateQuantity(item.foodId, item.quantity - 1)}
                                            className="p-2 hover:text-primary transition-colors text-textMuted flex items-center justify-center"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-semibold text-textPrimary">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.foodId, item.quantity + 1)}
                                            className="p-2 hover:text-success transition-colors text-textMuted flex items-center justify-center"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.foodId)}
                                        className="text-textMuted hover:text-error transition-colors p-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <div className="w-20 text-right font-bold text-lg">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-96">
                    <div className="card p-6 sticky top-24">
                        <h3 className="text-xl font-bold mb-6 text-textPrimary">Order Summary</h3>

                        <div className="space-y-4 mb-6 text-sm text-textMuted">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-textPrimary">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className="text-textPrimary">${deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Taxes & Fees</span>
                                <span className="text-textPrimary">${taxes.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-borderColor pt-4 mt-2 flex justify-between font-bold text-lg text-textPrimary">
                                <span>Total</span>
                                <span className="text-primary">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full py-4 text-lg"
                            onClick={() => router.push('/checkout')}
                        >
                            Proceed to Checkout <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

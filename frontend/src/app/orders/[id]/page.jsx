"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ChevronLeft, MapPin, Receipt, Clock, Phone, AlertCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [order, setOrder] = useState < any > (null);
    const [loading, setLoading] = useState(true);

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/customer/orders/${params.id}`);
                setOrder(res.data.data);
            } catch (error) {
                toast.error('Failed to load order');
                router.push('/orders');
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchOrder();

        // Auto refresh interval for active orders
        const interval = setInterval(() => {
            if (order?.status && !['completed', 'cancelled'].includes(order.status)) {
                api.get(`/customer/orders/${params.id}`).then(res => setOrder(res.data.data)).catch(() => { });
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [params.id, router, order?.status, isAuthenticated]);

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        try {
            const res = await api.put(`/customer/orders/${order._id}/cancel`, { reason: 'Customer requested cancellation' });
            setOrder(res.data.data);
            toast.success('Order cancelled successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) return toast.error('Please select a rating');
        setIsSubmittingReview(true);
        try {
            await api.post('/customer/reviews', {
                orderId: order._id,
                restaurantId: order.restaurantId?._id,
                rating: rating,
                comment: reviewText
            });
            toast.success('Review submitted successfully!');
            setHasReviewed(true);
        } catch (error) {
            const msg = error.response?.data?.message || '';
            if (msg.includes('duplicate key') || msg.includes('E11000') || error.response?.status === 500) {
                toast.error('You have already submitted a review for this restaurant!');
                setHasReviewed(true);
            } else {
                toast.error(msg || 'Failed to submit review');
            }
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
    if (!order) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-gray-500 text-white';
            case 'confirmed': return 'bg-blue-500 text-white';
            case 'preparing': return 'bg-secondary text-white border-secondary animate-pulse';
            case 'ready': return 'bg-green-400 text-white';
            case 'completed': return 'bg-success text-white';
            case 'cancelled': return 'bg-error text-white';
            default: return 'bg-darkBg text-textPrimary';
        }
    };

    // Stepper logic
    const steps = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    const currentStepIndex = steps.indexOf(order.status);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <button
                onClick={() => router.push('/orders')}
                className="flex items-center text-primary mb-6 hover:underline"
            >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back to Orders
            </button>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    {/* Tracking Status Card */}
                    <div className="card p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold text-textPrimary">Order #{order.orderNumber}</h1>
                            <div className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                {order.status}
                            </div>
                        </div>

                        {order.status !== 'cancelled' && (
                            <div className="relative pt-8 pb-4">
                                <div className="absolute top-10 left-0 w-full h-1 bg-darkBg rounded">
                                    <div
                                        className="h-full bg-primary rounded transition-all duration-1000"
                                        style={{ width: `${Math.max(0, (currentStepIndex / (steps.length - 1)) * 100)}%` }}
                                    />
                                </div>
                                <div className="relative flex justify-between z-10 text-xs font-semibold text-textMuted uppercase mt-2">
                                    <span className={currentStepIndex >= 0 ? "text-primary" : ""}>Placed</span>
                                    <span className={currentStepIndex >= 1 ? "text-primary" : ""}>Confirmed</span>
                                    <span className={currentStepIndex >= 2 ? "text-primary bg-darkBg px-1" : ""}>Preparing</span>
                                    <span className={currentStepIndex >= 3 ? "text-primary bg-darkBg px-1" : ""}>On the way</span>
                                    <span className={currentStepIndex >= 4 ? "text-primary bg-darkBg px-1 text-right" : "text-right"}>Delivered</span>
                                </div>
                            </div>
                        )}

                        {order.status === 'cancelled' && (
                            <div className="bg-error/10 border border-error/50 p-4 rounded-lg flex items-start mt-4">
                                <AlertCircle className="w-5 h-5 text-error mr-3 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-error font-semibold">Order Cancelled</h4>
                                    <p className="text-sm text-textMuted mt-1">Reason: {order.cancellationReason || 'Not specified'}</p>
                                </div>
                            </div>
                        )}

                        {(order.status === 'pending' || order.status === 'confirmed') && (
                            <div className="mt-8 flex justify-end">
                                <Button variant="danger" onClick={handleCancel}>Cancel Order</Button>
                            </div>
                        )}
                    </div>

                    {/* Delivery Details */}
                    <div className="card p-6">
                        <h2 className="text-xl font-bold mb-4 text-textPrimary flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-primary" /> Delivery Details
                        </h2>
                        <div className="bg-darkBg rounded-lg p-4">
                            <p className="font-semibold text-textPrimary mb-1">{order.deliveryAddress.street}</p>
                            <p className="text-sm text-textMuted mb-2">{order.deliveryAddress.city}, {order.deliveryAddress.zipCode}</p>
                            {order.deliveryAddress.instructions && (
                                <div className="mt-4 pt-4 border-t border-borderColor">
                                    <p className="text-xs uppercase tracking-wider text-textMuted mb-1 font-semibold">Instructions</p>
                                    <p className="text-sm text-textPrimary">{order.deliveryAddress.instructions}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Review Section */}
                    {order.status === 'completed' && !hasReviewed && (
                        <div className="card p-6 border-t-4 border-t-secondary">
                            <h2 className="text-xl font-bold mb-4 text-textPrimary flex items-center">
                                <Star className="w-5 h-5 mr-2 text-secondary fill-secondary" /> Rate Your Experience
                            </h2>
                            <div className="bg-darkBg rounded-lg p-6 flex flex-col items-center">
                                <p className="mb-4 text-textPrimary font-medium text-center">How was the food from {order.restaurantId?.name}?</p>
                                <div className="flex gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star className={`w-10 h-10 ${star <= (hoverRating || rating) ? 'text-secondary fill-secondary' : 'text-textMuted'}`} />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    className="input-field min-h-[100px] w-full mb-4"
                                    placeholder="Write a review... (optional)"
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                />
                                <Button
                                    className="w-full sm:w-auto px-8"
                                    onClick={handleSubmitReview}
                                    disabled={rating === 0 || isSubmittingReview}
                                    isLoading={isSubmittingReview}
                                >
                                    Submit Review
                                </Button>
                            </div>
                        </div>
                    )}

                    {order.status === 'completed' && hasReviewed && (
                        <div className="card p-6 bg-secondary/10 border border-secondary text-center text-secondary font-semibold">
                            Thank you! Your feedback for {order.restaurantId?.name} has been submitted.
                        </div>
                    )}
                </div>

                {/* Receipt Panel */}
                <div className="md:w-96">
                    <div className="card p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 text-textPrimary flex items-center border-b border-borderColor pb-4">
                            <Receipt className="w-5 h-5 mr-2 text-primary" /> Order Receipt
                        </h2>

                        <div className="mb-4">
                            <h3 className="font-semibold text-textPrimary">{order.restaurantId?.name}</h3>
                            <p className="text-sm text-textMuted flex items-center mt-1">
                                <Phone className="w-3 h-3 mr-1" /> {order.restaurantId?.phone}
                            </p>
                        </div>

                        <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-textPrimary"><span className="text-primary font-bold">{item.quantity}x</span> {item.name}</span>
                                    <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 pt-4 border-t border-dashed border-borderColor text-sm">
                            <div className="flex justify-between text-textMuted">
                                <span>Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-textMuted">
                                <span>Delivery Fee</span>
                                <span>${order.deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-textMuted">
                                <span>Taxes & Fees</span>
                                <span>${(order.totalAmount - order.subtotal - order.deliveryFee).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-textPrimary pt-4 border-t border-borderColor">
                                <span>Total</span>
                                <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="mt-2 text-xs text-center text-textMuted uppercase tracking-wider bg-darkBg py-2 rounded">
                                Paid via {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

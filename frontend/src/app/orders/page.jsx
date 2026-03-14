"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Clock, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function OrdersPage() {
    const { isAuthenticated } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ratingOrder, setRatingOrder] = useState(null);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            window.location.href = '/login';
            return;
        }
        const fetchOrders = async () => {
            try {
                const res = await api.get('/customer/orders/my');
                setOrders(res.data.data || []);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [isAuthenticated]);

    const submitReview = async (orderId, restaurantId) => {
        try {
            await api.post('/customer/reviews', {
                orderId,
                restaurantId,
                rating,
                comment: review
            });
            toast.success('Review submitted!');
            setRatingOrder(null);
            setRating(5);
            setReview('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8 text-textPrimary">Your Orders</h1>

            {orders.length === 0 ? (
                <div className="card p-12 text-center flex flex-col items-center">
                    <Search className="w-16 h-16 text-textMuted mb-4" />
                    <h2 className="text-xl font-semibold mb-2 text-textPrimary">No orders found</h2>
                    <p className="text-textMuted mb-6">You haven't placed any orders yet.</p>
                    <Link href="/">
                        <Button>Explore Restaurants</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order._id} className="card p-6 flex flex-col gap-4 hover:border-primary transition-colors">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden relative bg-darkBg">
                                    <img
                                        src={order.restaurantId?.image || 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070'}
                                        alt={order.restaurantId?.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="text-xl font-bold text-textPrimary">{order.restaurantId?.name || 'Restaurant'}</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${order.status === 'completed' ? 'bg-success/20 text-success' :
                                                    order.status === 'cancelled' ? 'bg-error/20 text-error' :
                                                        'bg-secondary/20 text-secondary'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-textMuted text-sm mb-4 line-clamp-1">
                                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-textMuted mt-auto">
                                        <span className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1 text-primary" />
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="font-semibold text-textPrimary">
                                            Total: <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                                        </span>
                                        <div className="ml-auto flex gap-3">
                                            <Link href={`/orders/${order._id}`}>
                                                <Button variant={['completed', 'cancelled'].includes(order.status) ? "outline" : "primary"} className="text-xs py-1.5 h-auto">
                                                    {['completed', 'cancelled'].includes(order.status) ? 'View Receipt' : 'Track Order'}
                                                </Button>
                                            </Link>
                                            {order.status === 'completed' && (
                                                <>
                                                    <Button className="text-xs py-1.5 h-auto" variant="outline" onClick={() => setRatingOrder(ratingOrder === order._id ? null : order._id)}>
                                                        <Star className="w-3 h-3 mr-1" /> Rate
                                                    </Button>
                                                    <Link href={`/restaurant/${order.restaurantId?._id}`}>
                                                        <Button className="text-xs py-1.5 h-auto">Reorder</Button>
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Review Form */}
                            {ratingOrder === order._id && (
                                <div className="border-t border-borderColor pt-4 mt-2">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-medium text-textMuted">Rating:</span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                                            >
                                                <Star className="w-5 h-5 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-3">
                                        <textarea
                                            className="input-field flex-1 min-h-[60px]"
                                            placeholder="Write your review..."
                                            value={review}
                                            onChange={(e) => setReview(e.target.value)}
                                        />
                                        <Button className="h-auto" onClick={() => submitReview(order._id, order.restaurantId?._id)}>
                                            Submit
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

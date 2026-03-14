"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Clock, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function RestaurantOrdersPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');

    if (!isAuthenticated || user?.role !== 'restaurant_owner') {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return null;
    }

    const fetchOrders = async () => {
        try {
            const res = await api.get('/restaurant/orders');
            setOrders(res.data.data);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000); // Polling for new orders every 15s
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await api.put(`/restaurant/orders/${orderId}/status`, { status });
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    const activeOrders = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
    const pastOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

    const displayOrders = activeTab === 'active' ? activeOrders : pastOrders;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-textPrimary">Order Management</h1>
                <div className="flex bg-darkBg border border-borderColor rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'active' ? 'bg-primary text-white' : 'text-textMuted hover:text-textPrimary'}`}
                    >
                        Active Orders ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${activeTab === 'past' ? 'bg-cardBg text-white border border-borderColor shadow-sm' : 'text-textMuted hover:text-textPrimary'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            {displayOrders.length === 0 ? (
                <div className="card p-12 text-center flex flex-col items-center">
                    <Search className="w-16 h-16 text-textMuted mb-4" />
                    <h2 className="text-xl font-semibold mb-2 text-textPrimary">No {activeTab} orders</h2>
                    <p className="text-textMuted text-sm">Waiting for new orders to come in...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayOrders.map(order => (
                        <div key={order._id} className="card p-6 flex flex-col h-full border-t-4" style={{
                            borderTopColor:
                                order.status === 'pending' ? '#fbd334' :
                                    order.status === 'confirmed' ? '#2196F3' :
                                        order.status === 'preparing' ? '#fbd334' :
                                            order.status === 'ready' ? '#4CAF50' :
                                                order.status === 'completed' ? '#4CAF50' : '#FF3333'
                        }}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-textPrimary">#{order.orderNumber}</h3>
                                    <p className="text-xs text-textMuted flex items-center mt-1">
                                        <Clock className="w-3 h-3 mr-1" /> {new Date(order.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${order.status === 'completed' || order.status === 'ready' ? 'bg-success/20 text-success' :
                                    order.status === 'cancelled' ? 'bg-error/20 text-error' :
                                        'bg-secondary/20 text-secondary'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="bg-darkBg p-4 rounded-lg mb-4 flex-grow">
                                <div className="max-h-40 overflow-y-auto space-y-2 mb-4 pr-1">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-textPrimary font-medium line-clamp-1"><span className="text-primary font-bold mr-1">{item.quantity}x</span>{item.name}</span>
                                            <span className="text-textMuted shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-borderColor pt-3">
                                    <div className="flex justify-between font-bold">
                                        <span>Total Amount</span>
                                        <span className="text-primary">${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <div className="text-sm border-t border-borderColor pt-4 mb-4">
                                    <p className="text-textMuted mb-1"><span className="font-semibold text-textPrimary">Customer:</span> {order.userId?.name || 'Guest'}</p>
                                    <p className="text-textMuted line-clamp-2"><span className="font-semibold text-textPrimary">Address:</span> {order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
                                    {order.deliveryAddress.instructions && (
                                        <p className="text-error mt-2 font-medium bg-error/10 p-2 rounded text-xs">{order.deliveryAddress.instructions}</p>
                                    )}
                                </div>

                                {/* Action Buttons based on status */}
                                {activeTab === 'active' && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-borderColor">
                                        {order.status === 'pending' && (
                                            <>
                                                <Button className="flex-1" onClick={() => handleUpdateStatus(order._id, 'confirmed')}>Accept Order</Button>
                                                <Button variant="danger" onClick={() => handleUpdateStatus(order._id, 'cancelled')}>Reject</Button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <Button className="w-full" onClick={() => handleUpdateStatus(order._id, 'preparing')}>Start Preparing</Button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <Button className="w-full" onClick={() => handleUpdateStatus(order._id, 'ready')}>Mark as Ready</Button>
                                        )}
                                        {order.status === 'ready' && (
                                            <Button className="w-full" onClick={() => handleUpdateStatus(order._id, 'completed')}>Dispatch & Complete</Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

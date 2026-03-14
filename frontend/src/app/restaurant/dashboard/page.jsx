"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Store, ShoppingBag, Clock, Star, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function RestaurantDashboard() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    if (!isAuthenticated || user?.role !== 'restaurant_owner') {
        if (typeof window !== 'undefined') router.push('/login');
        return null;
    }

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [profileRes, ordersRes] = await Promise.all([
                    api.get('/restaurant/profile').catch(() => ({ data: { data: null } })),
                    api.get('/restaurant/orders').catch(() => ({ data: { data: [] } }))
                ]);

                setProfile(profileRes.data.data);
                setOrders(ordersRes.data.data);
            } catch (error) {
                console.error('Failed to load dashboard', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    if (!profile) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <Store className="w-16 h-16 text-primary mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-4">Welcome, Partner!</h1>
                <p className="text-textMuted mb-8">Let's set up your restaurant profile to start receiving orders.</p>
                <Button onClick={() => router.push('/restaurant/profile')}>Set Up Profile</Button>
            </div>
        );
    }

    const activeOrdersCount = orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;
    const todayRevenue = orders
        .filter(o => o.status === 'completed' && new Date(o.createdAt).toDateString() === new Date().toDateString())
        .reduce((total, o) => total + o.totalAmount, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-end mb-8 border-b border-borderColor pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary mb-1">Dashboard</h1>
                    <p className="text-textMuted">Welcome back, {profile.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center text-sm font-semibold bg-darkBg px-4 py-2 rounded-lg border border-borderColor">
                        <span className={`w-3 h-3 rounded-full mr-2 ${profile.isCurrentlyOpen ? 'bg-success' : 'bg-error'}`} />
                        {profile.isCurrentlyOpen ? 'Accepting Orders' : 'Currently Closed'}
                    </div>
                    <Button onClick={() => router.push('/restaurant/profile')} variant="outline">Edit Profile</Button>
                </div>
            </div>

            {profile.licenseStatus === 'pending' && (
                <div className="bg-secondary/10 border border-secondary p-4 rounded-xl flex items-start mb-8">
                    <AlertTriangle className="w-6 h-6 text-secondary mr-3 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-secondary">Account under review</h3>
                        <p className="text-sm text-textMuted mt-1">Your restaurant license is currently pending admin approval. You cannot receive public orders yet.</p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6 border-l-4 border-l-primary hover:border-l-secondary transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-textMuted font-medium tracking-wider mb-1">ACTIVE ORDERS</p>
                            <h3 className="text-3xl font-bold text-textPrimary">{activeOrdersCount}</h3>
                        </div>
                        <div className="p-3 bg-primary/20 text-primary rounded-lg">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-l-success hover:border-l-primary transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-textMuted font-medium tracking-wider mb-1">TODAY'S REVENUE</p>
                            <h3 className="text-3xl font-bold text-textPrimary">${todayRevenue.toFixed(2)}</h3>
                        </div>
                        <div className="p-3 bg-success/20 text-success rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-l-secondary hover:border-l-primary transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-textMuted font-medium tracking-wider mb-1">TOTAL ORDERS</p>
                            <h3 className="text-3xl font-bold text-textPrimary">{orders.length}</h3>
                        </div>
                        <div className="p-3 bg-secondary/20 text-secondary rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="card p-6 border-l-4 border-l-info hover:border-l-primary transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-textMuted font-medium tracking-wider mb-1">RATING</p>
                            <h3 className="text-3xl font-bold text-textPrimary">{profile.rating.toFixed(1)} <span className="text-sm text-textMuted">/ 5.0</span></h3>
                        </div>
                        <div className="p-3 bg-info/20 text-info rounded-lg">
                            <Star className="w-6 h-6 fill-current" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Recent Orders</h2>
                        <Button variant="outline" className="text-sm py-1" onClick={() => router.push('/restaurant/orders')}>View All</Button>
                    </div>

                    <div className="space-y-4">
                        {orders.slice(0, 5).map(order => (
                            <div key={order._id} className="flex items-center justify-between p-4 border border-borderColor rounded-lg hover:bg-darkBg transition-colors border-l-4 border-l-transparent hover:border-l-primary">
                                <div>
                                    <h4 className="font-bold text-textPrimary">#{order.orderNumber}</h4>
                                    <p className="text-sm text-textMuted flex items-center mt-1">
                                        <Clock className="w-3 h-3 mr-1" /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${order.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${order.status === 'completed' ? 'bg-success/20 text-success' :
                                        order.status === 'cancelled' ? 'bg-error/20 text-error' :
                                            'bg-secondary/20 text-secondary'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p className="text-textMuted text-center py-4">No recent orders.</p>}
                    </div>
                </div>

                <div className="card p-6 flex flex-col justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-6">Quick Links</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={() => router.push('/restaurant/menu')} variant="outline" className="flex flex-col items-center justify-center h-24 gap-2 border-dashed hover:border-solid">
                                <Store className="w-6 h-6 text-primary" />
                                <span>Menu</span>
                            </Button>
                            <Button onClick={() => router.push('/restaurant/orders')} variant="outline" className="flex flex-col items-center justify-center h-24 gap-2 border-dashed hover:border-solid">
                                <ShoppingBag className="w-6 h-6 text-primary" />
                                <span>Orders</span>
                            </Button>
                            <Button onClick={() => router.push('/restaurant/profile')} variant="outline" className="flex flex-col items-center justify-center h-24 gap-2 border-dashed hover:border-solid">
                                <TrendingUp className="w-6 h-6 text-primary" />
                                <span>Analytics</span>
                            </Button>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-borderColor text-center">
                        <p className="text-sm text-textMuted">Need help? <a href="/support" className="text-primary hover:underline">Contact Support</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Shield, Users, Store, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminDashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [adminReplies, setAdminReplies] = useState({});

    const fetchAdminData = async () => {
        try {
            const [statsRes, restRes, compRes] = await Promise.all([
                api.get('/admin/stats').catch(() => ({ data: { data: { customers: 0, restaurants: 0, pendingLicenses: 0, activeComplaints: 0 } } })),
                api.get('/admin/restaurants').catch(() => ({ data: { data: [] } })),
                api.get('/admin/complaints').catch(() => ({ data: { data: [] } }))
            ]);
            setStats(statsRes.data.data);
            setRestaurants(restRes.data.data);
            setComplaints(compRes.data.data);
        } catch (error) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            router.push('/admin');
            return;
        }
        fetchAdminData();
        const interval = setInterval(fetchAdminData, 10000);
        return () => clearInterval(interval);
    }, [isAuthenticated, user, router]);

    const handleLicenseAction = async (id, action) => {
        try {
            await api.put(`/admin/restaurants/${id}/status`, { status: action });
            toast.success(`Restaurant ${action} successfully`);
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.message || `Failed to ${action} restaurant`);
        }
    };

    const handleComplaintReply = async (complaintId) => {
        const text = adminReplies[complaintId];
        if (!text || text.trim() === '') return toast.error('Reply cannot be empty');

        try {
            await api.put(`/admin/complaints/${complaintId}/respond`, {
                response: text,
                status: 'resolved'
            });
            toast.success('Complaint resolved successfully');
            fetchAdminData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update complaint');
        }
    };

    if (!isAuthenticated || user?.role !== 'admin') {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-borderColor border-t-4 border-t-primary pt-6 px-6 bg-cardBg rounded-xl shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold text-textPrimary flex items-center">
                        <Shield className="w-8 h-8 text-primary mr-3" /> System Control Panel
                    </h1>
                    <p className="text-textMuted mt-1">Global administrative overview</p>
                </div>
            </div>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                <Button
                    variant={activeTab === 'overview' ? 'primary' : 'outline'}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview Status
                </Button>
                <Button
                    variant={activeTab === 'restaurants' ? 'primary' : 'outline'}
                    onClick={() => setActiveTab('restaurants')}
                >
                    Licensing & Restaurants
                    {stats?.pendingLicenses > 0 && <span className="ml-2 bg-error text-white px-2 py-0.5 rounded-full text-xs">{stats.pendingLicenses}</span>}
                </Button>
                <Button
                    variant={activeTab === 'complaints' ? 'primary' : 'outline'}
                    onClick={() => setActiveTab('complaints')}
                >
                    Global Complaints
                    {stats?.openComplaints > 0 && <span className="ml-2 bg-error text-white px-2 py-0.5 rounded-full text-xs">{stats.openComplaints}</span>}
                </Button>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="card p-6 flex items-center gap-4 border-l-4 border-l-blue-500">
                        <div className="p-4 bg-blue-500/20 text-blue-500 rounded-lg">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-textMuted text-sm font-bold uppercase tracking-wider">Total Users</p>
                            <h3 className="text-3xl font-bold text-textPrimary">{stats?.customers || 0}</h3>
                        </div>
                    </div>
                    <div className="card p-6 flex items-center gap-4 border-l-4 border-l-success">
                        <div className="p-4 bg-success/20 text-success rounded-lg">
                            <Store className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-textMuted text-sm font-bold uppercase tracking-wider">Restaurants</p>
                            <h3 className="text-3xl font-bold text-textPrimary">{stats?.restaurants || 0}</h3>
                        </div>
                    </div>
                    <div className="card p-6 flex items-center gap-4 border-l-4 border-l-secondary">
                        <div className="p-4 bg-secondary/20 text-secondary rounded-lg">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-textMuted text-sm font-bold uppercase tracking-wider">Pending Approvals</p>
                            <h3 className="text-3xl font-bold text-textPrimary">{stats?.pendingLicenses || 0}</h3>
                        </div>
                    </div>
                    <div className="card p-6 flex items-center gap-4 border-l-4 border-l-error">
                        <div className="p-4 bg-error/20 text-error rounded-lg">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-textMuted text-sm font-bold uppercase tracking-wider">Open Complaints</p>
                            <h3 className="text-3xl font-bold text-textPrimary">{stats?.openComplaints || 0}</h3>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'restaurants' && (
                <div className="card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-darkBg text-textMuted border-b border-borderColor text-sm uppercase tracking-wider">
                            <tr>
                                <th className="p-4 font-semibold">Restaurant</th>
                                <th className="p-4 font-semibold">Owner</th>
                                <th className="p-4 font-semibold">License #</th>
                                <th className="p-4 font-semibold">Joined At</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-borderColor">
                            {restaurants.map(rest => (
                                <tr key={rest._id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4">
                                        <p className="font-bold text-slate-50 group-hover:text-yellow-400 transition-colors">{rest.name}</p>
                                        <p className="text-xs text-slate-400">{rest.phone} • {rest.address?.city}</p>
                                    </td>
                                    <td className="p-4 text-sm">{rest.ownerId?.name || 'Unknown'}</td>
                                    <td className="p-4 text-sm font-mono text-yellow-500/80">{rest.licenseNumber}</td>
                                    <td className="p-4 text-sm text-slate-500">{new Date(rest.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-wider ${rest.licenseStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                            rest.licenseStatus === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                                                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)] animate-pulse'
                                            }`}>
                                            {rest.licenseStatus}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {rest.licenseStatus === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <Button className="text-xs py-1.5 h-auto" onClick={() => handleLicenseAction(rest._id, 'approved')}>Approve</Button>
                                                <Button variant="danger" className="text-xs py-1.5 h-auto" onClick={() => handleLicenseAction(rest._id, 'rejected')}>Reject</Button>
                                            </div>
                                        )}
                                        {rest.licenseStatus === 'rejected' && (
                                            <Button className="text-xs py-1.5 h-auto" onClick={() => handleLicenseAction(rest._id, 'approved')}>Approve Now</Button>
                                        )}
                                        {rest.licenseStatus === 'approved' && (
                                            <Button variant="danger" className="text-xs py-1.5 h-auto bg-darkBg text-textMuted hover:bg-error hover:text-white" onClick={() => handleLicenseAction(rest._id, 'rejected')}>Revoke</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {restaurants.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-textMuted text-sm">No restaurants found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'complaints' && (
                <div className="space-y-6">
                    {complaints.map(complaint => (
                        <div key={complaint._id} className="card p-6 border-l-4" style={{
                            borderLeftColor: complaint.status === 'resolved' ? '#4CAF50' : '#FF3333'
                        }}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-textPrimary flex items-center gap-2">
                                        Complaint #{complaint.complaintNumber}
                                        <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${complaint.status === 'resolved' ? 'bg-success/20 text-success' :
                                            complaint.status === 'in_progress' ? 'bg-secondary/20 text-secondary' :
                                                'bg-error/20 text-error'
                                            }`}>
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-textMuted mt-1 w-full flex items-center justify-between">
                                        <span>
                                            <strong>Customer:</strong> {complaint.userId?.name} |
                                            <strong> Restaurant:</strong> {complaint.restaurantId?.name} |
                                            <strong> Category:</strong> {complaint.category.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-darkBg p-4 rounded-lg mb-4 text-sm text-textPrimary border-l-4 border-error">
                                <span className="text-xs font-bold text-textMuted uppercase block mb-1">Customer Description:</span>
                                {complaint.description}
                            </div>

                            {complaint.restaurantResponse && (
                                <div className="bg-secondary/10 p-4 rounded-lg text-sm mb-4 border border-secondary/20">
                                    <span className="text-xs font-bold text-secondary uppercase block mb-1">Restaurant Response:</span>
                                    {complaint.restaurantResponse}
                                </div>
                            )}

                            {complaint.adminResponse ? (
                                <div className="bg-primary/10 p-4 rounded-lg text-sm border border-primary/20">
                                    <span className="text-xs font-bold text-primary uppercase block mb-1">Admin Resolution:</span>
                                    {complaint.adminResponse}
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-borderColor">
                                    <label className="block text-sm font-medium text-primary mb-2 uppercase tracking-wider">Step in / Resolve Issue:</label>
                                    <div className="flex gap-4">
                                        <textarea
                                            className="input-field min-h-[80px]"
                                            placeholder="Admin final resolution note..."
                                            value={adminReplies[complaint._id] || ''}
                                            onChange={(e) => setAdminReplies({ ...adminReplies, [complaint._id]: e.target.value })}
                                        />
                                        <Button
                                            className="whitespace-nowrap h-auto"
                                            onClick={() => handleComplaintReply(complaint._id)}
                                        >
                                            Resolve Issue
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {complaints.length === 0 && (
                        <div className="card p-12 text-center text-textMuted border-dashed">
                            No active complaints. System is running smoothly.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

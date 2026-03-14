"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

export default function RestaurantSupportPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState({});

    if (!isAuthenticated || user?.role !== 'restaurant_owner') {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return null;
    }

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/restaurant/complaints');
            setComplaints(res.data.data);
        } catch (error) {
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const handleReply = async (complaintId) => {
        const text = replyText[complaintId];
        if (!text || text.trim() === '') return toast.error('Reply cannot be empty');

        try {
            await api.put(`/restaurant/complaints/${complaintId}/reply`, { response: text });
            toast.success('Reply submitted');
            fetchComplaints();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit reply');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8 text-textPrimary">Customer Complaints</h1>

            {complaints.length === 0 ? (
                <div className="card p-12 text-center text-textMuted border-dashed">
                    No complaints received. Great job!
                </div>
            ) : (
                <div className="space-y-6">
                    {complaints.map(complaint => (
                        <div key={complaint._id} className="card p-6">
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
                                    <p className="text-sm text-textMuted mt-1">
                                        Customer: {complaint.userId?.name} | Category: {complaint.category.replace('_', ' ')}
                                    </p>
                                </div>
                                <span className="text-xs text-textMuted">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="bg-darkBg p-4 rounded-lg mb-4 text-sm text-textPrimary border-l-4 border-error">
                                {complaint.description}
                            </div>

                            {complaint.restaurantResponse ? (
                                <div className="mt-4 pt-4 border-t border-borderColor">
                                    <span className="text-xs font-bold text-secondary uppercase block mb-2">Your Response:</span>
                                    <div className="bg-secondary/10 p-4 rounded-lg text-sm">
                                        {complaint.restaurantResponse}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-borderColor">
                                    <label className="block text-sm font-medium text-textMuted mb-2">Write a response to the customer:</label>
                                    <div className="flex gap-4">
                                        <textarea
                                            className="input-field min-h-[80px]"
                                            placeholder="We apologize for the inconvenience..."
                                            value={replyText[complaint._id] || ''}
                                            onChange={(e) => setReplyText({ ...replyText, [complaint._id]: e.target.value })}
                                        />
                                        <Button
                                            className="whitespace-nowrap h-auto"
                                            onClick={() => handleReply(complaint._id)}
                                        >
                                            Submit Reply
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

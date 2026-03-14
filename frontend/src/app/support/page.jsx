"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SupportPage() {
    const { isAuthenticated } = useAuthStore();
    const [complaints, setComplaints] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, reset } = useForm();

    if (!isAuthenticated && typeof window !== 'undefined') {
        window.location.href = '/login';
        return null;
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [complaintsRes, restaurantsRes] = await Promise.all([
                    api.get('/customer/complaints'),
                    api.get('/customer/restaurants')
                ]);
                setComplaints(complaintsRes.data.data);
                setRestaurants(restaurantsRes.data.data);
            } catch (error) {
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await api.post('/customer/complaints', data);
            setComplaints([res.data.data, ...complaints]);
            toast.success('Complaint submitted successfully');
            reset();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8 text-textPrimary">Help & Support</h1>

            <div className="flex flex-col lg:flex-row gap-8">

                <div className="lg:w-1/3">
                    <div className="card p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 text-textPrimary">File a Complaint</h2>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-1">Select Restaurant</label>
                                <select className="input-field" {...register('restaurantId', { required: true })}>
                                    <option value="">Select a restaurant...</option>
                                    {restaurants.map(r => (
                                        <option key={r._id} value={r._id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-1">Category</label>
                                <select className="input-field" {...register('category', { required: true })}>
                                    <option value="food_quality">Food Quality</option>
                                    <option value="delivery_issue">Delivery Issue</option>
                                    <option value="wrong_item">Wrong Item</option>
                                    <option value="missing_item">Missing Item</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-textMuted mb-1">Description</label>
                                <textarea
                                    className="input-field min-h-[120px] resize-none"
                                    placeholder="Please describe your issue in detail..."
                                    {...register('description', { required: true })}
                                />
                            </div>

                            <Button type="submit" className="w-full" isLoading={isSubmitting}>
                                Submit Complaint
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="lg:w-2/3">
                    <h2 className="text-2xl font-bold mb-6 text-textPrimary">Your Complaints Status</h2>

                    {complaints.length === 0 ? (
                        <div className="card p-8 border border-dashed border-borderColor text-center text-textMuted">
                            You haven't filed any complaints yet.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {complaints.map(complaint => (
                                <div key={complaint._id} className="card p-6 border-l-4" style={{
                                    borderLeftColor:
                                        complaint.status === 'resolved' ? '#4CAF50' :
                                            complaint.status === 'in_progress' ? '#fbd334' : '#FF3333'
                                }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-textPrimary">
                                                Complaint #{complaint.complaintNumber}
                                            </h3>
                                            <p className="text-sm text-textMuted">Filed on: {new Date(complaint.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full
                      ${complaint.status === 'resolved' ? 'bg-success/20 text-success' :
                                                complaint.status === 'in_progress' ? 'bg-secondary/20 text-secondary' :
                                                    'bg-error/20 text-error'}`}>
                                            {complaint.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="bg-darkBg p-4 rounded-lg mb-4">
                                        <span className="text-xs uppercase font-bold text-textMuted tracking-wider mb-2 block text-primary">Issue: {complaint.category.replace('_', ' ')}</span>
                                        <p className="text-sm text-textPrimary">{complaint.description}</p>
                                    </div>

                                    {(complaint.adminResponse || complaint.restaurantResponse) && (
                                        <div className="mt-4 pt-4 border-t border-borderColor space-y-3">
                                            {complaint.restaurantResponse && (
                                                <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-md">
                                                    <span className="text-xs font-bold text-secondary uppercase block mb-1">Restaurant Response</span>
                                                    <p className="text-sm">{complaint.restaurantResponse}</p>
                                                </div>
                                            )}
                                            {complaint.adminResponse && (
                                                <div className="bg-primary/10 border border-primary/20 p-3 rounded-md">
                                                    <span className="text-xs font-bold text-primary uppercase block mb-1">Admin Response</span>
                                                    <p className="text-sm">{complaint.adminResponse}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

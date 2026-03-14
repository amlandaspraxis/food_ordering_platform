"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function MenuManagementPage() {
    const { user, isAuthenticated } = useAuthStore();
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm();

    const fetchMenu = async () => {
        try {
            const res = await api.get('/restaurant/menu');
            setMenu(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'restaurant_owner') {
            window.location.href = '/login';
            return;
        }
        fetchMenu();
    }, []);

    const openAddModal = () => {
        setEditingItem(null);
        reset({
            name: '',
            description: '',
            price: '',
            category: '',
            image: '',
            isVegetarian: true,
            preparationTime: 15
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        reset({
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            image: item.image,
            isVegetarian: item.isVegetarian,
            preparationTime: item.preparationTime
        });
        setIsModalOpen(true);
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const payload = {
                ...data,
                price: parseFloat(data.price),
                preparationTime: parseInt(data.preparationTime, 10),
                isVegetarian: data.isVegetarian === 'true' || data.isVegetarian === true
            };

            if (editingItem) {
                await api.put(`/restaurant/menu/${editingItem._id}`, payload);
                toast.success('Item updated successfully');
            } else {
                await api.post('/restaurant/menu', payload);
                toast.success('Item added successfully');
            }
            setIsModalOpen(false);
            fetchMenu();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save item');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/restaurant/menu/${id}`);
            toast.success('Item deleted successfully');
            fetchMenu();
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-borderColor">
                <h1 className="text-3xl font-bold text-textPrimary">Menu Management</h1>
                <Button onClick={openAddModal} className="shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5 mr-1" /> Add New Item
                </Button>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-darkBg text-textMuted border-b border-borderColor text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Item</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Price</th>
                                <th className="p-4 font-semibold text-center">Type</th>
                                <th className="p-4 font-semibold text-center">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-borderColor">
                            {menu.map((item) => (
                                <tr key={item._id} className="hover:bg-darkBg/50 transition-colors">
                                    <td className="p-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded bg-darkBg overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="w-full h-full flex items-center justify-center text-xs text-textMuted">No Img</span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-textPrimary">{item.name}</p>
                                            <p className="text-xs text-textMuted line-clamp-1 max-w-[200px]">{item.description}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-textMuted">{item.category}</td>
                                    <td className="p-4 font-bold text-primary">${item.price.toFixed(2)}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.isVegetarian ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                                            {item.isVegetarian ? 'VEG' : 'NON-VEG'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${item.isAvailable ? 'bg-blue-500/20 text-blue-500' : 'bg-textMuted/20 text-textMuted'}`}>
                                            {item.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => openEditModal(item)} className="p-2 text-textMuted hover:text-primary transition-colors">
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="p-2 text-textMuted hover:text-error transition-colors ml-2">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {menu.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-textMuted border-dashed">
                                        Your menu is empty. Start adding delicious items!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Food Item' : 'Add New Food Item'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Item Name"
                        placeholder="Margherita Pizza"
                        {...register('name', { required: true })}
                    />

                    <div>
                        <label className="label-text">Description</label>
                        <textarea
                            className="input-field min-h-[80px]"
                            placeholder="Fresh tomatoes, mozzarella..."
                            {...register('description', { required: true })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Price ($)"
                            type="number"
                            step="0.01"
                            placeholder="12.99"
                            {...register('price', { required: true })}
                        />
                        <Input
                            label="Category"
                            placeholder="Pizza, Starters, etc."
                            {...register('category', { required: true })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Prep Time (mins)"
                            type="number"
                            placeholder="15"
                            {...register('preparationTime', { required: true })}
                        />
                        <div>
                            <label className="label-text">Dietary Type</label>
                            <select className="input-field" {...register('isVegetarian')}>
                                <option value="true">Vegetarian</option>
                                <option value="false">Non-Vegetarian</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Image URL"
                        placeholder="https://..."
                        {...register('image')}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-borderColor mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSubmitting}>{editingItem ? 'Save Changes' : 'Add Item'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

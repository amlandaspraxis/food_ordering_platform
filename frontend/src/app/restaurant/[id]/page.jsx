"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Star, Clock, MapPin, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function RestaurantMenuPage() {
    const params = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCartStore();

    useEffect(() => {
        const fetchData = async () => {
            if (params.id === 'signup') {
                return;
            }
            try {
                const [resRes, menuRes] = await Promise.all([
                    api.get(`/customer/restaurants/${params.id}`),
                    api.get(`/customer/restaurants/${params.id}/menu`)
                ]);
                setRestaurant(resRes.data.data);
                setMenu(menuRes.data.data);
            } catch (error) {
                console.error('Failed to fetch to restaurant data', error);
                setRestaurant(null);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) fetchData();
    }, [params.id]);

    const handleAddToCart = (item) => {
        addItem({
            foodId: item._id,
            name: item.name,
            price: item.discountedPrice || item.price,
            quantity: 1,
            image: item.image
        }, restaurant._id, restaurant.deliveryFee);
        toast.success('Added to cart!');
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
    if (!restaurant) return <div className="min-h-screen text-center pt-20">Restaurant not found.</div>;

    const categories = Array.from(new Set(menu.map(item => item.category)));

    return (
        <div className="min-h-screen pb-20">
            {/* Restaurant Header */}
            <div className="bg-cardBg border-b border-borderColor">
                <div className="h-64 w-full relative">
                    <img
                        src={restaurant.banner || restaurant.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974'}
                        className="w-full h-full object-cover opacity-80"
                        alt={restaurant.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-darkBg to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
                        <h1 className="text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
                        <p className="text-textMuted mb-4">{restaurant.description}</p>
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            <span className="flex items-center text-success font-semibold px-2 py-1 bg-success/20 rounded">
                                <Star className="w-4 h-4 mr-1 fill-current" /> {restaurant.rating.toFixed(1)} ({restaurant.reviewCount} reviews)
                            </span>
                            <span className="flex items-center text-textPrimary">
                                <Clock className="w-4 h-4 mr-1 text-primary" /> {restaurant.deliveryTime} mins delivery
                            </span>
                            <span className="flex items-center text-textPrimary">
                                <MapPin className="w-4 h-4 mr-1 text-primary" /> {restaurant.address.city}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Main Menu Feed */}
                    <div className="flex-1">
                        {categories.map((category) => (
                            <div key={category} className="mb-10">
                                <h2 className="text-2xl font-bold text-textPrimary mb-6 pb-2 border-b border-borderColor">
                                    {category}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {menu.filter(item => item.category === category).map(item => (
                                        <div key={item._id} className="card p-4 flex flex-row hover:border-primary transition-colors">
                                            <div className="flex-1 pr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-3 h-3 rounded-sm border ${item.isVegetarian ? 'border-success bg-success/20' : 'border-error bg-error/20'}`} />
                                                    <h3 className="font-semibold text-lg">{item.name}</h3>
                                                </div>
                                                <p className="text-xl font-bold text-primary mb-2">
                                                    ${(item.discountedPrice || item.price).toFixed(2)}
                                                    {item.discount > 0 && (
                                                        <span className="text-sm line-through text-textMuted ml-2">${item.price.toFixed(2)}</span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-textMuted line-clamp-2">{item.description}</p>
                                            </div>
                                            <div className="relative w-32 h-32 flex-shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <div className="w-full h-full bg-darkBg rounded-lg flex items-center justify-center text-textMuted">
                                                        No image
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-success px-4 py-1.5 rounded-md shadow-md border border-success font-bold text-sm hover:bg-success hover:text-white transition-colors flex items-center shadow-success/20"
                                                >
                                                    ADD <Plus className="w-4 h-4 ml-1" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Spacer for desktop layout (Cart could go here dynamically if wanted) */}
                    <div className="hidden lg:block w-80">
                        {/* Can put a cart summary component or info panel here */}
                        <div className="card p-6 sticky top-24">
                            <h3 className="text-xl font-bold mb-4">Restaurant Info</h3>
                            <p className="text-sm text-textMuted mb-2">
                                <strong>Address:</strong> {restaurant.address.street}, {restaurant.address.city}
                            </p>
                            <p className="text-sm text-textMuted mb-2">
                                <strong>Phone:</strong> {restaurant.phone}
                            </p>
                            <p className="text-sm text-textMuted">
                                <strong>Status:</strong> {restaurant.isCurrentlyOpen ? <span className="text-success font-bold">Open</span> : <span className="text-error font-bold">Closed</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create()(
    persist(
        (set, get) => ({
            items: [],
            restaurantId: null,
            deliveryFee: 0,
            addItem: (item, resId, fee = 0) => {
                set((state) => {
                    if (state.restaurantId && state.restaurantId !== resId) {
                        return { items: [{ ...item, quantity: item.quantity || 1 }], restaurantId: resId, deliveryFee: fee };
                    }
                    const existing = state.items.find((i) => i.foodId === item.foodId);
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.foodId === item.foodId
                                    ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                                    : i
                            ),
                            restaurantId: resId,
                        };
                    }
                    return { items: [...state.items, { ...item, quantity: item.quantity || 1 }], restaurantId: resId };
                });
            },
            removeItem: (foodId) => {
                set((state) => ({ items: state.items.filter((i) => i.foodId !== foodId) }));
            },
            updateQuantity: (foodId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(foodId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) => (i.foodId === foodId ? { ...i, quantity } : i)),
                }));
            },
            clearCart: () => set({ items: [], restaurantId: null }),
            getSubtotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);

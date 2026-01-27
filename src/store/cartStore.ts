import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FoodItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isVeg: boolean;
    isPopular?: boolean;
    isSpecial?: boolean;
}

export interface CartItem extends FoodItem {
    quantity: number;
}

interface CartStore {
    items: CartItem[];
    addItem: (item: FoodItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const items = get().items;
                const existingItem = items.find((i) => i.id === item.id);

                if (existingItem) {
                    set({
                        items: items.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    });
                } else {
                    set({ items: [...items, { ...item, quantity: 1 }] });
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((i) => i.id !== id) });
            },

            updateQuantity: (id, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(id);
                    return;
                }

                set({
                    items: get().items.map((i) =>
                        i.id === id ? { ...i, quantity } : i
                    ),
                });
            },

            clearCart: () => {
                set({ items: [] });
            },

            getTotalPrice: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
        }),
        {
            name: 'tfc-cart-storage',
        }
    )
);

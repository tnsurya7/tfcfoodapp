import { create } from 'zustand';
import { addToCart, updateCartItemQty, removeFromCart, getUserCart, clearUserCart, listenToCart } from '@/lib/firebaseHelpers';
import { generateUserId } from '@/lib/firebaseHelpers';
import toast from '@/lib/toast';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    qty: number;
    addedAt: string;
}

interface FirebaseCartStore {
    items: CartItem[];
    loading: boolean;
    error: string | null;
    userId: string | null;
    
    // Actions
    setUserId: (email: string) => void;
    fetchCart: () => Promise<void>;
    addItem: (foodItem: any) => Promise<boolean>;
    updateQuantity: (foodId: string, qty: number) => Promise<boolean>;
    removeItem: (foodId: string) => Promise<boolean>;
    clearCart: () => Promise<boolean>;
    
    // Getters
    getTotalItems: () => number;
    getTotalPrice: () => number;
    
    // Real-time listener
    startListening: () => () => void;
    stopListening: () => void;
    
    // Internal state management
    setItems: (items: CartItem[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

let unsubscribeCartListener: (() => void) | null = null;

export const useFirebaseCartStore = create<FirebaseCartStore>((set, get) => ({
    items: [],
    loading: false,
    error: null,
    userId: null,
    
    // Set user ID from email
    setUserId: (email) => {
        const userId = generateUserId(email);
        set({ userId });
    },
    
    // Fetch cart from Firebase
    fetchCart: async () => {
        const { userId } = get();
        if (!userId) return;
        
        set({ loading: true, error: null });
        try {
            const result = await getUserCart(userId);
            if (result.success) {
                set({ items: result.cartItems, loading: false });
            } else {
                set({ error: result.error, loading: false });
            }
        } catch (error) {
            set({ error: 'Failed to fetch cart', loading: false });
        }
    },
    
    // Add item to cart
    addItem: async (foodItem) => {
        const { userId, items } = get();
        if (!userId) {
            toast.error('Please login to add items to cart');
            return false;
        }
        
        set({ loading: true, error: null });
        try {
            // Check if item already exists in cart
            const existingItem = items.find(item => item.id === foodItem.id);
            
            if (existingItem) {
                // Update quantity instead of adding new item
                const newQty = existingItem.qty + 1;
                const result = await updateCartItemQty(userId, foodItem.id, newQty);
                if (result.success) {
                    set({ loading: false });
                    toast.success(`${foodItem.name} quantity updated in cart`);
                    return true;
                } else {
                    set({ error: result.error, loading: false });
                    toast.error('Failed to update cart');
                    return false;
                }
            } else {
                // Add new item
                const result = await addToCart(userId, {
                    id: foodItem.id,
                    name: foodItem.name,
                    price: foodItem.price,
                    image: foodItem.image,
                    qty: 1
                });
                
                if (result.success) {
                    set({ loading: false });
                    toast.success(`${foodItem.name} added to cart`);
                    return true;
                } else {
                    set({ error: result.error, loading: false });
                    toast.error('Failed to add item to cart');
                    return false;
                }
            }
        } catch (error) {
            set({ error: 'Failed to add item to cart', loading: false });
            toast.error('Failed to add item to cart');
            return false;
        }
    },
    
    // Update item quantity
    updateQuantity: async (foodId, qty) => {
        const { userId } = get();
        if (!userId) return false;
        
        set({ loading: true, error: null });
        try {
            const result = await updateCartItemQty(userId, foodId, qty);
            if (result.success) {
                set({ loading: false });
                return true;
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to update quantity');
                return false;
            }
        } catch (error) {
            set({ error: 'Failed to update quantity', loading: false });
            toast.error('Failed to update quantity');
            return false;
        }
    },
    
    // Remove item from cart
    removeItem: async (foodId) => {
        const { userId } = get();
        if (!userId) return false;
        
        set({ loading: true, error: null });
        try {
            const result = await removeFromCart(userId, foodId);
            if (result.success) {
                set({ loading: false });
                return true;
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to remove item');
                return false;
            }
        } catch (error) {
            set({ error: 'Failed to remove item', loading: false });
            toast.error('Failed to remove item');
            return false;
        }
    },
    
    // Clear entire cart
    clearCart: async () => {
        const { userId } = get();
        if (!userId) return false;
        
        set({ loading: true, error: null });
        try {
            const result = await clearUserCart(userId);
            if (result.success) {
                set({ loading: false });
                toast.success('Cart cleared');
                return true;
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to clear cart');
                return false;
            }
        } catch (error) {
            set({ error: 'Failed to clear cart', loading: false });
            toast.error('Failed to clear cart');
            return false;
        }
    },
    
    // Get total items count
    getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.qty, 0);
    },
    
    // Get total price
    getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.qty), 0);
    },
    
    // Start real-time listener
    startListening: () => {
        const { userId } = get();
        if (!userId) return () => {};
        
        if (unsubscribeCartListener) {
            unsubscribeCartListener();
        }
        
        unsubscribeCartListener = listenToCart(userId, (cartItems: any) => {
            set({ items: cartItems, error: null });
        });
        
        return () => {
            if (unsubscribeCartListener) {
                unsubscribeCartListener();
                unsubscribeCartListener = null;
            }
        };
    },
    
    // Stop real-time listener
    stopListening: () => {
        if (unsubscribeCartListener) {
            unsubscribeCartListener();
            unsubscribeCartListener = null;
        }
    },
    
    // Internal state setters
    setItems: (items) => set({ items }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
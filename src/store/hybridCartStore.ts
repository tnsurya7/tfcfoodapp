import { create } from 'zustand';
import { hybridStorage } from '@/lib/hybridStorage';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import toast from '@/lib/toast';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    qty: number;
    addedAt?: string;
}

interface HybridCartStore {
    items: CartItem[];
    loading: boolean;
    error: string | null;
    
    // Actions
    loadCart: (email: string) => Promise<void>;
    addItem: (email: string, foodItem: any) => Promise<boolean>;
    updateQuantity: (email: string, foodId: string, qty: number) => Promise<boolean>;
    removeItem: (email: string, foodId: string) => Promise<boolean>;
    clearCart: (email: string) => Promise<boolean>;
    
    // Getters
    getTotalItems: () => number;
    getTotalPrice: () => number;
    
    // Real-time listener
    startListening: (email: string) => () => void;
    stopListening: () => void;
    
    // Internal state management
    setItems: (items: CartItem[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

let unsubscribeListener: (() => void) | null = null;

export const useHybridCartStore = create<HybridCartStore>((set, get) => ({
    items: [],
    loading: false,
    error: null,
    
    // Load cart from hybrid storage
    loadCart: async (email: string) => {
        if (!email) return;
        
        set({ loading: true, error: null });
        try {
            const result = await hybridStorage.getUserCartData(email);
            if (result.success) {
                set({ items: result.cartItems || [], loading: false });
                
                if ((result as any).offline) {
                    console.log('📦 Cart loaded from localStorage (offline)');
                } else {
                    console.log('✅ Cart loaded from Firebase');
                }
            } else {
                set({ error: (result as any).error || 'Failed to load cart', loading: false });
            }
        } catch (error) {
            set({ error: 'Failed to load cart', loading: false });
            console.error('Error loading cart:', error);
        }
    },
    
    // Add item to cart
    addItem: async (email: string, foodItem: any) => {
        if (!email) {
            toast.error('Please login to add items to cart');
            return false;
        }
        
        try {
            const cartItem = {
                id: foodItem.id,
                name: foodItem.name,
                price: foodItem.price,
                image: foodItem.image,
                qty: 1
            };
            
            const result = await hybridStorage.addToUserCart(email, cartItem);
            if (result.success) {
                // Update local state
                const currentItems = get().items;
                const existingIndex = currentItems.findIndex(item => item.id === foodItem.id);
                
                let newItems;
                if (existingIndex >= 0) {
                    newItems = [...currentItems];
                    newItems[existingIndex].qty += 1;
                } else {
                    newItems = [...currentItems, cartItem];
                }
                
                set({ items: newItems });
                
                if ((result as any).offline) {
                    console.log('📦 Item added to cart (offline)');
                } else {
                    console.log('✅ Item added to Firebase cart');
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding to cart:', error);
            return false;
        }
    },
    
    // Update item quantity
    updateQuantity: async (email: string, foodId: string, qty: number) => {
        if (!email) return false;
        
        try {
            const result = await hybridStorage.updateCartQuantity(email, foodId, qty);
            if (result.success) {
                // Update local state
                const currentItems = get().items;
                const newItems = currentItems.map(item => 
                    item.id === foodId ? { ...item, qty } : item
                ).filter(item => item.qty > 0);
                
                set({ items: newItems });
                
                if ((result as any).offline) {
                    console.log('📦 Cart quantity updated (offline)');
                } else {
                    console.log('✅ Cart quantity updated in Firebase');
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating quantity:', error);
            return false;
        }
    },
    
    // Remove item from cart
    removeItem: async (email: string, foodId: string) => {
        if (!email) return false;
        
        try {
            const result = await hybridStorage.removeFromUserCart(email, foodId);
            if (result.success) {
                // Update local state
                const currentItems = get().items;
                const newItems = currentItems.filter(item => item.id !== foodId);
                set({ items: newItems });
                
                if ((result as any).offline) {
                    console.log('📦 Item removed from cart (offline)');
                } else {
                    console.log('✅ Item removed from Firebase cart');
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing from cart:', error);
            return false;
        }
    },
    
    // Clear entire cart
    clearCart: async (email: string) => {
        if (!email) return false;
        
        try {
            const result = await hybridStorage.clearUserCartData(email);
            if (result.success) {
                set({ items: [] });
                
                if ((result as any).offline) {
                    console.log('📦 Cart cleared (offline)');
                } else {
                    console.log('✅ Cart cleared in Firebase');
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    },
    
    // Get total number of items
    getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.qty, 0);
    },
    
    // Get total price
    getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.qty), 0);
    },
    
    // Start real-time listening
    startListening: (email: string) => {
        if (!email) return () => {};
        
        // Stop any existing listener
        if (unsubscribeListener) {
            unsubscribeListener();
        }
        
        unsubscribeListener = hybridStorage.listenToUserCart(email, (cartItems: CartItem[]) => {
            set({ items: cartItems });
        });
        
        return unsubscribeListener;
    },
    
    // Stop listening
    stopListening: () => {
        if (unsubscribeListener) {
            unsubscribeListener();
            unsubscribeListener = null;
        }
    },
    
    // Internal state setters
    setItems: (items: CartItem[]) => set({ items }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
}));
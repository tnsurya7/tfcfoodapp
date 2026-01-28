import { create } from 'zustand';
import { hybridStorage } from '@/lib/hybridStorage';
import toast from '@/lib/toast';

export interface HybridOrder {
    id: string;
    orderId?: string;
    userId: string;
    customer: string;
    phone: string;
    email: string;
    address: string;
    paymentMethod: string;
    items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    total: number;
    status: 'pending' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    offline?: boolean;
}

interface HybridOrderStore {
    orders: HybridOrder[];
    loading: boolean;
    error: string | null;
    
    // Actions
    loadUserOrders: (email: string) => Promise<void>;
    placeOrder: (orderData: any) => Promise<{ success: boolean; orderId?: string }>;
    
    // Getters
    getTotalRevenue: () => number;
    getOrdersByStatus: (status: string) => HybridOrder[];
    getPendingOrdersCount: () => number;
    
    // Real-time listener
    startListening: (email: string) => () => void;
    stopListening: () => void;
    
    // Internal state management
    setOrders: (orders: HybridOrder[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

let unsubscribeListener: (() => void) | null = null;

export const useHybridOrderStore = create<HybridOrderStore>((set, get) => ({
    orders: [],
    loading: false,
    error: null,
    
    // Load user orders from hybrid storage
    loadUserOrders: async (email: string) => {
        if (!email) return;
        
        set({ loading: true, error: null });
        try {
            const result = await hybridStorage.getUserOrdersData(email);
            if (result.success) {
                set({ orders: result.orders || [], loading: false });
                
                if ((result as any).offline) {
                    console.log('📦 Orders loaded from localStorage (offline)');
                } else {
                    console.log('✅ Orders loaded from Firebase');
                }
            } else {
                set({ error: (result as any).error || 'Failed to load orders', loading: false });
            }
        } catch (error) {
            set({ error: 'Failed to load orders', loading: false });
            console.error('Error loading orders:', error);
        }
    },
    
    // Place new order
    placeOrder: async (orderData: any) => {
        try {
            const result = await hybridStorage.placeUserOrder(orderData);
            if (result.success) {
                // Update local state
                const currentOrders = get().orders;
                const newOrders = [result.order, ...currentOrders];
                set({ orders: newOrders });
                
                if ((result as any).offline) {
                    console.log('📦 Order placed (offline)');
                    toast.info('Order saved locally. Will sync when online.');
                } else {
                    console.log('✅ Order placed in Firebase');
                }
                
                return { success: true, orderId: result.order.id };
            }
            return { success: false };
        } catch (error) {
            console.error('Error placing order:', error);
            return { success: false };
        }
    },
    
    // Get total revenue from delivered orders
    getTotalRevenue: () => {
        return get().orders
            .filter(order => order.status === 'delivered')
            .reduce((total, order) => total + order.total, 0);
    },
    
    // Get orders by status
    getOrdersByStatus: (status: string) => {
        return get().orders.filter(order => order.status === status);
    },
    
    // Get count of pending orders
    getPendingOrdersCount: () => {
        return get().orders.filter(order => order.status === 'pending').length;
    },
    
    // Start real-time listening
    startListening: (email: string) => {
        if (!email) return () => {};
        
        // Stop any existing listener
        if (unsubscribeListener) {
            unsubscribeListener();
        }
        
        unsubscribeListener = hybridStorage.listenToUserOrdersData(email, (orders: HybridOrder[]) => {
            set({ orders });
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
    setOrders: (orders: HybridOrder[]) => set({ orders }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: string | null) => set({ error }),
}));
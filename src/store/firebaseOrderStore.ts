import { create } from 'zustand';
import { placeOrder, updateOrderStatus, getAllOrders, getUserOrders, deleteOrder, listenToOrders } from '@/lib/firebaseHelpers';
import { generateUserId } from '@/lib/firebaseHelpers';
import toast from '@/lib/toast';

export interface FirebaseOrder {
    id: string;
    orderId: string;
    userId: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    paymentMethod: string;
    items: Array<{
        id: string;
        name: string;
        price: number;
        qty: number;
    }>;
    total: number;
    status: 'pending' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

interface FirebaseOrderStore {
    orders: FirebaseOrder[];
    userOrders: FirebaseOrder[];
    loading: boolean;
    error: string | null;
    
    // Actions
    createOrder: (orderData: any) => Promise<{ success: boolean; orderId?: string }>;
    updateStatus: (orderId: string, status: string) => Promise<boolean>;
    deleteExistingOrder: (orderId: string) => Promise<boolean>;
    fetchAllOrders: () => Promise<void>;
    fetchUserOrders: (email: string) => Promise<void>;
    
    // Getters
    getTotalRevenue: () => number;
    getOrdersByStatus: (status: string) => FirebaseOrder[];
    getPendingOrdersCount: () => number;
    
    // Real-time listener
    startListening: () => () => void;
    stopListening: () => void;
    
    // Internal state management
    setOrders: (orders: FirebaseOrder[]) => void;
    setUserOrders: (orders: FirebaseOrder[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

let unsubscribeOrderListener: (() => void) | null = null;

export const useFirebaseOrderStore = create<FirebaseOrderStore>((set, get) => ({
    orders: [],
    userOrders: [],
    loading: false,
    error: null,
    
    // Create new order
    createOrder: async (orderData) => {
        set({ loading: true, error: null });
        try {
            const userId = generateUserId(orderData.email);
            
            const orderToPlace = {
                userId,
                customer: orderData.customer,
                phone: orderData.phone,
                email: orderData.email,
                address: orderData.address,
                paymentMethod: orderData.paymentMethod,
                items: orderData.items,
                total: orderData.total
            };
            
            const result = await placeOrder(orderToPlace);
            
            if (result.success) {
                set({ loading: false });
                toast.success('Order placed successfully!');
                return { success: true, orderId: result.orderId };
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to place order');
                return { success: false };
            }
        } catch (error) {
            set({ error: 'Failed to place order', loading: false });
            toast.error('Failed to place order');
            return { success: false };
        }
    },
    
    // Update order status
    updateStatus: async (orderId, status) => {
        set({ loading: true, error: null });
        try {
            const result = await updateOrderStatus(orderId, status);
            if (result.success) {
                set({ loading: false });
                toast.success('Order status updated');
                return true;
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to update order status');
                return false;
            }
        } catch (error) {
            set({ error: 'Failed to update order status', loading: false });
            toast.error('Failed to update order status');
            return false;
        }
    },
    
    // Delete order (admin only)
    deleteExistingOrder: async (orderId) => {
        set({ loading: true, error: null });
        try {
            const result = await deleteOrder(orderId);
            if (result.success) {
                set({ loading: false });
                toast.success('Order deleted successfully');
                return true;
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to delete order');
                return false;
            }
        } catch (error) {
            set({ error: 'Failed to delete order', loading: false });
            toast.error('Failed to delete order');
            return false;
        }
    },
    
    // Fetch all orders (admin)
    fetchAllOrders: async () => {
        set({ loading: true, error: null });
        try {
            const result = await getAllOrders();
            if (result.success) {
                set({ orders: result.orders, loading: false });
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            set({ error: 'Failed to fetch orders', loading: false });
            toast.error('Failed to fetch orders');
        }
    },
    
    // Fetch user orders
    fetchUserOrders: async (email) => {
        set({ loading: true, error: null });
        try {
            const userId = generateUserId(email);
            const result = await getUserOrders(userId);
            if (result.success) {
                set({ userOrders: result.orders, loading: false });
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to fetch your orders');
            }
        } catch (error) {
            set({ error: 'Failed to fetch your orders', loading: false });
            toast.error('Failed to fetch your orders');
        }
    },
    
    // Get total revenue from delivered orders
    getTotalRevenue: () => {
        return get().orders
            .filter(order => order.status === 'delivered')
            .reduce((total, order) => total + order.total, 0);
    },
    
    // Get orders by status
    getOrdersByStatus: (status) => {
        return get().orders.filter(order => order.status === status);
    },
    
    // Get pending orders count
    getPendingOrdersCount: () => {
        return get().orders.filter(order => order.status === 'pending').length;
    },
    
    // Start real-time listener
    startListening: () => {
        if (unsubscribeOrderListener) {
            unsubscribeOrderListener();
        }
        
        unsubscribeOrderListener = listenToOrders((orders: any) => {
            set({ orders, error: null });
        });
        
        return () => {
            if (unsubscribeOrderListener) {
                unsubscribeOrderListener();
                unsubscribeOrderListener = null;
            }
        };
    },
    
    // Stop real-time listener
    stopListening: () => {
        if (unsubscribeOrderListener) {
            unsubscribeOrderListener();
            unsubscribeOrderListener = null;
        }
    },
    
    // Internal state setters
    setOrders: (orders) => set({ orders }),
    setUserOrders: (orders) => set({ userOrders: orders }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
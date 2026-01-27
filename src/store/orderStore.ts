import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCustomerStore } from './customerStore';

export interface Order {
    id: string;
    customer: string;
    phone: string;
    email: string;
    address: string;
    items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    total: number;
    status: 'Pending' | 'Preparing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
    statusHistory?: Record<string, string>;
}

interface OrderStore {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateOrderStatus: (id: string, status: Order['status']) => void;
    deleteOrder: (id: string) => void;
    getOrderById: (id: string) => Order | undefined;
    getTotalRevenue: () => number;
    getOrdersByStatus: (status: Order['status']) => Order[];
}

// Sample orders for demo
const sampleOrders: Order[] = [
    {
        id: '1',
        customer: 'Rajesh Kumar',
        phone: '+91 9876543210',
        email: 'rajesh.kumar@example.com',
        address: 'No. 123, Gandhi Street, Erode, Tamil Nadu',
        items: [
            { id: '9', name: 'Chicken Fried Rice', price: 219, quantity: 2 },
            { id: '15', name: 'Fresh Lime Soda', price: 49, quantity: 1 }
        ],
        total: 487,
        status: 'Pending',
        paymentMethod: 'cod',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
    {
        id: '2',
        customer: 'Priya Sharma',
        phone: '+91 8765432109',
        email: 'priya.sharma@example.com',
        address: 'No. 456, Anna Nagar, Erode, Tamil Nadu',
        items: [
            { id: '6', name: 'Paneer Tikka', price: 249, quantity: 1 },
            { id: '16', name: 'Mango Lassi', price: 79, quantity: 1 }
        ],
        total: 328,
        status: 'Preparing',
        paymentMethod: 'upi',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    },
    {
        id: '3',
        customer: 'Arjun Patel',
        phone: '+91 7654321098',
        email: 'arjun.patel@example.com',
        address: 'No. 789, Periyar Street, Erode, Tamil Nadu',
        items: [
            { id: '1', name: 'Spicy Chicken Wings', price: 299, quantity: 1 },
            { id: '12', name: 'Hakka Noodles', price: 189, quantity: 1 },
            { id: '19', name: 'Chocolate Brownie', price: 119, quantity: 1 }
        ],
        total: 607,
        status: 'Delivered',
        paymentMethod: 'razorpay',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
];

export const useOrderStore = create<OrderStore>()(
    persist(
        (set, get) => ({
            orders: sampleOrders,
            
            addOrder: (order) => {
                const newOrder: Order = {
                    ...order,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                
                // Update customer stats
                const customerStore = useCustomerStore.getState();
                customerStore.updateCustomerStats(order.email, order.total);
                
                set((state) => ({
                    orders: [newOrder, ...state.orders],
                }));
            },
            
            updateOrderStatus: (id, status) => {
                set((state) => ({
                    orders: state.orders.map((order) =>
                        order.id === id 
                            ? { ...order, status, updatedAt: new Date().toISOString() }
                            : order
                    ),
                }));
            },
            
            deleteOrder: (id) => {
                set((state) => ({
                    orders: state.orders.filter((order) => order.id !== id),
                }));
            },
            
            getOrderById: (id) => {
                return get().orders.find((order) => order.id === id);
            },
            
            getTotalRevenue: () => {
                return get().orders
                    .filter(order => order.status === 'Delivered')
                    .reduce((total, order) => total + order.total, 0);
            },
            
            getOrdersByStatus: (status) => {
                return get().orders.filter((order) => order.status === status);
            },
        }),
        {
            name: 'order-storage',
        }
    )
);
'use client';

import { useEffect, useRef } from 'react';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import { useOrderStore } from '@/store/orderStore';
import toast from '@/lib/toast';

export const useOrderNotifications = () => {
    const { currentUser } = useEmailAuth();
    const { orders } = useOrderStore();
    const previousOrdersRef = useRef<any[]>([]);

    useEffect(() => {
        if (!currentUser?.email) return;

        // Filter orders for current user
        const userOrders = orders.filter(order => order.email === currentUser.email);
        const previousOrders = previousOrdersRef.current;

        // Check for status changes
        if (previousOrders.length > 0) {
            userOrders.forEach(currentOrder => {
                const previousOrder = previousOrders.find(prev => prev.id === currentOrder.id);
                
                if (previousOrder && previousOrder.status !== currentOrder.status) {
                    // Order status changed - show notification
                    const statusMessages = {
                        'pending': '⏳ Your order has been received and is being processed',
                        'preparing': '👨‍🍳 Your order is being prepared with care',
                        'out for delivery': '🚚 Your order is on the way to you!',
                        'delivered': '✅ Your order has been delivered successfully!',
                        'cancelled': '❌ Your order has been cancelled'
                    };

                    const message = statusMessages[currentOrder.status.toLowerCase() as keyof typeof statusMessages] 
                        || `Order status updated to: ${currentOrder.status}`;

                    if (currentOrder.status.toLowerCase() === 'delivered') {
                        toast.success(message);
                    } else if (currentOrder.status.toLowerCase() === 'cancelled') {
                        toast.error(message);
                    } else {
                        toast.info(message);
                    }
                }
            });
        }

        // Update the reference for next comparison
        previousOrdersRef.current = userOrders.map(order => ({ ...order }));
    }, [orders, currentUser?.email]);
};
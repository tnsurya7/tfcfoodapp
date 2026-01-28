'use client';

import { 
    saveUser, 
    getUser, 
    addToCart, 
    getUserCart, 
    updateCartItemQty, 
    removeFromCart,
    clearUserCart,
    placeOrder,
    getUserOrders,
    getAllFoods,
    listenToFoods,
    listenToCart,
    listenToUserOrders
} from './firebaseHelpers';
import { generateUserId } from './firebaseHelpers';

// Hybrid storage system that uses Firebase as primary and localStorage as fallback
class HybridStorage {
    constructor() {
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        this.listeners = new Map();
        
        // Only add event listeners on client side
        if (typeof window !== 'undefined') {
            // Listen for online/offline events
            window.addEventListener('online', () => {
                this.isOnline = true;
                console.log('🌐 Back online - syncing with Firebase');
                this.syncPendingOperations();
            });
            
            window.addEventListener('offline', () => {
                this.isOnline = false;
                console.log('📴 Offline - using localStorage fallback');
            });
        }
    }

    // User operations
    async saveUserData(userData) {
        try {
            if (this.isOnline) {
                const result = await saveUser(userData);
                if (result.success) {
                    // Also cache in localStorage for offline access
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('tfc_user_data', JSON.stringify(userData));
                    }
                    console.log('✅ User saved to Firebase and cached locally');
                    return result;
                }
            }
            
            // Fallback to localStorage
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('tfc_user_data', JSON.stringify(userData));
                this.queueOperation('saveUser', userData);
                console.log('📦 User saved to localStorage (offline)');
            }
            return { success: true, offline: true };
            
        } catch (error) {
            console.error('Error saving user:', error);
            // Fallback to localStorage
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('tfc_user_data', JSON.stringify(userData));
            }
            return { success: true, offline: true };
        }
    }

    async getUserData(email) {
        try {
            if (this.isOnline) {
                const result = await getUser(email);
                if (result.success) {
                    // Cache the result
                    localStorage.setItem('tfc_user_data', JSON.stringify(result.user));
                    return result;
                }
            }
            
            // Fallback to localStorage
            const cachedUser = localStorage.getItem('tfc_user_data');
            if (cachedUser) {
                const user = JSON.parse(cachedUser);
                if (user.email === email) {
                    return { success: true, user, offline: true };
                }
            }
            
            return { success: false, error: 'User not found' };
            
        } catch (error) {
            console.error('Error getting user:', error);
            return { success: false, error: error.message };
        }
    }

    // Cart operations
    async addToUserCart(email, foodItem) {
        const userId = generateUserId(email);
        
        try {
            if (this.isOnline) {
                const result = await addToCart(userId, foodItem);
                if (result.success) {
                    this.updateLocalCartCache(email, 'add', foodItem);
                    console.log('✅ Item added to Firebase cart and cached locally');
                    return result;
                }
            }
            
            // Fallback to localStorage
            this.updateLocalCartCache(email, 'add', foodItem);
            this.queueOperation('addToCart', { userId, foodItem });
            console.log('📦 Item added to localStorage cart (offline)');
            return { success: true, offline: true };
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            this.updateLocalCartCache(email, 'add', foodItem);
            return { success: true, offline: true };
        }
    }

    async getUserCartData(email) {
        const userId = generateUserId(email);
        
        try {
            if (this.isOnline) {
                const result = await getUserCart(userId);
                if (result.success) {
                    // Cache the result
                    this.cacheUserCart(email, result.cartItems);
                    return result;
                }
            }
            
            // Fallback to localStorage
            const cachedCart = this.getLocalCartCache(email);
            return { success: true, cartItems: cachedCart, offline: true };
            
        } catch (error) {
            console.error('Error getting cart:', error);
            const cachedCart = this.getLocalCartCache(email);
            return { success: true, cartItems: cachedCart, offline: true };
        }
    }

    async updateCartQuantity(email, foodId, qty) {
        const userId = generateUserId(email);
        
        try {
            if (this.isOnline) {
                const result = await updateCartItemQty(userId, foodId, qty);
                if (result.success) {
                    this.updateLocalCartCache(email, 'update', { id: foodId, qty });
                    console.log('✅ Cart quantity updated in Firebase and cached locally');
                    return result;
                }
            }
            
            // Fallback to localStorage
            this.updateLocalCartCache(email, 'update', { id: foodId, qty });
            this.queueOperation('updateCartItemQty', { userId, foodId, qty });
            console.log('📦 Cart quantity updated in localStorage (offline)');
            return { success: true, offline: true };
            
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            this.updateLocalCartCache(email, 'update', { id: foodId, qty });
            return { success: true, offline: true };
        }
    }

    async removeFromUserCart(email, foodId) {
        const userId = generateUserId(email);
        
        try {
            if (this.isOnline) {
                const result = await removeFromCart(userId, foodId);
                if (result.success) {
                    this.updateLocalCartCache(email, 'remove', { id: foodId });
                    console.log('✅ Item removed from Firebase cart and local cache');
                    return result;
                }
            }
            
            // Fallback to localStorage
            this.updateLocalCartCache(email, 'remove', { id: foodId });
            this.queueOperation('removeFromCart', { userId, foodId });
            console.log('📦 Item removed from localStorage cart (offline)');
            return { success: true, offline: true };
            
        } catch (error) {
            console.error('Error removing from cart:', error);
            this.updateLocalCartCache(email, 'remove', { id: foodId });
            return { success: true, offline: true };
        }
    }

    async clearUserCartData(email) {
        const userId = generateUserId(email);
        
        try {
            if (this.isOnline) {
                const result = await clearUserCart(userId);
                if (result.success) {
                    this.clearLocalCartCache(email);
                    console.log('✅ Cart cleared in Firebase and local cache');
                    return result;
                }
            }
            
            // Fallback to localStorage
            this.clearLocalCartCache(email);
            this.queueOperation('clearUserCart', { userId });
            console.log('📦 Cart cleared in localStorage (offline)');
            return { success: true, offline: true };
            
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.clearLocalCartCache(email);
            return { success: true, offline: true };
        }
    }

    // Order operations
    async placeUserOrder(orderData) {
        try {
            if (this.isOnline) {
                const result = await placeOrder(orderData);
                if (result.success) {
                    // Cache the order locally
                    this.cacheUserOrder(orderData.email, result.order);
                    console.log('✅ Order placed in Firebase and cached locally');
                    return result;
                }
            }
            
            // Fallback to localStorage
            const offlineOrder = {
                ...orderData,
                id: 'offline_' + Date.now(),
                status: 'pending',
                createdAt: new Date().toISOString(),
                offline: true
            };
            this.cacheUserOrder(orderData.email, offlineOrder);
            this.queueOperation('placeOrder', orderData);
            console.log('📦 Order saved locally (offline)');
            return { success: true, order: offlineOrder, offline: true };
            
        } catch (error) {
            console.error('Error placing order:', error);
            const offlineOrder = {
                ...orderData,
                id: 'offline_' + Date.now(),
                status: 'pending',
                createdAt: new Date().toISOString(),
                offline: true
            };
            this.cacheUserOrder(orderData.email, offlineOrder);
            return { success: true, order: offlineOrder, offline: true };
        }
    }

    async getUserOrdersData(email) {
        const userId = generateUserId(email);
        
        try {
            if (this.isOnline) {
                const result = await getUserOrders(userId);
                if (result.success) {
                    // Cache the orders
                    this.cacheUserOrders(email, result.orders);
                    return result;
                }
            }
            
            // Fallback to localStorage
            const cachedOrders = this.getLocalOrdersCache(email);
            return { success: true, orders: cachedOrders, offline: true };
            
        } catch (error) {
            console.error('Error getting orders:', error);
            const cachedOrders = this.getLocalOrdersCache(email);
            return { success: true, orders: cachedOrders, offline: true };
        }
    }

    // Local cache management
    updateLocalCartCache(email, operation, item) {
        const cacheKey = `tfc_cart_${generateUserId(email)}`;
        let cart = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        
        switch (operation) {
            case 'add':
                const existingIndex = cart.findIndex(cartItem => cartItem.id === item.id);
                if (existingIndex >= 0) {
                    cart[existingIndex].qty += item.qty || 1;
                } else {
                    cart.push({ ...item, qty: item.qty || 1 });
                }
                break;
            case 'update':
                const updateIndex = cart.findIndex(cartItem => cartItem.id === item.id);
                if (updateIndex >= 0) {
                    if (item.qty <= 0) {
                        cart.splice(updateIndex, 1);
                    } else {
                        cart[updateIndex].qty = item.qty;
                    }
                }
                break;
            case 'remove':
                cart = cart.filter(cartItem => cartItem.id !== item.id);
                break;
        }
        
        localStorage.setItem(cacheKey, JSON.stringify(cart));
    }

    getLocalCartCache(email) {
        const cacheKey = `tfc_cart_${generateUserId(email)}`;
        return JSON.parse(localStorage.getItem(cacheKey) || '[]');
    }

    clearLocalCartCache(email) {
        const cacheKey = `tfc_cart_${generateUserId(email)}`;
        localStorage.removeItem(cacheKey);
    }

    cacheUserCart(email, cartItems) {
        const cacheKey = `tfc_cart_${generateUserId(email)}`;
        localStorage.setItem(cacheKey, JSON.stringify(cartItems));
    }

    cacheUserOrder(email, order) {
        const cacheKey = `tfc_orders_${generateUserId(email)}`;
        let orders = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        orders.unshift(order); // Add to beginning
        localStorage.setItem(cacheKey, JSON.stringify(orders));
    }

    cacheUserOrders(email, orders) {
        const cacheKey = `tfc_orders_${generateUserId(email)}`;
        localStorage.setItem(cacheKey, JSON.stringify(orders));
    }

    getLocalOrdersCache(email) {
        const cacheKey = `tfc_orders_${generateUserId(email)}`;
        return JSON.parse(localStorage.getItem(cacheKey) || '[]');
    }

    // Queue operations for when back online
    queueOperation(operation, data) {
        const queue = JSON.parse(localStorage.getItem('tfc_pending_operations') || '[]');
        queue.push({
            operation,
            data,
            timestamp: Date.now()
        });
        localStorage.setItem('tfc_pending_operations', JSON.stringify(queue));
    }

    async syncPendingOperations() {
        const queue = JSON.parse(localStorage.getItem('tfc_pending_operations') || '[]');
        if (queue.length === 0) return;

        console.log(`🔄 Syncing ${queue.length} pending operations...`);
        
        for (const item of queue) {
            try {
                switch (item.operation) {
                    case 'saveUser':
                        await saveUser(item.data);
                        break;
                    case 'addToCart':
                        await addToCart(item.data.userId, item.data.foodItem);
                        break;
                    case 'updateCartItemQty':
                        await updateCartItemQty(item.data.userId, item.data.foodId, item.data.qty);
                        break;
                    case 'removeFromCart':
                        await removeFromCart(item.data.userId, item.data.foodId);
                        break;
                    case 'clearUserCart':
                        await clearUserCart(item.data.userId);
                        break;
                    case 'placeOrder':
                        await placeOrder(item.data);
                        break;
                }
                console.log(`✅ Synced ${item.operation}`);
            } catch (error) {
                console.error(`❌ Failed to sync ${item.operation}:`, error);
            }
        }
        
        // Clear the queue
        localStorage.removeItem('tfc_pending_operations');
        console.log('✅ All pending operations synced');
    }

    // Real-time listeners with fallback
    listenToUserCart(email, callback) {
        if (this.isOnline) {
            const userId = generateUserId(email);
            return listenToCart(userId, (cartItems) => {
                this.cacheUserCart(email, cartItems);
                callback(cartItems);
            });
        } else {
            // Return cached data immediately
            const cachedCart = this.getLocalCartCache(email);
            callback(cachedCart);
            return () => {}; // No-op unsubscribe
        }
    }

    listenToUserOrdersData(email, callback) {
        if (this.isOnline) {
            return listenToUserOrders(email, (orders) => {
                this.cacheUserOrders(email, orders);
                callback(orders);
            });
        } else {
            // Return cached data immediately
            const cachedOrders = this.getLocalOrdersCache(email);
            callback(cachedOrders);
            return () => {}; // No-op unsubscribe
        }
    }
}

// Export singleton instance
export const hybridStorage = new HybridStorage();
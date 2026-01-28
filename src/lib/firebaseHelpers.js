import { database } from './firebase';
import { ref, set, get, push, update, remove, onValue, off } from 'firebase/database';

// Check if database is available
const isDatabaseAvailable = () => {
    if (!database) {
        console.warn('Firebase database not initialized. Make sure environment variables are set.');
        return false;
    }
    return true;
};

// ==================== USER FUNCTIONS ====================

// Save user after email OTP verification
export const saveUser = async (userData) => {
    try {
        if (!isDatabaseAvailable()) {
            return { success: false, error: 'Database not available' };
        }
        
        const userId = userData.email.replace(/\./g, '_').replace(/@/g, '_at_');
        const userRef = ref(database, `tfc/users/${userId}`);
        
        const userToSave = {
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        await set(userRef, userToSave);
        return { success: true, userId, user: userToSave };
    } catch (error) {
        console.error('Error saving user:', error);
        return { success: false, error: error.message };
    }
};

// Get user by email
export const getUser = async (email) => {
    try {
        const userId = email.replace(/\./g, '_').replace(/@/g, '_at_');
        const userRef = ref(database, `tfc/users/${userId}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            return { success: true, user: snapshot.val(), userId };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Error getting user:', error);
        return { success: false, error: error.message };
    }
};

// Update user last login
export const updateUserLastLogin = async (email) => {
    try {
        const userId = email.replace(/\./g, '_').replace(/@/g, '_at_');
        const userRef = ref(database, `tfc/users/${userId}/lastLogin`);
        await set(userRef, new Date().toISOString());
        return { success: true };
    } catch (error) {
        console.error('Error updating last login:', error);
        return { success: false, error: error.message };
    }
};

// ==================== FOOD FUNCTIONS ====================

// Add new food item
export const addFood = async (foodData) => {
    try {
        const foodsRef = ref(database, 'tfc/foods');
        const newFoodRef = push(foodsRef);
        
        const foodToSave = {
            ...foodData,
            id: newFoodRef.key,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await set(newFoodRef, foodToSave);
        return { success: true, foodId: newFoodRef.key, food: foodToSave };
    } catch (error) {
        console.error('Error adding food:', error);
        return { success: false, error: error.message };
    }
};

// Update food item
export const updateFood = async (foodId, foodData) => {
    try {
        const foodRef = ref(database, `tfc/foods/${foodId}`);
        const updatedFood = {
            ...foodData,
            updatedAt: new Date().toISOString()
        };
        
        await update(foodRef, updatedFood);
        return { success: true, food: updatedFood };
    } catch (error) {
        console.error('Error updating food:', error);
        return { success: false, error: error.message };
    }
};

// Delete food item
export const deleteFood = async (foodId) => {
    try {
        const foodRef = ref(database, `tfc/foods/${foodId}`);
        await remove(foodRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting food:', error);
        return { success: false, error: error.message };
    }
};

// Get all foods
export const getAllFoods = async () => {
    try {
        const foodsRef = ref(database, 'tfc/foods');
        const snapshot = await get(foodsRef);
        
        if (snapshot.exists()) {
            const foods = [];
            snapshot.forEach((childSnapshot) => {
                foods.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return { success: true, foods };
        } else {
            return { success: true, foods: [] };
        }
    } catch (error) {
        console.error('Error getting foods:', error);
        return { success: false, error: error.message };
    }
};

// Listen to foods changes (real-time)
export const listenToFoods = (callback) => {
    const foodsRef = ref(database, 'tfc/foods');
    
    const unsubscribe = onValue(foodsRef, (snapshot) => {
        const foods = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                foods.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
        }
        callback(foods);
    });
    
    return unsubscribe;
};

// ==================== CART FUNCTIONS ====================

// Add item to cart
export const addToCart = async (userId, foodItem) => {
    try {
        const cartItemRef = ref(database, `tfc/carts/${userId}/${foodItem.id}`);
        
        const cartItem = {
            name: foodItem.name,
            price: foodItem.price,
            image: foodItem.image,
            qty: foodItem.qty || 1,
            addedAt: new Date().toISOString()
        };
        
        await set(cartItemRef, cartItem);
        return { success: true, cartItem };
    } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: error.message };
    }
};

// Update cart item quantity
export const updateCartItemQty = async (userId, foodId, qty) => {
    try {
        if (qty <= 0) {
            return await removeFromCart(userId, foodId);
        }
        
        const cartItemRef = ref(database, `tfc/carts/${userId}/${foodId}/qty`);
        await set(cartItemRef, qty);
        return { success: true };
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        return { success: false, error: error.message };
    }
};

// Remove item from cart
export const removeFromCart = async (userId, foodId) => {
    try {
        const cartItemRef = ref(database, `tfc/carts/${userId}/${foodId}`);
        await remove(cartItemRef);
        return { success: true };
    } catch (error) {
        console.error('Error removing from cart:', error);
        return { success: false, error: error.message };
    }
};

// Get user cart
export const getUserCart = async (userId) => {
    try {
        const cartRef = ref(database, `tfc/carts/${userId}`);
        const snapshot = await get(cartRef);
        
        if (snapshot.exists()) {
            const cartItems = [];
            snapshot.forEach((childSnapshot) => {
                cartItems.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            return { success: true, cartItems };
        } else {
            return { success: true, cartItems: [] };
        }
    } catch (error) {
        console.error('Error getting cart:', error);
        return { success: false, error: error.message };
    }
};

// Clear user cart
export const clearUserCart = async (userId) => {
    try {
        const cartRef = ref(database, `tfc/carts/${userId}`);
        await remove(cartRef);
        return { success: true };
    } catch (error) {
        console.error('Error clearing cart:', error);
        return { success: false, error: error.message };
    }
};

// Listen to cart changes (real-time)
export const listenToCart = (userId, callback) => {
    const cartRef = ref(database, `tfc/carts/${userId}`);
    
    const unsubscribe = onValue(cartRef, (snapshot) => {
        const cartItems = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                cartItems.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
        }
        callback(cartItems);
    });
    
    return unsubscribe;
};

// ==================== ORDER FUNCTIONS ====================

// Place order
export const placeOrder = async (orderData) => {
    try {
        // Check if database is available
        if (!database) {
            return { success: false, error: 'Database not initialized' };
        }
        
        const ordersRef = ref(database, 'tfc/orders');
        const newOrderRef = push(ordersRef);
        
        const orderToSave = {
            ...orderData,
            orderId: newOrderRef.key,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await set(newOrderRef, orderToSave);
        
        // Clear user cart after successful order
        if (orderData.userId) {
            await clearUserCart(orderData.userId);
        }
        
        return { success: true, orderId: newOrderRef.key, order: orderToSave };
    } catch (error) {
        console.error('❌ Error placing order:', error);
        return { success: false, error: error.message };
    }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
        const orderRef = ref(database, `tfc/orders/${orderId}`);
        const updates = {
            status: status,
            updatedAt: new Date().toISOString()
        };
        
        await update(orderRef, updates);
        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
};

// Get all orders
export const getAllOrders = async () => {
    try {
        const ordersRef = ref(database, 'tfc/orders');
        const snapshot = await get(ordersRef);
        
        if (snapshot.exists()) {
            const orders = [];
            snapshot.forEach((childSnapshot) => {
                orders.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            // Sort by creation date (newest first)
            orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return { success: true, orders };
        } else {
            return { success: true, orders: [] };
        }
    } catch (error) {
        console.error('Error getting orders:', error);
        return { success: false, error: error.message };
    }
};

// Get user orders
export const getUserOrders = async (userId) => {
    try {
        const ordersRef = ref(database, 'tfc/orders');
        const snapshot = await get(ordersRef);
        
        if (snapshot.exists()) {
            const userOrders = [];
            snapshot.forEach((childSnapshot) => {
                const order = childSnapshot.val();
                if (order.userId === userId) {
                    userOrders.push({
                        id: childSnapshot.key,
                        ...order
                    });
                }
            });
            // Sort by creation date (newest first)
            userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return { success: true, orders: userOrders };
        } else {
            return { success: true, orders: [] };
        }
    } catch (error) {
        console.error('Error getting user orders:', error);
        return { success: false, error: error.message };
    }
};

// Listen to orders changes (real-time)
export const listenToOrders = (callback) => {
    const ordersRef = ref(database, 'tfc/orders');
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
        const orders = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                orders.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            // Sort by creation date (newest first)
            orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        callback(orders);
    });
    
    return unsubscribe;
};

// Delete order (admin only)
export const deleteOrder = async (orderId) => {
    try {
        const orderRef = ref(database, `tfc/orders/${orderId}`);
        await remove(orderRef);
        return { success: true };
    } catch (error) {
        console.error('Error deleting order:', error);
        return { success: false, error: error.message };
    }
};

// ==================== ADMIN FUNCTIONS ====================

// Save admin credentials (for initial setup)
export const saveAdmin = async (username, password) => {
    try {
        const adminRef = ref(database, `tfc/admins/${username}`);
        const adminData = {
            username: username,
            password: password, // In production, hash this password
            createdAt: new Date().toISOString()
        };
        
        await set(adminRef, adminData);
        return { success: true };
    } catch (error) {
        console.error('Error saving admin:', error);
        return { success: false, error: error.message };
    }
};

// Verify admin credentials
export const verifyAdmin = async (username, password) => {
    try {
        const adminRef = ref(database, `tfc/admins/${username}`);
        const snapshot = await get(adminRef);
        
        if (snapshot.exists()) {
            const adminData = snapshot.val();
            if (adminData.password === password) {
                return { success: true, admin: adminData };
            } else {
                return { success: false, error: 'Invalid password' };
            }
        } else {
            return { success: false, error: 'Admin not found' };
        }
    } catch (error) {
        console.error('Error verifying admin:', error);
        return { success: false, error: error.message };
    }
};

// ==================== UTILITY FUNCTIONS ====================

// Generate user ID from email
export const generateUserId = (email) => {
    return email.replace(/\./g, '_').replace(/@/g, '_at_');
};

// Initialize default admin (run once)
export const initializeDefaultAdmin = async () => {
    try {
        if (!isDatabaseAvailable()) {
            return { success: false, error: 'Database not available' };
        }
        
        const username = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
        const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        
        if (!username || !password) {
            console.error('Admin credentials not found in environment variables');
            return { success: false, error: 'Admin credentials not configured' };
        }
        
        const result = await saveAdmin(username, password);
        return result;
    } catch (error) {
        console.error('Error initializing default admin:', error);
        return { success: false, error: error.message };
    }
};

// Get database statistics
export const getDatabaseStats = async () => {
    try {
        const [usersResult, foodsResult, ordersResult] = await Promise.all([
            get(ref(database, 'tfc/users')),
            get(ref(database, 'tfc/foods')),
            get(ref(database, 'tfc/orders'))
        ]);
        
        const stats = {
            totalUsers: usersResult.exists() ? Object.keys(usersResult.val()).length : 0,
            totalFoods: foodsResult.exists() ? Object.keys(foodsResult.val()).length : 0,
            totalOrders: ordersResult.exists() ? Object.keys(ordersResult.val()).length : 0,
            totalRevenue: 0
        };
        
        // Calculate total revenue (include preparing, out-for-delivery, and delivered orders)
        if (ordersResult.exists()) {
            Object.values(ordersResult.val()).forEach(order => {
                if (order.status === 'delivered' || order.status === 'preparing' || order.status === 'out-for-delivery') {
                    stats.totalRevenue += order.total || 0;
                }
            });
        }
        
        return { success: true, stats };
    } catch (error) {
        console.error('Error getting database stats:', error);
        return { success: false, error: error.message };
    }
};

// ==================== ORDER TRACKING FUNCTIONS ====================

// Get order by ID for tracking
export const getOrderById = async (orderId) => {
    try {
        const orderRef = ref(database, `tfc/orders/${orderId}`);
        const snapshot = await get(orderRef);
        
        if (snapshot.exists()) {
            return { 
                success: true, 
                order: {
                    id: snapshot.key,
                    ...snapshot.val()
                }
            };
        } else {
            return { success: false, error: 'Order not found' };
        }
    } catch (error) {
        console.error('Error getting order:', error);
        return { success: false, error: error.message };
    }
};

// Get orders by user email for tracking
export const getOrdersByEmail = async (email) => {
    try {
        const ordersRef = ref(database, 'tfc/orders');
        const snapshot = await get(ordersRef);
        
        if (snapshot.exists()) {
            const userOrders = [];
            snapshot.forEach((childSnapshot) => {
                const order = childSnapshot.val();
                if (order.email === email) {
                    userOrders.push({
                        id: childSnapshot.key,
                        ...order
                    });
                }
            });
            // Sort by creation date (newest first)
            userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return { success: true, orders: userOrders };
        } else {
            return { success: true, orders: [] };
        }
    } catch (error) {
        console.error('Error getting user orders:', error);
        return { success: false, error: error.message };
    }
};

// Listen to specific user's orders (real-time)
export const listenToUserOrders = (email, callback) => {
    const ordersRef = ref(database, 'tfc/orders');
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
        const userOrders = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const order = childSnapshot.val();
                if (order.email === email) {
                    userOrders.push({
                        id: childSnapshot.key,
                        ...order
                    });
                }
            });
            // Sort by creation date (newest first)
            userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        callback(userOrders);
    });
    
    return unsubscribe;
};

// Update order status with timestamp
export const updateOrderStatusWithTimestamp = async (orderId, status, statusMessage = '') => {
    try {
        const orderRef = ref(database, `tfc/orders/${orderId}`);
        const updates = {
            status: status,
            statusMessage: statusMessage,
            updatedAt: new Date().toISOString(),
            [`statusHistory/${status}`]: new Date().toISOString()
        };
        
        await update(orderRef, updates);
        return { success: true };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
};
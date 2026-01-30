import { ref, get, set, push, update, remove, onValue, goOnline } from "firebase/database";
import { database } from "./firebase";

// Ensure Firebase connection is always alive for optimal performance
if (database) {
    goOnline(database);
}

/* ------------------ FOOD ------------------ */

export const getAllFoods = async () => {
    if (!database) throw new Error('Database not available');
    const snap = await get(ref(database, "tfc/foods"));
    if (!snap.exists()) return { success: true, foods: [] };
    
    const data = snap.val();
    const foods = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
    }));
    return { success: true, foods };
};

export const listenFoods = (callback) => {
    if (!database) return () => {};
    const foodsRef = ref(database, "tfc/foods");
    return onValue(foodsRef, (snap) => {
        if (!snap.exists()) return callback([]);
        const data = snap.val();
        const foods = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        callback(foods);
    });
};

export const listenToFoods = (callback) => {
    return listenFoods(callback);
};

export const addFood = async (food) => {
    if (!database) throw new Error('Database not available');
    const newRef = push(ref(database, "tfc/foods"));
    await set(newRef, {
        ...food,
        id: newRef.key,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    return { success: true };
};

export const updateFood = async (id, food) => {
    if (!database) throw new Error('Database not available');
    await update(ref(database, `tfc/foods/${id}`), {
        ...food,
        updatedAt: new Date().toISOString()
    });
    return { success: true };
};

export const updateFoodInFirebase = async (id, food) => {
    return await updateFood(id, food);
};

export const deleteFood = async (id) => {
    if (!database) throw new Error('Database not available');
    await remove(ref(database, `tfc/foods/${id}`));
    return { success: true };
};

/* ------------------ ORDERS ------------------ */

export const getAllOrders = async () => {
    if (!database) throw new Error('Database not available');
    const snap = await get(ref(database, "tfc/orders"));
    if (!snap.exists()) return { success: true, orders: [] };
    
    const data = snap.val();
    const orders = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
    }));
    return { success: true, orders };
};

export const createOrder = async (order) => {
    if (!database) throw new Error('Database not available');
    const newRef = push(ref(database, "tfc/orders"));
    
    // Ensure items have proper structure
    const formattedItems = order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty || item.quantity || 1),
        image: item.image || ""
    }));
    
    await set(newRef, {
        ...order,
        items: formattedItems,
        orderId: newRef.key,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    return { success: true, orderId: newRef.key };
};

export const placeOrder = async (orderData, clearCartLocal) => {
    // 1. INSTANT UI UPDATE (Optimistic)
    if (clearCartLocal && typeof clearCartLocal === 'function') {
        clearCartLocal(); // Clear cart immediately for instant UI response
    }
    
    // 2. FIREBASE ORDER CREATION (Background)
    if (!database) throw new Error('Database not available');
    const orderRef = push(ref(database, "tfc/orders"));
    
    // Ensure items have proper structure
    const formattedItems = orderData.items.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        qty: Number(item.qty || item.quantity || 1),
        image: item.image || ""
    }));
    
    await set(orderRef, {
        ...orderData,
        items: formattedItems,
        orderId: orderRef.key,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // 3. CLEAR FIREBASE CART (Background)
    if (orderData.userId) {
        await remove(ref(database, `tfc/carts/${orderData.userId}`));
    }
    
    return { success: true, orderId: orderRef.key };
};

export const listenOrders = (callback) => {
    if (!database) return () => {};
    const ordersRef = ref(database, "tfc/orders");
    return onValue(ordersRef, (snap) => {
        if (!snap.exists()) return callback([]);
        const data = snap.val();
        const orders = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        callback(orders);
    });
};

export const listenToOrders = (callback) => {
    return listenOrders(callback);
};

export const updateOrderStatus = async (id, status) => {
    if (!database) throw new Error('Database not available');
    await update(ref(database, `tfc/orders/${id}`), {
        status: status.toLowerCase(),
        updatedAt: new Date().toISOString()
    });
    return { success: true };
};

export const updateOrderStatusWithTimestamp = async (id, status) => {
    if (!database) throw new Error('Database not available');
    await update(ref(database, `tfc/orders/${id}`), {
        status: status.toLowerCase(),
        updatedAt: new Date().toISOString()
    });
    return { success: true };
};

export const deleteOrder = async (id) => {
    if (!database) throw new Error('Database not available');
    await remove(ref(database, `tfc/orders/${id}`));
    return { success: true };
};

/* ------------------ USER ORDERS ------------------ */

export const getOrdersByEmail = async (email) => {
    if (!database) return [];
    const snap = await get(ref(database, "tfc/orders"));
    if (!snap.exists()) return [];
    
    const data = snap.val();
    return Object.keys(data).map(key => ({
        id: key,
        ...data[key]
    })).filter(order => order.email === email);
};

export const getOrdersByUserId = async (userId) => {
    if (!database) throw new Error('Database not available');
    const snap = await get(ref(database, "tfc/orders"));
    if (!snap.exists()) return { success: true, orders: [] };
    
    const data = snap.val();
    const orders = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
    })).filter(order => {
        // Match by userId or email
        const orderUserId = order.email ? order.email.replace(/\./g, '_').replace(/@/g, '_at_') : '';
        return orderUserId === userId || order.userId === userId;
    });
    
    return { success: true, orders };
};

export const getUserOrders = async (email) => {
    const orders = await getOrdersByEmail(email);
    return { success: true, orders };
};

/* ------------------ USER MANAGEMENT ------------------ */

export const saveUser = async (userData) => {
    if (!database) throw new Error('Database not available');
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
};

export const updateUserLastLogin = async (email) => {
    if (!database) throw new Error('Database not available');
    const userId = email.replace(/\./g, '_').replace(/@/g, '_at_');
    const userRef = ref(database, `tfc/users/${userId}`);
    
    await update(userRef, {
        lastLogin: new Date().toISOString()
    });
    
    return { success: true };
};

export const getUser = async (email) => {
    if (!database) throw new Error('Database not available');
    const userId = email.replace(/\./g, '_').replace(/@/g, '_at_');
    const userRef = ref(database, `tfc/users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
        return { success: true, user: snapshot.val(), userId };
    } else {
        return { success: false, error: 'User not found' };
    }
};

/* ------------------ CART ------------------ */

export const addToCart = async (userId, foodItem) => {
    if (!database) throw new Error('Database not available');
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
};

export const updateCartItemQty = async (userId, foodId, qty) => {
    if (!database) throw new Error('Database not available');
    if (qty <= 0) {
        return await removeFromCart(userId, foodId);
    }
    
    const cartItemRef = ref(database, `tfc/carts/${userId}/${foodId}/qty`);
    await set(cartItemRef, qty);
    return { success: true };
};

export const removeFromCart = async (userId, foodId) => {
    if (!database) throw new Error('Database not available');
    const cartItemRef = ref(database, `tfc/carts/${userId}/${foodId}`);
    await remove(cartItemRef);
    return { success: true };
};

export const clearUserCart = async (userId) => {
    if (!database) throw new Error('Database not available');
    const cartRef = ref(database, `tfc/carts/${userId}`);
    await remove(cartRef);
    return { success: true };
};

export const listenToCart = (userId, callback) => {
    if (!database) return () => {};
    const cartRef = ref(database, `tfc/carts/${userId}`);
    
    return onValue(cartRef, (snapshot) => {
        const cartItems = [];
        if (snapshot.exists()) {
            const data = snapshot.val();
            Object.keys(data).forEach(key => {
                cartItems.push({
                    id: key,
                    ...data[key]
                });
            });
        }
        callback(cartItems);
    });
};

export const getUserCart = async (userId) => {
    if (!database) throw new Error('Database not available');
    const cartRef = ref(database, `tfc/carts/${userId}`);
    const snapshot = await get(cartRef);
    
    const cartItems = [];
    if (snapshot.exists()) {
        const data = snapshot.val();
        Object.keys(data).forEach(key => {
            cartItems.push({
                id: key,
                ...data[key]
            });
        });
    }
    
    return { success: true, cartItems };
};

/* ------------------ STATS ------------------ */

export const getDatabaseStats = async () => {
    if (!database) throw new Error('Database not available');
    
    const foods = await get(ref(database, "tfc/foods"));
    const orders = await get(ref(database, "tfc/orders"));
    const users = await get(ref(database, "tfc/users"));

    let totalRevenue = 0;

    if (orders.exists()) {
        const ordersData = orders.val();
        
        Object.values(ordersData).forEach(order => {
            if (order.status?.toLowerCase() === "delivered") {
                totalRevenue += Number(order.total || 0);
            }
        });
    }

    return {
        success: true,
        stats: {
            totalFoods: foods.exists() ? Object.keys(foods.val()).length : 0,
            totalOrders: orders.exists() ? Object.keys(orders.val()).length : 0,
            totalUsers: users.exists() ? Object.keys(users.val()).length : 0,
            totalRevenue
        }
    };
};

export const getDeliveredRevenue = async () => {
    if (!database) throw new Error('Database not available');
    
    const orders = await get(ref(database, "tfc/orders"));
    let revenue = 0;

    if (orders.exists()) {
        const ordersData = orders.val();
        Object.values(ordersData).forEach(order => {
            if (order.status?.toLowerCase() === "delivered") {
                revenue += Number(order.total || 0);
            }
        });
    }

    return revenue;
};

export const getAdminStats = async () => {
    if (!database) throw new Error('Database not available');
    
    const foods = await get(ref(database, "tfc/foods"));
    const orders = await get(ref(database, "tfc/orders"));
    const users = await get(ref(database, "tfc/users"));

    let revenue = 0;

    if (orders.exists()) {
        const ordersData = orders.val();
        
        Object.values(ordersData).forEach(order => {
            if (order.status?.toLowerCase() === "delivered") {
                revenue += Number(order.total || 0);
            }
        });
    }

    return {
        success: true,
        stats: {
            foods: foods.exists() ? Object.keys(foods.val()).length : 0,
            orders: orders.exists() ? Object.keys(orders.val()).length : 0,
            users: users.exists() ? Object.keys(users.val()).length : 0,
            revenue
        }
    };
};

/* ------------------ UTILITY ------------------ */

export const listenToUsers = (callback) => {
    if (!database) return () => {};
    const usersRef = ref(database, "tfc/users");
    return onValue(usersRef, (snap) => {
        if (!snap.exists()) return callback([]);
        const data = snap.val();
        const users = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        callback(users);
    });
};

export const generateUserId = (email) => {
    return email.replace(/\./g, '_').replace(/@/g, '_at_');
};
// Delete customer and all related data
export const deleteCustomer = async (userId, userEmail) => {
    if (!database) throw new Error('Database not available');
    
    try {
        // Delete user data
        await remove(ref(database, `tfc/users/${userId}`));
        
        // Delete user's cart
        await remove(ref(database, `tfc/carts/${userId}`));
        
        // Delete user's orders (optional - you might want to keep orders for business records)
        // Uncomment the lines below if you want to delete orders too
        // const ordersRef = ref(database, "tfc/orders");
        // const ordersSnapshot = await get(ordersRef);
        // if (ordersSnapshot.exists()) {
        //     const orders = ordersSnapshot.val();
        //     const userOrderIds = Object.keys(orders).filter(orderId => 
        //         orders[orderId].email === userEmail
        //     );
        //     for (const orderId of userOrderIds) {
        //         await remove(ref(database, `tfc/orders/${orderId}`));
        //     }
        // }
        
        return { success: true };
    } catch (error) {
        console.error('Error deleting customer:', error);
        return { success: false, error: error.message };
    }
};
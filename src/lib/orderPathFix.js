import { database } from './firebase';
import { ref, get, set, remove } from 'firebase/database';

// Function to check and fix order paths
export const checkAndFixOrderPaths = async () => {
    try {
        console.log('🔍 Checking for misplaced orders...');
        
        // Get all data from root
        const rootRef = ref(database, '/');
        const rootSnapshot = await get(rootRef);
        
        if (!rootSnapshot.exists()) {
            console.log('✅ No data at root level');
            return { success: true, message: 'No misplaced orders found' };
        }
        
        const rootData = rootSnapshot.val();
        const misplacedOrders = [];
        
        // Look for order-like objects at root level
        for (const [key, value] of Object.entries(rootData)) {
            // Skip the 'tfc' node and other expected root nodes
            if (key === 'tfc' || typeof value !== 'object' || !value) {
                continue;
            }
            
            // Check if this looks like an order (has order-like properties)
            if (value.customer && value.email && value.items && value.total) {
                misplacedOrders.push({ key, order: value });
                console.log(`📋 Found misplaced order: ${key} (Customer: ${value.customer})`);
            }
        }
        
        if (misplacedOrders.length === 0) {
            console.log('✅ No misplaced orders found');
            return { success: true, message: 'No misplaced orders found' };
        }
        
        console.log(`🔧 Found ${misplacedOrders.length} misplaced orders. Moving to correct path...`);
        
        // Move misplaced orders to correct path
        const tfcOrdersRef = ref(database, 'tfc/orders');
        
        for (const { key, order } of misplacedOrders) {
            try {
                // Add to correct path
                const newOrderRef = ref(database, `tfc/orders/${key}`);
                await set(newOrderRef, order);
                
                // Remove from wrong path
                const oldOrderRef = ref(database, key);
                await remove(oldOrderRef);
                
                console.log(`✅ Moved order ${key} to tfc/orders/${key}`);
            } catch (error) {
                console.error(`❌ Failed to move order ${key}:`, error);
            }
        }
        
        console.log('🎉 Order path cleanup completed!');
        return { 
            success: true, 
            message: `Moved ${misplacedOrders.length} orders to correct path`,
            movedOrders: misplacedOrders.length
        };
        
    } catch (error) {
        console.error('❌ Error checking order paths:', error);
        return { success: false, error: error.message };
    }
};

// Function to verify current placeOrder is working correctly
export const testOrderPlacement = async () => {
    try {
        console.log('🧪 Testing order placement path...');
        
        const testOrder = {
            userId: 'test_user',
            customer: 'Test Customer',
            phone: '+91 9999999999',
            email: 'test@example.com',
            address: 'Test Address',
            items: [{ id: 'test', name: 'Test Item', price: 100, quantity: 1 }],
            total: 100,
            paymentMethod: 'test'
        };
        
        // Import placeOrder function
        const { placeOrder } = await import('./firebaseHelpers');
        
        // Place test order
        const result = await placeOrder(testOrder);
        
        if (result.success) {
            console.log('✅ Test order placed successfully at correct path');
            console.log('📍 Order ID:', result.orderId);
            
            // Verify it's in the correct location
            const orderRef = ref(database, `tfc/orders/${result.orderId}`);
            const orderSnapshot = await get(orderRef);
            
            if (orderSnapshot.exists()) {
                console.log('✅ Test order verified at tfc/orders/' + result.orderId);
                
                // Clean up test order
                await remove(orderRef);
                console.log('🗑️ Test order cleaned up');
                
                return { success: true, message: 'Order placement working correctly' };
            } else {
                console.log('❌ Test order not found at expected path');
                return { success: false, error: 'Order not found at expected path' };
            }
        } else {
            console.log('❌ Test order placement failed:', result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error('❌ Error testing order placement:', error);
        return { success: false, error: error.message };
    }
};

// Function to get current database structure
export const getDatabaseStructure = async () => {
    try {
        const rootRef = ref(database, '/');
        const snapshot = await get(rootRef);
        
        if (!snapshot.exists()) {
            return { success: true, structure: {} };
        }
        
        const data = snapshot.val();
        const structure = {};
        
        // Get top-level keys and their types
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && value !== null) {
                structure[key] = Object.keys(value).length + ' items';
            } else {
                structure[key] = typeof value;
            }
        }
        
        return { success: true, structure };
    } catch (error) {
        console.error('Error getting database structure:', error);
        return { success: false, error: error.message };
    }
};
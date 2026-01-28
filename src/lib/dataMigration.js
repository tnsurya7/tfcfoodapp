import { addFood, saveUser, addToCart, placeOrder, getAllFoods, getAllOrders, getUserOrders } from './firebaseHelpers';
import { generateUserId } from './firebaseHelpers';
import toast from './toast';

// Migration status tracking
let migrationInProgress = false;
let migrationCompleted = false;

// Migration utility to convert localStorage data to Firebase
export const migrateLocalStorageToFirebase = async (options = {}) => {
    const { 
        skipIfExists = true, 
        showLogs = true,
        autoMigrate = false 
    } = options;

    if (migrationInProgress) {
        console.log('⏳ Migration already in progress...');
        return { success: false, error: 'Migration already in progress' };
    }

    if (migrationCompleted && !options.force) {
        console.log('✅ Migration already completed this session');
        return { success: true, message: 'Already migrated' };
    }

    migrationInProgress = true;

    try {
        if (showLogs) console.log('🔄 Starting localStorage to Firebase migration...');
        
        let migrationResults = {
            foods: 0,
            users: 0,
            cartItems: 0,
            orders: 0,
            errors: [],
            skipped: []
        };

        // 1. Migrate Food Store Data
        await migrateFoodData(migrationResults, skipIfExists, showLogs);

        // 2. Migrate User Data (Email Auth Context)
        await migrateUserData(migrationResults, skipIfExists, showLogs);

        // 3. Migrate Cart Store Data (requires user to be migrated first)
        await migrateCartData(migrationResults, skipIfExists, showLogs);

        // 4. Migrate Order Store Data
        await migrateOrderData(migrationResults, skipIfExists, showLogs);

        // 5. Migrate Customer Store Data
        await migrateCustomerData(migrationResults, skipIfExists, showLogs);

        // Display migration results
        if (showLogs) {
            console.log('✅ Migration completed!');
            console.log('📊 Migration Results:', migrationResults);
        }
        
        const totalMigrated = migrationResults.foods + migrationResults.users + 
                            migrationResults.cartItems + migrationResults.orders;

        if (totalMigrated > 0) {
            const successMessage = `Migration completed! Foods: ${migrationResults.foods}, Users: ${migrationResults.users}, Cart Items: ${migrationResults.cartItems}, Orders: ${migrationResults.orders}`;
            
            if (migrationResults.errors.length > 0) {
                console.warn('⚠️ Migration errors:', migrationResults.errors);
                if (!autoMigrate) {
                    toast.error(`Migration completed with ${migrationResults.errors.length} errors. Check console for details.`);
                }
            } else {
                if (!autoMigrate) {
                    toast.success(successMessage);
                }
            }
        } else if (showLogs) {
            console.log('ℹ️ No data found to migrate');
        }

        migrationCompleted = true;
        return { success: true, results: migrationResults };

    } catch (error) {
        console.error('❌ Migration failed:', error);
        if (!autoMigrate) {
            toast.error('Migration failed. Check console for details.');
        }
        return { success: false, error: error.message };
    } finally {
        migrationInProgress = false;
    }
};

// Migrate food data
const migrateFoodData = async (results, skipIfExists, showLogs) => {
    const foodStorage = localStorage.getItem('food-storage');
    if (!foodStorage) return;

    try {
        const foodData = JSON.parse(foodStorage);
        if (foodData.state && foodData.state.foods && Array.isArray(foodData.state.foods)) {
            if (showLogs) console.log(`📦 Found ${foodData.state.foods.length} food items in localStorage`);
            
            // Check if Firebase already has food data
            if (skipIfExists) {
                const existingFoods = await getAllFoods();
                if (existingFoods.success && existingFoods.foods && existingFoods.foods.length > 0) {
                    if (showLogs) console.log('🔄 Firebase already has food data, skipping migration');
                    results.skipped.push(`Foods (${existingFoods.foods.length} items already exist)`);
                    return;
                }
            }
            
            for (const food of foodData.state.foods) {
                const { id, ...foodWithoutId } = food; // Remove local ID
                const result = await addFood(foodWithoutId);
                if (result.success) {
                    results.foods++;
                    if (showLogs) console.log(`✅ Migrated food: ${food.name}`);
                } else {
                    results.errors.push(`Failed to migrate food: ${food.name} - ${result.error}`);
                }
            }
        }
    } catch (error) {
        results.errors.push(`Food migration error: ${error.message}`);
    }
};

// Migrate user data
const migrateUserData = async (results, skipIfExists, showLogs) => {
    const emailAuthStorage = localStorage.getItem('tfc_user_data');
    if (!emailAuthStorage) return;

    try {
        const user = JSON.parse(emailAuthStorage);
        if (user && user.email) {
            if (showLogs) console.log(`👤 Found user data for: ${user.email}`);
            
            const userData = {
                name: user.name,
                phone: user.phone,
                email: user.email
            };
            
            const result = await saveUser(userData);
            if (result.success) {
                results.users++;
                if (showLogs) console.log(`✅ Migrated user: ${user.email}`);
            } else {
                // User might already exist, which is okay
                if (result.error && !result.error.includes('already exists')) {
                    results.errors.push(`Failed to migrate user: ${user.email} - ${result.error}`);
                } else {
                    results.skipped.push(`User ${user.email} (already exists)`);
                }
            }
        }
    } catch (error) {
        results.errors.push(`User migration error: ${error.message}`);
    }
};

// Migrate cart data
const migrateCartData = async (results, skipIfExists, showLogs) => {
    const cartStorage = localStorage.getItem('tfc-cart-storage');
    if (!cartStorage) return;

    try {
        const cartData = JSON.parse(cartStorage);
        if (cartData.state && cartData.state.items && Array.isArray(cartData.state.items)) {
            if (showLogs) console.log(`🛒 Found ${cartData.state.items.length} cart items in localStorage`);
            
            // Get current user from localStorage
            const currentUser = getCurrentUserFromStorage();
            if (currentUser && currentUser.email) {
                const userId = generateUserId(currentUser.email);
                
                for (const item of cartData.state.items) {
                    const cartItem = {
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        qty: item.quantity || 1
                    };
                    
                    const result = await addToCart(userId, cartItem);
                    if (result.success) {
                        results.cartItems++;
                        if (showLogs) console.log(`✅ Migrated cart item: ${item.name}`);
                    } else {
                        results.errors.push(`Failed to migrate cart item: ${item.name} - ${result.error}`);
                    }
                }
            } else {
                results.errors.push('Cannot migrate cart: No current user found');
            }
        }
    } catch (error) {
        results.errors.push(`Cart migration error: ${error.message}`);
    }
};

// Migrate order data
const migrateOrderData = async (results, skipIfExists, showLogs) => {
    const orderStorage = localStorage.getItem('order-storage');
    if (!orderStorage) return;

    try {
        const orderData = JSON.parse(orderStorage);
        if (orderData.state && orderData.state.orders && Array.isArray(orderData.state.orders)) {
            if (showLogs) console.log(`📋 Found ${orderData.state.orders.length} orders in localStorage`);
            
            for (const order of orderData.state.orders) {
                const orderToMigrate = {
                    userId: order.email ? generateUserId(order.email) : 'unknown',
                    customer: order.customer,
                    phone: order.phone,
                    email: order.email,
                    address: order.address,
                    items: order.items.map(item => ({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    })),
                    total: order.total,
                    paymentMethod: order.paymentMethod || 'cod'
                };
                
                const result = await placeOrder(orderToMigrate);
                if (result.success) {
                    results.orders++;
                    if (showLogs) console.log(`✅ Migrated order: ${order.id || 'unknown'}`);
                } else {
                    results.errors.push(`Failed to migrate order: ${order.id || 'unknown'} - ${result.error}`);
                }
            }
        }
    } catch (error) {
        results.errors.push(`Order migration error: ${error.message}`);
    }
};

// Migrate customer data
const migrateCustomerData = async (results, skipIfExists, showLogs) => {
    const customerStorage = localStorage.getItem('customer-storage');
    if (!customerStorage) return;

    try {
        const customerData = JSON.parse(customerStorage);
        if (customerData.state && customerData.state.customers) {
            if (showLogs) console.log(`👥 Found customer data in localStorage`);
            // Customer data is typically handled through user migration
            // This is mainly for completeness
        }
    } catch (error) {
        results.errors.push(`Customer migration error: ${error.message}`);
    }
};

// Helper function to get current user from localStorage
const getCurrentUserFromStorage = () => {
    try {
        const userData = localStorage.getItem('tfc_user_data');
        if (userData) {
            return JSON.parse(userData);
        }
    } catch (error) {
        console.warn('Could not get current user from storage:', error);
    }
    return null;
};

// Clear localStorage after successful migration
export const clearLocalStorageAfterMigration = () => {
    const confirmation = confirm(
        'Migration completed successfully! Do you want to clear the old localStorage data? This action cannot be undone.'
    );
    
    if (confirmation) {
        // Clear Zustand stores
        localStorage.removeItem('food-storage');
        localStorage.removeItem('tfc-cart-storage');
        localStorage.removeItem('order-storage');
        localStorage.removeItem('customer-storage');
        
        // Keep authentication data
        // localStorage.removeItem('tfc_user_data'); // Keep for auth
        // localStorage.removeItem('tfc_registered_users'); // Keep for returning users
        
        toast.success('localStorage data cleared successfully!');
        console.log('🗑️ Old localStorage data cleared');
        
        // Reset migration status
        migrationCompleted = false;
        
        // Reload page to ensure fresh start with Firebase data
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
};

// Check if migration is needed
export const checkMigrationNeeded = () => {
    const foodStorage = localStorage.getItem('food-storage');
    const cartStorage = localStorage.getItem('tfc-cart-storage');
    const orderStorage = localStorage.getItem('order-storage');
    const customerStorage = localStorage.getItem('customer-storage');
    
    return !!(foodStorage || cartStorage || orderStorage || customerStorage);
};

// Auto-migration on app start
export const autoMigrateIfNeeded = async () => {
    if (checkMigrationNeeded() && !migrationCompleted) {
        console.log('📦 localStorage data detected. Starting auto-migration...');
        const result = await migrateLocalStorageToFirebase({ 
            autoMigrate: true, 
            showLogs: true,
            skipIfExists: true 
        });
        
        if (result.success && result.results) {
            const totalMigrated = result.results.foods + result.results.users + 
                                result.results.cartItems + result.results.orders;
            
            if (totalMigrated > 0) {
                // Show option to clear localStorage after successful migration
                setTimeout(() => {
                    const shouldClear = confirm(
                        `Data migration completed! Migrated ${totalMigrated} items to Firebase.\n\nWould you like to clear the old localStorage data to prevent conflicts?`
                    );
                    if (shouldClear) {
                        clearLocalStorageAfterMigration();
                    }
                }, 3000);
            }
        }
    }
};

// Reset migration status (for testing)
export const resetMigrationStatus = () => {
    migrationInProgress = false;
    migrationCompleted = false;
};
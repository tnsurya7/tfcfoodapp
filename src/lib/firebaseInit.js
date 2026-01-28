import { initializeDefaultAdmin, getDatabaseStats } from './firebaseHelpers';

// Initialize Firebase database with default data
export const initializeFirebaseDatabase = async () => {
    try {
        console.log('🔥 Initializing Firebase Database...');
        
        // 1. Initialize default admin
        console.log('👤 Setting up default admin...');
        const adminResult = await initializeDefaultAdmin();
        if (adminResult.success) {
            console.log('✅ Default admin created successfully');
        } else {
            console.log('ℹ️ Admin already exists or error:', adminResult.error);
        }
        
        // 2. Display current stats
        console.log('📊 Checking database statistics...');
        const finalStats = await getDatabaseStats();
        if (finalStats.success) {
            console.log('📊 Database Statistics:');
            console.log(`   Users: ${finalStats.stats.totalUsers}`);
            console.log(`   Foods: ${finalStats.stats.totalFoods}`);
            console.log(`   Orders: ${finalStats.stats.totalOrders}`);
            console.log(`   Revenue: ₹${finalStats.stats.totalRevenue}`);
        }
        
        console.log('🎉 Firebase Database initialization complete!');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return { success: false, error: error.message };
    }
};

// Reset database (use with caution)
export const resetDatabase = async () => {
    console.warn('⚠️ Database reset is not implemented for safety reasons');
    console.warn('⚠️ Please manually delete data from Firebase Console if needed');
    return { success: false, error: 'Manual reset required' };
};

// Health check
export const checkFirebaseHealth = async () => {
    try {
        const stats = await getDatabaseStats();
        return {
            success: true,
            healthy: true,
            stats: stats.stats,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            success: false,
            healthy: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};
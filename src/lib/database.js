import { getDatabase, ref, set, get, child } from 'firebase/database';
import { app } from './firebase';

const database = getDatabase(app);

// Save user to Firebase Realtime Database
export const saveUserToDatabase = async (userData) => {
    try {
        const userRef = ref(database, `tfc/users/${userData.email.replace(/\./g, '_')}`);
        await set(userRef, {
            name: userData.name,
            phone: userData.phone,
            email: userData.email,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Error saving user to database:', error);
        return { success: false, error: error.message };
    }
};

// Get user from Firebase Realtime Database
export const getUserFromDatabase = async (email) => {
    try {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `tfc/users/${email.replace(/\./g, '_')}`));
        
        if (snapshot.exists()) {
            return { success: true, user: snapshot.val() };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Error getting user from database:', error);
        return { success: false, error: error.message };
    }
};

// Update user last login
export const updateUserLastLogin = async (email) => {
    try {
        const userRef = ref(database, `tfc/users/${email.replace(/\./g, '_')}/lastLogin`);
        await set(userRef, new Date().toISOString());
        return { success: true };
    } catch (error) {
        console.error('Error updating last login:', error);
        return { success: false, error: error.message };
    }
};
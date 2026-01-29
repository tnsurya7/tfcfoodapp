"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, saveUser, updateUserLastLogin, generateUserId } from '@/lib/firebaseHelpers';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';

const EmailAuthContext = createContext();

export const useEmailAuth = () => {
    const context = useContext(EmailAuthContext);
    if (!context) {
        throw new Error('useEmailAuth must be used within an EmailAuthProvider');
    }
    return context;
};

export const EmailAuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Restore user session from localStorage on app startup
        const restoreUserSession = async () => {
            try {
                const savedUserId = localStorage.getItem('tfc_user');
                if (!savedUserId) {
                    setLoading(false);
                    return;
                }

                // Fetch user data from Firebase using saved userId
                const userRef = ref(database, `tfc/users/${savedUserId}`);
                const snapshot = await get(userRef);
                
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setCurrentUser(userData);
                    // Update last login
                    await updateUserLastLogin(userData.email);
                    console.log('✅ User session restored:', userData.name);
                } else {
                    // User data not found in Firebase, clear localStorage
                    localStorage.removeItem('tfc_user');
                    console.log('❌ User data not found, cleared session');
                }
            } catch (error) {
                console.error('Error restoring user session:', error);
                localStorage.removeItem('tfc_user');
            } finally {
                setLoading(false);
            }
        };

        restoreUserSession();
    }, []);

    const login = async (userData) => {
        try {
            // Save user to Firebase Realtime Database
            const result = await saveUser(userData);
            if (result.success) {
                setCurrentUser(result.user);
                
                // Store userId in localStorage for persistent login
                const userId = generateUserId(userData.email);
                localStorage.setItem('tfc_user', userId);
                
                console.log('✅ User logged in and session saved:', result.user.name);
            }
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setCurrentUser(null);
            // Clear persistent session
            localStorage.removeItem('tfc_user');
            console.log('✅ User logged out and session cleared');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const isAuthenticated = () => {
        return currentUser !== null;
    };

    const value = {
        currentUser,
        loading,
        login,
        logout,
        isAuthenticated
    };

    return (
        <EmailAuthContext.Provider value={value}>
            {children}
        </EmailAuthContext.Provider>
    );
};
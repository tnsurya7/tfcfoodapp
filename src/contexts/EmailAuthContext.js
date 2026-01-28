"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, saveUser } from '@/lib/firebaseHelpers';

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
        // Check if user is logged in on component mount
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            // Check sessionStorage for current session only
            const userEmail = sessionStorage.getItem('tfc_user_email');
            if (userEmail) {
                // Fetch user data from Firebase
                const result = await getUser(userEmail);
                if (result.success) {
                    setCurrentUser(result.user);
                } else {
                    // User not found in Firebase, clear session
                    sessionStorage.removeItem('tfc_user_email');
                }
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            sessionStorage.removeItem('tfc_user_email');
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData) => {
        try {
            // Save user to Firebase
            const result = await saveUser(userData);
            if (result.success) {
                setCurrentUser(result.user);
                // Store only email in sessionStorage for current session
                sessionStorage.setItem('tfc_user_email', userData.email);
            }
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    };

    const logout = () => {
        setCurrentUser(null);
        sessionStorage.removeItem('tfc_user_email');
    };

    const isAuthenticated = () => {
        return currentUser !== null;
    };

    const value = {
        currentUser,
        loading,
        login,
        logout,
        isAuthenticated,
        checkAuthState
    };

    return (
        <EmailAuthContext.Provider value={value}>
            {children}
        </EmailAuthContext.Provider>
    );
};
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { updateUserLastLogin } from '@/lib/firebaseHelpers';

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
            // Check localStorage for persistent login
            const userData = localStorage.getItem('tfc_user');
            if (userData) {
                const user = JSON.parse(userData);
                setCurrentUser(user);
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            localStorage.removeItem('tfc_user');
        } finally {
            setLoading(false);
        }
    };

    const login = async (userData) => {
        setCurrentUser(userData);
        
        // Save to localStorage immediately for persistent login
        localStorage.setItem('tfc_user', JSON.stringify(userData));
        
        // Save to Firebase (don't wait for it)
        try {
            const { saveUser } = await import('@/lib/firebaseHelpers');
            await saveUser(userData);
        } catch (error) {
            console.error('Error saving user to Firebase:', error);
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('tfc_user');
        localStorage.removeItem('tfc_otp_data');
        localStorage.removeItem('tfc_last_otp_request');
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
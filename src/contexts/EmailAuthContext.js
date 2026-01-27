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

    const checkAuthState = () => {
        try {
            const userData = localStorage.getItem('tfc_user_data');
            if (userData) {
                const user = JSON.parse(userData);
                setCurrentUser(user);
                // Update last login in database (don't wait for it)
                updateUserLastLogin(user.email).catch(console.error);
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            // Clear invalid data
            localStorage.removeItem('tfc_user_data');
        } finally {
            setLoading(false);
        }
    };

    const login = (userData) => {
        setCurrentUser(userData);
        localStorage.setItem('tfc_user_data', JSON.stringify(userData));
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('tfc_user_data');
        localStorage.removeItem('tfc_otp_data');
        localStorage.removeItem('tfc_last_otp_request');
        // Note: We keep 'tfc_registered_users' so returning users don't need OTP
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
"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, saveUser, updateUserLastLogin } from '@/lib/firebaseHelpers';

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
        // Check if user is already logged in (session storage for current session)
        const userSession = sessionStorage.getItem('tfc_user_session');
        if (userSession) {
            try {
                const userData = JSON.parse(userSession);
                setCurrentUser(userData);
                // Update last login
                updateUserLastLogin(userData.email).catch(console.error);
            } catch (error) {
                console.error('Error parsing user session:', error);
                sessionStorage.removeItem('tfc_user_session');
            }
        }
        setLoading(false);
    }, []);

    const login = async (userData) => {
        try {
            // Save user to Firebase Realtime Database
            const result = await saveUser(userData);
            if (result.success) {
                setCurrentUser(result.user);
                // Store user session data (persists during browser session)
                sessionStorage.setItem('tfc_user_session', JSON.stringify(result.user));
            }
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setCurrentUser(null);
            sessionStorage.removeItem('tfc_user_session');
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
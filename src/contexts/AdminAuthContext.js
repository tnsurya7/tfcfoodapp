"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if admin is already logged in (session storage for current session)
        const adminSession = sessionStorage.getItem('adminSession');
        if (adminSession) {
            try {
                const adminData = JSON.parse(adminSession);
                setCurrentAdmin(adminData);
            } catch (error) {
                console.error('Error parsing admin session:', error);
                sessionStorage.removeItem('adminSession');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Check credentials against environment variables
            if (username !== process.env.NEXT_PUBLIC_ADMIN_USERNAME || 
                password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
                throw new Error('Invalid admin credentials');
            }

            // Create admin session data
            const adminData = {
                username: username,
                isAdmin: true,
                loginTime: new Date().toISOString()
            };

            // Store in session storage (persists during browser session)
            sessionStorage.setItem('adminSession', JSON.stringify(adminData));
            
            setCurrentAdmin(adminData);
            
            return { success: true };
        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setCurrentAdmin(null);
            sessionStorage.removeItem('adminSession');
        } catch (error) {
            console.error('Error logging out admin:', error);
        }
    };

    const isAuthenticated = () => {
        return currentAdmin !== null && currentAdmin.isAdmin === true;
    };

    const value = {
        currentAdmin,
        loading,
        login,
        logout,
        isAuthenticated
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};
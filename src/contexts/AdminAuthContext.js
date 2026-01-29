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
        // Restore admin session from localStorage on app startup
        const restoreAdminSession = () => {
            try {
                const savedAdmin = localStorage.getItem('tfc_admin');
                if (savedAdmin) {
                    const adminData = JSON.parse(savedAdmin);
                    // Verify the session is still valid (optional: add expiry check here)
                    if (adminData.isAdmin && adminData.username) {
                        setCurrentAdmin(adminData);
                        console.log('✅ Admin session restored:', adminData.username);
                    } else {
                        localStorage.removeItem('tfc_admin');
                    }
                }
            } catch (error) {
                console.error('Error restoring admin session:', error);
                localStorage.removeItem('tfc_admin');
            } finally {
                setLoading(false);
            }
        };

        restoreAdminSession();
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

            // Store in localStorage for persistent login
            localStorage.setItem('tfc_admin', JSON.stringify(adminData));
            
            setCurrentAdmin(adminData);
            
            console.log('✅ Admin logged in and session saved:', username);
            
            return { success: true };
        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setCurrentAdmin(null);
            // Clear persistent session
            localStorage.removeItem('tfc_admin');
            console.log('✅ Admin logged out and session cleared');
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
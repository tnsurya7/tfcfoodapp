"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
        if (!auth) {
            setLoading(false);
            return;
        }

        // Listen to Firebase auth state changes for admin
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Check if this is an admin user
                const isAdmin = localStorage.getItem('isAdmin');
                if (isAdmin === 'true') {
                    setCurrentAdmin({
                        uid: user.uid,
                        email: user.email,
                        isAdmin: true
                    });
                } else {
                    setCurrentAdmin(null);
                }
            } else {
                setCurrentAdmin(null);
                localStorage.removeItem('isAdmin');
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (username, password) => {
        try {
            // Check credentials against environment variables
            if (username !== process.env.NEXT_PUBLIC_ADMIN_USERNAME || 
                password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
                throw new Error('Invalid admin credentials');
            }

            // Create a unique admin email for Firebase Auth
            const adminEmail = `admin@${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.com`;
            
            try {
                // Try to sign in first
                const userCredential = await signInWithEmailAndPassword(auth, adminEmail, password);
                
                // Mark as admin in localStorage
                localStorage.setItem('isAdmin', 'true');
                
                setCurrentAdmin({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    isAdmin: true
                });
                
                return { success: true };
            } catch (signInError) {
                // If sign in fails, try to create the admin account
                if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
                    try {
                        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, password);
                        
                        // Mark as admin in localStorage
                        localStorage.setItem('isAdmin', 'true');
                        
                        setCurrentAdmin({
                            uid: userCredential.user.uid,
                            email: userCredential.user.email,
                            isAdmin: true
                        });
                        
                        return { success: true };
                    } catch (createError) {
                        console.error('Error creating admin account:', createError);
                        throw createError;
                    }
                } else {
                    throw signInError;
                }
            }
        } catch (error) {
            console.error('Admin login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setCurrentAdmin(null);
            localStorage.removeItem('isAdmin');
            
            // Sign out from Firebase Auth
            await signOut(auth);
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
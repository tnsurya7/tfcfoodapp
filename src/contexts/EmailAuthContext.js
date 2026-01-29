"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
    const [firebaseUser, setFirebaseUser] = useState(null);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            
            if (user) {
                // User is signed in, check if we have their profile data
                const userEmail = localStorage.getItem('tfc_user_email');
                if (userEmail) {
                    try {
                        const result = await getUser(userEmail);
                        if (result.success) {
                            setCurrentUser(result.user);
                            // Update last login
                            await updateUserLastLogin(userEmail);
                        } else {
                            // User data not found, clear storage
                            localStorage.removeItem('tfc_user_email');
                            setCurrentUser(null);
                        }
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                        localStorage.removeItem('tfc_user_email');
                        setCurrentUser(null);
                    }
                }
            } else {
                // User is signed out
                setCurrentUser(null);
                localStorage.removeItem('tfc_user_email');
            }
            
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (userData) => {
        try {
            // First, sign in anonymously to Firebase Auth for session persistence
            if (!firebaseUser) {
                await signInAnonymously(auth);
            }
            
            // Save user to Firebase Realtime Database
            const result = await saveUser(userData);
            if (result.success) {
                setCurrentUser(result.user);
                // Store email in localStorage for persistent login
                localStorage.setItem('tfc_user_email', userData.email);
            }
        } catch (error) {
            console.error('Error logging in user:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setCurrentUser(null);
            localStorage.removeItem('tfc_user_email');
            
            // Sign out from Firebase Auth
            if (firebaseUser) {
                await signOut(auth);
            }
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
        isAuthenticated,
        firebaseUser
    };

    return (
        <EmailAuthContext.Provider value={value}>
            {children}
        </EmailAuthContext.Provider>
    );
};
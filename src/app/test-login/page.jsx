"use client";

import { useState } from "react";
import { useEmailAuth } from "@/contexts/EmailAuthContext";

export default function TestLoginPage() {
    const { currentUser, logout } = useEmailAuth();
    const [userData, setUserData] = useState(null);

    const checkLocalStorage = () => {
        const data = localStorage.getItem('tfc_user_data');
        setUserData(data ? JSON.parse(data) : null);
    };

    const clearAllData = () => {
        localStorage.removeItem('tfc_user_data');
        localStorage.removeItem('tfc_otp_data');
        localStorage.removeItem('tfc_last_otp_request');
        logout();
        setUserData(null);
        alert('All login data cleared!');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-3xl font-bold mb-8">Login Test Page</h1>
                
                <div className="space-y-6">
                    {/* Current Auth State */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Current Auth State</h2>
                        <div className="space-y-2">
                            <p><strong>Context User:</strong> {currentUser ? currentUser.name : 'Not logged in'}</p>
                            <p><strong>Email:</strong> {currentUser ? currentUser.email : 'N/A'}</p>
                            <p><strong>Phone:</strong> {currentUser ? currentUser.phone : 'N/A'}</p>
                        </div>
                    </div>

                    {/* LocalStorage Data */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">LocalStorage Data</h2>
                        <button 
                            onClick={checkLocalStorage}
                            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                        >
                            Check LocalStorage
                        </button>
                        <div className="space-y-2">
                            <p><strong>Stored User:</strong> {userData ? userData.name : 'None'}</p>
                            <p><strong>Email:</strong> {userData ? userData.email : 'N/A'}</p>
                            <p><strong>Phone:</strong> {userData ? userData.phone : 'N/A'}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Actions</h2>
                        <div className="space-x-4">
                            <button 
                                onClick={clearAllData}
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Clear All Data
                            </button>
                            <a 
                                href="/login?force=true"
                                className="bg-green-500 text-white px-4 py-2 rounded inline-block"
                            >
                                Go to Login (Force)
                            </a>
                            <a 
                                href="/login"
                                className="bg-blue-500 text-white px-4 py-2 rounded inline-block"
                            >
                                Go to Login (Normal)
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
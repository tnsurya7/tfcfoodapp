"use client";

import { useState } from 'react';
import { initializeFirebaseDatabase, checkFirebaseHealth } from '@/lib/firebaseInit';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import toast from '@/lib/toast';

export default function FirebaseInit() {
    const [loading, setLoading] = useState(false);
    const [health, setHealth] = useState(null);

    const handleInitialize = async () => {
        setLoading(true);
        try {
            const result = await initializeFirebaseDatabase();
            if (result.success) {
                toast.success('Firebase database initialized successfully!');
                await checkHealth();
            } else {
                toast.error('Failed to initialize database');
            }
        } catch (error) {
            toast.error('Error initializing database');
        } finally {
            setLoading(false);
        }
    };

    const checkHealth = async () => {
        try {
            const healthResult = await checkFirebaseHealth();
            setHealth(healthResult);
            if (healthResult.healthy) {
                toast.success('Database is healthy');
            } else {
                toast.error('Database health check failed');
            }
        } catch (error) {
            toast.error('Error checking database health');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-6">
                <Database className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Firebase Database Setup</h2>
            </div>

            <div className="space-y-4">
                {/* Initialize Button */}
                <button
                    onClick={handleInitialize}
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Initializing...</span>
                        </>
                    ) : (
                        <>
                            <Database className="w-4 h-4" />
                            <span>Initialize Database</span>
                        </>
                    )}
                </button>

                {/* Health Check Button */}
                <button
                    onClick={checkHealth}
                    className="btn-outline flex items-center space-x-2"
                >
                    <CheckCircle className="w-4 h-4" />
                    <span>Check Health</span>
                </button>

                {/* Health Status */}
                {health && (
                    <div className={`p-4 rounded-lg border ${
                        health.healthy 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex items-center space-x-2 mb-2">
                            {health.healthy ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-medium ${
                                health.healthy ? 'text-green-800' : 'text-red-800'
                            }`}>
                                Database {health.healthy ? 'Healthy' : 'Unhealthy'}
                            </span>
                        </div>
                        
                        {health.stats && (
                            <div className="text-sm space-y-1">
                                <p><strong>Users:</strong> {health.stats.totalUsers}</p>
                                <p><strong>Foods:</strong> {health.stats.totalFoods}</p>
                                <p><strong>Orders:</strong> {health.stats.totalOrders}</p>
                                <p><strong>Revenue:</strong> ₹{health.stats.totalRevenue}</p>
                            </div>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-2">
                            Last checked: {new Date(health.timestamp).toLocaleString()}
                        </p>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-800 mb-2">Setup Instructions:</h3>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Click "Initialize Database" to set up default admin and sample foods</li>
                        <li>Admin credentials are configured via environment variables</li>
                        <li>Use "Check Health" to monitor database status</li>
                        <li>View Firebase Console for detailed database structure</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
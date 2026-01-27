'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from '@/lib/toast';

export default function AdminPage() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        // Check if already logged in
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (isLoggedIn === 'true') {
            router.push('/admin/dashboard');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate login delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simple authentication (in production, use proper backend authentication)
        if (credentials.username === process.env.NEXT_PUBLIC_ADMIN_USERNAME && credentials.password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            toast.success('Login successful!');
            router.push('/admin/dashboard');
        } else {
            toast.error('Invalid credentials');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-red-900 flex items-center justify-center py-20 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
                    <p className="text-gray-600">
                        Enter your credentials to access the admin panel
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) =>
                                    setCredentials({ ...credentials, username: e.target.value })
                                }
                                className="input-field pl-11"
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={credentials.password}
                                onChange={(e) =>
                                    setCredentials({ ...credentials, password: e.target.value })
                                }
                                className="input-field pl-11 pr-11"
                                placeholder="Enter password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

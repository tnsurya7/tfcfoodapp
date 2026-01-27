'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
    User, 
    Package, 
    Clock, 
    CheckCircle, 
    Truck, 
    X, 
    Phone, 
    Mail, 
    MapPin,
    Calendar,
    IndianRupee
} from 'lucide-react';
import Link from 'next/link';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import EmailProtectedRoute from '@/components/auth/EmailProtectedRoute';
import { useOrderStore } from '@/store/orderStore';
import OrderTracker from '@/components/orders/OrderTracker';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import toast from "@/lib/toast";

export default function ProfilePage() {
    return (
        <EmailProtectedRoute>
            <ProfileContent />
        </EmailProtectedRoute>
    );
}

function ProfileContent() {
    const router = useRouter();
    const { currentUser: emailUser, logout } = useEmailAuth();
    const { orders } = useOrderStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');

    // Enable order notifications
    useOrderNotifications();

    // Filter orders for current user
    const userOrders = orders.filter(order => 
        order.email === emailUser?.email
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        router.push('/');
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'preparing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'out for delivery':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'preparing':
                return <Package className="w-4 h-4" />;
            case 'out for delivery':
                return <Truck className="w-4 h-4" />;
            case 'delivered':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <X className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 60) {
            return `${diffInMinutes} mins ago`;
        } else if (diffInMinutes < 1440) {
            return `${Math.floor(diffInMinutes / 60)} hours ago`;
        } else {
            return `${Math.floor(diffInMinutes / 1440)} days ago`;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2 dark:text-white">
                                My Profile
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage your account and track your orders
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="btn-outline"
                        >
                            Back to Home
                        </Link>
                    </div>
                </motion.div>

                {/* User Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold dark:text-white">
                                    {emailUser?.name}
                                </h2>
                                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400 mt-1">
                                    <div className="flex items-center space-x-1">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{emailUser?.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{emailUser?.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-outline text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                        >
                            Logout
                        </button>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                                    activeTab === 'orders'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                My Orders ({userOrders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                                    activeTab === 'profile'
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                            >
                                Profile Details
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 dark:text-white">Order History</h2>
                                
                                {userOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                            No Orders Yet
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-500 mb-6">
                                            You haven't placed any orders yet. Start exploring our menu!
                                        </p>
                                        <Link href="/menu" className="btn-primary">
                                            Browse Menu
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {userOrders.map((order) => (
                                            <motion.div
                                                key={order.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <h3 className="font-bold dark:text-white text-lg">
                                                                Order #{order.id}
                                                            </h3>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                                                                {getStatusIcon(order.status)}
                                                                <span>{order.status}</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                                            <div className="flex items-center space-x-1">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>{formatTime(order.createdAt)}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <IndianRupee className="w-4 h-4" />
                                                                <span className="font-semibold">₹{order.total}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <Package className="w-4 h-4" />
                                                                <span>{order.items.length} items</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div className="mb-4">
                                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Items:</h4>
                                                    <div className="space-y-2">
                                                        {order.items.map((item, index) => (
                                                            <div key={index} className="flex justify-between items-center text-sm">
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    {item.name} x {item.quantity}
                                                                </span>
                                                                <span className="font-semibold dark:text-white">
                                                                    ₹{(item.price * item.quantity).toFixed(0)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Delivery Address */}
                                                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                                    <div className="flex items-start space-x-2">
                                                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                                Delivery Address:
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                {order.address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Status Progress */}
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Order Status:</h4>
                                                    <OrderTracker 
                                                        status={order.status}
                                                        createdAt={order.createdAt}
                                                        statusHistory={order.statusHistory || {}}
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 dark:text-white">Profile Details</h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name
                                            </label>
                                            <div className="input-field bg-gray-50 dark:bg-gray-700">
                                                {emailUser?.name}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <div className="input-field bg-gray-50 dark:bg-gray-700">
                                                {emailUser?.email}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="input-field bg-gray-50 dark:bg-gray-700">
                                                {emailUser?.phone}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-6">
                                            <h3 className="font-bold text-lg mb-4 dark:text-white">Order Statistics</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Total Orders:</span>
                                                    <span className="font-semibold dark:text-white">{userOrders.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Total Spent:</span>
                                                    <span className="font-semibold dark:text-white">
                                                        ₹{userOrders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Delivered Orders:</span>
                                                    <span className="font-semibold dark:text-white">
                                                        {userOrders.filter(order => order.status.toLowerCase() === 'delivered').length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <Link href="/menu" className="btn-primary w-full">
                                                Order More Food
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
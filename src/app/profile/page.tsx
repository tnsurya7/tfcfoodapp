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
import { getOrdersByUserId } from '@/lib/firebaseHelpers';
import OrderTracker from '@/components/orders/OrderTracker';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import toast from "@/lib/toast";
import ClientOnly from '@/components/ClientOnly';

function ProfileContent() {
    const router = useRouter();
    const { currentUser: emailUser, logout } = useEmailAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('orders');
    const [isLoading, setIsLoading] = useState(true);

    // Enable order notifications
    useOrderNotifications();

    // Load user orders when component mounts
    useEffect(() => {
        const loadOrders = async () => {
            if (emailUser?.email) {
                setIsLoading(true);
                try {
                    // Generate userId from email (same format as order creation)
                    const userId = emailUser.email.replace(/\./g, '_').replace(/@/g, '_at_');
                    console.log('🔍 Loading orders for userId:', userId);
                    
                    const res = await getOrdersByUserId(userId);
                    if (res.success && res.orders) {
                        console.log('📊 Found orders:', res.orders.length);
                        setOrders(res.orders);
                    } else {
                        console.error('Failed to load orders');
                        setOrders([]);
                    }
                } catch (error) {
                    console.error('Error loading orders:', error);
                    setOrders([]);
                }
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };
        loadOrders();
    }, [emailUser]);

    // Filter orders for current user (additional client-side filtering)
    const userOrders = orders.filter(order => 
        order.email === emailUser?.email
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        router.push('/');
    };

    const getStatusColor = (status: string) => {
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'preparing':
                return 'bg-blue-100 text-blue-800';
            case 'out for delivery':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        const lowerStatus = status.toLowerCase();
        switch (lowerStatus) {
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                                My Profile
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Manage your account and track your orders
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-center sm:text-left"
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
                    className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                                <User className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-xl sm:text-2xl font-bold">
                                    {emailUser?.name}
                                </h2>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-gray-600 mt-1 space-y-1 sm:space-y-0">
                                    <div className="flex items-center justify-center sm:justify-start space-x-1">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-xs sm:text-sm break-all">{emailUser?.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center sm:justify-start space-x-1">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-xs sm:text-sm">{emailUser?.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors w-full sm:w-auto"
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
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                    <div className="border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base ${
                                    activeTab === 'orders'
                                        ? 'bg-red-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span className="sm:hidden">Orders ({userOrders.length})</span>
                                <span className="hidden sm:inline">My Orders ({userOrders.length})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base ${
                                    activeTab === 'profile'
                                        ? 'bg-red-500 text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <span className="sm:hidden">Profile</span>
                                <span className="hidden sm:inline">Profile Details</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Order History</h2>
                                
                                {userOrders.length === 0 ? (
                                    <div className="text-center py-8 sm:py-12">
                                        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                                            No Orders Yet
                                        </h3>
                                        <p className="text-gray-500 mb-6 text-sm sm:text-base px-4">
                                            You haven't placed any orders yet. Start exploring our menu!
                                        </p>
                                        <Link href="/menu" className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 inline-block">
                                            Browse Menu
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4 sm:space-y-6">
                                        {userOrders.map((order) => (
                                            <motion.div
                                                key={order.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="bg-gray-50 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2 gap-2">
                                                            <h3 className="font-bold text-base sm:text-lg">
                                                                Order #{order.id.substring(0, 8)}...
                                                            </h3>
                                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 self-start ${getStatusColor(order.status)}`}>
                                                                {getStatusIcon(order.status)}
                                                                <span>{order.status}</span>
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
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
                                                    <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Items:</h4>
                                                    <div className="space-y-2">
                                                        {order.items.map((item: any, index: number) => {
                                                            const price = Number(item.price) || 0;
                                                            const qty = Number(item.qty) || 1;
                                                            return (
                                                                <div key={index} className="flex justify-between items-center text-xs sm:text-sm">
                                                                    <span className="text-gray-600 flex-1 pr-2">
                                                                        {item.name} x {qty}
                                                                    </span>
                                                                    <span className="font-semibold">
                                                                        ₹{(price * qty).toFixed(0)}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Delivery Address */}
                                                <div className="border-t border-gray-200 pt-4 mb-4">
                                                    <div className="flex items-start space-x-2">
                                                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-xs sm:text-sm font-semibold text-gray-700">
                                                                Delivery Address:
                                                            </p>
                                                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                                                                {order.address}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Status Progress */}
                                                <div className="pt-4 border-t border-gray-200">
                                                    <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Order Status:</h4>
                                                    <OrderTracker 
                                                        status={order.status}
                                                        createdAt={order.createdAt}
                                                        statusHistory={{}}
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
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Profile Details</h2>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm sm:text-base">
                                                {emailUser?.name}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm sm:text-base break-all">
                                                {emailUser?.email}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm sm:text-base">
                                                {emailUser?.phone}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 sm:p-6">
                                            <h3 className="font-bold text-base sm:text-lg mb-4">Order Statistics</h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm sm:text-base">
                                                    <span className="text-gray-600">Total Orders:</span>
                                                    <span className="font-semibold">{userOrders.length}</span>
                                                </div>
                                                <div className="flex justify-between text-sm sm:text-base">
                                                    <span className="text-gray-600">Total Spent:</span>
                                                    <span className="font-semibold">
                                                        ₹{userOrders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm sm:text-base">
                                                    <span className="text-gray-600">Delivered Orders:</span>
                                                    <span className="font-semibold">
                                                        {userOrders.filter(order => order.status.toLowerCase() === 'delivered').length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <Link href="/menu" className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 w-full block text-sm sm:text-base">
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

export default function ProfilePage() {
    return (
        <ClientOnly>
            <EmailProtectedRoute>
                <ProfileContent />
            </EmailProtectedRoute>
        </ClientOnly>
    );
}
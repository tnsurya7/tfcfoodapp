'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    LogOut,
    Plus,
    Edit,
    Trash2,
    Package,
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Eye,
} from 'lucide-react';
import Link from 'next/link';
import toast from "@/lib/toast";
import Image from 'next/image';
import { FoodItem } from '@/store/cartStore';
import FoodForm from '@/components/admin/FoodForm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    getAllFoods, 
    deleteFood as deleteFirebaseFood,
    getAllOrders,
    updateOrderStatusWithTimestamp,
    deleteOrder as deleteFirebaseOrder,
    listenToFoods,
    listenToOrders,
    getDatabaseStats,
    getDeliveredRevenue,
    getAdminStats
} from '@/lib/firebaseHelpers';
import { useFirebaseFoodStore } from '@/store/firebaseFoodStore';
import { seedTFCFoods } from '@/lib/seedFoods';

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState<'foods' | 'orders' | 'customers'>('foods');
    const [showFoodForm, setShowFoodForm] = useState(false);
    const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Firebase data states
    const { foods, listenFoods, addFood: addFoodToFirebase, updateFood: updateFoodInFirebase, deleteFood: deleteFoodFromFirebase } = useFirebaseFoodStore();
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });

    // Function to refresh statistics (Firebase-only)
    const refreshStats = async () => {
        try {
            console.log('🔄 Refreshing stats from Firebase...');
            const res = await getAdminStats();
            
            if (res.success && res.stats) {
                setStats({
                    totalCustomers: res.stats.users,
                    totalProducts: res.stats.foods,
                    totalOrders: res.stats.orders,
                    totalRevenue: res.stats.revenue
                });
                console.log('✅ Stats refreshed:', res.stats);
                toast.success('Statistics refreshed successfully');
            } else {
                console.error('❌ Failed to refresh stats:', res.error);
                toast.error('Failed to refresh statistics');
            }
        } catch (error) {
            console.error('❌ Error refreshing stats:', error);
            toast.error('Failed to refresh statistics');
        }
    };

    useEffect(() => {
        const loggedIn = sessionStorage.getItem('adminLoggedIn');
        if (loggedIn !== 'true') {
            router.push('/admin');
        } else {
            setIsLoggedIn(true);
            loadData();
        }
    }, [router]);

    useEffect(() => {
        seedTFCFoods();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            
            // Start Firebase foods listener (replaces manual loading)
            listenFoods();

            // Load orders
            const ordersResult = await getAllOrders();
            if (ordersResult.success) {
                setOrders(ordersResult.orders || []);
            }

            // Load statistics using Firebase only
            const statsResult = await getDatabaseStats();
            const revenue = await getDeliveredRevenue();
            
            if (statsResult.success) {
                const dbStats = statsResult.stats || { totalUsers: 0, totalFoods: 0, totalOrders: 0, totalRevenue: 0 };
                setStats({
                    totalCustomers: dbStats.totalUsers,
                    totalProducts: dbStats.totalFoods,
                    totalOrders: dbStats.totalOrders,
                    totalRevenue: revenue
                });
            }

            // Set up real-time listeners for orders only (foods handled by store)
            const unsubscribeOrders = listenToOrders((updatedOrders: any[]) => {
                setOrders(updatedOrders);
                // Update order stats from Firebase data
                const totalOrders = updatedOrders.length;
                const totalRevenue = updatedOrders
                    .filter(order => order.status?.toLowerCase() === 'delivered')
                    .reduce((sum, order) => sum + (order.total || 0), 0);
                
                // Calculate unique customers from orders
                const uniqueCustomers = new Set(updatedOrders.map(order => order.email)).size;
                
                setStats(prevStats => ({
                    ...prevStats,
                    totalOrders,
                    totalRevenue,
                    totalCustomers: uniqueCustomers
                }));
            });

            // Cleanup listeners on unmount
            return () => {
                if (unsubscribeOrders) unsubscribeOrders();
            };

        } catch (error) {
            console.error('Error loading admin data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminLoggedIn');
        toast.success('Logged out successfully');
        router.push('/admin');
    };

    const handleDeleteFood = async (id: string, name: string) => {
        toast.action(
            `Are you sure you want to delete "${name}"?`,
            [
                {
                    label: 'Delete',
                    onClick: async () => {
                        try {
                            await deleteFoodFromFirebase(id);
                            toast.success('Food item deleted successfully');
                            // UI will update automatically via Firebase listener
                        } catch (error) {
                            console.error('Error deleting food:', error);
                            toast.error('Failed to delete food item');
                        }
                    },
                    style: 'bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded'
                },
                {
                    label: 'Cancel',
                    onClick: () => {},
                    style: 'bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded'
                }
            ]
        );
    };

    const handleEditFood = (food: FoodItem) => {
        setEditingFood(food);
        setShowFoodForm(true);
    };

    const handleAddFood = () => {
        setEditingFood(null);
        setShowFoodForm(true);
    };

    const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const result = await updateOrderStatusWithTimestamp(orderId, newStatus);
            if (result.success) {
                toast.success('Order status updated');
                // Orders will update automatically via listener
            } else {
                toast.error(result.error || 'Failed to update order status');
            }
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const handleDeleteOrder = async (orderId: string) => {
        toast.action(
            'Are you sure you want to delete this order?',
            [
                {
                    label: 'Delete',
                    onClick: async () => {
                        try {
                            const result = await deleteFirebaseOrder(orderId);
                            if (result.success) {
                                toast.success('Order deleted successfully');
                                // Orders will update automatically via listener
                            } else {
                                toast.error(result.error || 'Failed to delete order');
                            }
                        } catch (error) {
                            toast.error('Failed to delete order');
                        }
                    },
                    style: 'bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded'
                },
                {
                    label: 'Cancel',
                    onClick: () => {},
                    style: 'bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-1 rounded'
                }
            ]
        );
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

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    const pendingOrders = orders.filter(order => order.status?.toLowerCase() === 'pending').length;

    const generatePDFReport = () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(20);
        doc.text('TFC Food Ordering - Admin Dashboard Report', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);
        
        // Summary Stats
        doc.setFontSize(16);
        doc.text('Summary Statistics', 20, 55);
        
        doc.setFontSize(12);
        doc.text(`Total Products: ${stats.totalProducts}`, 20, 70);
        doc.text(`Total Orders: ${stats.totalOrders}`, 20, 80);
        doc.text(`Total Revenue: Rs. ${stats.totalRevenue.toLocaleString()}`, 20, 90);
        doc.text(`Total Customers: ${stats.totalCustomers}`, 20, 100);
        doc.text(`Pending Orders: ${pendingOrders}`, 20, 110);
        
        // Orders Table
        if (orders.length > 0) {
            doc.setFontSize(16);
            doc.text('Recent Orders', 20, 135);
            
            const orderData = orders.slice(0, 10).map(order => [
                order.id,
                order.customer,
                order.email,
                order.phone,
                `Rs. ${order.total}`,
                order.status,
                new Date(order.createdAt).toLocaleDateString()
            ]);
            
            autoTable(doc, {
                head: [['Order ID', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Date']],
                body: orderData,
                startY: 145,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [211, 47, 47] }
            });
        }
        
        // Skip customers table - not implemented yet
        
        // Save the PDF
        doc.save(`TFC-Dashboard-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const statsCards = [
        {
            icon: <Package className="w-8 h-8" />,
            label: 'Total Products',
            value: stats.totalProducts,
            color: 'bg-blue-500',
        },
        {
            icon: <ShoppingBag className="w-8 h-8" />,
            label: 'Total Orders',
            value: stats.totalOrders,
            color: 'bg-green-500',
        },
        {
            icon: <DollarSign className="w-8 h-8" />,
            label: 'Revenue',
            value: `Rs. ${stats.totalRevenue.toLocaleString()}`,
            color: 'bg-yellow-500',
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            label: 'Total Customers',
            value: stats.totalCustomers,
            color: 'bg-purple-500',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage your food ordering system
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={refreshStats}
                                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <TrendingUp className="w-4 h-4" />
                                <span>Refresh Stats</span>
                            </button>
                            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary">
                                View Site
                            </Link>
                            <button
                                onClick={generatePDFReport}
                                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Package className="w-4 h-4" />
                                <span>Download Report</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold dark:text-white">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} text-white p-3 rounded-lg`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('foods')}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'foods'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Food Items ({stats.totalProducts})
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'orders'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Orders ({orders.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('customers')}
                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === 'customers'
                                    ? 'bg-primary text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Customers ({(() => {
                                    const customerEmails = new Set(orders.map(order => order.email));
                                    return customerEmails.size;
                                })()})
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'foods' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold dark:text-white">Food Items</h2>
                                    <button 
                                        onClick={handleAddFood}
                                        className="btn-primary flex items-center space-x-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Add New Item</span>
                                    </button>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Image
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Name
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Category
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Price
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Type
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {foods.map((food) => (
                                                <tr
                                                    key={food.id}
                                                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                                            <Image
                                                                src={food.image}
                                                                alt={food.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 dark:text-white">{food.name}</td>
                                                    <td className="py-3 px-4 dark:text-gray-400 capitalize">
                                                        {food.category.replace('-', ' ')}
                                                    </td>
                                                    <td className="py-3 px-4 dark:text-white font-semibold">
                                                        ₹{food.price}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${food.type === 'veg'
                                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                                }`}
                                                        >
                                                            {food.type === 'veg' ? 'Veg' : 'Non-Veg'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center space-x-2">
                                                            <button 
                                                                onClick={() => handleEditFood(food)}
                                                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteFood(food.id, food.name)}
                                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 dark:text-white">Orders Management</h2>

                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-3">
                                                        <h3 className="font-bold dark:text-white text-lg">
                                                            Order #{order.id}
                                                        </h3>
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                                order.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                                                order.status?.toLowerCase() === 'preparing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                                                order.status?.toLowerCase() === 'out for delivery' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                                                                order.status?.toLowerCase() === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                                                'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                            }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                <strong>Customer:</strong> {order.customer}
                                                            </p>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                <strong>Email:</strong> {order.email}
                                                            </p>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                <strong>Phone:</strong> {order.phone}
                                                            </p>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                <strong>Payment:</strong> {order.paymentMethod.toUpperCase()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                <strong>Items:</strong> {order.items.length} items
                                                            </p>
                                                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                                                <strong>Total:</strong> ₹{order.total}
                                                            </p>
                                                            <p className="text-gray-500 dark:text-gray-500 text-xs">
                                                                {formatTime(order.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                                            <strong>Address:</strong> {order.address}
                                                        </p>
                                                        <div className="text-sm">
                                                            <strong className="text-gray-700 dark:text-gray-300">Items:</strong>
                                                            <ul className="mt-1 space-y-1">
                                                                {order.items.map((item: any, index: number) => (
                                                                    <li key={index} className="text-gray-600 dark:text-gray-400">
                                                                        {item.name} x {item.quantity} - ₹{item.price * item.quantity}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-3 ml-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="preparing">Preparing</option>
                                                        <option value="out for delivery">Out for Delivery</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'customers' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 dark:text-white">Customer Management</h2>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Name
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Email
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Phone
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Total Orders
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Total Spent
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Last Order
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                // Build customers from orders
                                                const customerMap = new Map();
                                                
                                                orders.forEach(order => {
                                                    if (!customerMap.has(order.email)) {
                                                        customerMap.set(order.email, {
                                                            name: order.customer,
                                                            email: order.email,
                                                            phone: order.phone,
                                                            totalOrders: 0,
                                                            totalSpent: 0,
                                                            lastOrderDate: order.createdAt
                                                        });
                                                    }
                                                    
                                                    const customer = customerMap.get(order.email);
                                                    customer.totalOrders += 1;
                                                    customer.totalSpent += order.total;
                                                    
                                                    // Update last order date if this order is more recent
                                                    if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
                                                        customer.lastOrderDate = order.createdAt;
                                                    }
                                                });
                                                
                                                const customers = Array.from(customerMap.values());
                                                
                                                if (customers.length === 0) {
                                                    return (
                                                        <tr>
                                                            <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                                No customers found
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                                
                                                return customers.map((customer, index) => (
                                                    <tr key={customer.email} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                        <td className="py-3 px-4 dark:text-white">{customer.name}</td>
                                                        <td className="py-3 px-4 dark:text-gray-400">{customer.email}</td>
                                                        <td className="py-3 px-4 dark:text-gray-400">{customer.phone}</td>
                                                        <td className="py-3 px-4 dark:text-white font-semibold">{customer.totalOrders}</td>
                                                        <td className="py-3 px-4 dark:text-white font-semibold">₹{customer.totalSpent}</td>
                                                        <td className="py-3 px-4 dark:text-gray-400">
                                                            {new Date(customer.lastOrderDate).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Food Form Modal */}
            <AnimatePresence>
                {showFoodForm && (
                    <FoodForm
                        food={editingFood || undefined}
                        onClose={() => {
                            setShowFoodForm(false);
                            setEditingFood(null);
                        }}
                        onSave={async () => {
                            // Firebase listener will automatically update UI
                            // No manual state updates needed
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
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
    listenToUsers,
    getDatabaseStats,
    getDeliveredRevenue,
    getAdminStats
} from '@/lib/firebaseHelpers';
import { useFirebaseFoodStore } from '@/store/firebaseFoodStore';
import { seedTFCFoodsOnce } from '@/lib/seedFoods';

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
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalCustomers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });

    // Auto-load statistics on component mount and when data changes
    useEffect(() => {
        const loadStats = async () => {
            try {
                console.log('🔄 Auto-loading stats from Firebase...');
                const res = await getAdminStats();
                
                if (res.success && res.stats) {
                    setStats({
                        totalCustomers: res.stats.users,
                        totalProducts: res.stats.foods,
                        totalOrders: res.stats.orders,
                        totalRevenue: res.stats.revenue
                    });
                    console.log('✅ Stats auto-loaded:', res.stats);
                }
            } catch (error) {
                console.error('❌ Error auto-loading stats:', error);
            }
        };

        loadStats();
    }, [foods, orders]); // Re-run when foods or orders change

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
        seedTFCFoodsOnce();
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

            // Set up real-time listeners for orders and users
            const unsubscribeOrders = listenToOrders((updatedOrders: any[]) => {
                setOrders(updatedOrders);
                // Update order stats from Firebase data
                const totalOrders = updatedOrders.length;
                const totalRevenue = updatedOrders
                    .filter(order => order.status?.toLowerCase() === 'delivered')
                    .reduce((sum, order) => sum + (order.total || 0), 0);
                
                setStats(prevStats => ({
                    ...prevStats,
                    totalOrders,
                    totalRevenue
                }));
            });

            // Set up real-time listener for users
            const unsubscribeUsers = listenToUsers((updatedUsers: any[]) => {
                console.log('📊 Firebase users updated:', updatedUsers.length, 'users');
                setUsers(updatedUsers);
                
                // Update customer count from Firebase users
                setStats(prevStats => ({
                    ...prevStats,
                    totalCustomers: updatedUsers.length
                }));
            });

            // Cleanup listeners on unmount
            return () => {
                if (unsubscribeOrders) unsubscribeOrders();
                if (unsubscribeUsers) unsubscribeUsers();
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
                toast.error('Failed to update order status');
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
                                toast.error('Failed to delete order');
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
        
        let currentY = 130;
        
        // Orders Table with Enhanced Details
        if (orders.length > 0) {
            doc.setFontSize(16);
            doc.text('Recent Orders', 20, currentY);
            
            const orderData = orders.slice(0, 8).map(order => {
                // Build items breakdown
                const itemsBreakdown = order.items?.map((item: any) => 
                    `${item.name} x${item.qty || item.quantity || 1} = Rs.${((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(0)}`
                ).join(', ') || 'No items';
                
                return [
                    order.id.substring(0, 12) + '...',
                    order.customer,
                    order.phone,
                    itemsBreakdown,
                    order.paymentMethod?.toUpperCase() || 'COD',
                    order.address?.substring(0, 30) + '...' || 'N/A',
                    `Rs. ${order.total}`,
                    order.status,
                    new Date(order.createdAt).toLocaleDateString() + ' ' + new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                ];
            });
            
            autoTable(doc, {
                head: [['Order ID', 'Customer', 'Phone', 'Items', 'Payment', 'Address', 'Total', 'Status', 'Ordered At']],
                body: orderData,
                startY: currentY + 10,
                styles: { fontSize: 7 },
                headStyles: { fillColor: [211, 47, 47] },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 18 },
                    2: { cellWidth: 18 },
                    3: { cellWidth: 35 },
                    4: { cellWidth: 15 },
                    5: { cellWidth: 25 },
                    6: { cellWidth: 15 },
                    7: { cellWidth: 15 },
                    8: { cellWidth: 25 }
                }
            });
            
            currentY = (doc as any).lastAutoTable.finalY + 20;
        }
        
        // Business Analytics Section
        doc.setFontSize(16);
        doc.text('Business Analytics', 20, currentY);
        
        // Category-wise Sales Analysis
        const categoryStats: { [key: string]: number } = {};
        const itemStats: { [key: string]: number } = {};
        const statusStats: { [key: string]: number } = { delivered: 0, preparing: 0, 'out-for-delivery': 0, pending: 0, cancelled: 0 };
        let deliveredRevenue = 0;
        let pendingRevenue = 0;
        
        orders.forEach(order => {
            // Status summary
            const status = order.status || 'pending';
            statusStats[status] = (statusStats[status] || 0) + 1;
            
            // Revenue breakdown
            if (order.status === 'delivered') {
                deliveredRevenue += order.total || 0;
            } else {
                pendingRevenue += order.total || 0;
            }
            
            // Category and item analysis
            order.items?.forEach((item: any) => {
                // Find food category from foods array
                const foodItem = foods.find(f => f.id === item.id);
                const category = foodItem?.category || 'unknown';
                
                categoryStats[category] = (categoryStats[category] || 0) + ((item.price || 0) * (item.qty || item.quantity || 1));
                itemStats[item.name] = (itemStats[item.name] || 0) + (item.qty || item.quantity || 1);
            });
        });
        
        // Category Sales
        doc.setFontSize(12);
        doc.text('Category Sales:', 20, currentY + 20);
        let yPos = currentY + 30;
        Object.entries(categoryStats).slice(0, 6).forEach(([category, revenue]) => {
            doc.text(`${category.charAt(0).toUpperCase() + category.slice(1)}: Rs. ${(revenue as number).toFixed(0)}`, 25, yPos);
            yPos += 10;
        });
        
        // Best Selling Items
        const topItems = Object.entries(itemStats).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5);
        doc.text('Top Selling Items:', 120, currentY + 20);
        yPos = currentY + 30;
        topItems.forEach(([item, count]) => {
            doc.text(`${item} - ${count} orders`, 125, yPos);
            yPos += 10;
        });
        
        // Order Status Summary
        doc.text('Order Status Summary:', 20, yPos + 10);
        yPos += 20;
        Object.entries(statusStats).forEach(([status, count]) => {
            if ((count as number) > 0) {
                doc.text(`${status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}: ${count}`, 25, yPos);
                yPos += 10;
            }
        });
        
        // Revenue Breakdown
        doc.text('Revenue Breakdown:', 120, yPos - 40);
        doc.text(`Delivered Orders: Rs. ${deliveredRevenue.toFixed(0)}`, 125, yPos - 30);
        doc.text(`Pending Orders Value: Rs. ${pendingRevenue.toFixed(0)}`, 125, yPos - 20);
        
        currentY = yPos + 20;
        
        // Customer Analysis Section
        if (users.length > 0) {
            // Build customer analytics from users and orders
            const customerAnalytics = users.map(user => {
                const userOrders = orders.filter(order => order.email === user.email);
                const totalOrders = userOrders.length;
                const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
                
                let firstOrderDate = null;
                let lastOrderDate = null;
                let lastOrderStatus = 'No Orders';
                
                if (userOrders.length > 0) {
                    const sortedOrders = userOrders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    firstOrderDate = sortedOrders[0].createdAt;
                    lastOrderDate = sortedOrders[sortedOrders.length - 1].createdAt;
                    lastOrderStatus = sortedOrders[sortedOrders.length - 1].status;
                }
                
                return {
                    customerId: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    totalOrders,
                    totalSpent,
                    firstOrderDate: firstOrderDate || user.createdAt,
                    lastOrderDate: lastOrderDate || user.lastLogin,
                    lastOrderStatus,
                    accountCreated: user.createdAt
                };
            });
            
            // Customer Summary
            doc.setFontSize(16);
            doc.text('Customer Analysis', 20, currentY);
            
            doc.setFontSize(12);
            const activeCustomers = customerAnalytics.filter(c => {
                const daysSinceLastLogin = (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
                return daysSinceLastLogin <= 7;
            }).length;
            
            const repeatCustomers = customerAnalytics.filter(c => c.totalOrders > 1).length;
            const customersWithOrders = customerAnalytics.filter(c => c.totalOrders > 0);
            const avgOrderValue = customersWithOrders.length > 0 
                ? customersWithOrders.reduce((sum, c) => sum + (c.totalSpent / Math.max(c.totalOrders, 1)), 0) / customersWithOrders.length 
                : 0;
            
            doc.text(`Total Customers: ${users.length}`, 20, currentY + 20);
            doc.text(`Active Customers (last 7 days): ${activeCustomers}`, 20, currentY + 30);
            doc.text(`Repeat Customers: ${repeatCustomers}`, 20, currentY + 40);
            doc.text(`Average Order Value: Rs. ${avgOrderValue.toFixed(0)}`, 20, currentY + 50);
            
            currentY += 70;
            
            // Customer List Table
            doc.setFontSize(16);
            doc.text('Customer List', 20, currentY);
            
            const customerData = customerAnalytics.slice(0, 10).map(customer => {
                const deliveredOrders = orders.filter(order => 
                    order.email === customer.email && order.status === 'delivered'
                ).length;
                const avgOrderValue = customer.totalOrders > 0 ? (customer.totalSpent / customer.totalOrders) : 0;
                
                return [
                    customer.name,
                    customer.email,
                    customer.phone,
                    customer.totalOrders.toString(),
                    deliveredOrders.toString(),
                    `Rs. ${customer.totalSpent}`,
                    `Rs. ${avgOrderValue.toFixed(0)}`,
                    customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never',
                    customer.lastOrderStatus
                ];
            });
            
            autoTable(doc, {
                head: [['Name', 'Email', 'Phone', 'Orders', 'Delivered', 'Total Spent', 'Avg Order', 'Last Order', 'Status']],
                body: customerData,
                startY: currentY + 10,
                styles: { fontSize: 7 },
                headStyles: { fillColor: [211, 47, 47] },
                columnStyles: {
                    0: { cellWidth: 20 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 15 },
                    4: { cellWidth: 15 },
                    5: { cellWidth: 20 },
                    6: { cellWidth: 18 },
                    7: { cellWidth: 20 },
                    8: { cellWidth: 20 }
                }
            });
        }
        
        // Professional Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Report Generated By: TFC Food Ordering System', 20, pageHeight - 30);
        doc.text('Developed by: Surya Kumar', 20, pageHeight - 20);
        doc.text('Contact: +91 6379151006', 20, pageHeight - 10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 120, pageHeight - 20);
        
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
                                Customers ({users.length})
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
                                                    Last Login
                                                </th>
                                                <th className="text-left py-3 px-4 font-semibold dark:text-white">
                                                    Account Created
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                        No customers found
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map((user) => {
                                                    // Calculate user's order statistics
                                                    const userOrders = orders.filter(order => order.email === user.email);
                                                    const totalOrders = userOrders.length;
                                                    const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
                                                    
                                                    return (
                                                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                            <td className="py-3 px-4 dark:text-white font-semibold">{user.name}</td>
                                                            <td className="py-3 px-4 dark:text-gray-400">{user.email}</td>
                                                            <td className="py-3 px-4 dark:text-gray-400">{user.phone}</td>
                                                            <td className="py-3 px-4 dark:text-white font-semibold">{totalOrders}</td>
                                                            <td className="py-3 px-4 dark:text-white font-semibold">₹{totalSpent}</td>
                                                            <td className="py-3 px-4 dark:text-gray-400">
                                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                                            </td>
                                                            <td className="py-3 px-4 dark:text-gray-400">
                                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
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
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Check } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import EmailProtectedRoute from '@/components/auth/EmailProtectedRoute';
import toast from "@/lib/toast";
import Image from 'next/image';
import ClientOnly from '@/components/ClientOnly';

function CheckoutContent() {
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { addOrder } = useOrderStore();
    const { currentUser: emailUser } = useEmailAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    const [formData, setFormData] = useState({
        name: emailUser?.name || '',
        phone: emailUser?.phone || '',
        address: '',
        paymentMethod: 'cod',
    });

    if (items.length === 0 && !orderPlaced) {
        router.push('/cart');
        return null;
    }

    const totalPrice = getTotalPrice();
    const deliveryFee = totalPrice > 500 ? 0 : 40;
    const finalTotal = totalPrice + deliveryFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePaymentMethodChange = (method: string) => {
        setFormData({
            ...formData,
            paymentMethod: method,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.address) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsProcessing(true);

        // Simulate order processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Create order object
        const orderData = {
            customer: formData.name,
            phone: formData.phone,
            email: emailUser.email,
            address: formData.address,
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
            })),
            total: finalTotal,
            status: 'Pending' as const,
            paymentMethod: formData.paymentMethod,
        };

        // Add order to store
        addOrder(orderData);

        setIsProcessing(false);
        setOrderPlaced(true);
        clearCart();
        toast.success('Order placed successfully!');
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-md"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Check className="w-12 h-12 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-bold mb-4">
                        Order Confirmed! 🎉
                    </h1>
                    <p className="text-gray-600 text-lg mb-8">
                        Your order has been placed successfully. We'll deliver it to you soon!
                    </p>
                    <div className="space-y-3">
                        <Link href="/profile" className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 w-full block text-center">
                            Track Your Orders
                        </Link>
                        <Link href="/menu" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 w-full block text-center">
                            Order More Food
                        </Link>
                        <Link href="/" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 w-full block text-center">
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <Link
                    href="/cart"
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-red-500 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Cart</span>
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-8">
                        Checkout
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Delivery Information */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                Delivery Information
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="+91 9876543210"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Delivery Address *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="123 Main St, Apt 4B, City, State, PIN"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                Payment Method
                            </h2>
                            <div className="space-y-3">
                                {/* Cash on Delivery */}
                                <div
                                    onClick={() => handlePaymentMethodChange('cod')}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-red-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Banknote className="w-6 h-6 text-red-500" />
                                        <div className="flex-1">
                                            <h3 className="font-bold">Cash on Delivery</h3>
                                            <p className="text-sm text-gray-600">
                                                Pay when you receive your order
                                            </p>
                                        </div>
                                        {formData.paymentMethod === 'cod' && (
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* UPI */}
                                <div
                                    onClick={() => handlePaymentMethodChange('upi')}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.paymentMethod === 'upi'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-red-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Smartphone className="w-6 h-6 text-red-500" />
                                        <div className="flex-1">
                                            <h3 className="font-bold">UPI Payment</h3>
                                            <p className="text-sm text-gray-600">
                                                Pay via UPI QR code
                                            </p>
                                        </div>
                                        {formData.paymentMethod === 'upi' && (
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Razorpay */}
                                <div
                                    onClick={() => handlePaymentMethodChange('razorpay')}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.paymentMethod === 'razorpay'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-red-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <CreditCard className="w-6 h-6 text-red-500" />
                                        <div className="flex-1">
                                            <h3 className="font-bold">Card Payment</h3>
                                            <p className="text-sm text-gray-600">
                                                Pay securely with Razorpay
                                            </p>
                                        </div>
                                        {formData.paymentMethod === 'razorpay' && (
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                Order Summary
                            </h2>
                            <div className="space-y-3 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-gray-600">
                                        <span>
                                            {item.name} x {item.quantity}
                                        </span>
                                        <span className="font-semibold">
                                            ₹{(item.price * item.quantity).toFixed(0)}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-200 pt-3 mt-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">₹{totalPrice.toFixed(0)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 mt-2">
                                        <span>Delivery Fee</span>
                                        <span className="font-semibold">
                                            {deliveryFee === 0 ? (
                                                <span className="text-green-500">FREE</span>
                                            ) : (
                                                `₹${deliveryFee.toFixed(0)}`
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span className="text-red-500">₹{finalTotal.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="bg-red-500 text-white px-6 py-4 rounded-lg hover:bg-red-600 w-full text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    <span>Processing...</span>
                                </span>
                            ) : (
                                `Place Order - ₹${finalTotal.toFixed(0)}`
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <ClientOnly>
            <EmailProtectedRoute>
                <CheckoutContent />
            </EmailProtectedRoute>
        </ClientOnly>
    );
}
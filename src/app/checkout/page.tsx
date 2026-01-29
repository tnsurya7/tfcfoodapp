'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Smartphone, Banknote, Check } from 'lucide-react';
import Link from 'next/link';
import { useFirebaseCartStore } from '@/store/firebaseCartStore';
import { useFirebaseOrderStore } from '@/store/firebaseOrderStore';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import EmailProtectedRoute from '@/components/auth/EmailProtectedRoute';
import toast from "@/lib/toast";
import Image from 'next/image';
import ClientOnly from '@/components/ClientOnly';
import { generateUserId } from '@/lib/firebaseHelpers';

function CheckoutContent() {
    const router = useRouter();
    const { items, getTotalPrice, clearCart, clearCartInstant, fetchCart, setUserId } = useFirebaseCartStore();
    const { createOrder } = useFirebaseOrderStore();
    const { currentUser: emailUser } = useEmailAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: emailUser?.name || '',
        phone: emailUser?.phone || '',
        address: '',
        paymentMethod: 'cod',
    });

    // UPI Payment States
    const [upiApp, setUpiApp] = useState("");
    const [upiTxnId, setUpiTxnId] = useState("");
    const [showUpiForm, setShowUpiForm] = useState(false);

    // Load user cart when component mounts
    useEffect(() => {
        const loadCart = async () => {
            if (emailUser?.email) {
                setIsLoading(true);
                setUserId(emailUser.email);
                await fetchCart();
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };
        loadCart();
    }, [emailUser, fetchCart, setUserId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

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
        
        // Show UPI form when UPI is selected
        if (method === "upi") {
            setShowUpiForm(true);
        } else {
            setShowUpiForm(false);
            setUpiApp("");
            setUpiTxnId("");
        }
    };

    // UPI Payment Configuration
    const MERCHANT_UPI = process.env.NEXT_PUBLIC_UPI_ID || ""; // No fallback - must be set in env
    const MERCHANT_NAME = process.env.NEXT_PUBLIC_UPI_MERCHANT_NAME || ""; // No fallback - must be set in env
    
    const openUPI = (app: string) => {
        const amount = finalTotal;
        const upiId = process.env.NEXT_PUBLIC_UPI_ID || "";
        const name = "TFC FOOD";
        const note = "TFC Order Payment";
        
        let url = "";
        
        if (app === "gpay") {
            url = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
        }
        if (app === "phonepe") {
            url = `phonepe://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
        }
        if (app === "paytm") {
            url = `paytmmp://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
        }
        
        // Set the app name for tracking
        setUpiApp(app === 'gpay' ? 'Google Pay' : app === 'phonepe' ? 'PhonePe' : 'Paytm');
        
        // Open UPI app with specific deep link
        window.location.href = url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.phone || !formData.address) {
            toast.error('Please fill in all fields');
            return;
        }

        // UPI Payment Validation
        if (formData.paymentMethod === "upi") {
            if (!upiApp || !upiTxnId) {
                toast.error("Please enter UPI app name and transaction ID");
                return;
            }
        }

        setIsProcessing(true);

        try {
            // Create order object
            const orderData = {
                userId: generateUserId(emailUser.email),
                customer: formData.name,
                phone: formData.phone,
                email: emailUser.email,
                address: formData.address,
                items: items.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.qty,
                })),
                total: finalTotal,
                paymentMethod: formData.paymentMethod,
                upiDetails: formData.paymentMethod === "upi" 
                    ? {
                        app: upiApp,
                        transactionId: upiTxnId
                    }
                    : null,
            };

            // OPTIMISTIC UI UPDATE: Show success immediately
            setOrderPlaced(true);
            toast.success('Order placed successfully!');
            
            // Place order with optimistic cart clearing (happens in background)
            const result = await createOrder(orderData, () => {
                // Clear cart instantly for immediate UI response
                clearCartInstant();
            });
            
            if (!result.success) {
                // If order fails, revert the optimistic update
                setOrderPlaced(false);
                toast.error('Failed to place order. Please try again.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            // Revert optimistic update on error
            setOrderPlaced(false);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
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

                            {/* UPI Payment Interface */}
                            {formData.paymentMethod === "upi" && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold mb-4 text-blue-800">Complete UPI Payment</h3>
                                    
                                    {/* UPI App Buttons */}
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-3">Select your UPI app to pay ₹{finalTotal}:</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openUPI("gpay")}
                                                className="flex flex-col items-center p-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                                                    <span className="text-white text-xs font-bold">G</span>
                                                </div>
                                                <span className="text-xs font-medium">Google Pay</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openUPI("phonepe")}
                                                className="flex flex-col items-center p-3 bg-white border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                                                    <span className="text-white text-xs font-bold">P</span>
                                                </div>
                                                <span className="text-xs font-medium">PhonePe</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => openUPI("paytm")}
                                                className="flex flex-col items-center p-3 bg-white border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                                                    <span className="text-white text-xs font-bold">P</span>
                                                </div>
                                                <span className="text-xs font-medium">Paytm</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* UPI Details Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                UPI App Used *
                                            </label>
                                            <input
                                                type="text"
                                                value={upiApp}
                                                onChange={(e) => setUpiApp(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., Google Pay, PhonePe, Paytm"
                                                required={formData.paymentMethod === "upi"}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Transaction ID *
                                            </label>
                                            <input
                                                type="text"
                                                value={upiTxnId}
                                                onChange={(e) => setUpiTxnId(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter UPI transaction ID"
                                                required={formData.paymentMethod === "upi"}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Instructions:</strong>
                                        </p>
                                        <ol className="text-sm text-yellow-700 mt-1 list-decimal list-inside space-y-1">
                                            <li>Click on your preferred UPI app above</li>
                                            <li>Complete the payment of ₹{finalTotal}</li>
                                            <li>Enter the app name and transaction ID here</li>
                                            <li>Click "Place Order" to confirm</li>
                                        </ol>
                                    </div>
                                </div>
                            )}
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
                                            {item.name} x {item.qty}
                                        </span>
                                        <span className="font-semibold">
                                            ₹{(item.price * item.qty).toFixed(0)}
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
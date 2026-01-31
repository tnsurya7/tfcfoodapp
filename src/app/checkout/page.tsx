'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone, Banknote, Check } from 'lucide-react';
import Link from 'next/link';
import { useFirebaseCartStore } from '@/store/firebaseCartStore';
import { useFirebaseOrderStore } from '@/store/firebaseOrderStore';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import EmailProtectedRoute from '@/components/auth/EmailProtectedRoute';
import toast from "@/lib/toast";
import Image from 'next/image';
import ClientOnly from '@/components/ClientOnly';
import { generateUserId } from '@/lib/firebaseHelpers';
import pincodeData from '@/data/pincodeData.json';
import { sendOrderEmail } from '@/lib/orderEmailService';

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
        pincode: '',
        area: '',
        district: '',
        state: '',
        paymentMethod: 'cod',
    });

    // UPI Payment States - Production Ready
    const [upiAppUsed, setUpiAppUsed] = useState("");
    const [upiUserName, setUpiUserName] = useState("");
    const [upiMobile, setUpiMobile] = useState("");
    const [showUpiForm, setShowUpiForm] = useState(false);

    // ENV Variables - Single Stable UPI ID (No Hardcoding)
    const TFC_UPI_ID = process.env.NEXT_PUBLIC_TFC_UPI_ID;
    const TFC_UPI_NAME = process.env.NEXT_PUBLIC_TFC_UPI_NAME;
    const TFC_UPI_MOBILE = process.env.NEXT_PUBLIC_TFC_UPI_MOBILE;

    // Mobile Detection
    const isMobile = () => {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    };

    // Pincode auto-fill states
    const [availableAreas, setAvailableAreas] = useState<Array<{pincode: string; area: string; district: string; state: string}>>([]);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);

    // Order type state
    const [orderType, setOrderType] = useState("delivery");

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
    const deliveryFee = orderType === "pickup" ? 0 : (totalPrice > 500 ? 0 : 40);
    const finalTotal = totalPrice + deliveryFee;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pincode = e.target.value;
        setFormData({
            ...formData,
            pincode: pincode,
        });

        // Auto-fill area, district, and state if pincode matches
        if (pincode.length === 6) {
            const matchedData = pincodeData.filter(item => item.pincode === pincode);
            if (matchedData.length > 0) {
                // Get unique areas for this pincode
                const uniqueAreas = [...new Set(matchedData.map(item => item.area))];
                
                if (uniqueAreas.length === 1) {
                    // Single area - auto-fill directly
                    const data = matchedData[0];
                    setFormData(prev => ({
                        ...prev,
                        pincode: pincode,
                        area: data.area,
                        district: data.district,
                        state: data.state,
                    }));
                    setShowAreaDropdown(false);
                    toast.success('Address details auto-filled!');
                } else {
                    // Multiple areas - show dropdown
                    setAvailableAreas(matchedData);
                    setShowAreaDropdown(true);
                    setFormData(prev => ({
                        ...prev,
                        pincode: pincode,
                        area: '',
                        district: matchedData[0].district, // Same district for all areas
                        state: matchedData[0].state, // Same state for all areas
                    }));
                    toast.success(`Found ${uniqueAreas.length} areas for this pincode. Please select one.`);
                }
            } else {
                // Clear auto-filled fields if no match
                setFormData(prev => ({
                    ...prev,
                    pincode: pincode,
                    area: '',
                    district: '',
                    state: '',
                }));
                setAvailableAreas([]);
                setShowAreaDropdown(false);
            }
        } else {
            // Clear fields if pincode is incomplete
            setAvailableAreas([]);
            setShowAreaDropdown(false);
        }
    };

    const handleAreaSelect = (selectedArea: string) => {
        const selectedData = availableAreas.find(item => item.area === selectedArea);
        if (selectedData) {
            setFormData(prev => ({
                ...prev,
                area: selectedData.area,
                district: selectedData.district,
                state: selectedData.state,
            }));
            setShowAreaDropdown(false);
            toast.success('Area selected successfully!');
        }
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
            setUpiAppUsed("");
            setUpiUserName("");
            setUpiMobile("");
        }
    };

    // Safe Universal UPI Payment Function - Industry Standard
    const openUpiApp = () => {
        if (!isMobile()) return;
        
        const amount = finalTotal;
        const merchantName = encodeURIComponent(`${TFC_UPI_NAME}`);
        const transactionNote = encodeURIComponent('TFC Food Order');
        const upiId = TFC_UPI_ID || "";
        
        // ✅ SAFE: Universal UPI protocol - shows app chooser
        const upiUrl = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${transactionNote}`;
        
        console.log(`🔗 Opening UPI App Chooser:`, upiUrl);
        window.location.href = upiUrl;
    };

    // Generate QR Code URL for UPI payment
    const generateQRCode = () => {
        const amount = finalTotal;
        const merchantName = encodeURIComponent(`${TFC_UPI_NAME}`);
        const transactionNote = encodeURIComponent('TFC Food Order');
        const upiId = TFC_UPI_ID || "";
        
        const upiString = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${transactionNote}`;
        
        // Using QR Server API to generate QR code
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`;
    };

    // Download QR Code function
    const downloadQRCode = async () => {
        try {
            const qrUrl = generateQRCode();
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `TFC-UPI-QR-₹${finalTotal}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('QR Code downloaded successfully!');
        } catch (error) {
            console.error('Download failed:', error);
            toast.error('Failed to download QR code. Please try again.');
        }
    };

    // Copy to clipboard functions
    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${label} copied to clipboard!`);
        } catch (error) {
            console.error('Copy failed:', error);
            toast.error('Copy failed. Please copy manually.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation based on order type
        if (orderType === "delivery") {
            if (!formData.name || !formData.phone || !formData.address || !formData.pincode || !formData.area || !formData.district || !formData.state) {
                toast.error('Please fill in all address fields');
                return;
            }
        } else {
            // For pickup, only name and phone are required
            if (!formData.name || !formData.phone) {
                toast.error('Please fill in name and phone number');
                return;
            }
        }

        // UPI Payment Validation - Simplified
        if (formData.paymentMethod === "upi") {
            if (!upiAppUsed) {
                toast.error("Please select a UPI app");
                return;
            }
            if (!upiUserName || upiUserName.trim().length < 2) {
                toast.error("Please enter your full name as per UPI");
                return;
            }
            if (!upiMobile || upiMobile.length !== 10) {
                toast.error("Please enter a valid 10-digit mobile number");
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
                orderType: orderType,
                address: orderType === "delivery" 
                    ? `${formData.address}, ${formData.area}, ${formData.district}, ${formData.state} - ${formData.pincode}`
                    : "Store Pickup - TFC Thozha Fried Chicken, BKN School Opposite, Nasiyanur, Erode, Tamil Nadu, India",
                addressDetails: orderType === "delivery" ? {
                    address: formData.address,
                    area: formData.area,
                    district: formData.district,
                    state: formData.state,
                    pincode: formData.pincode
                } : null,
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
                        app: upiAppUsed,
                        name: upiUserName,
                        mobile: upiMobile
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
            
            if (result.success) {
                // 🔥 FORCE ORDER EMAIL TO SEND
                console.log('🚀 Order placed successfully, sending email...');
                console.log('🔧 Order result:', result);
                console.log('📧 About to call sendOrderEmail...');
                
                try {
                    console.log('📧 Calling sendOrderEmail with data:', {
                        customer: orderData.customer,
                        email: orderData.email,
                        total: orderData.total,
                        paymentMethod: orderData.paymentMethod
                    });
                    
                    await sendOrderEmail(orderData);
                    console.log('✅ Order email triggered successfully');
                } catch (emailError) {
                    console.error('❌ Order email failed:', emailError);
                    // Still show success to user since order was placed
                }
            } else {
                console.log('❌ Order creation failed, result:', result);
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
                        {/* Order Type Selection */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                Order Type
                            </h2>
                            <div className="space-y-3">
                                {/* Delivery Option */}
                                <div
                                    onClick={() => setOrderType('delivery')}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${orderType === 'delivery'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-red-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                                            {orderType === 'delivery' && (
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">Home Delivery</h3>
                                            <p className="text-sm text-gray-600">
                                                Get your order delivered to your doorstep
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pickup Option */}
                                <div
                                    onClick={() => setOrderType('pickup')}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${orderType === 'pickup'
                                            ? 'border-red-500 bg-red-50'
                                            : 'border-gray-200 hover:border-red-300'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                                            {orderType === 'pickup' && (
                                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold">Store Pickup (Come & Collect)</h3>
                                            <p className="text-sm text-gray-600">
                                                Pick up your order from our store
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Store Location for Pickup */}
                            {orderType === 'pickup' && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="text-lg font-semibold mb-2 text-blue-800">Store Location:</h3>
                                    <div className="text-gray-700">
                                        <p className="font-semibold">TFC Thozha Fried Chicken</p>
                                        <p>BKN School Opposite</p>
                                        <p>Nasiyanur, Erode</p>
                                        <p>Tamil Nadu, India</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Customer Information */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                Customer Information
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
                            </div>
                        </div>

                        {/* Delivery Information - Only show for delivery */}
                        {orderType === "delivery" && (
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-2xl font-bold mb-6">
                                    Delivery Information
                                </h2>
                                <div className="space-y-4">
                                    {/* Pincode Field */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Pincode *
                                        </label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handlePincodeChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            placeholder="Enter 6-digit pincode"
                                            maxLength={6}
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter pincode to auto-fill area, district, and state
                                        </p>
                                    </div>

                                    {/* Auto-filled Address Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Area *
                                            </label>
                                            {showAreaDropdown ? (
                                                <div className="relative">
                                                    <select
                                                        value={formData.area}
                                                        onChange={(e) => handleAreaSelect(e.target.value)}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                                                        required
                                                    >
                                                        <option value="">Select Area</option>
                                                        {[...new Set(availableAreas.map(item => item.area))].map((area, index) => (
                                                            <option key={index} value={area}>
                                                                {area}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <p className="text-xs text-green-600 mt-1">
                                                        Multiple areas found for this pincode. Please select one.
                                                    </p>
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    name="area"
                                                    value={formData.area}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                                                    placeholder="Area will be auto-filled"
                                                    required
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                District *
                                            </label>
                                            <input
                                                type="text"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                                                placeholder="District will be auto-filled"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-50"
                                            placeholder="State will be auto-filled"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Street Address *
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            rows={3}
                                            placeholder="House/Flat No., Street Name, Landmark"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-6">
                                Payment Method
                            </h2>
                            <div className="space-y-3">
                                {/* Cash Payment - Different labels for delivery vs pickup */}
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
                                            <h3 className="font-bold">
                                                {orderType === 'pickup' ? 'Pay at Store (Cash)' : 'Cash on Delivery'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {orderType === 'pickup' 
                                                    ? 'Pay with cash when you collect your order'
                                                    : 'Pay when you receive your order'
                                                }
                                            </p>
                                        </div>
                                        {formData.paymentMethod === 'cod' && (
                                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* UPI Payment */}
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
                                            <h3 className="font-bold">UPI Online Pay</h3>
                                            <p className="text-sm text-gray-600">
                                                Pay online via UPI apps
                                            </p>
                                        </div>
                                        {formData.paymentMethod === 'upi' && (
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
                                    
                                    {/* Safe UPI Payment System - QR + Universal Open Button */}
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-4">Pay ₹{finalTotal} via UPI:</p>
                                        
                                        {/* Auto-Generated QR Code */}
                                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                                            <div className="text-center">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Scan QR Code to Pay</h4>
                                                <div className="inline-block p-4 bg-gray-50 rounded-lg border">
                                                    <Image
                                                        src={generateQRCode()}
                                                        alt="UPI QR Code"
                                                        width={200}
                                                        height={200}
                                                        className="rounded-lg"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-600 mt-2 mb-3">
                                                    Open any UPI app → Scan QR → Pay ₹{finalTotal}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={downloadQRCode}
                                                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Download QR Code
                                                </button>
                                            </div>
                                        </div>

                                        {/* Universal Open UPI App Button */}
                                        <button
                                            type="button"
                                            onClick={openUpiApp}
                                            className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg mb-4"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-lg font-bold">₹</span>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold text-lg">Open UPI App</div>
                                                    <div className="text-sm opacity-90">Choose your preferred UPI app</div>
                                                </div>
                                            </div>
                                        </button>

                                        {/* Copy Options */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(TFC_UPI_ID || "", "UPI ID")}
                                                className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold text-blue-800">Copy UPI ID</div>
                                                    <div className="text-xs text-blue-600 mt-1">{TFC_UPI_ID}</div>
                                                </div>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(TFC_UPI_MOBILE || "", "UPI Number")}
                                                className="flex items-center justify-center p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                                            >
                                                <div className="text-center">
                                                    <div className="text-sm font-semibold text-purple-800">Copy UPI Number</div>
                                                    <div className="text-xs text-purple-600 mt-1">{TFC_UPI_MOBILE}</div>
                                                </div>
                                            </button>
                                        </div>

                                        {/* Helper Message */}
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800 text-center">
                                                <span className="font-semibold">💡 Tip:</span> QR code works with all UPI apps. "Open UPI App" shows app chooser.
                                            </p>
                                        </div>
                                    </div>



                                    {/* UPI Details Form - Simplified */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                UPI App Used <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={upiAppUsed}
                                                onChange={(e) => setUpiAppUsed(e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    !upiAppUsed ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                }`}
                                                required={formData.paymentMethod === "upi"}
                                            >
                                                <option value="">Select UPI App</option>
                                                <option value="Google Pay">Google Pay</option>
                                                <option value="PhonePe">PhonePe</option>
                                                <option value="Paytm">Paytm</option>
                                                <option value="Other UPI">Other UPI</option>
                                            </select>
                                            {!upiAppUsed && (
                                                <p className="text-red-500 text-xs mt-1">Please select a UPI app</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Your UPI Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={upiUserName}
                                                onChange={(e) => setUpiUserName(e.target.value)}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    formData.paymentMethod === "upi" && (!upiUserName || upiUserName.trim().length < 2) 
                                                        ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="Your full name as per UPI"
                                                required={formData.paymentMethod === "upi"}
                                            />
                                            {formData.paymentMethod === "upi" && (!upiUserName || upiUserName.trim().length < 2) && (
                                                <p className="text-red-500 text-xs mt-1">Enter your full name (minimum 2 characters)</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Your UPI Mobile Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                maxLength={10}
                                                value={upiMobile}
                                                onChange={(e) => setUpiMobile(e.target.value.replace(/\D/g, ''))}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    formData.paymentMethod === "upi" && upiMobile.length !== 10 
                                                        ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="10-digit mobile number"
                                                required={formData.paymentMethod === "upi"}
                                            />
                                            {formData.paymentMethod === "upi" && upiMobile.length !== 10 && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    Enter exactly 10 digits ({upiMobile.length}/10)
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-800">
                                            <strong>Note:</strong> All UPI fields are mandatory. Order cannot be placed without complete UPI details.
                                        </p>
                                        <p className="text-sm text-red-700 mt-1">
                                            We will verify your number whether amount is paid or not.
                                        </p>
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
                                        <span>
                                            {orderType === 'pickup' ? 'Pickup' : 'Delivery Fee'}
                                        </span>
                                        <span className="font-semibold">
                                            {orderType === 'pickup' ? (
                                                <span className="text-green-500">FREE</span>
                                            ) : deliveryFee === 0 ? (
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
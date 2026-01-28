'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import toast from "@/lib/toast";
import { useEffect, useState } from 'react';
import ClientOnly from '@/components/ClientOnly';

function CartContent() {
    const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
    const { currentUser: emailUser } = useEmailAuth();

    const handleRemoveItem = (id: string, name: string) => {
        removeItem(id);
        toast.success(`${name} removed from cart`);
    };

    const handleClearCart = () => {
        toast.action(
            'Are you sure you want to clear your cart?',
            [
                {
                    label: 'Clear Cart',
                    onClick: () => {
                        clearCart();
                        toast.success('Cart cleared');
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

    const getCheckoutLink = () => {
        if (emailUser) {
            return "/checkout";
        } else {
            return "/login?redirect=/checkout";
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-md mx-auto"
                >
                    <div className="text-6xl sm:text-8xl mb-6">🛒</div>
                    <h1 className="text-2xl sm:text-4xl font-bold mb-4">Your Cart is Empty</h1>
                    <p className="text-gray-600 text-base sm:text-lg mb-8">
                        Add some delicious food to get started!
                    </p>
                    <Link href="/menu" className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 inline-flex items-center space-x-2 w-full sm:w-auto justify-center">
                        <ShoppingBag className="w-5 h-5" />
                        <span>Browse Menu</span>
                    </Link>
                </motion.div>
            </div>
        );
    }

    const totalPrice = getTotalPrice();
    const deliveryFee = totalPrice > 500 ? 0 : 40;
    const finalTotal = totalPrice + deliveryFee;

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 sm:mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-2">
                                Your Cart
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base">
                                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                            </p>
                        </div>
                        <button
                            onClick={handleClearCart}
                            className="text-red-500 hover:text-red-600 font-semibold transition-colors text-sm sm:text-base self-start sm:self-auto"
                        >
                            Clear Cart
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <AnimatePresence>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 hover:shadow-lg transition-shadow"
                                >
                                    {/* Mobile Layout */}
                                    <div className="sm:hidden">
                                        <div className="flex items-start space-x-3 mb-4">
                                            {/* Image */}
                                            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            
                                            {/* Details */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base mb-1 truncate">
                                                    {item.name}
                                                </h3>
                                                <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                                                    {item.description}
                                                </p>
                                                <p className="text-red-500 font-bold text-lg">
                                                    ₹{item.price.toFixed(0)}
                                                </p>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveItem(item.id, item.name)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Quantity:</span>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="font-bold text-base w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden sm:flex items-center space-x-4">
                                        {/* Image */}
                                        <div className="relative w-20 h-20 lg:w-24 lg:h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">
                                                {item.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                                                {item.description}
                                            </p>
                                            <p className="text-red-500 font-bold text-xl">
                                                ₹{item.price.toFixed(0)}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-lg w-8 text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveItem(item.id, item.name)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-24"
                        >
                            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                                Order Summary
                            </h2>

                            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">₹{totalPrice.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                                    <span>Delivery Fee</span>
                                    <span className="font-semibold">
                                        {deliveryFee === 0 ? (
                                            <span className="text-green-500">FREE</span>
                                        ) : (
                                            <>₹{deliveryFee}</>
                                        )}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                                    <div className="flex justify-between text-lg sm:text-xl font-bold">
                                        <span>Total</span>
                                        <span className="text-red-500">₹{finalTotal.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>

                            {deliveryFee > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                    <p className="text-xs sm:text-sm text-gray-700">
                                        💡 Add ₹{(500 - totalPrice).toFixed(0)} more to get <strong>FREE delivery</strong>!
                                    </p>
                                </div>
                            )}

                            <Link
                                href={getCheckoutLink()}
                                className="bg-red-500 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-red-600 w-full flex items-center justify-center space-x-2 mb-3 text-sm sm:text-base font-medium"
                            >
                                <span className="truncate">{emailUser ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            </Link>

                            <Link
                                href="/menu"
                                className="border border-gray-300 text-gray-700 px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-50 w-full text-center block text-sm sm:text-base"
                            >
                                Continue Shopping
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CartPage() {
    return (
        <ClientOnly>
            <CartContent />
        </ClientOnly>
    );
}

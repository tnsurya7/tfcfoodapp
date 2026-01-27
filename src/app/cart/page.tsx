'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import toast from "@/lib/toast";

export default function CartPage() {
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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <div className="text-8xl mb-6">🛒</div>
                    <h1 className="text-4xl font-bold mb-4 dark:text-white">Your Cart is Empty</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                        Add some delicious food to get started!
                    </p>
                    <Link href="/menu" className="btn-primary inline-flex items-center space-x-2">
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
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
                                Your Cart
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                            </p>
                        </div>
                        <button
                            onClick={handleClearCart}
                            className="text-red-500 hover:text-red-600 font-semibold transition-colors"
                        >
                            Clear Cart
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
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
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center space-x-4">
                                        {/* Image */}
                                        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1 dark:text-white">
                                                {item.name}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-1">
                                                {item.description}
                                            </p>
                                            <p className="text-primary font-bold text-xl">
                                                ₹{item.price.toFixed(0)}
                                            </p>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-bold text-lg w-8 text-center dark:text-white">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveItem(item.id, item.name)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24"
                        >
                            <h2 className="text-2xl font-bold mb-6 dark:text-white">
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">₹{totalPrice.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Delivery Fee</span>
                                    <span className="font-semibold">
                                        {deliveryFee === 0 ? (
                                            <span className="text-green-500">FREE</span>
                                        ) : (
                                            <>₹{deliveryFee}</>
                                        )}
                                    </span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex justify-between text-xl font-bold dark:text-white">
                                        <span>Total</span>
                                        <span className="text-primary">₹{finalTotal.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>

                            {deliveryFee > 0 && (
                                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        💡 Add ₹{(500 - totalPrice).toFixed(0)} more to get <strong>FREE delivery</strong>!
                                    </p>
                                </div>
                            )}

                            <Link
                                href={getCheckoutLink()}
                                className="btn-primary w-full flex items-center justify-center space-x-2"
                            >
                                <span>{emailUser ? 'Proceed to Checkout' : 'Login to Checkout'}</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>

                            <Link
                                href="/menu"
                                className="btn-outline w-full mt-3 text-center block"
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

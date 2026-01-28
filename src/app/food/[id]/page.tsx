'use client';

import { useState, use, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Clock } from 'lucide-react';
import { useFirebaseFoodStore } from '@/store/firebaseFoodStore';
import { useFirebaseCartStore } from '@/store/firebaseCartStore';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import { generateUserId } from '@/lib/firebaseHelpers';
import toast from '@/lib/toast';
import { useRouter } from 'next/navigation';

export default function FoodDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { addItem, setUserId } = useFirebaseCartStore();
    const { foods, fetchFoods } = useFirebaseFoodStore();
    const { currentUser: emailUser } = useEmailAuth();

    // Load foods when component mounts
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchFoods();
            setIsLoading(false);
        };
        loadData();
    }, [fetchFoods]);

    const food = foods.find((f) => f.id === resolvedParams.id);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading food details...</p>
                </div>
            </div>
        );
    }

    if (!food) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Food Not Found</h1>
                    <Link href="/menu" className="btn-primary">
                        Back to Menu
                    </Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = async () => {
        if (!emailUser?.email) {
            toast.error('Please login to add items to cart');
            router.push('/login');
            return;
        }

        setUserId(emailUser.email);
        
        // Add items one by one to maintain quantity
        for (let i = 0; i < quantity; i++) {
            const result = await addItem(food);
            if (!result) {
                toast.error('Failed to add item to cart');
                return;
            }
        }
        
        toast.success(`${quantity} x ${food.name} added to cart!`);
        router.push('/cart');
    };

    const relatedFoods = foods
        .filter((f) => f.category === food.category && f.id !== food.id)
        .slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                {/* Back Button */}
                <Link
                    href="/menu"
                    className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Menu</span>
                </Link>

                <div className="grid md:grid-cols-2 gap-12 mb-16">
                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                            <Image
                                src={food.image}
                                alt={food.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {food.isPopular && (
                                <div className="absolute top-4 left-4 bg-primary text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                    ⭐ Popular
                                </div>
                            )}
                            {food.isSpecial && (
                                <div className="absolute top-4 right-4 bg-secondary text-white px-4 py-2 rounded-full font-bold shadow-lg">
                                    🔥 Special Offer
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Details Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col"
                    >
                        {/* Category Badge */}
                        <div className="mb-4">
                            <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-full text-sm font-semibold capitalize">
                                {food.category.replace('-', ' ')}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
                            {food.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="flex items-center space-x-1 text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <span className="text-gray-600 dark:text-gray-400">(4.9 out of 5)</span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 leading-relaxed">
                            {food.description}
                        </p>

                        {/* Additional Info */}
                        <div className="flex items-center space-x-6 mb-8">
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                <Clock className="w-5 h-5" />
                                <span>20-25 min</span>
                            </div>
                            <div
                                className={`px-4 py-2 rounded-full text-sm font-semibold ${food.type === 'veg'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                    }`}
                            >
                                {food.type === 'veg' ? '🌱 Vegetarian' : '🍖 Non-Vegetarian'}
                            </div>
                        </div>

                        <div className="mb-8">
                            <span className="text-5xl font-bold text-primary">
                                ₹{food.price}
                            </span>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Quantity
                            </label>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="text-2xl font-bold w-12 text-center dark:text-white">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className="btn-primary text-lg flex items-center justify-center space-x-3"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            <span>Add to Cart - ₹{food.price * quantity}</span>
                        </button>
                    </motion.div>
                </div>

                {/* Related Items */}
                {relatedFoods.length > 0 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-8 dark:text-white">
                            You May Also Like
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedFoods.map((relatedFood, index) => (
                                <motion.div
                                    key={relatedFood.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Link href={`/food/${relatedFood.id}`}>
                                        <div className="food-card">
                                            <div className="relative h-48">
                                                <Image
                                                    src={relatedFood.image}
                                                    alt={relatedFood.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-lg mb-2 dark:text-white">
                                                    {relatedFood.name}
                                                </h3>
                                                <p className="text-primary font-bold">
                                                    ₹{relatedFood.price}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

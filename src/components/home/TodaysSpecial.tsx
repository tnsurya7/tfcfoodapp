'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { listenToFoods } from '@/lib/firebaseHelpers';
import { FoodItem } from '@/store/cartStore';

export default function TodaysSpecial() {
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Set up real-time listener for foods
        const unsubscribe = listenToFoods((updatedFoods: any[]) => {
            setFoods(updatedFoods);
            setLoading(false);
        });

        // Cleanup listener on unmount
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);
    
    const specialItem = foods.find((food) => food.special === true);

    if (loading) {
        return (
            <section className="py-16 bg-gradient-to-br from-secondary/10 to-primary/10">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading today's special...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!specialItem) return null;

    return (
        <section className="py-16 bg-gradient-to-br from-secondary/10 to-primary/10 dark:from-secondary/5 dark:to-primary/5">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="inline-block bg-primary text-white px-6 py-2 rounded-full font-bold mb-4">
                        🔥 Today's Special
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold dark:text-white">
                        Limited Time Offer!
                    </h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-0">
                            {/* Image Side */}
                            <div className="relative h-80 md:h-auto">
                                <Image
                                    src={specialItem.image}
                                    alt={specialItem.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg">
                                    20% OFF
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="flex items-center space-x-1 text-yellow-500">
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                        <Star className="w-5 h-5 fill-current" />
                                    </div>
                                    <span className="text-gray-600 dark:text-gray-400">(4.9)</span>
                                </div>

                                <h3 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
                                    {specialItem.name}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 leading-relaxed">
                                    {specialItem.description}
                                </p>

                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                                        <Clock className="w-5 h-5" />
                                        <span>20-25 min</span>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${specialItem.type === 'veg'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                        {specialItem.type === 'veg' ? '🌱 Veg' : '🍖 Non-Veg'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <span className="text-gray-400 line-through text-xl">
                                            ₹{Math.round(specialItem.price * 1.2)}
                                        </span>
                                        <span className="text-4xl font-bold text-primary ml-3">
                                            ₹{specialItem.price}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href={`/food/${specialItem.id}`}
                                    className="btn-primary text-center text-lg"
                                >
                                    Order Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

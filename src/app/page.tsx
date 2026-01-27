'use client';

import { motion } from 'framer-motion';
import { Search, ChevronRight, Star, Clock, Truck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import CategorySlider from '@/components/home/CategorySlider';
import PopularItems from '@/components/home/PopularItems';
import TodaysSpecial from '@/components/home/TodaysSpecial';

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/menu?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    const features = [
        {
            icon: <Clock className="w-8 h-8" />,
            title: 'Fast Delivery',
            description: 'Get your food in 30 minutes or less',
        },
        {
            icon: <Star className="w-8 h-8" />,
            title: 'Quality Food',
            description: 'Fresh ingredients, amazing taste',
        },
        {
            icon: <Truck className="w-8 h-8" />,
            title: 'Free Delivery',
            description: 'On orders above ₹500',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary-dark to-red-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-secondary rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                        >
                            Delicious Food
                            <br />
                            <span className="text-secondary">Delivered Fast</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-xl md:text-2xl mb-8 text-gray-100"
                        >
                            Order your favorite meals and get them delivered to your doorstep in minutes!
                        </motion.p>

                        {/* Search Bar */}
                        <motion.form
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            onSubmit={handleSearch}
                            className="max-w-2xl mx-auto mb-8"
                        >
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for food..."
                                    className="w-full px-6 py-4 pr-14 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-secondary shadow-2xl"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-dark text-white p-3 rounded-full transition-colors"
                                >
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.form>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <Link
                                href="/menu"
                                className="inline-flex items-center space-x-2 bg-secondary hover:bg-secondary-dark text-white font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                            >
                                <span>Browse Menu</span>
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                            fill="white"
                            className="dark:fill-gray-900"
                        />
                    </svg>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center p-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Category Slider */}
            <CategorySlider />

            {/* Today's Special */}
            <TodaysSpecial />

            {/* Popular Items */}
            <PopularItems />

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Order?
                        </h2>
                        <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
                            Join thousands of happy customers enjoying delicious food every day!
                        </p>
                        <Link
                            href="/menu"
                            className="inline-flex items-center space-x-2 bg-white text-primary hover:bg-gray-100 font-bold px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                        >
                            <span>Order Now</span>
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

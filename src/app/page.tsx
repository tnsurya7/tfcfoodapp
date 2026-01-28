'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, Truck } from 'lucide-react';
import Link from 'next/link';
import CategorySlider from '@/components/home/CategorySlider';
import PopularItems from '@/components/home/PopularItems';
import TodaysSpecial from '@/components/home/TodaysSpecial';

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-red-500 via-red-600 to-red-900 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative container mx-auto px-4 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                        >
                            Delicious Food
                            <span className="block text-yellow-300">Delivered Fast</span>
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto"
                        >
                            Experience the finest flavors from Nasiyanur, Erode. Fresh ingredients, authentic taste, delivered to your doorstep.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <Link
                                href="/menu"
                                className="bg-white text-red-600 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <span>Order Now</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            
                            <Link
                                href="/menu"
                                className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-red-600 transition-all duration-300"
                            >
                                Browse Menu
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
                        >
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300">500+</div>
                                <div className="text-sm text-gray-200">Happy Customers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300">30min</div>
                                <div className="text-sm text-gray-200">Avg Delivery</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-yellow-300">4.8★</div>
                                <div className="text-sm text-gray-200">Customer Rating</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-300/20 rounded-full blur-xl"></div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Why Choose TFC?</h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            We're committed to delivering exceptional food experiences with quality, speed, and care.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            viewport={{ once: true }}
                            className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                            <p className="text-gray-600">Fresh ingredients and authentic recipes for the best taste experience.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
                            <p className="text-gray-600">Quick and reliable delivery service to get your food while it's hot.</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Free Delivery</h3>
                            <p className="text-gray-600">Free delivery on orders above ₹500. Save more while you enjoy more.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Explore Our Menu</h2>
                        <p className="text-gray-600 text-lg">
                            Discover our wide range of delicious food categories
                        </p>
                    </motion.div>
                    <CategorySlider />
                </div>
            </section>

            {/* Today's Special */}
            <TodaysSpecial />

            {/* Popular Items */}
            <PopularItems />

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-red-500 to-red-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
                        <p className="text-xl mb-8 text-red-100">
                            Join thousands of satisfied customers and experience the TFC difference today!
                        </p>
                        <Link
                            href="/menu"
                            className="bg-white text-red-600 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-all duration-300 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <span>Start Ordering</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}

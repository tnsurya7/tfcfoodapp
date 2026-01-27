'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef } from 'react';

const categories = [
    { id: 'chicken', name: 'Chicken', emoji: '🍗', color: 'from-orange-400 to-red-500' },
    { id: 'egg', name: 'Egg', emoji: '🥚', color: 'from-yellow-400 to-orange-400' },
    { id: 'veg', name: 'Vegetarian', emoji: '🥗', color: 'from-green-400 to-emerald-500' },
    { id: 'fried-rice', name: 'Fried Rice', emoji: '🍚', color: 'from-amber-400 to-orange-500' },
    { id: 'noodles', name: 'Noodles', emoji: '🍜', color: 'from-yellow-500 to-red-500' },
    { id: 'drinks', name: 'Drinks', emoji: '🥤', color: 'from-blue-400 to-cyan-500' },
    { id: 'desserts', name: 'Desserts', emoji: '🍰', color: 'from-pink-400 to-purple-500' },
];

export default function CategorySlider() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            const newScrollLeft =
                direction === 'left'
                    ? scrollRef.current.scrollLeft - scrollAmount
                    : scrollRef.current.scrollLeft + scrollAmount;

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth',
            });

            setTimeout(() => {
                if (scrollRef.current) {
                    setCanScrollLeft(scrollRef.current.scrollLeft > 0);
                    setCanScrollRight(
                        scrollRef.current.scrollLeft <
                        scrollRef.current.scrollWidth - scrollRef.current.clientWidth
                    );
                }
            }, 300);
        }
    };

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Browse Categories
                    </h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`p-2 rounded-full transition-all ${canScrollLeft
                                    ? 'bg-primary text-white hover:bg-primary-dark'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`p-2 rounded-full transition-all ${canScrollRight
                                    ? 'bg-primary text-white hover:bg-primary-dark'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link
                                href={`/menu?category=${category.id}`}
                                className="block flex-shrink-0"
                            >
                                <div className={`w-40 h-40 rounded-2xl bg-gradient-to-br ${category.color} p-1 transform transition-all duration-300 hover:scale-110 hover:shadow-2xl`}>
                                    <div className="w-full h-full bg-white rounded-xl flex flex-col items-center justify-center space-y-2">
                                        <span className="text-5xl">{category.emoji}</span>
                                        <span className="font-bold text-gray-800">
                                            {category.name}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

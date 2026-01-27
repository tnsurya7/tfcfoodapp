'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import FoodCard from '@/components/food/FoodCard';
import { useFoodStore } from '@/store/foodStore';
import { useSearchParams } from 'next/navigation';

const categories = [
    { id: 'all', name: 'All' },
    { id: 'chicken', name: 'Chicken' },
    { id: 'egg', name: 'Egg' },
    { id: 'veg', name: 'Vegetarian' },
    { id: 'fried-rice', name: 'Fried Rice' },
    { id: 'noodles', name: 'Noodles' },
    { id: 'drinks', name: 'Drinks' },
    { id: 'desserts', name: 'Desserts' },
];

function MenuContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const { foods } = useFoodStore();

    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
    const [searchQuery, setSearchQuery] = useState(searchParam || '');
    const [filteredFoods, setFilteredFoods] = useState(foods);

    useEffect(() => {
        let filtered = foods;

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((food) => food.category === selectedCategory);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(
                (food) =>
                    food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    food.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredFoods(filtered);
    }, [selectedCategory, searchQuery, foods]);

    useEffect(() => {
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [categoryParam]);

    useEffect(() => {
        if (searchParam) {
            setSearchQuery(searchParam);
        }
    }, [searchParam]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 dark:text-white">
                        Our Menu
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Explore our delicious selection of food
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="max-w-2xl mx-auto mb-8"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for food..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-md"
                        />
                    </div>
                </motion.div>

                {/* Category Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="flex items-center space-x-2 mb-4">
                        <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                            Filter by Category:
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${selectedCategory === category.id
                                        ? 'bg-primary text-white shadow-lg scale-105'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        Showing <span className="font-bold text-primary">{filteredFoods.length}</span> items
                    </p>
                </div>

                {/* Food Grid */}
                {filteredFoods.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredFoods.map((food, index) => (
                            <motion.div
                                key={food.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                            >
                                <FoodCard food={food} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="text-6xl mb-4">🍽️</div>
                        <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                            No items found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Try adjusting your search or filter to find what you're looking for.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <MenuContent />
        </Suspense>
    );
}

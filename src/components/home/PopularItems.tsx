'use client';

import { motion } from 'framer-motion';
import FoodCard from '@/components/food/FoodCard';
import { useFoodStore } from '@/store/foodStore';

export default function PopularItems() {
    const { foods } = useFoodStore();
    const popularItems = foods.filter((food) => food.isPopular).slice(0, 6);

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Popular Items
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Our customers' favorite dishes
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popularItems.map((food, index) => (
                        <motion.div
                            key={food.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <FoodCard food={food} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

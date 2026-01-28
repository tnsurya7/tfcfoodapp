'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { FoodItem } from '@/store/cartStore';
import { useFirebaseCartStore } from '@/store/firebaseCartStore';
import { useEmailAuth } from '@/contexts/EmailAuthContext';
import { generateUserId } from '@/lib/firebaseHelpers';
import toast from '@/lib/toast';

interface FoodCardProps {
    food: FoodItem;
}

export default function FoodCard({ food }: FoodCardProps) {
    const { addItem, setUserId } = useFirebaseCartStore();
    const { currentUser: emailUser } = useEmailAuth();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!emailUser?.email) {
            toast.error('Please login to add items to cart');
            return;
        }

        setUserId(emailUser.email);
        const result = await addItem(food);
        
        if (result) {
            toast.success(`${food.name} added to cart!`);
        } else {
            toast.error('Failed to add item to cart');
        }
    };

    return (
        <Link href={`/food/${food.id}`}>
            <motion.div
                whileHover={{ y: -8 }}
                className="food-card group h-full flex flex-col"
            >
                {/* Image */}
                <div className="relative h-56 flex-shrink-0 overflow-hidden">
                    <Image
                        src={food.image}
                        alt={food.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col space-y-2">
                        {food.isPopular && (
                            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                ⭐ Popular
                            </span>
                        )}
                        {food.isSpecial && (
                            <span className="bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                🔥 Special
                            </span>
                        )}
                    </div>

                    {/* Veg/Non-Veg Indicator */}
                    <div className="absolute top-3 right-3">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${food.type === 'veg' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                        >
                            <div className={`w-3 h-3 rounded-full ${food.type === 'veg' ? 'bg-white' : 'bg-white'}`}></div>
                        </div>
                    </div>

                    {/* Add to Cart Button (Hover) */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button
                            onClick={handleAddToCart}
                            className="bg-white text-primary hover:bg-primary hover:text-white font-bold px-6 py-3 rounded-full transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl flex items-center space-x-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span>Add to Cart</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1 flex-1">
                            {food.name}
                        </h3>
                        <div className="flex items-center space-x-1 text-yellow-500 ml-2">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-semibold">4.5</span>
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                        {food.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-2xl font-bold text-primary">
                            ₹{food.price.toFixed(0)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {food.category}
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

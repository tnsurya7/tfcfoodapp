'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { FoodItem } from '@/store/cartStore';
import { useFoodStore } from '@/store/foodStore';
import toast from 'react-hot-toast';

interface FoodFormProps {
    food?: FoodItem;
    onClose: () => void;
    onSave: () => void;
}

export default function FoodForm({ food, onClose, onSave }: FoodFormProps) {
    const { addFood, updateFood } = useFoodStore();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        image: '',
        category: 'chicken',
        isVeg: false,
        isPopular: false,
        isSpecial: false,
    });

    useEffect(() => {
        if (food) {
            setFormData({
                name: food.name,
                description: food.description,
                price: food.price,
                image: food.image,
                category: food.category,
                isVeg: food.isVeg,
                isPopular: food.isPopular || false,
                isSpecial: food.isSpecial || false,
            });
        }
    }, [food]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.description || !formData.image || formData.price <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (food) {
            updateFood(food.id, formData);
            toast.success('Food item updated successfully!');
        } else {
            addFood(formData);
            toast.success('Food item added successfully!');
        }

        onSave();
        onClose();
    };

    const categories = [
        { value: 'chicken', label: 'Chicken' },
        { value: 'egg', label: 'Egg' },
        { value: 'veg', label: 'Vegetarian' },
        { value: 'fried-rice', label: 'Fried Rice' },
        { value: 'noodles', label: 'Noodles' },
        { value: 'drinks', label: 'Drinks' },
        { value: 'desserts', label: 'Desserts' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold dark:text-white">
                        {food ? 'Edit Food Item' : 'Add New Food Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 dark:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                placeholder="Enter food name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Price (₹) *
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                className="input-field"
                                placeholder="Enter price"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input-field"
                            rows={3}
                            placeholder="Enter food description"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Image URL *
                        </label>
                        <input
                            type="url"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="input-field"
                            placeholder="https://example.com/image.jpg"
                            required
                        />
                        {formData.image && (
                            <div className="mt-2">
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Category *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="input-field"
                            required
                        >
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="isVeg"
                                checked={formData.isVeg}
                                onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="isVeg" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Vegetarian
                            </label>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="isPopular"
                                checked={formData.isPopular}
                                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="isPopular" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Popular Item
                            </label>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="isSpecial"
                                checked={formData.isSpecial}
                                onChange={(e) => setFormData({ ...formData, isSpecial: e.target.checked })}
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="isSpecial" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Today's Special
                            </label>
                        </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-outline flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex-1"
                        >
                            {food ? 'Update Food' : 'Add Food'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
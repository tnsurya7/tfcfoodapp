'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { FoodItem } from '@/store/cartStore';
import toast from '@/lib/toast';
import { useFirebaseFoodStore } from '@/store/firebaseFoodStore';

interface FoodFormProps {
    food?: FoodItem;
    onClose: () => void;
    onSave: () => void;
}

export default function FoodForm({ food, onClose, onSave }: FoodFormProps) {
    const [loading, setLoading] = useState(false);
    const { addFood, updateFood } = useFirebaseFoodStore();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        image: '',
        category: 'fried',
        type: 'non-veg',
        popular: false,
        special: false,
    });

    useEffect(() => {
        if (food) {
            setFormData({
                name: food.name,
                description: food.description,
                price: food.price,
                image: food.image,
                category: food.category,
                type: food.type,
                popular: food.popular || false,
                special: food.special || false,
            });
        }
    }, [food]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.description || !formData.image || formData.price <= 0) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            if (food) {
                // Update existing food using Firebase store
                console.log('🔥 Updating food with ID:', food.id);
                console.log('📝 Form data:', formData);
                
                await updateFood(food.id, formData);
                console.log('✅ Food updated successfully');
                
                toast.success('Food item updated successfully!');
                onSave(); // This will trigger any cleanup needed
                onClose();
            } else {
                // Add new food using Firebase store
                console.log('➕ Adding new food:', formData.name);
                
                await addFood(formData);
                console.log('✅ Food added successfully');
                
                toast.success('Food item added successfully!');
                onSave(); // This will trigger any cleanup needed
                onClose();
            }
        } catch (error) {
            console.error('Error saving food:', error);
            toast.error('Failed to save food item');
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { value: 'fried', label: 'Fried' },
        { value: 'bbq', label: 'BBQ' },
        { value: 'rice', label: 'Rice' },
        { value: 'noodles', label: 'Noodles' },
        { value: 'chilli', label: 'Chilli' },
        { value: 'gravy', label: 'Gravy' },
        { value: 'desserts', label: 'Desserts' },
        { value: 'drinks', label: 'Drinks' },
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Food Type
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                <option value="veg">Vegetarian</option>
                                <option value="non-veg">Non-Vegetarian</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="popular"
                                checked={formData.popular}
                                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="popular" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Popular Item
                            </label>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="special"
                                checked={formData.special}
                                onChange={(e) => setFormData({ ...formData, special: e.target.checked })}
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="special" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            disabled={loading}
                            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {food ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                food ? 'Update Food' : 'Add Food'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
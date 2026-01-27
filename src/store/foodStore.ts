import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FoodItem } from './cartStore';
import { sampleFoods } from '@/data/sampleData';

interface FoodStore {
    foods: FoodItem[];
    addFood: (food: Omit<FoodItem, 'id'>) => void;
    updateFood: (id: string, food: Partial<FoodItem>) => void;
    deleteFood: (id: string) => void;
    getFoodById: (id: string) => FoodItem | undefined;
    getFoodsByCategory: (category: string) => FoodItem[];
    resetToSampleData: () => void;
}

export const useFoodStore = create<FoodStore>()(
    persist(
        (set, get) => ({
            foods: sampleFoods,
            
            addFood: (food) => {
                const newFood: FoodItem = {
                    ...food,
                    id: Date.now().toString(),
                };
                set((state) => ({
                    foods: [...state.foods, newFood],
                }));
            },
            
            updateFood: (id, updatedFood) => {
                set((state) => ({
                    foods: state.foods.map((food) =>
                        food.id === id ? { ...food, ...updatedFood } : food
                    ),
                }));
            },
            
            deleteFood: (id) => {
                set((state) => ({
                    foods: state.foods.filter((food) => food.id !== id),
                }));
            },
            
            getFoodById: (id) => {
                return get().foods.find((food) => food.id === id);
            },
            
            getFoodsByCategory: (category) => {
                return get().foods.filter((food) => food.category === category);
            },
            
            resetToSampleData: () => {
                set({ foods: sampleFoods });
            },
        }),
        {
            name: 'food-storage',
        }
    )
);
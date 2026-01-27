import { create } from 'zustand';
import { addFood, updateFood, deleteFood, getAllFoods, listenToFoods } from '@/lib/firebaseHelpers';
import { FoodItem } from './cartStore';
import toast from '@/lib/toast';

interface FirebaseFoodStore {
    foods: FoodItem[];
    loading: boolean;
    error: string | null;
    
    // Actions
    fetchFoods: () => Promise<void>;
    addNewFood: (food: Omit<FoodItem, 'id'>) => Promise<boolean>;
    updateExistingFood: (id: string, food: Partial<FoodItem>) => Promise<boolean>;
    deleteExistingFood: (id: string) => Promise<boolean>;
    getFoodById: (id: string) => FoodItem | undefined;
    getFoodsByCategory: (category: string) => FoodItem[];
    
    // Real-time listener
    startListening: () => () => void;
    stopListening: () => void;
    
    // Internal state management
    setFoods: (foods: FoodItem[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

let unsubscribeListener: (() => void) | null = null;

export const useFirebaseFoodStore = create<FirebaseFoodStore>((set, get) => ({
    foods: [],
    loading: false,
    error: null,
    
    // Fetch all foods from Firebase
    fetchFoods: async () => {
        set({ loading: true, error: null });
        try {
            const result = await getAllFoods();
            if (result.success) {
                set({ foods: result.foods, loading: false });
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to fetch foods');
            }
        } catch (error) {
            set({ error: 'Failed to fetch foods', loading: false });
            toast.error('Failed to fetch foods');
        }
    },
    
    // Add new food to Firebase
    addNewFood: async (foodData) => {
        set({ loading: true, error: null });
        try {
            const result = await addFood(foodData);
            if (result.success) {
                // Food will be updated via real-time listener
                set({ loading: false });
                toast.success('Food item added successfully');
                return true;
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to add food item');
                return false;
            }
        } catch (error) {
            set({ error: 'Failed to add food item', loading: false });
            toast.error('Failed to add food item');
            return false;
        }
    },
    
    // Update existing food in Firebase
    updateExistingFood: async (id, foodData) => {
        set({ loading: true, error: null });
        try {
            const result = await updateFood(id, foodData);
            if (result.success) {
                // Food will be updated via real-time listener
                set({ loading: false });
                toast.success('Food item updated successfully');
                return true;
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to update food item');
                return false;
            }
        } catch (error) {
            set({ error: 'Failed to update food item', loading: false });
            toast.error('Failed to update food item');
            return false;
        }
    },
    
    // Delete food from Firebase
    deleteExistingFood: async (id) => {
        set({ loading: true, error: null });
        try {
            const result = await deleteFood(id);
            if (result.success) {
                // Food will be removed via real-time listener
                set({ loading: false });
                toast.success('Food item deleted successfully');
                return true;
            } else {
                set({ error: result.error, loading: false });
                toast.error('Failed to delete food item');
                return false;
            }
        } catch (error) {
            set({ error: 'Failed to delete food item', loading: false });
            toast.error('Failed to delete food item');
            return false;
        }
    },
    
    // Get food by ID
    getFoodById: (id) => {
        return get().foods.find((food) => food.id === id);
    },
    
    // Get foods by category
    getFoodsByCategory: (category) => {
        return get().foods.filter((food) => food.category === category);
    },
    
    // Start real-time listener
    startListening: () => {
        if (unsubscribeListener) {
            unsubscribeListener();
        }
        
        unsubscribeListener = listenToFoods((foods: any) => {
            set({ foods, error: null });
        });
        
        return () => {
            if (unsubscribeListener) {
                unsubscribeListener();
                unsubscribeListener = null;
            }
        };
    },
    
    // Stop real-time listener
    stopListening: () => {
        if (unsubscribeListener) {
            unsubscribeListener();
            unsubscribeListener = null;
        }
    },
    
    // Internal state setters
    setFoods: (foods) => set({ foods }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
}));
import { create } from "zustand";
import { addFood as addFoodToFirebase, updateFoodInFirebase, deleteFood as deleteFoodFromFirebase, listenToFoods } from "@/lib/firebaseHelpers";

interface Food {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    category: string;
    type: string;
    popular: boolean;
    special: boolean;
}

interface FoodStore {
    foods: Food[];
    listenFoods: () => void;
    addFood: (food: Omit<Food, "id">) => Promise<void>;
    updateFood: (id: string, food: Partial<Food>) => Promise<void>;
    deleteFood: (id: string) => Promise<void>;
}

export const useFirebaseFoodStore = create<FoodStore>((set) => ({
    foods: [],

    listenFoods: () => {
        console.log('🔥 Starting Firebase foods listener...');
        
        const unsubscribe = listenToFoods((updatedFoods: any[]) => {
            console.log('📊 Firebase foods updated:', updatedFoods.length, 'items');
            set({ foods: updatedFoods });
        });
        
        return unsubscribe;
    },

    addFood: async (food) => {
        try {
            console.log('➕ Adding food to Firebase:', food.name);
            
            const result = await addFoodToFirebase(food);
            if (!result.success) {
                throw new Error('Failed to add food');
            }

            console.log('✅ Food added to Firebase successfully');
        } catch (error) {
            console.error('❌ Error adding food to Firebase:', error);
            throw error;
        }
    },

    updateFood: async (id, food) => {
        try {
            console.log('📝 Updating food in Firebase:', id);
            
            const result = await updateFoodInFirebase(id, food);
            if (!result.success) {
                throw new Error('Failed to update food');
            }

            console.log('✅ Food updated in Firebase successfully');
        } catch (error) {
            console.error('❌ Error updating food in Firebase:', error);
            throw error;
        }
    },

    deleteFood: async (id) => {
        try {
            console.log('🗑️ Deleting food from Firebase:', id);
            
            const result = await deleteFoodFromFirebase(id);
            if (!result.success) {
                throw new Error('Failed to delete food');
            }

            console.log('✅ Food deleted from Firebase successfully');
        } catch (error) {
            console.error('❌ Error deleting food from Firebase:', error);
            throw error;
        }
    },
}));
import { ref, get, push, set } from "firebase/database"
import { database } from "./firebase"

const defaultFoods = [
    // Chicken (5 items)
    { 
        name: "Spicy Chicken Wings", 
        price: 299, 
        category: "chicken", 
        description: "Crispy chicken wings tossed in our signature spicy sauce", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400", 
        popular: true, 
        special: false 
    },
    { 
        name: "Grilled Chicken Breast", 
        price: 349, 
        category: "chicken", 
        description: "Tender grilled chicken breast with herbs and spices", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400", 
        popular: true, 
        special: false 
    },
    { 
        name: "Chicken Tikka Masala", 
        price: 329, 
        category: "chicken", 
        description: "Creamy tomato-based curry with tender chicken pieces", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", 
        popular: false, 
        special: true 
    },
    { 
        name: "Butter Chicken", 
        price: 359, 
        category: "chicken", 
        description: "Rich and creamy chicken curry with aromatic spices", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400", 
        popular: true, 
        special: true 
    },
    { 
        name: "Chicken Biryani", 
        price: 389, 
        category: "chicken", 
        description: "Fragrant basmati rice with spiced chicken and herbs", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400", 
        popular: true, 
        special: false 
    },

    // Egg (4 items)
    { 
        name: "Egg Fried Rice", 
        price: 179, 
        category: "egg", 
        description: "Classic fried rice with scrambled eggs and vegetables", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400", 
        popular: true, 
        special: false 
    },
    { 
        name: "Masala Omelette", 
        price: 129, 
        category: "egg", 
        description: "Fluffy omelette with onions, tomatoes, and spices", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400", 
        popular: false, 
        special: false 
    },
    { 
        name: "Egg Curry", 
        price: 199, 
        category: "egg", 
        description: "Hard-boiled eggs in rich spicy gravy", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400", 
        popular: false, 
        special: false 
    },
    { 
        name: "Scrambled Eggs", 
        price: 149, 
        category: "egg", 
        description: "Creamy scrambled eggs with herbs and butter", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400", 
        popular: false, 
        special: false 
    },

    // Veg (5 items)
    { 
        name: "Paneer Tikka", 
        price: 249, 
        category: "veg", 
        description: "Grilled cottage cheese cubes marinated in spices", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400", 
        popular: true, 
        special: false 
    },
    { 
        name: "Vegetable Curry", 
        price: 199, 
        category: "veg", 
        description: "Mixed vegetables in rich curry sauce", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400", 
        popular: false, 
        special: false 
    },
    { 
        name: "Palak Paneer", 
        price: 229, 
        category: "veg", 
        description: "Cottage cheese in spinach gravy", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400", 
        popular: false, 
        special: false 
    },
    { 
        name: "Dal Tadka", 
        price: 169, 
        category: "veg", 
        description: "Yellow lentils tempered with spices", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", 
        popular: true, 
        special: false 
    },
    { 
        name: "Aloo Gobi", 
        price: 189, 
        category: "veg", 
        description: "Potato and cauliflower curry with spices", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", 
        popular: false, 
        special: true 
    },

    // Fried Rice (4 items)
    { 
        name: "Chicken Fried Rice", 
        price: 219, 
        category: "fried-rice", 
        description: "Wok tossed rice with chicken and vegetables", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400", 
        popular: true, 
        special: false 
    },
    { 
        name: "Vegetable Fried Rice", 
        price: 169, 
        category: "fried-rice", 
        description: "Mixed vegetables with seasoned rice", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400", 
        popular: false, 
        special: false 
    },
    { 
        name: "Shrimp Fried Rice", 
        price: 299, 
        category: "fried-rice", 
        description: "Succulent shrimp with aromatic rice", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1516684669134-de6f7c473a2a?w=400", 
        popular: false, 
        special: false 
    },
    { 
        name: "Mixed Fried Rice", 
        price: 249, 
        category: "fried-rice", 
        description: "Combination of chicken, egg, and vegetables", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400", 
        popular: false, 
        special: true 
    },

    // Noodles (4 items)
    { 
        name: "Hakka Noodles", 
        price: 189, 
        category: "noodles", 
        description: "Indo-Chinese style stir-fried noodles", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400", 
        popular: true, 
        special: false 
    },
    { 
        name: "Chicken Chow Mein", 
        price: 239, 
        category: "noodles", 
        description: "Stir-fried noodles with chicken and vegetables", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400", 
        popular: false, 
        special: false 
    },
    { 
        name: "Pad Thai", 
        price: 269, 
        category: "noodles", 
        description: "Thai style rice noodles with tamarind sauce", 
        type: "non-veg", 
        image: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400", 
        popular: false, 
        special: false 
    },
    { 
        name: "Schezwan Noodles", 
        price: 219, 
        category: "noodles", 
        description: "Spicy Schezwan sauce noodles with vegetables", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400", 
        popular: false, 
        special: true 
    },

    // Drinks (2 items)
    { 
        name: "Fresh Lime Soda", 
        price: 49, 
        category: "drinks", 
        description: "Refreshing lime soda with mint", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400", 
        popular: false, 
        special: false 
    },
    { 
        name: "Mango Lassi", 
        price: 79, 
        category: "drinks", 
        description: "Creamy yogurt drink with fresh mango", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400", 
        popular: false, 
        special: false 
    },

    // Desserts (1 item)
    { 
        name: "Gulab Jamun", 
        price: 149, 
        category: "desserts", 
        description: "Sweet milk dumplings in sugar syrup", 
        type: "veg", 
        image: "https://images.unsplash.com/photo-1571167530149-c72f17e72c50?w=400", 
        popular: false, 
        special: false 
    }
];

export async function seedFoodsIfEmpty() {
    try {
        const foodsRef = ref(database, "tfc/foods");
        const snapshot = await get(foodsRef);
        
        if (!snapshot.exists()) {
            console.log('Seeding foods to Firebase...');
            for (const food of defaultFoods) {
                const newFoodRef = push(foodsRef);
                await set(newFoodRef, {
                    ...food,
                    id: newFoodRef.key,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            console.log(`Successfully seeded ${defaultFoods.length} foods to Firebase`);
        } else {
            console.log('Foods already exist in Firebase, skipping seed');
        }
    } catch (error) {
        console.error('Error seeding foods:', error);
    }
}
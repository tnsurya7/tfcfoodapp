import { ref, get, push, set } from "firebase/database"
import { database } from "./firebase"

const defaultFoods = [
    /* ---------------- FRIED ---------------- */
    { name:"Leg - 2 Pcs", price:99, category:"fried", description:"Crispy fried chicken leg", type:"non-veg", image:"", popular:true, special:false },
    { name:"Wings - 3 Pcs", price:99, category:"fried", description:"Crispy fried wings", type:"non-veg", image:"", popular:true, special:false },
    { name:"Lollipop - 3 Pcs", price:99, category:"fried", description:"Chicken lollipop", type:"non-veg", image:"", popular:false, special:false },
    { name:"Strips - 5 Pcs", price:99, category:"fried", description:"Chicken strips", type:"non-veg", image:"", popular:false, special:false },
    { name:"Popcorn Chicken - 10 Pcs", price:99, category:"fried", description:"Popcorn chicken", type:"non-veg", image:"", popular:false, special:false },
    { name:"French Fries", price:69, category:"fried", description:"Crispy fries", type:"veg", image:"", popular:true, special:false },
    { name:"Smile Potato", price:79, category:"fried", description:"Smile potatoes", type:"veg", image:"", popular:false, special:false },

    /* ---------------- BBQ ---------------- */
    { name:"BBQ Leg - 2 Pcs", price:119, category:"bbq", description:"BBQ chicken leg", type:"non-veg", image:"", popular:true, special:true },
    { name:"BBQ Wings - 3 Pcs", price:109, category:"bbq", description:"BBQ wings", type:"non-veg", image:"", popular:false, special:false },
    { name:"BBQ Strips - 5 Pcs", price:109, category:"bbq", description:"BBQ strips", type:"non-veg", image:"", popular:false, special:false },

    /* ---------------- RICE ---------------- */
    { name:"Veg Rice", price:79, category:"rice", description:"Vegetable rice", type:"veg", image:"", popular:false, special:false },
    { name:"Egg Rice", price:89, category:"rice", description:"Egg fried rice", type:"non-veg", image:"", popular:true, special:false },
    { name:"Chicken Rice", price:89, category:"rice", description:"Chicken fried rice", type:"non-veg", image:"", popular:true, special:false },

    /* ---------------- NOODLES ---------------- */
    { name:"Veg Noodles", price:79, category:"noodles", description:"Veg noodles", type:"veg", image:"", popular:false, special:false },
    { name:"Egg Noodles", price:79, category:"noodles", description:"Egg noodles", type:"non-veg", image:"", popular:false, special:false },
    { name:"Chicken Noodles", price:89, category:"noodles", description:"Chicken noodles", type:"non-veg", image:"", popular:true, special:false },

    /* ---------------- CHILLI ---------------- */
    { name:"Chilli Cauliflower (100g)", price:39, category:"chilli", description:"Chilli cauliflower", type:"veg", image:"", popular:false, special:false },
    { name:"Chilli Mushroom (100g)", price:69, category:"chilli", description:"Chilli mushroom", type:"veg", image:"", popular:false, special:false },
    { name:"Chilli Chicken (100g)", price:49, category:"chilli", description:"Chilli chicken", type:"non-veg", image:"", popular:true, special:false },

    /* ---------------- DESSERT ---------------- */
    { name:"Brownie", price:69, category:"desserts", description:"Chocolate brownie", type:"veg", image:"", popular:true, special:false },
    { name:"Ice Cream Brownie", price:79, category:"desserts", description:"Brownie with ice cream", type:"veg", image:"", popular:false, special:false },
    { name:"Maska Bun", price:39, category:"desserts", description:"Maska bun", type:"veg", image:"", popular:false, special:false },
    { name:"Zamoon Bun", price:39, category:"desserts", description:"Zamoon bun", type:"veg", image:"", popular:false, special:false },
    { name:"Palcowa Bun", price:39, category:"desserts", description:"Palcowa bun", type:"veg", image:"", popular:false, special:false },
    { name:"Bun Butter Jam", price:29, category:"desserts", description:"Bun with butter and jam", type:"veg", image:"", popular:false, special:false },

    /* ---------------- DRINKS ---------------- */
    { name:"Tea", price:9, category:"drinks", description:"Hot tea", type:"veg", image:"", popular:false, special:false },
    { name:"Coffee", price:19, category:"drinks", description:"Hot coffee", type:"veg", image:"", popular:false, special:false },
    { name:"Mojito Mint", price:49, category:"drinks", description:"Mint mojito", type:"veg", image:"", popular:true, special:false },
    { name:"Mojito Apple", price:59, category:"drinks", description:"Apple mojito", type:"veg", image:"", popular:false, special:false },
    { name:"Mojito Blueberry", price:59, category:"drinks", description:"Blueberry mojito", type:"veg", image:"", popular:false, special:false },
    { name:"Mojito Strawberry", price:59, category:"drinks", description:"Strawberry mojito", type:"veg", image:"", popular:false, special:false }
];

export async function seedTFCFoods() {
    try {
        const foodsRef = ref(database, "tfc/foods");
        
        // Clear all existing foods first
        console.log("Clearing existing foods...");
        await set(foodsRef, null);
        
        console.log("Adding new TFC menu items...");
        let addedCount = 0;
        
        for (const food of defaultFoods) {
            const newFoodRef = push(foodsRef);
            
            await set(newFoodRef, {
                ...food,
                id: newFoodRef.key,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            addedCount++;
            console.log(`Added: ${food.name} - ₹${food.price}`);
        }
        
        console.log(`Successfully added ${addedCount} TFC menu items`);
    } catch (error) {
        console.error("Error seeding foods:", error);
    }
}
import { ref, get, push, set } from "firebase/database"
import { database } from "./firebase"

const defaultFoods = [
    /* ---------------- FRIED ---------------- */
    { name:"Leg - 2 Pcs", price:99, category:"fried", description:"Crispy fried chicken leg", type:"non-veg", image:"https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=300&fit=crop", popular:true, special:false },
    { name:"Wings - 3 Pcs", price:99, category:"fried", description:"Crispy fried wings", type:"non-veg", image:"https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop", popular:true, special:false },
    { name:"Lollipop - 3 Pcs", price:99, category:"fried", description:"Chicken lollipop", type:"non-veg", image:"https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Strips - 5 Pcs", price:99, category:"fried", description:"Chicken strips", type:"non-veg", image:"https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Popcorn Chicken - 10 Pcs", price:99, category:"fried", description:"Popcorn chicken", type:"non-veg", image:"https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"French Fries", price:69, category:"fried", description:"Crispy fries", type:"veg", image:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop", popular:true, special:false },
    { name:"Smile Potato", price:79, category:"fried", description:"Smile potatoes", type:"veg", image:"https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&h=300&fit=crop", popular:false, special:false },

    /* ---------------- BBQ ---------------- */
    { name:"BBQ Leg - 2 Pcs", price:119, category:"bbq", description:"BBQ chicken leg", type:"non-veg", image:"https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop", popular:true, special:true },
    { name:"BBQ Wings - 3 Pcs", price:109, category:"bbq", description:"BBQ wings", type:"non-veg", image:"https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"BBQ Strips - 5 Pcs", price:109, category:"bbq", description:"BBQ strips", type:"non-veg", image:"https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop", popular:false, special:false },

    /* ---------------- RICE ---------------- */
    { name:"Veg Rice", price:79, category:"rice", description:"Vegetable rice", type:"veg", image:"https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Egg Rice", price:89, category:"rice", description:"Egg fried rice", type:"non-veg", image:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop", popular:true, special:false },
    { name:"Chicken Rice", price:89, category:"rice", description:"Chicken fried rice", type:"non-veg", image:"https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop", popular:true, special:false },

    /* ---------------- NOODLES ---------------- */
    { name:"Veg Noodles", price:79, category:"noodles", description:"Veg noodles", type:"veg", image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Egg Noodles", price:79, category:"noodles", description:"Egg noodles", type:"non-veg", image:"https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Chicken Noodles", price:89, category:"noodles", description:"Chicken noodles", type:"non-veg", image:"https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop", popular:true, special:false },

    /* ---------------- CHILLI ---------------- */
    { name:"Chilli Cauliflower (100g)", price:39, category:"chilli", description:"Chilli cauliflower", type:"veg", image:"https://images.unsplash.com/photo-1628294895950-9805252327bc?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Chilli Mushroom (100g)", price:69, category:"chilli", description:"Chilli mushroom", type:"veg", image:"https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Chilli Chicken (100g)", price:49, category:"chilli", description:"Chilli chicken", type:"non-veg", image:"https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&h=300&fit=crop", popular:true, special:false },

    /* ---------------- DESSERT ---------------- */
    { name:"Brownie", price:69, category:"desserts", description:"Chocolate brownie", type:"veg", image:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop", popular:true, special:false },
    { name:"Ice Cream Brownie", price:79, category:"desserts", description:"Brownie with ice cream", type:"veg", image:"https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Maska Bun", price:39, category:"desserts", description:"Maska bun", type:"veg", image:"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Zamoon Bun", price:39, category:"desserts", description:"Zamoon bun", type:"veg", image:"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Palcowa Bun", price:39, category:"desserts", description:"Palcowa bun", type:"veg", image:"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Bun Butter Jam", price:29, category:"desserts", description:"Bun with butter and jam", type:"veg", image:"https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop", popular:false, special:false },

    /* ---------------- DRINKS ---------------- */
    { name:"Tea", price:9, category:"drinks", description:"Hot tea", type:"veg", image:"https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Coffee", price:19, category:"drinks", description:"Hot coffee", type:"veg", image:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Mojito Mint", price:49, category:"drinks", description:"Mint mojito", type:"veg", image:"https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop", popular:true, special:false },
    { name:"Mojito Apple", price:59, category:"drinks", description:"Apple mojito", type:"veg", image:"https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Mojito Blueberry", price:59, category:"drinks", description:"Blueberry mojito", type:"veg", image:"https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop", popular:false, special:false },
    { name:"Mojito Strawberry", price:59, category:"drinks", description:"Strawberry mojito", type:"veg", image:"https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop", popular:false, special:false },

    /* ---------------- GRAVY ---------------- */
    { name:"Chicken Pepper", price:129, category:"gravy", description:"Spicy chicken pepper gravy", type:"non-veg", image:"https://i.ytimg.com/vi/UtVDwLyQz08/maxresdefault.jpg", popular:false, special:false },
    { name:"Chicken Manchurian", price:129, category:"gravy", description:"Classic chicken manchurian gravy", type:"non-veg", image:"https://i.ytimg.com/vi/UtVDwLyQz08/maxresdefault.jpg", popular:true, special:false },
    { name:"Chicken Pallipalayam (Pre Order)", price:249, category:"gravy", description:"Traditional Pallipalayam chicken - Pre Order", type:"non-veg", image:"https://i.ytimg.com/vi/UtVDwLyQz08/maxresdefault.jpg", popular:true, special:true },
    { name:"Chicken Varamilagai Kari (Pre Order)", price:249, category:"gravy", description:"Spicy varamilagai chicken - Pre Order", type:"non-veg", image:"https://i.ytimg.com/vi/UtVDwLyQz08/maxresdefault.jpg", popular:false, special:true }
];

// ✅ SAFE SEEDER - ONLY RUNS IF DATABASE IS EMPTY
export async function seedTFCFoodsOnce() {
    try {
        const foodsRef = ref(database, "tfc/foods");
        
        // Check if foods already exist
        const snapshot = await get(foodsRef);
        if (snapshot.exists()) {
            const existingFoods = snapshot.val();
            const foodCount = Object.keys(existingFoods).length;
            console.log(`🍗 Foods already exist (${foodCount} items), skipping seed`);
            return { success: true, count: foodCount, skipped: true };
        }
        
        console.log("🍗 No foods found, seeding TFC menu items...");
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
        }
        
        console.log(`🎉 Successfully seeded ${addedCount} TFC menu items`);
        return { success: true, count: addedCount, skipped: false };
    } catch (error) {
        console.error("❌ Error seeding foods:", error);
        return { success: false, error: error.message };
    }
}

// ⚠️ DANGEROUS - ONLY FOR MANUAL RESET (WIPES ALL DATA)
export async function resetAndSeedTFCFoods() {
    try {
        const foodsRef = ref(database, "tfc/foods");
        
        // Clear all existing foods first
        console.log("🗑️ DANGER: Clearing existing foods...");
        await set(foodsRef, null);
        
        console.log("🍗 Adding new TFC menu items...");
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
        }
        
        console.log(`🎉 Successfully reset and added ${addedCount} TFC menu items`);
        return { success: true, count: addedCount };
    } catch (error) {
        console.error("❌ Error resetting foods:", error);
        return { success: false, error: error.message };
    }
}
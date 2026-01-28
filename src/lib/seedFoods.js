import { ref, get, push } from "firebase/database"
import { database } from "./firebase"

const defaultFoods = [
    { name:"Spicy Chicken Wings", price:299, category:"chicken", description:"Crispy chicken wings tossed in our signature spicy sauce", type:"non-veg", image:"", popular:true, special:false },
    { name:"Grilled Chicken Breast", price:349, category:"chicken", description:"Tender grilled chicken breast with herbs and spices", type:"non-veg", image:"", popular:true, special:false },
    { name:"Chicken Tikka Masala", price:329, category:"chicken", description:"Creamy tomato-based curry with tender chicken pieces", type:"non-veg", image:"", popular:false, special:true },
    { name:"Egg Fried Rice", price:179, category:"egg", description:"Classic fried rice with scrambled eggs and vegetables", type:"veg", image:"", popular:true, special:false },
    { name:"Masala Omelette", price:129, category:"egg", description:"Fluffy omelette with onions, tomatoes, and spices", type:"veg", image:"", popular:false, special:false },
    { name:"Paneer Tikka", price:249, category:"veg", description:"Grilled cottage cheese cubes marinated in spices", type:"veg", image:"", popular:true, special:false },
    { name:"Vegetable Curry", price:199, category:"veg", description:"Mixed vegetables in rich curry sauce", type:"veg", image:"", popular:false, special:false },
    { name:"Palak Paneer", price:229, category:"veg", description:"Cottage cheese in spinach gravy", type:"veg", image:"", popular:false, special:false },
    { name:"Chicken Fried Rice", price:219, category:"fried-rice", description:"Wok tossed rice with chicken", type:"non-veg", image:"", popular:true, special:false },
    { name:"Vegetable Fried Rice", price:169, category:"fried-rice", description:"Vegetables with rice", type:"veg", image:"", popular:false, special:false },
    { name:"Shrimp Fried Rice", price:299, category:"fried-rice", description:"Rice with shrimp", type:"non-veg", image:"", popular:false, special:false },
    { name:"Hakka Noodles", price:189, category:"noodles", description:"Indo-Chinese noodles", type:"veg", image:"", popular:true, special:false },
    { name:"Chicken Chow Mein", price:239, category:"noodles", description:"Chicken noodles", type:"non-veg", image:"", popular:false, special:false },
    { name:"Pad Thai", price:269, category:"noodles", description:"Thai noodles", type:"non-veg", image:"", popular:false, special:false },
    { name:"Fresh Lime Soda", price:49, category:"drinks", description:"Refreshing lime soda", type:"veg", image:"", popular:false, special:false },
    { name:"Mango Lassi", price:79, category:"drinks", description:"Yogurt mango drink", type:"veg", image:"", popular:false, special:false },
    { name:"Cold Coffee", price:99, category:"drinks", description:"Chilled coffee", type:"veg", image:"", popular:false, special:false },
    { name:"Tiramisu", price:149, category:"desserts", description:"Italian dessert", type:"veg", image:"", popular:false, special:false },
    { name:"Veg Momos", price:70, category:"veg", description:"Veg momos", type:"veg", image:"", popular:false, special:false },
    { name:"Burger", price:100, category:"chicken", description:"nice and healthy to eat", type:"non-veg", image:"", popular:true, special:false }
]

export async function seedFoodsIfEmpty(){
    const foodsRef = ref(database,"tfc/foods")
    const snap = await get(foodsRef)
    if(!snap.exists()){
        for(const food of defaultFoods){
            await push(foodsRef,{
                ...food,
                createdAt:new Date().toISOString(),
                updatedAt:new Date().toISOString()
            })
        }
    }
}
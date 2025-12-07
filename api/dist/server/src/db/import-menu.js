"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./database"));
// ============================================
// MENU DATA FROM "1 - FINIAL.PDF"
// ============================================
const menuData = {
    // Pizza Sizes
    sizes: [
        { id: 'size-small', name: 'small', display_name: 'Small', base_price: 14.49 },
        { id: 'size-medium', name: 'medium', display_name: 'Medium', base_price: 16.99 },
        { id: 'size-large', name: 'large', display_name: 'Large', base_price: 20.99 },
        { id: 'size-xlarge', name: 'xlarge', display_name: 'X-Large', base_price: 23.99 },
    ],
    // Crust Types (using standard crusts - no specific crusts in PDF)
    crusts: [
        { id: 'crust-thin', type: 'thin', display_name: 'Thin Crust', price_modifier: 0 },
        { id: 'crust-regular', type: 'regular', display_name: 'Regular Crust', price_modifier: 0 },
        { id: 'crust-thick', type: 'thick', display_name: 'Thick Crust', price_modifier: 0 },
    ],
    // Toppings (ALL MEATS are halal)
    toppings: [
        // Meats (All Halal)
        { id: 'top-pepperoni', name: 'Pepperoni', price: 2.00, category: 'meat' },
        { id: 'top-groundbeef', name: 'Ground Beef', price: 2.00, category: 'meat' },
        { id: 'top-sausage', name: 'Sausage', price: 2.00, category: 'meat' },
        { id: 'top-salami', name: 'Salami', price: 2.00, category: 'meat' },
        { id: 'top-halalbeefbacon', name: 'Halal Beef Bacon', price: 2.00, category: 'meat' },
        { id: 'top-grilledchicken', name: 'Grilled Chicken', price: 2.00, category: 'meat' },
        // Vegetables
        { id: 'top-mushrooms', name: 'Mushrooms', price: 1.50, category: 'veggie' },
        { id: 'top-greenpepper', name: 'Green Peppers', price: 1.50, category: 'veggie' },
        { id: 'top-greenolives', name: 'Green Olives', price: 1.50, category: 'veggie' },
        { id: 'top-blackolives', name: 'Black Olives', price: 1.50, category: 'veggie' },
        { id: 'top-tomatoes', name: 'Tomatoes', price: 1.50, category: 'veggie' },
        { id: 'top-hotpeppers', name: 'Hot Peppers', price: 1.50, category: 'veggie' },
        { id: 'top-pineapple', name: 'Pineapple', price: 1.50, category: 'veggie' },
        { id: 'top-jalapeno', name: 'Jalapeno', price: 1.50, category: 'veggie' },
        { id: 'top-spinach', name: 'Spinach', price: 1.50, category: 'veggie' },
        { id: 'top-redonions', name: 'Red Onions', price: 1.50, category: 'veggie' },
        { id: 'top-onions', name: 'Onions', price: 1.50, category: 'veggie' },
        { id: 'top-ginger', name: 'Ginger', price: 1.50, category: 'veggie' },
        { id: 'top-chilledpeppers', name: 'Chilled Peppers', price: 1.50, category: 'veggie' },
        // Cheese
        { id: 'top-fetacheese', name: 'Feta Cheese', price: 2.00, category: 'cheese' },
    ],
    // Sides/Appetizers
    sides: [
        // Wings
        { id: 'side-wings-10', name: 'Chicken Wings (10pc)', price: 13.99, description: '10 pieces' },
        { id: 'side-wings-15', name: 'Chicken Wings (15pc)', price: 15.99, description: '15 pieces' },
        { id: 'side-wings-20', name: 'Chicken Wings (20pc)', price: 19.99, description: '20 pieces' },
        { id: 'side-wings-25', name: 'Chicken Wings (25pc)', price: 21.99, description: '25 pieces' },
        { id: 'side-wings-30', name: 'Chicken Wings (30pc)', price: 26.99, description: '30 pieces' },
        { id: 'side-wings-40', name: 'Chicken Wings (40pc)', price: 30.99, description: '40 pieces' },
        // Finger Food
        { id: 'side-garlic-bread', name: 'Garlic Bread', price: 7.99, description: 'Fresh garlic bread' },
        { id: 'side-cheese-bread', name: 'Garlic Cheese Bread', price: 8.99, description: 'Garlic bread with cheese' },
        { id: 'side-chicken-finger', name: 'Chicken Fingers', price: 13.99, description: 'Crispy chicken fingers' },
        { id: 'side-chicken-nuggets', name: 'Chicken Nuggets', price: 13.99, description: 'Chicken nuggets' },
        { id: 'side-fish-chips', name: 'Fish N Chips', price: 12.99, description: 'Fish and chips' },
        { id: 'side-zucchini-sm', name: 'Zucchini Sticks (Small)', price: 7.99, description: 'Small portion' },
        { id: 'side-zucchini-lg', name: 'Zucchini Sticks (Large)', price: 9.99, description: 'Large portion' },
        { id: 'side-fries-sm', name: 'French Fries Poutine (Small)', price: 9.49, description: 'Small poutine' },
        { id: 'side-fries-lg', name: 'French Fries Poutine (Large)', price: 12.99, description: 'Large poutine' },
        { id: 'side-onionrings-sm', name: 'Onion Rings (Small)', price: 8.99, description: 'Small portion' },
        { id: 'side-onionrings-lg', name: 'Onion Rings (Large)', price: 12.99, description: 'Large portion' },
        // Dipping Sauce
        { id: 'side-dip', name: 'Dipping Sauce', price: 1.50, description: 'Various flavors' },
    ],
    // Drinks/Beverages
    drinks: [
        { id: 'drink-2litre', name: '2 Litre Bottle', price: 4.00, description: '2L bottle' },
        { id: 'drink-355ml', name: '355ml Can', price: 1.80, description: '355ml can' },
        { id: 'drink-water', name: 'Bottled Water', price: 1.50, description: 'Bottled water' },
    ],
    // Specialty Pizzas (Pre-defined combinations from menu)
    specialtyPizzas: [
        {
            id: 'specialty-pepperoni',
            name: 'Pepperoni',
            description: 'Classic pepperoni pizza',
            toppings: 'Pepperoni',
            price_small: 15.49,
            price_medium: 17.99,
            price_large: 21.99,
            price_xlarge: 24.99,
        },
        {
            id: 'specialty-hawaiian',
            name: 'Hawaiian',
            description: 'Chicken & Pineapple',
            toppings: 'Grilled Chicken, Pineapple',
            price_small: 16.49,
            price_medium: 19.99,
            price_large: 22.99,
            price_xlarge: 25.99,
        },
        {
            id: 'specialty-combination',
            name: 'Combination',
            description: 'Pepperoni, Mushrooms & Green Peppers',
            toppings: 'Pepperoni, Mushrooms, Green Peppers',
            price_small: 17.49,
            price_medium: 20.99,
            price_large: 23.99,
            price_xlarge: 28.99,
        },
        {
            id: 'specialty-canadian',
            name: 'Canadian',
            description: 'Pepperoni, Mushrooms & Halal Beef Bacon',
            toppings: 'Pepperoni, Mushrooms, Halal Beef Bacon',
            price_small: 17.49,
            price_medium: 20.99,
            price_large: 23.99,
            price_xlarge: 28.99,
        },
        {
            id: 'specialty-chicken',
            name: 'Chicken',
            description: 'Barbecue sauce, Chicken & Onions',
            toppings: 'Grilled Chicken, Onions',
            price_small: 17.49,
            price_medium: 20.99,
            price_large: 23.99,
            price_xlarge: 28.99,
        },
        {
            id: 'specialty-mexican',
            name: 'Mexican',
            description: 'Mexican Sauce, Onions, Beef, Black Olives & Tomatoes',
            toppings: 'Ground Beef, Onions, Black Olives, Tomatoes',
            price_small: 18.49,
            price_medium: 21.99,
            price_large: 24.99,
            price_xlarge: 30.99,
        },
        {
            id: 'specialty-vegetarian',
            name: 'Vegetarian',
            description: 'Mushrooms, Green Peppers, Onions, Green Olives, Tomatoes',
            toppings: 'Mushrooms, Green Peppers, Onions, Green Olives, Tomatoes',
            price_small: 19.49,
            price_medium: 22.99,
            price_large: 25.99,
            price_xlarge: 32.99,
        },
        {
            id: 'specialty-greek',
            name: 'Greek',
            description: 'Black Olives, Onions, Tomatoes, Feta Cheeses & Green Peppers',
            toppings: 'Black Olives, Onions, Tomatoes, Feta Cheese, Green Peppers',
            price_small: 19.49,
            price_medium: 22.99,
            price_large: 25.99,
            price_xlarge: 32.99,
        },
        {
            id: 'specialty-deluxe',
            name: 'Deluxe',
            description: 'Ground Beef, Red Onions, Tomatoes, Green Papers, Hot Peppers',
            toppings: 'Ground Beef, Red Onions, Tomatoes, Green Peppers, Hot Peppers',
            price_small: 19.49,
            price_medium: 22.99,
            price_large: 25.99,
            price_xlarge: 32.99,
        },
        {
            id: 'specialty-house',
            name: 'House Special',
            description: 'Pepperoni, Green Peppers, Onions, Green Olives & Halal Beef Bacon',
            toppings: 'Pepperoni, Green Peppers, Onions, Green Olives, Halal Beef Bacon',
            price_small: 20.49,
            price_medium: 23.99,
            price_large: 26.99,
            price_xlarge: 33.99,
        },
        {
            id: 'specialty-meatlovers',
            name: 'Meat Lovers',
            description: 'Pepperoni, Halal Beef Bacon, Ground Beef, Sausage & Salami',
            toppings: 'Pepperoni, Halal Beef Bacon, Ground Beef, Sausage, Salami',
            price_small: 20.49,
            price_medium: 23.99,
            price_large: 26.99,
            price_xlarge: 33.99,
        },
    ],
    // Pizza Specials & Combo Deals
    combos: [
        {
            id: 'combo-2med-pizzas',
            name: '2 Medium Pizzas Special',
            description: '2 Medium Pizzas with 2 toppings each, 2 Dipping Sauce, 4 Cans of POP',
            price: 33.99,
            items: '2 Medium Pizzas (2 toppings each), 2 Dipping Sauce, 4x 355ml Cans',
            category: 'pizza-special',
        },
        {
            id: 'combo-2large-pizzas',
            name: '2 Large Pizzas Special',
            description: '2 Large Pizzas with 3 toppings each, 20 Wings, 2 Litre of POP',
            price: 52.99,
            items: '2 Large Pizzas (3 toppings each), 20 Wings, 2 Litre Bottle',
            category: 'pizza-special',
        },
        {
            id: 'walkin-small',
            name: 'Small Pizza Walk-In Special',
            description: 'Small Pizza with 3 toppings, 6 Wings, 1 Dip, 1 Can',
            price: 20.99,
            items: '1 Small Pizza (3 toppings), 10 Wings, 1 Dip, 1x 355ml Can',
            category: 'walk-in',
        },
        {
            id: 'walkin-medium-single',
            name: 'Medium Pizza Walk-In Special',
            description: 'Medium Pizza with 3 toppings, 1 Dip',
            price: 18.99,
            items: '1 Medium Pizza (3 toppings), 1 Dip',
            category: 'walk-in',
        },
        {
            id: 'walkin-medium-combo',
            name: 'Medium Pizza Combo Walk-In',
            description: 'Medium Pizza with 3 toppings, 10 Wings, 1 Dip, 2 Cans',
            price: 29.99,
            items: '1 Medium Pizza (3 toppings), 10 Wings, 1 Dip, 2x 355ml Cans',
            category: 'walk-in',
        },
        {
            id: 'walkin-large-single',
            name: 'Large Pizza Walk-In Special',
            description: 'Large Pizza with 3 toppings, 1 Dip',
            price: 21.99,
            items: '1 Large Pizza (3 toppings), 1 Dip',
            category: 'walk-in',
        },
        {
            id: 'walkin-2large',
            name: '2 Large Pizzas Walk-In Special',
            description: '2 Large Pizzas with 2 toppings each, 2 Dips',
            price: 36.99,
            items: '2 Large Pizzas (2 toppings each), 2 Dips',
            category: 'walk-in',
        },
        {
            id: 'family-large',
            name: 'Family Special - 1 Large Pizza',
            description: '1 Large Pizza with 3 toppings combined, 15 Wings, 2 Litre POP, Dipping Sauce',
            price: 36.99,
            items: '1 Large Pizza (3 toppings combined), 15 Wings, 2 Litre Bottle, 1 Dipping Sauce',
            category: 'family-special',
        },
        {
            id: 'family-xlarge',
            name: 'Family Special - 1 XLarge Pizza',
            description: '1 XLarge Pizza with 3 toppings, 30 Wings, 2 Litre POP, 2 Dipping Sauce',
            price: 49.99,
            items: '1 XLarge Pizza (3 toppings), 30 Wings, 2 Litre Bottle, 2 Dipping Sauce',
            category: 'family-special',
        },
        {
            id: 'special-large-1topping',
            name: 'Large Pizza - 1 Topping Special',
            description: 'Large Pizza with 1 Topping',
            price: 18.99,
            items: '1 Large Pizza (1 topping)',
            category: 'daily-special',
        },
    ],
};
async function importMenu() {
    const connection = await database_1.default.getConnection();
    try {
        console.log('🍕 Starting menu import...\n');
        // Ask for confirmation
        console.log('⚠️  This will REPLACE all existing menu items!');
        console.log('📊 Items to import:');
        console.log(`   - ${menuData.sizes.length} pizza sizes`);
        console.log(`   - ${menuData.crusts.length} crust types`);
        console.log(`   - ${menuData.toppings.length} toppings`);
        console.log(`   - ${menuData.specialtyPizzas.length} specialty pizzas`);
        console.log(`   - ${menuData.combos.length} combo deals & specials`);
        console.log(`   - ${menuData.sides.length} sides`);
        console.log(`   - ${menuData.drinks.length} drinks`);
        console.log('\n⏳ Starting import in 3 seconds... Press Ctrl+C to cancel\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Clear existing menu items
        console.log('🗑️  Clearing existing menu items...');
        await connection.query('DELETE FROM sizes');
        await connection.query('DELETE FROM crusts');
        await connection.query('DELETE FROM toppings');
        await connection.query('DELETE FROM menu_items');
        await connection.query('DELETE FROM specialty_pizzas');
        await connection.query('DELETE FROM combo_deals');
        console.log('✅ Existing items cleared\n');
        // Import sizes
        console.log('📏 Importing pizza sizes...');
        for (const size of menuData.sizes) {
            await connection.query('INSERT INTO sizes (id, name, display_name, base_price) VALUES (?, ?, ?, ?)', [size.id, size.name, size.display_name, size.base_price]);
            console.log(`   ✓ ${size.display_name} - $${size.base_price}`);
        }
        // Import crusts
        console.log('\n🍞 Importing crust types...');
        for (const crust of menuData.crusts) {
            await connection.query('INSERT INTO crusts (id, type, display_name, price_modifier) VALUES (?, ?, ?, ?)', [crust.id, crust.type, crust.display_name, crust.price_modifier]);
            const modifier = crust.price_modifier > 0 ? `+$${crust.price_modifier}` : 'No charge';
            console.log(`   ✓ ${crust.display_name} - ${modifier}`);
        }
        // Import toppings
        console.log('\n🧀 Importing toppings...');
        const meatToppings = menuData.toppings.filter(t => t.category === 'meat');
        const veggieToppings = menuData.toppings.filter(t => t.category === 'veggie');
        const cheeseToppings = menuData.toppings.filter(t => t.category === 'cheese');
        console.log(`   Meats (${meatToppings.length}):`);
        for (const topping of meatToppings) {
            await connection.query('INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)', [topping.id, topping.name, topping.price, topping.category]);
            console.log(`   ✓ ${topping.name} - $${topping.price}`);
        }
        console.log(`   Vegetables (${veggieToppings.length}):`);
        for (const topping of veggieToppings) {
            await connection.query('INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)', [topping.id, topping.name, topping.price, topping.category]);
            console.log(`   ✓ ${topping.name} - $${topping.price}`);
        }
        console.log(`   Cheese (${cheeseToppings.length}):`);
        for (const topping of cheeseToppings) {
            await connection.query('INSERT INTO toppings (id, name, price, category) VALUES (?, ?, ?, ?)', [topping.id, topping.name, topping.price, topping.category]);
            console.log(`   ✓ ${topping.name} - $${topping.price}`);
        }
        // Import sides
        console.log(`\n🍗 Importing sides (${menuData.sides.length})...`);
        for (const side of menuData.sides) {
            await connection.query('INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)', [side.id, side.name, 'side', side.price, side.description]);
            console.log(`   ✓ ${side.name} - $${side.price} (${side.description})`);
        }
        // Import drinks
        console.log(`\n🥤 Importing drinks (${menuData.drinks.length})...`);
        for (const drink of menuData.drinks) {
            await connection.query('INSERT INTO menu_items (id, name, category, price, description) VALUES (?, ?, ?, ?, ?)', [drink.id, drink.name, 'drink', drink.price, drink.description]);
            console.log(`   ✓ ${drink.name} - $${drink.price} (${drink.description})`);
        }
        // Import specialty pizzas
        console.log(`\n🍕 Importing specialty pizzas (${menuData.specialtyPizzas.length})...`);
        for (const pizza of menuData.specialtyPizzas) {
            await connection.query('INSERT INTO specialty_pizzas (id, name, description, toppings, price_small, price_medium, price_large, price_xlarge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [pizza.id, pizza.name, pizza.description, pizza.toppings, pizza.price_small, pizza.price_medium, pizza.price_large, pizza.price_xlarge]);
            console.log(`   ✓ ${pizza.name} - S:$${pizza.price_small} M:$${pizza.price_medium} L:$${pizza.price_large} XL:$${pizza.price_xlarge}`);
        }
        // Import combo deals
        console.log(`\n🎁 Importing combo deals & specials (${menuData.combos.length})...`);
        for (const combo of menuData.combos) {
            await connection.query('INSERT INTO combo_deals (id, name, description, price, items, category) VALUES (?, ?, ?, ?, ?, ?)', [combo.id, combo.name, combo.description, combo.price, combo.items, combo.category]);
            console.log(`   ✓ ${combo.name} - $${combo.price}`);
        }
        // Summary
        console.log('\n✅ Menu import completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   ✓ ${menuData.sizes.length} pizza sizes imported`);
        console.log(`   ✓ ${menuData.crusts.length} crust types imported`);
        console.log(`   ✓ ${menuData.toppings.length} toppings imported`);
        console.log(`   ✓ ${menuData.specialtyPizzas.length} specialty pizzas imported`);
        console.log(`   ✓ ${menuData.combos.length} combo deals imported`);
        console.log(`   ✓ ${menuData.sides.length} sides imported`);
        console.log(`   ✓ ${menuData.drinks.length} drinks imported`);
        console.log('\n🎉 Your menu is ready to use!\n');
    }
    catch (error) {
        console.error('\n❌ Import failed:', error.message);
        throw error;
    }
    finally {
        connection.release();
        await database_1.default.end();
    }
}
// Run import
importMenu()
    .then(() => {
    console.log('🎉 Import script completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Import script failed:', error);
    process.exit(1);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const database_js_1 = __importDefault(require("../db/database.js"));
class MenuService {
    async getMenuData() {
        const [sizes] = await database_js_1.default.query("SELECT * FROM sizes ORDER BY base_price");
        const [crusts] = await database_js_1.default.query("SELECT * FROM crusts");
        const [toppings] = await database_js_1.default.query("SELECT * FROM toppings ORDER BY category, name");
        const [sides] = await database_js_1.default.query("SELECT * FROM menu_items WHERE category = ? ORDER BY price", ["side"]);
        const [drinks] = await database_js_1.default.query("SELECT * FROM menu_items WHERE category = ? ORDER BY price", ["drink"]);
        const [specialtyPizzas] = await database_js_1.default.query("SELECT * FROM specialty_pizzas WHERE active = 1 ORDER BY name");
        const [combos] = await database_js_1.default.query("SELECT * FROM combo_deals WHERE active = 1 ORDER BY category, price");
        return {
            sizes: sizes.map((s) => ({
                id: s.id,
                name: s.name,
                displayName: s.display_name,
                basePrice: parseFloat(s.base_price),
            })),
            crusts: crusts.map((c) => ({
                id: c.id,
                type: c.type,
                displayName: c.display_name,
                priceModifier: parseFloat(c.price_modifier),
            })),
            toppings: toppings.map((t) => ({
                id: t.id,
                name: t.name,
                price: parseFloat(t.price),
                category: t.category,
            })),
            sides: sides.map((s) => ({
                id: s.id,
                name: s.name,
                category: s.category,
                price: parseFloat(s.price),
                description: s.description || undefined,
            })),
            drinks: drinks.map((d) => ({
                id: d.id,
                name: d.name,
                category: d.category,
                price: parseFloat(d.price),
                description: d.description || undefined,
            })),
            specialtyPizzas: specialtyPizzas.map((sp) => ({
                id: sp.id,
                name: sp.name,
                description: sp.description || "",
                toppings: sp.toppings,
                prices: {
                    small: parseFloat(sp.price_small),
                    medium: parseFloat(sp.price_medium),
                    large: parseFloat(sp.price_large),
                    xlarge: parseFloat(sp.price_xlarge),
                },
                category: sp.category || "specialty",
            })),
            combos: combos.map((c) => ({
                id: c.id,
                name: c.name,
                description: c.description,
                price: parseFloat(c.price),
                items: c.items,
                category: c.category || "combo",
                toppings_allowed: c.toppings_allowed || 3,
            })),
        };
    }
    async getToppings() {
        const [toppings] = await database_js_1.default.query("SELECT * FROM toppings ORDER BY category, name");
        return toppings.map((t) => ({
            id: t.id,
            name: t.name,
            price: parseFloat(t.price),
            category: t.category,
        }));
    }
}
exports.MenuService = MenuService;

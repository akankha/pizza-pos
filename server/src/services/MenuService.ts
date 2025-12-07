import type { MenuData, Topping } from "../../../shared/types";
import db from "../db/database.js";

export class MenuService {
  async getMenuData(): Promise<MenuData> {
    const [sizes] = await db.query("SELECT * FROM sizes ORDER BY base_price");
    const [crusts] = await db.query("SELECT * FROM crusts");
    const [toppings] = await db.query(
      "SELECT * FROM toppings ORDER BY category, name"
    );
    const [sides] = await db.query(
      "SELECT * FROM menu_items WHERE category = ? ORDER BY price",
      ["side"]
    );
    const [drinks] = await db.query(
      "SELECT * FROM menu_items WHERE category = ? ORDER BY price",
      ["drink"]
    );
    const [specialtyPizzas] = await db.query(
      "SELECT * FROM specialty_pizzas WHERE active = 1 ORDER BY name"
    );
    const [combos] = await db.query(
      "SELECT * FROM combo_deals WHERE active = 1 ORDER BY category, price"
    );

    return {
      sizes: (sizes as any[]).map((s) => ({
        id: s.id,
        name: s.name as any,
        displayName: s.display_name,
        basePrice: parseFloat(s.base_price),
      })),
      crusts: (crusts as any[]).map((c) => ({
        id: c.id,
        type: c.type as any,
        displayName: c.display_name,
        priceModifier: parseFloat(c.price_modifier),
      })),
      toppings: (toppings as any[]).map((t) => ({
        id: t.id,
        name: t.name,
        price: parseFloat(t.price),
        category: t.category as any,
      })),
      sides: (sides as any[]).map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category as any,
        price: parseFloat(s.price),
        description: s.description || undefined,
      })),
      drinks: (drinks as any[]).map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category as any,
        price: parseFloat(d.price),
        description: d.description || undefined,
      })),
      specialtyPizzas: (specialtyPizzas as any[]).map((sp) => ({
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
      combos: (combos as any[]).map((c) => ({
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

  async getToppings(): Promise<Topping[]> {
    const [toppings] = await db.query(
      "SELECT * FROM toppings ORDER BY category, name"
    );

    return (toppings as any[]).map((t) => ({
      id: t.id,
      name: t.name,
      price: parseFloat(t.price),
      category: t.category as any,
    }));
  }
}

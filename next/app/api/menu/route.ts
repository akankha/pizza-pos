import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const [sizes, crusts, toppings, specialtyPizzas, combos, sides, drinks] = await Promise.all([
      query('SELECT * FROM sizes ORDER BY price'),
      query('SELECT * FROM crusts'),
      query('SELECT * FROM toppings ORDER BY category, name'),
      query('SELECT * FROM specialty_pizzas WHERE available = TRUE ORDER BY name'),
      query('SELECT * FROM combo_deals WHERE available = TRUE ORDER BY name'),
      query('SELECT * FROM menu_items WHERE category = "side" AND available = TRUE ORDER BY name'),
      query('SELECT * FROM menu_items WHERE category = "drink" AND available = TRUE ORDER BY name'),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        sizes,
        crusts,
        toppings,
        specialtyPizzas,
        combos,
        sides,
        drinks,
      },
    });
  } catch (error: any) {
    console.error('Menu fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

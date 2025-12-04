# Specialty Pizza Management Guide

## Overview

Specialty pizzas are pre-designed pizza combinations with specific toppings at fixed prices for each size. These are your signature menu items (e.g., "Pepperoni Supreme", "Meat Lovers", "Veggie Delight").

## How to Add Specialty Pizzas

### 1. Access Admin Menu Management

1. Login to Admin Dashboard (`/admin/login`)
2. Click **"Menu Management"** from the dashboard
3. Click the **"🍕 Specialty Pizzas"** tab at the top

### 2. Create New Specialty Pizza

1. Click the **"+ Add New"** button
2. Fill in the pizza details:

   **Name** (Required)

   - Example: "Pepperoni Supreme", "Hawaiian", "Meat Lovers"

   **Description** (Optional)

   - Brief description of the pizza
   - Example: "Our most popular pizza loaded with pepperoni"

   **Toppings** (Required)

   - List all toppings included
   - Example: "Double Pepperoni, Mozzarella, Pizza Sauce"
   - Example: "Ham, Pineapple, Bacon, Mozzarella"

   **Prices by Size** (All Required)

   - Small Price: e.g., 12.99
   - Medium Price: e.g., 16.99
   - Large Price: e.g., 20.99
   - X-Large Price: e.g., 24.99

3. Click **"Save"** to create the specialty pizza

### 3. Edit Existing Specialty Pizza

1. Find the pizza in the list
2. Click the **blue edit button** (pencil icon)
3. Update the fields as needed
4. Click **"Save"** to update

### 4. Delete Specialty Pizza

1. Find the pizza you want to remove
2. Click the **red delete button** (trash icon)
3. Confirm the deletion

## Database Schema

Specialty pizzas are stored in the `specialty_pizzas` table:

```sql
CREATE TABLE specialty_pizzas (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  toppings TEXT NOT NULL,
  price_small DECIMAL(10,2) NOT NULL,
  price_medium DECIMAL(10,2) NOT NULL,
  price_large DECIMAL(10,2) NOT NULL,
  price_xlarge DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) DEFAULT 'specialty',
  active TINYINT(1) DEFAULT 1
);
```

## API Endpoints

### Get All Active Specialty Pizzas (Public)

```
GET /api/menu/specialty-pizzas
```

### Create Specialty Pizza (Restaurant Admin)

```
POST /api/admin/menu/specialty
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pepperoni Supreme",
  "description": "Loaded with double pepperoni",
  "toppings": "Double Pepperoni, Mozzarella, Pizza Sauce",
  "prices": {
    "small": 12.99,
    "medium": 16.99,
    "large": 20.99,
    "xlarge": 24.99
  },
  "category": "specialty"
}
```

### Update Specialty Pizza (Restaurant Admin)

```
PUT /api/admin/menu/specialty/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Pepperoni Supreme Deluxe",
  "description": "Now with extra cheese!",
  "toppings": "Double Pepperoni, Extra Mozzarella, Pizza Sauce",
  "prices": {
    "small": 13.99,
    "medium": 17.99,
    "large": 21.99,
    "xlarge": 25.99
  },
  "category": "specialty"
}
```

### Delete Specialty Pizza (Restaurant Admin)

```
DELETE /api/admin/menu/specialty/:id
Authorization: Bearer <token>
```

## Example Specialty Pizzas

### 1. Pepperoni Supreme

```json
{
  "name": "Pepperoni Supreme",
  "description": "Our most popular pizza",
  "toppings": "Double Pepperoni, Mozzarella, Pizza Sauce",
  "prices": {
    "small": 12.99,
    "medium": 16.99,
    "large": 20.99,
    "xlarge": 24.99
  },
  "category": "specialty"
}
```

### 2. Hawaiian Paradise

```json
{
  "name": "Hawaiian Paradise",
  "description": "A tropical delight",
  "toppings": "Ham, Pineapple, Bacon, Mozzarella",
  "prices": {
    "small": 13.99,
    "medium": 17.99,
    "large": 21.99,
    "xlarge": 25.99
  },
  "category": "specialty"
}
```

### 3. Meat Lovers

```json
{
  "name": "Meat Lovers",
  "description": "For serious carnivores",
  "toppings": "Pepperoni, Italian Sausage, Ham, Bacon, Ground Beef, Mozzarella",
  "prices": {
    "small": 14.99,
    "medium": 18.99,
    "large": 22.99,
    "xlarge": 26.99
  },
  "category": "specialty"
}
```

### 4. Veggie Delight

```json
{
  "name": "Veggie Delight",
  "description": "Fresh vegetables on every bite",
  "toppings": "Mushrooms, Green Peppers, Onions, Tomatoes, Black Olives, Mozzarella",
  "prices": {
    "small": 12.99,
    "medium": 16.99,
    "large": 20.99,
    "xlarge": 24.99
  },
  "category": "specialty"
}
```

### 5. BBQ Chicken

```json
{
  "name": "BBQ Chicken",
  "description": "Tangy BBQ sauce with grilled chicken",
  "toppings": "BBQ Sauce, Grilled Chicken, Red Onions, Cilantro, Mozzarella",
  "prices": {
    "small": 14.99,
    "medium": 18.99,
    "large": 22.99,
    "xlarge": 26.99
  },
  "category": "specialty"
}
```

### 6. The Works

```json
{
  "name": "The Works",
  "description": "Everything you could want on a pizza",
  "toppings": "Pepperoni, Italian Sausage, Mushrooms, Green Peppers, Onions, Black Olives, Mozzarella",
  "prices": {
    "small": 15.99,
    "medium": 19.99,
    "large": 23.99,
    "xlarge": 27.99
  },
  "category": "specialty"
}
```

## Best Practices

### Naming

- Use descriptive, appetizing names
- Avoid generic names like "Pizza #1"
- Consider customer appeal (e.g., "Supreme" vs "Deluxe")
- Be consistent with branding

### Toppings

- List all toppings clearly and in order of prominence
- Start with the main/featured ingredient
- Always include cheese type
- Be specific (e.g., "Red Onions" not just "Onions")

### Pricing Strategy

- Typical size pricing gaps:
  - Small → Medium: +$3-4
  - Medium → Large: +$4-5
  - Large → X-Large: +$4-5
- Keep specialty pizzas 10-20% higher than custom pizzas with same toppings
- Price by value, not just topping count

### Description

- Keep it short (5-10 words)
- Highlight what makes it special
- Use appetizing language
- Optional but recommended for premium pizzas

### Categories

- Standard specialty: `category: "specialty"`
- Premium/gourmet: `category: "premium"`
- Classic favorites: `category: "classic"`

## Price Calculation Tips

**Small (10")**: Base price + $1-2 per topping
**Medium (12")**: Base price + $1.50-2.50 per topping
**Large (14")**: Base price + $2-3 per topping
**X-Large (16")**: Base price + $2.50-3.50 per topping

Example calculation for "Meat Lovers" (6 toppings):

- Small: $8 base + ($1.50 × 6) = $17 → Price at $14.99
- Medium: $10 base + ($2 × 6) = $22 → Price at $18.99
- Large: $12 base + ($2.50 × 6) = $27 → Price at $22.99
- X-Large: $14 base + ($3 × 6) = $32 → Price at $26.99

## Displaying Specialty Pizzas

The UI will show:

- **Name** in bold
- **Description** in smaller gray text
- **Toppings** with 🍕 emoji in orange
- **Prices grid** showing all 4 sizes at once

Example display:

```
┌─────────────────────────────────────┐
│ Pepperoni Supreme          [Edit][X]│
│ Our most popular pizza               │
│ 🍕 Double Pepperoni, Mozzarella...  │
│                                      │
│ Prices:                              │
│ Small: $12.99    Medium: $16.99     │
│ Large: $20.99    X-Large: $24.99    │
│ Category: specialty                  │
└─────────────────────────────────────┘
```

## Troubleshooting

### Pizza Not Showing Up

1. Check if pizza is marked as `active = 1` in database
2. Verify all 4 prices are set (all required)
3. Refresh the menu data

### Can't Edit/Delete Pizza

1. Verify you're logged in as Restaurant Admin or higher
2. Check browser console for API errors
3. Verify the pizza ID exists in database

### Prices Not Saving

1. Ensure all 4 price fields are filled (small, medium, large, xlarge)
2. Check that prices are valid numbers (not negative)
3. Verify decimal format (2 decimal places)

### Toppings Display Issues

1. Keep topping list under 150 characters for better display
2. Use commas to separate toppings
3. Capitalize properly for consistency

## Common Mistakes to Avoid

❌ **Don't:**

- Leave topping list empty
- Forget to set all 4 prices
- Use inconsistent topping naming (e.g., "mozzarella" vs "Mozzarella")
- Price specialty pizzas same as or lower than custom pizzas
- Use unclear abbreviations in topping names

✅ **Do:**

- List all toppings clearly
- Set all 4 prices before saving
- Use consistent capitalization
- Price appropriately for value
- Test the pizza on the ordering interface

## Future Enhancements

Potential features to add:

- [ ] Image upload for specialty pizzas
- [ ] Nutritional information
- [ ] Allergen warnings
- [ ] Customization options (e.g., "add/remove toppings")
- [ ] Limited time specialty pizzas
- [ ] Seasonal specials
- [ ] Popular tags (🔥 Trending, ⭐ Best Seller)
- [ ] Pizza builder based on specialty as template

---

**Need Help?** Contact the developer at info@akankha.com

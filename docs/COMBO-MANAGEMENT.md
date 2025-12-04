# Combo & Special Offers Management Guide

## Overview

The combo system allows you to create bundled deals and special offers at discounted prices (e.g., "2 Large Pizzas + Wings + 2L Pop for $39.99").

## How to Add Combo Deals

### 1. Access Admin Menu Management

1. Login to Admin Dashboard (`/admin/login`)
2. Click **"Menu Management"** from the dashboard
3. Click the **"🎁 Combos"** tab at the top

### 2. Create New Combo

1. Click the **"+ Add New"** button
2. Fill in the combo details:

   **Name** (Required)

   - Example: "Family Deal", "2 Medium Pizza Combo", "Walk-In Special"

   **Description** (Optional)

   - Additional details about the offer
   - Example: "Perfect for family dinner nights!"

   **Price** (Required)

   - The special combo price (discounted)
   - Example: 39.99

   **Items Included** (Required)

   - List what's included in the combo
   - Example: "2 Medium Pizzas, 1 Large Fries, 2L Pop"
   - Example: "1 Large 3-Topping Pizza, 12 Wings, 2L Pop"

3. Click **"Save"** to create the combo

### 3. Edit Existing Combo

1. Find the combo in the list
2. Click the **blue edit button** (pencil icon)
3. Update the fields as needed
4. Click **"Save"** to update

### 4. Delete Combo

1. Find the combo you want to remove
2. Click the **red delete button** (trash icon)
3. Confirm the deletion

## Database Schema

Combos are stored in the `combo_deals` table:

```sql
CREATE TABLE combo_deals (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  items TEXT,  -- Description of what's included
  category VARCHAR(50) DEFAULT 'combo',
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Endpoints

### Get All Active Combos (Public)

```
GET /api/menu/combos
```

### Create Combo (Restaurant Admin)

```
POST /api/admin/menu/combo
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Family Deal",
  "description": "Perfect for family dinner",
  "price": 39.99,
  "items": "2 Large Pizzas, 1 Large Fries, 2L Pop",
  "category": "combo"
}
```

### Update Combo (Restaurant Admin)

```
PUT /api/admin/menu/combo/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Family Deal",
  "description": "Perfect for family dinner",
  "price": 44.99,
  "items": "2 XLarge Pizzas, 1 Large Fries, 2L Pop",
  "category": "combo"
}
```

### Delete Combo (Restaurant Admin)

```
DELETE /api/admin/menu/combo/:id
Authorization: Bearer <token>
```

## Example Combos

### 1. Two Medium Pizza Deal

```json
{
  "name": "2 Medium Pizza Combo",
  "description": "Great value for couples or small families",
  "price": 24.99,
  "items": "2 Medium Pizzas (up to 3 toppings each)",
  "category": "combo"
}
```

### 2. Family Feast

```json
{
  "name": "Family Feast",
  "description": "Feed the whole family!",
  "price": 49.99,
  "items": "2 Large Pizzas, 1 Large Wings, 1 Large Fries, 2L Pop",
  "category": "combo"
}
```

### 3. Walk-In Special

```json
{
  "name": "Walk-In Medium Special",
  "description": "Walk-in customers only",
  "price": 12.99,
  "items": "1 Medium Pizza (3 toppings), 355ml Pop",
  "category": "combo"
}
```

### 4. Game Day Special

```json
{
  "name": "Game Day Special",
  "description": "Perfect for watching the game!",
  "price": 59.99,
  "items": "3 Large Pizzas, 2 Large Wings, 3 Dips, 2L Pop",
  "category": "combo"
}
```

## Best Practices

### Naming

- Use clear, descriptive names
- Include quantity/size if relevant (e.g., "2 Medium", "Family Size")
- Consider adding time/event context (e.g., "Lunch Special", "Weekend Deal")

### Pricing

- Calculate regular price first
- Apply 15-25% discount for combo pricing
- Keep prices ending in .99 for marketing appeal

### Items Description

- Be specific about quantities and sizes
- List items in order of importance (pizzas first, then sides, then drinks)
- Mention limits if any (e.g., "up to 3 toppings")

### Category

- Standard combos: `category: "combo"`
- Walk-in specials: `category: "walkin"`
- Promotional offers: `category: "special"`

## Troubleshooting

### Combo Not Showing Up

1. Check if combo is marked as `active = 1` in database
2. Verify the combo was saved successfully (check browser console)
3. Refresh the menu data in frontend

### Can't Edit/Delete Combo

1. Verify you're logged in as Restaurant Admin or higher
2. Check browser console for API errors
3. Verify the combo ID exists in database

### Price Not Displaying Correctly

1. Ensure price is saved as a number, not string
2. Check if price field is populated in database
3. Verify decimal format (2 decimal places)

## Future Enhancements

Potential features to add:

- [ ] Image upload for combo deals
- [ ] Time-based availability (lunch vs dinner combos)
- [ ] Day-of-week restrictions (weekend specials)
- [ ] Quantity limits (first 50 customers)
- [ ] Combo builder (let customers choose from options)
- [ ] Auto-calculate savings percentage
- [ ] Combo analytics (which combos sell best)

---

**Need Help?** Contact the developer at info@akankha.com

# Admin Menu Management - Complete Guide

## Overview

The Admin Menu Management system allows restaurant administrators to fully manage all menu items from a single interface. You can create, edit, and delete items across all categories.

## Accessing Admin Menu Management

1. Navigate to `/admin/login`
2. Login with your admin credentials
3. Click **"Menu Management"** from the Admin Dashboard
4. Select the appropriate tab for the item type you want to manage

## Available Menu Categories

### 1. 📏 Sizes

Configure available pizza sizes.

**Fields:**

- Name (e.g., "small", "medium")
- Display Name (e.g., "Small 10\"", "Medium 12\"")
- Base Price (starting price for this size)

**Documentation:** Built-in to admin interface

---

### 2. 🥖 Crusts

Manage crust types and their price modifiers.

**Fields:**

- Type (e.g., "thin", "thick", "stuffed")
- Display Name (customer-facing name)
- Price Modifier (additional cost, can be $0 or positive)

**Documentation:** Built-in to admin interface

---

### 3. 🧀 Toppings

Add and manage all available pizza toppings.

**Fields:**

- Name (e.g., "Pepperoni", "Mushrooms")
- Category (veggie, meat, cheese)
- Price (per topping cost)

**Documentation:** Built-in to admin interface

---

### 4. 🍟 Sides

Manage side items like wings, fries, breadsticks.

**Fields:**

- Name (e.g., "Chicken Wings", "Garlic Bread")
- Price (fixed price)
- Description (optional)

**Documentation:** Built-in to admin interface

---

### 5. 🥤 Drinks

Manage beverage options.

**Fields:**

- Name (e.g., "Coca-Cola 2L", "Bottled Water")
- Price (fixed price)
- Description (optional, e.g., size, type)

**Documentation:** Built-in to admin interface

---

### 6. 🎁 Combos

Create bundled deals with multiple items at a special price.

**Fields:**

- Name (e.g., "Family Feast", "2 Medium Pizza Deal")
- Description (optional marketing text)
- Price (discounted combo price)
- Items Included (what's in the combo - required)

**Example:**

```json
{
  "name": "Family Feast",
  "description": "Perfect for the whole family!",
  "price": 49.99,
  "items": "2 Large Pizzas, 1 Large Wings, 1 Large Fries, 2L Pop"
}
```

**Full Documentation:** `docs/COMBO-MANAGEMENT.md`

---

### 7. 🍕 Specialty Pizzas

Pre-designed signature pizzas with fixed toppings and size-based pricing.

**Fields:**

- Name (e.g., "Pepperoni Supreme", "Hawaiian")
- Description (optional marketing text)
- Toppings (comma-separated list - required)
- Prices (all 4 sizes required):
  - Small Price
  - Medium Price
  - Large Price
  - X-Large Price

**Example:**

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
  }
}
```

**Full Documentation:** `docs/SPECIALTY-PIZZA-MANAGEMENT.md`

---

## Common Operations

### Adding a New Item

1. Select the appropriate tab
2. Click **"+ Add New"** button
3. Fill in all required fields
4. Click **"Save"**

### Editing an Item

1. Find the item in the list
2. Click the **blue edit button** (pencil icon)
3. Modify the fields
4. Click **"Save"**

### Deleting an Item

1. Find the item in the list
2. Click the **red delete button** (trash icon)
3. Confirm the deletion
4. **Note:** This will permanently delete the item

### Searching/Filtering

Currently, all items in the selected category are displayed. Use browser's find function (Ctrl+F / Cmd+F) to search.

## API Reference

All menu management endpoints require Restaurant Admin authentication.

### Base Pattern

```
POST   /api/admin/menu/:type          - Create new item
PUT    /api/admin/menu/:type/:id      - Update existing item
DELETE /api/admin/menu/:type/:id      - Delete item
```

### Valid Types

- `size`
- `crust`
- `topping`
- `side`
- `drink`
- `combo`
- `specialty`

### Authentication

All requests require:

```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

## User Interface Features

### List View

Each item displays:

- **Name** (or display name)
- **Description** (if applicable)
- **Additional Info**:
  - Combos: 📦 Items included
  - Specialty Pizzas: 🍕 Toppings
- **Price Information**:
  - Single price items: Large display
  - Specialty pizzas: Grid of all 4 sizes
- **Category** tag
- **Edit/Delete** action buttons

### Modal Form

Clean, responsive form with:

- Appropriate input types (text, number, textarea, select)
- Clear labeling
- Validation (required fields marked)
- Save/Cancel buttons
- Scrollable for long forms

### Design

- Clean 2px borders
- Moderate shadows for depth
- Orange accent color (#f97316) for primary actions
- Responsive grid layout
- Touch-friendly buttons (optimized for touchscreens)

## Database Tables

### Core Tables

- `sizes` - Pizza sizes
- `crusts` - Crust types
- `toppings` - All toppings
- `menu_items` - Sides and drinks (category field differentiates)
- `combo_deals` - Combo meal offers
- `specialty_pizzas` - Signature pizzas

### Common Fields

All tables include:

- `id` (VARCHAR primary key)
- `active` (TINYINT, default 1)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP, auto-updated)

## Best Practices

### Pricing Strategy

1. **Pizza Sizes:**

   - Small (10"): Base price
   - Medium (12"): +$3-4
   - Large (14"): +$7-9
   - X-Large (16"): +$11-14

2. **Toppings:**

   - Standard veggie: $1.50-2.00
   - Premium veggie: $2.00-2.50
   - Meat toppings: $2.50-3.50
   - Premium meat: $3.50-4.50

3. **Combos:**

   - Calculate regular price sum
   - Apply 15-25% discount
   - Round to .99 or .95

4. **Specialty Pizzas:**
   - Price 10-20% higher than equivalent custom pizza
   - Account for all toppings included
   - Premium ingredients = premium pricing

### Naming Conventions

- **Be Consistent:** Capitalize properly across all items
- **Be Descriptive:** "Large Wings (12 pc)" not just "Wings"
- **Be Clear:** Avoid abbreviations customers won't understand
- **Be Appetizing:** Use marketing-friendly language

### Descriptions

- **Optional But Valuable:** Helps customers make decisions
- **Keep Brief:** 5-15 words maximum
- **Highlight Benefits:** "Perfect for sharing" not "Contains chicken"
- **Use Sparingly:** Not needed for basic items like "Pepsi 2L"

## Troubleshooting

### Item Not Appearing on Menu

1. Check if item is marked as `active = 1` in database
2. Verify required fields are filled
3. Check browser console for API errors
4. Refresh menu data (may need to reload page)

### Can't Edit/Delete

1. Verify admin login status
2. Check you have Restaurant Admin role or higher
3. Clear browser cache and cookies
4. Check server logs for permission errors

### Save Failed

1. Ensure all required fields are filled
2. Check number formats (no negative prices)
3. Verify text fields aren't too long (check limits)
4. Check browser console for validation errors

### Display Issues

1. Long text may be truncated - keep names/descriptions concise
2. Special characters may cause issues - stick to alphanumeric
3. Price formatting requires valid numbers

## Security & Permissions

### Role Requirements

- **View Menu (Public):** Anyone can view active menu items
- **Create/Edit/Delete:** Restaurant Admin or higher only
- **Database Access:** Server Admin only

### Data Validation

- Server-side validation on all inputs
- Type checking (numbers must be numbers, required fields must exist)
- SQL injection protection via parameterized queries
- Authentication token verification on all mutations

## Workflow Examples

### Adding a New Specialty Pizza

1. Click "Specialty Pizzas" tab
2. Click "+ Add New"
3. Fill in:
   - Name: "Buffalo Chicken"
   - Description: "Spicy buffalo sauce with grilled chicken"
   - Toppings: "Buffalo Sauce, Grilled Chicken, Red Onions, Ranch Drizzle, Mozzarella"
   - Small: 13.99
   - Medium: 17.99
   - Large: 21.99
   - X-Large: 25.99
4. Click "Save"
5. Verify it appears in the list

### Creating a Lunch Combo

1. Click "Combos" tab
2. Click "+ Add New"
3. Fill in:
   - Name: "Lunch Special"
   - Description: "Available 11am-3pm weekdays"
   - Price: 9.99
   - Items: "1 Medium 2-Topping Pizza, 355ml Pop"
4. Click "Save"
5. Verify it appears in combo list

### Updating Topping Prices

1. Click "Toppings" tab
2. Find topping (e.g., "Pepperoni")
3. Click blue edit button
4. Update price (e.g., 2.99 → 3.49)
5. Click "Save"
6. Verify updated price displays

## Support & Resources

### Documentation

- **Combo Deals:** `docs/COMBO-MANAGEMENT.md`
- **Specialty Pizzas:** `docs/SPECIALTY-PIZZA-MANAGEMENT.md`
- **This Guide:** `docs/ADMIN-MENU-GUIDE.md`

### Contact

- **Developer:** Akankha
- **Email:** info@akankha.com
- **Website:** https://akankha.com

### Version

- **Current Version:** 2.0.0
- **Last Updated:** December 2025

---

**Quick Reference Card**

| Category         | Icon | Key Fields                         | Price Type |
| ---------------- | ---- | ---------------------------------- | ---------- |
| Sizes            | 📏   | Name, Display Name, Base Price     | Single     |
| Crusts           | 🥖   | Type, Display Name, Price Modifier | Single     |
| Toppings         | 🧀   | Name, Category, Price              | Single     |
| Sides            | 🍟   | Name, Price, Description           | Single     |
| Drinks           | 🥤   | Name, Price, Description           | Single     |
| Combos           | 🎁   | Name, Items, Price                 | Single     |
| Specialty Pizzas | 🍕   | Name, Toppings, 4 Prices           | Multiple   |

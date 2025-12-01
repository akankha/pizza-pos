# 🍕 Order Process & Menu Management Workflow

## 📊 Database Schema Analysis

### Current Tables

#### 1. **Menu Items Tables**
- `sizes` - Pizza sizes (Small, Medium, Large, XLarge)
- `crusts` - Crust types (Thin, Regular, Thick)
- `toppings` - Individual toppings with prices
- `menu_items` - Sides & drinks
- `specialty_pizzas` - Pre-defined pizzas with fixed prices per size
- `combo_deals` - Combo packages with fixed prices

#### 2. **Order Tables**
- `orders` - Main order record
- `order_items` - Individual items in an order

#### 3. **System Tables**
- `admin_users` - User management (RBAC)
- `restaurant_settings` - Configuration

---

## 🔄 Order Process Workflow

### **Customer Ordering Flow**

```
┌─────────────────────────────────────────────────────┐
│              START: New Order                       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  Select Order Type  │
        └──────────┬──────────┘
                   │
        ┌──────────┴──────────────────┐
        │                             │
        ▼                             ▼
┌───────────────────┐      ┌──────────────────────┐
│  Custom Pizza     │      │  Pre-defined Items   │
│  Builder          │      │  (Quick Order)       │
└─────────┬─────────┘      └──────────┬───────────┘
          │                           │
          │                           │
    ┌─────┴─────┐              ┌──────┴───────┐
    │           │              │              │
    ▼           ▼              ▼              ▼
┌────────┐ ┌─────────┐  ┌──────────┐  ┌─────────┐
│Specialty│ │ Build   │  │  Combo   │  │ Sides & │
│ Pizza   │ │ Custom  │  │  Deals   │  │ Drinks  │
└────┬────┘ └────┬────┘  └────┬─────┘  └────┬────┘
     │           │            │             │
     └───────────┴────────────┴─────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  Shopping Cart       │
        │  - Review items      │
        │  - Adjust quantities │
        │  - Add notes         │
        └─────────┬────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  Checkout            │
        │  - Calculate total   │
        │  - Apply taxes       │
        │  - Select payment    │
        └─────────┬────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  Submit Order        │
        │  - Save to database  │
        │  - Print receipt     │
        │  - Show in kitchen   │
        └─────────┬────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │   Order Complete     │
        └─────────────────────┘
```

---

## 📝 Detailed Order Types

### **1. Custom Pizza Builder**

**User Flow:**
1. Click "Build Your Own Pizza"
2. Select Size (Small/Medium/Large/XLarge)
3. Select Crust (Thin/Regular/Thick)
4. Add Toppings (select multiple)
5. Add to cart

**Database Storage:**
```json
{
  "order_item": {
    "type": "custom_pizza",
    "name": "Custom Pizza - Large",
    "price": 28.50,
    "quantity": 1,
    "custom_pizza": {
      "size": "large",
      "size_price": 20.99,
      "crust": "regular",
      "crust_price": 0,
      "toppings": [
        {"id": "top-pepperoni", "name": "Pepperoni", "price": 2.00},
        {"id": "top-mushrooms", "name": "Mushrooms", "price": 1.50},
        {"id": "top-greenpepper", "name": "Green Peppers", "price": 1.50}
      ]
    }
  }
}
```

**Price Calculation:**
```
Base Price (Size) = $20.99
+ Crust Modifier = $0.00
+ Topping 1 (Pepperoni) = $2.00
+ Topping 2 (Mushrooms) = $1.50
+ Topping 3 (Green Peppers) = $1.50
─────────────────────────────
Total = $25.99
```

---

### **2. Specialty Pizza (Pre-defined)**

**User Flow:**
1. Browse specialty pizzas
2. Select pizza (e.g., "Hawaiian")
3. Select Size (Small/Medium/Large/XLarge)
4. Add to cart

**Database Storage:**
```json
{
  "order_item": {
    "type": "specialty_pizza",
    "specialty_pizza_id": "specialty-hawaiian",
    "name": "Hawaiian Pizza - Medium",
    "price": 19.99,
    "quantity": 2,
    "size": "medium",
    "toppings": "Grilled Chicken, Pineapple"
  }
}
```

**Price:** Fixed based on size from `specialty_pizzas` table

---

### **3. Combo Deals**

**User Flow:**
1. Browse combo deals/specials
2. Select combo (e.g., "2 Medium Pizzas Special")
3. Customize pizzas if allowed
4. Add to cart

**Database Storage:**
```json
{
  "order_item": {
    "type": "combo_deal",
    "combo_id": "combo-2med-pizzas",
    "name": "2 Medium Pizzas Special",
    "price": 33.99,
    "quantity": 1,
    "items": "2 Medium Pizzas (2 toppings each), 2 Dipping Sauce, 4x 355ml Cans",
    "customization": {
      "pizza1_toppings": ["Pepperoni", "Mushrooms"],
      "pizza2_toppings": ["Hawaiian", "Green Peppers"]
    }
  }
}
```

**Price:** Fixed from `combo_deals` table

---

### **4. Sides & Drinks**

**User Flow:**
1. Browse sides or drinks
2. Select item
3. Select quantity
4. Add to cart

**Database Storage:**
```json
{
  "order_item": {
    "type": "side",
    "menu_item_id": "side-wings-20",
    "name": "Chicken Wings (20pc)",
    "price": 19.99,
    "quantity": 1
  }
}
```

---

## 🗄️ Database Schema Updates Needed

### **Update `order_items` Table**

```sql
ALTER TABLE order_items ADD COLUMN item_data JSON AFTER custom_pizza;
ALTER TABLE order_items ADD COLUMN specialty_pizza_id VARCHAR(255) AFTER type;
ALTER TABLE order_items ADD COLUMN combo_id VARCHAR(255) AFTER specialty_pizza_id;
ALTER TABLE order_items ADD COLUMN menu_item_id VARCHAR(255) AFTER combo_id;
```

**New Schema:**
```sql
CREATE TABLE order_items (
  id VARCHAR(255) PRIMARY KEY,
  order_id VARCHAR(255) NOT NULL,
  
  -- Item Type
  type ENUM('custom_pizza', 'specialty_pizza', 'combo_deal', 'side', 'drink') NOT NULL,
  
  -- Foreign Keys
  specialty_pizza_id VARCHAR(255),  -- References specialty_pizzas.id
  combo_id VARCHAR(255),             -- References combo_deals.id
  menu_item_id VARCHAR(255),         -- References menu_items.id
  
  -- Item Details
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  
  -- Custom Data (JSON for flexibility)
  item_data JSON,  -- Stores toppings, size, customization, etc.
  
  notes TEXT,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_type (type),
  INDEX idx_specialty_pizza (specialty_pizza_id),
  INDEX idx_combo (combo_id),
  INDEX idx_menu_item (menu_item_id)
);
```

### **Update `orders` Table**

```sql
ALTER TABLE orders ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL AFTER total;
ALTER TABLE orders ADD COLUMN tax_gst DECIMAL(10, 2) DEFAULT 0 AFTER subtotal;
ALTER TABLE orders ADD COLUMN tax_pst DECIMAL(10, 2) DEFAULT 0 AFTER tax_gst;
ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255) AFTER payment_method;
ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50) AFTER customer_name;
ALTER TABLE orders ADD COLUMN order_number INT AUTO_INCREMENT UNIQUE AFTER id;
```

**New Schema:**
```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  order_number INT AUTO_INCREMENT UNIQUE,  -- Sequential order #
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_gst DECIMAL(10, 2) DEFAULT 0,
  tax_pst DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Order Details
  status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  payment_method ENUM('cash', 'card', 'debit', 'credit') DEFAULT NULL,
  
  -- Customer Info (optional)
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_order_number (order_number)
);
```

---

## 🎨 Frontend UI/UX Flow

### **Reception User Interface**

#### **1. Home Page (Order Entry)**
```
┌────────────────────────────────────────────────────┐
│  🍕 New Order                          Cart: (3)   │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │   Build      │  │  Specialty   │              │
│  │  Your Own    │  │   Pizzas     │              │
│  │    Pizza     │  │              │              │
│  └──────────────┘  └──────────────┘              │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │    Combo     │  │   Sides &    │              │
│  │    Deals     │  │   Drinks     │              │
│  │              │  │              │              │
│  └──────────────┘  └──────────────┘              │
│                                                    │
│  Recent Orders:                                    │
│  #1234 - $45.99 - 2 mins ago                      │
│  #1233 - $32.50 - 5 mins ago                      │
└────────────────────────────────────────────────────┘
```

#### **2. Custom Pizza Builder**
```
┌────────────────────────────────────────────────────┐
│  🍕 Build Your Pizza              Back │ Cart (3)  │
├────────────────────────────────────────────────────┤
│  Step 1: Choose Size                               │
│  ○ Small $14.49   ● Medium $16.99                 │
│  ○ Large $20.99   ○ XLarge $23.99                 │
│                                                    │
│  Step 2: Choose Crust                              │
│  ● Thin   ○ Regular   ○ Thick                     │
│                                                    │
│  Step 3: Add Toppings ($1.50-$2.00 each)          │
│  ┌─── Meats (Halal) ───────────────────┐          │
│  │ ☑ Pepperoni        ☑ Ground Beef     │          │
│  │ ☐ Sausage          ☐ Salami          │          │
│  └──────────────────────────────────────┘          │
│  ┌─── Vegetables ───────────────────────┐          │
│  │ ☑ Mushrooms        ☐ Green Peppers   │          │
│  │ ☐ Onions           ☐ Tomatoes        │          │
│  └──────────────────────────────────────┘          │
│                                                    │
│  Your Pizza: Medium Thin Crust                     │
│  Toppings: Pepperoni, Ground Beef, Mushrooms       │
│                                                    │
│  Price: $22.99                                     │
│                                                    │
│  [Add to Cart]                                     │
└────────────────────────────────────────────────────┘
```

#### **3. Specialty Pizzas**
```
┌────────────────────────────────────────────────────┐
│  🍕 Specialty Pizzas              Back │ Cart (3)  │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌─────────────────────────────────────┐          │
│  │ Pepperoni                            │          │
│  │ Classic pepperoni pizza              │          │
│  │ S:$15.49 M:$17.99 L:$21.99 XL:$24.99│          │
│  │ [Small] [Medium] [Large] [XLarge]   │          │
│  └─────────────────────────────────────┘          │
│                                                    │
│  ┌─────────────────────────────────────┐          │
│  │ Hawaiian                             │          │
│  │ Chicken & Pineapple                  │          │
│  │ S:$16.49 M:$19.99 L:$22.99 XL:$25.99│          │
│  │ [Small] [Medium] [Large] [XLarge]   │          │
│  └─────────────────────────────────────┘          │
│                                                    │
│  ┌─────────────────────────────────────┐          │
│  │ Meat Lovers                          │          │
│  │ Pepperoni, Bacon, Beef, Sausage      │          │
│  │ S:$20.49 M:$23.99 L:$26.99 XL:$33.99│          │
│  │ [Small] [Medium] [Large] [XLarge]   │          │
│  └─────────────────────────────────────┘          │
└────────────────────────────────────────────────────┘
```

#### **4. Shopping Cart**
```
┌────────────────────────────────────────────────────┐
│  🛒 Shopping Cart                      Back        │
├────────────────────────────────────────────────────┤
│                                                    │
│  Hawaiian Pizza - Medium          $19.99           │
│  Qty: [1] ▲▼                      [Remove]         │
│                                                    │
│  Custom Pizza - Large             $25.99           │
│  Toppings: Pepperoni, Mushrooms                    │
│  Qty: [2] ▲▼                      [Remove]         │
│                                                    │
│  Chicken Wings (20pc)             $19.99           │
│  Qty: [1] ▲▼                      [Remove]         │
│                                                    │
│  2 Litre Bottle                   $4.00            │
│  Qty: [2] ▲▼                      [Remove]         │
│                                                    │
│  ─────────────────────────────────────────         │
│  Subtotal:                        $99.95           │
│  GST (5%):                        $5.00            │
│  PST (7%):                        $7.00            │
│  ─────────────────────────────────────────         │
│  Total:                           $111.95          │
│                                                    │
│  [Continue Shopping]  [Checkout]                   │
└────────────────────────────────────────────────────┘
```

#### **5. Checkout**
```
┌────────────────────────────────────────────────────┐
│  💳 Checkout                       Back            │
├────────────────────────────────────────────────────┤
│                                                    │
│  Order Summary:         Total: $111.95             │
│                                                    │
│  Customer Info (Optional):                         │
│  Name:  [__________________]                       │
│  Phone: [__________________]                       │
│                                                    │
│  Payment Method:                                   │
│  ○ Cash   ○ Card   ○ Debit   ○ Credit             │
│                                                    │
│  Order Notes:                                      │
│  [_______________________________________]         │
│  [_______________________________________]         │
│                                                    │
│  [Cancel]              [Complete Order]            │
└────────────────────────────────────────────────────┘
```

---

## 👨‍💼 Admin Panel - Menu Management

### **Admin Menu Management UI**

#### **1. Menu Dashboard**
```
┌────────────────────────────────────────────────────┐
│  🍕 Menu Management                                │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │   Pizza      │  │  Specialty   │              │
│  │   Builder    │  │   Pizzas     │              │
│  │  Components  │  │   (11)       │              │
│  └──────────────┘  └──────────────┘              │
│                                                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │    Combo     │  │   Sides &    │              │
│  │    Deals     │  │   Drinks     │              │
│  │    (10)      │  │   (21)       │              │
│  └──────────────┘  └──────────────┘              │
└────────────────────────────────────────────────────┘
```

#### **2. Pizza Builder Components**
```
┌────────────────────────────────────────────────────┐
│  🍕 Pizza Builder Components          Back         │
├────────────────────────────────────────────────────┤
│  [Sizes] [Crusts] [Toppings]                      │
│                                                    │
│  Sizes (4)                        [+ Add Size]     │
│  ┌──────────────────────────────────────┐         │
│  │ Small      $14.49    [Edit] [Delete] │         │
│  │ Medium     $16.99    [Edit] [Delete] │         │
│  │ Large      $20.99    [Edit] [Delete] │         │
│  │ XLarge     $23.99    [Edit] [Delete] │         │
│  └──────────────────────────────────────┘         │
│                                                    │
│  Crusts (3)                       [+ Add Crust]    │
│  ┌──────────────────────────────────────┐         │
│  │ Thin       +$0.00    [Edit] [Delete] │         │
│  │ Regular    +$0.00    [Edit] [Delete] │         │
│  │ Thick      +$0.00    [Edit] [Delete] │         │
│  └──────────────────────────────────────┘         │
│                                                    │
│  Toppings (20)                  [+ Add Topping]    │
│  ┌──────────────────────────────────────┐         │
│  │ 🥩 Pepperoni    $2.00 [Edit] [Delete]│         │
│  │ 🥩 Ground Beef  $2.00 [Edit] [Delete]│         │
│  │ 🥬 Mushrooms    $1.50 [Edit] [Delete]│         │
│  └──────────────────────────────────────┘         │
└────────────────────────────────────────────────────┘
```

#### **3. Specialty Pizzas Management**
```
┌────────────────────────────────────────────────────┐
│  🍕 Specialty Pizzas                  Back         │
├────────────────────────────────────────────────────┤
│  [+ Add Specialty Pizza]                           │
│                                                    │
│  ┌──────────────────────────────────────┐         │
│  │ Pepperoni                     Active │         │
│  │ Toppings: Pepperoni                  │         │
│  │ S:$15.49 M:$17.99 L:$21.99 XL:$24.99│         │
│  │ [Edit] [Duplicate] [Deactivate]      │         │
│  └──────────────────────────────────────┘         │
│                                                    │
│  ┌──────────────────────────────────────┐         │
│  │ Hawaiian                      Active │         │
│  │ Toppings: Chicken, Pineapple         │         │
│  │ S:$16.49 M:$19.99 L:$22.99 XL:$25.99│         │
│  │ [Edit] [Duplicate] [Deactivate]      │         │
│  └──────────────────────────────────────┘         │
│                                                    │
│  ┌──────────────────────────────────────┐         │
│  │ Meat Lovers                  Inactive│         │
│  │ Toppings: Pepperoni, Bacon, Beef...  │         │
│  │ S:$20.49 M:$23.99 L:$26.99 XL:$33.99│         │
│  │ [Edit] [Duplicate] [Activate]        │         │
│  └──────────────────────────────────────┘         │
└────────────────────────────────────────────────────┘
```

#### **4. Edit Specialty Pizza Modal**
```
┌────────────────────────────────────────────────────┐
│  ✏️ Edit Specialty Pizza                     [X]   │
├────────────────────────────────────────────────────┤
│                                                    │
│  Pizza Name:                                       │
│  [Hawaiian                              ]          │
│                                                    │
│  Description:                                      │
│  [Chicken & Pineapple                   ]          │
│                                                    │
│  Toppings (comma separated):                       │
│  [Grilled Chicken, Pineapple            ]          │
│                                                    │
│  Pricing:                                          │
│  Small:   [$16.49]                                 │
│  Medium:  [$19.99]                                 │
│  Large:   [$22.99]                                 │
│  XLarge:  [$25.99]                                 │
│                                                    │
│  Status: ☑ Active                                  │
│                                                    │
│  [Cancel]                          [Save Changes]  │
└────────────────────────────────────────────────────┘
```

#### **5. Combo Deals Management**
```
┌────────────────────────────────────────────────────┐
│  🎁 Combo Deals & Specials            Back         │
├────────────────────────────────────────────────────┤
│  [+ Add Combo Deal]                                │
│                                                    │
│  ┌──────────────────────────────────────┐         │
│  │ 2 Medium Pizzas Special      $33.99  │         │
│  │ Category: Pizza Special       Active │         │
│  │ Items: 2 Medium Pizzas (2 toppings   │         │
│  │ each), 2 Dipping Sauce, 4 Cans       │         │
│  │ [Edit] [Duplicate] [Deactivate]      │         │
│  └──────────────────────────────────────┘         │
│                                                    │
│  ┌──────────────────────────────────────┐         │
│  │ Family Special - Large       $36.99  │         │
│  │ Category: Family Special      Active │         │
│  │ Items: 1 Large Pizza, 15 Wings,      │         │
│  │ 2L Pop, 1 Dip                        │         │
│  │ [Edit] [Duplicate] [Deactivate]      │         │
│  └──────────────────────────────────────┘         │
└────────────────────────────────────────────────────┘
```

#### **6. Sides & Drinks Management**
```
┌────────────────────────────────────────────────────┐
│  🍗 Sides & Drinks                    Back         │
├────────────────────────────────────────────────────┤
│  [Sides] [Drinks]          [+ Add Item]            │
│                                                    │
│  Wings (6 items)                                   │
│  ┌──────────────────────────────────────┐         │
│  │ Chicken Wings (10pc)  $13.99  [Edit] │         │
│  │ Chicken Wings (15pc)  $15.99  [Edit] │         │
│  │ Chicken Wings (20pc)  $19.99  [Edit] │         │
│  └──────────────────────────────────────┘         │
│                                                    │
│  Finger Food (11 items)                            │
│  ┌──────────────────────────────────────┐         │
│  │ Garlic Bread          $7.99   [Edit] │         │
│  │ Garlic Cheese Bread   $8.99   [Edit] │         │
│  │ Chicken Fingers       $13.99  [Edit] │         │
│  └──────────────────────────────────────┘         │
└────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation Plan

### **Phase 1: Database Updates** ✅ NEXT

1. Create migration script for `orders` table
2. Create migration script for `order_items` table
3. Update TypeScript types
4. Test migrations

### **Phase 2: Backend API**

1. **Menu API Updates**
   - GET `/api/menu/specialty-pizzas` - List all specialty pizzas
   - GET `/api/menu/combos` - List all combo deals
   - POST `/api/menu/specialty-pizzas` - Create new specialty pizza (admin)
   - PUT `/api/menu/specialty-pizzas/:id` - Update specialty pizza (admin)
   - DELETE `/api/menu/specialty-pizzas/:id` - Delete specialty pizza (admin)
   - Similar endpoints for combos, sizes, crusts, toppings, sides, drinks

2. **Order API Updates**
   - POST `/api/orders` - Create new order
   - GET `/api/orders` - List orders (with filters)
   - GET `/api/orders/:id` - Get order details
   - PUT `/api/orders/:id/status` - Update order status (kitchen)
   - DELETE `/api/orders/:id` - Cancel order

3. **Cart/Pricing API**
   - POST `/api/cart/calculate` - Calculate cart total with taxes
   - POST `/api/cart/validate` - Validate cart items

### **Phase 3: Frontend - Reception UI**

1. **Home/Dashboard**
   - Order type selection cards
   - Recent orders list
   - Cart preview

2. **Custom Pizza Builder**
   - Size selection
   - Crust selection
   - Topping selection (multi-select)
   - Real-time price calculation
   - Add to cart

3. **Specialty Pizzas**
   - Grid/list view
   - Size selection per pizza
   - Quick add to cart

4. **Combo Deals**
   - Display combo details
   - Customization options
   - Add to cart

5. **Sides & Drinks**
   - Categorized list
   - Quantity selector
   - Quick add

6. **Shopping Cart**
   - Item list with quantities
   - Remove/edit items
   - Subtotal/tax/total display
   - Notes field

7. **Checkout**
   - Customer info (optional)
   - Payment method selection
   - Order notes
   - Submit order
   - Receipt print trigger

### **Phase 4: Frontend - Admin Panel**

1. **Pizza Builder Components**
   - Manage sizes (CRUD)
   - Manage crusts (CRUD)
   - Manage toppings (CRUD)
   - Bulk import/export

2. **Specialty Pizzas**
   - List view with status
   - Create/edit modal
   - Duplicate functionality
   - Activate/deactivate

3. **Combo Deals**
   - List view with categories
   - Create/edit modal
   - Category management

4. **Sides & Drinks**
   - Tabbed interface
   - Create/edit items
   - Category management

### **Phase 5: Kitchen Display**

1. **Active Orders View**
   - Real-time order updates
   - Order details expansion
   - Status update buttons
   - Timer/age display

---

## 📊 API Endpoints Summary

### **Menu Endpoints**

```
GET    /api/menu                      # Get full menu (sizes, crusts, toppings, etc.)
GET    /api/menu/specialty-pizzas     # List specialty pizzas
POST   /api/menu/specialty-pizzas     # Create specialty pizza (admin)
PUT    /api/menu/specialty-pizzas/:id # Update specialty pizza (admin)
DELETE /api/menu/specialty-pizzas/:id # Delete specialty pizza (admin)
GET    /api/menu/combos               # List combo deals
POST   /api/menu/combos               # Create combo (admin)
PUT    /api/menu/combos/:id           # Update combo (admin)
DELETE /api/menu/combos/:id           # Delete combo (admin)
GET    /api/menu/sizes                # List sizes
POST   /api/menu/sizes                # Create size (admin)
PUT    /api/menu/sizes/:id            # Update size (admin)
DELETE /api/menu/sizes/:id            # Delete size (admin)
GET    /api/menu/toppings             # List toppings
POST   /api/menu/toppings             # Create topping (admin)
PUT    /api/menu/toppings/:id         # Update topping (admin)
DELETE /api/menu/toppings/:id         # Delete topping (admin)
GET    /api/menu/sides                # List sides
GET    /api/menu/drinks               # List drinks
POST   /api/menu/items                # Create side/drink (admin)
PUT    /api/menu/items/:id            # Update item (admin)
DELETE /api/menu/items/:id            # Delete item (admin)
```

### **Order Endpoints**

```
GET    /api/orders                    # List orders (filter by status, date)
POST   /api/orders                    # Create new order
GET    /api/orders/:id                # Get order details
PUT    /api/orders/:id                # Update order
PUT    /api/orders/:id/status         # Update order status
DELETE /api/orders/:id                # Cancel order
POST   /api/orders/calculate          # Calculate order total
```

---

## 🎯 Next Steps

1. **Create database migration scripts**
2. **Update TypeScript types**
3. **Implement menu API endpoints**
4. **Build reception order entry UI**
5. **Build admin menu management UI**
6. **Test end-to-end order flow**
7. **Add real-time kitchen display updates**

---

## ✅ Success Criteria

- [ ] Reception can create orders with all menu types
- [ ] Prices calculate correctly (base + modifiers + toppings + tax)
- [ ] Admin can manage all menu items
- [ ] Orders save correctly to database
- [ ] Kitchen display shows real-time orders
- [ ] Receipts print automatically
- [ ] Cart persists during session
- [ ] Responsive touch-optimized UI

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-30  
**Status:** Ready for Implementation

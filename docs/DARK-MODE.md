# Dark Mode Feature

## Overview

The Pizza POS system now supports a system-wide dark mode theme that can be toggled from the Admin Settings page.

## Setup Instructions

### 1. Run Database Migration

First, add the `dark_mode` column to the database:

```bash
cd server
npm run migrate:dark-mode
```

Or manually run this SQL:

```sql
ALTER TABLE restaurant_settings
ADD COLUMN dark_mode TINYINT(1) NOT NULL DEFAULT 0 AFTER print_copies;
```

### 2. Restart Server and Client

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

## How to Use

### Enable Dark Mode

1. Login as admin
2. Go to **Admin Dashboard** → **Restaurant Settings**
3. Scroll to the **Appearance** section
4. Toggle the **Dark Mode** switch
5. Click **Save Settings**
6. The theme will apply immediately across the entire system

### Disable Dark Mode

1. Go to **Restaurant Settings**
2. Toggle the **Dark Mode** switch off
3. Click **Save Settings**

## Technical Details

### Frontend

- **Theme Context**: `client/src/contexts/ThemeContext.tsx`
  - Fetches dark mode setting from API on app load
  - Applies/removes 'dark' class on `<html>` element
- **Tailwind Config**: `client/tailwind.config.js`

  - Dark mode enabled with `darkMode: 'class'`
  - All dark mode styles use `dark:` prefix

- **Admin Settings**: `client/src/pages/AdminSettingsPage.tsx`
  - Toggle switch in Appearance section
  - Saves to database via API
  - Applies theme immediately on save

### Backend

- **Settings Route**: `server/src/routes/settings.ts`

  - GET `/api/settings` - Returns dark_mode value
  - PUT `/api/settings` - Updates dark_mode value

- **Database**: `restaurant_settings` table
  - `dark_mode` TINYINT(1) - 0 = light, 1 = dark

### Adding Dark Mode to Pages

To make a page support dark mode, add dark mode classes:

```tsx
// Background
className="bg-white dark:bg-gray-800"

// Text
className="text-gray-900 dark:text-white"
className="text-gray-600 dark:text-gray-300"

// Borders
className="border-gray-200 dark:border-gray-700"

// Example
<div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <h1 className="text-gray-900 dark:text-white">Title</h1>
  <p className="text-gray-600 dark:text-gray-300">Description</p>
</div>
```

### Current Implementation Status

✅ **Implemented:**

- Database column
- Backend API support
- Admin settings toggle
- Theme context and provider
- Tailwind dark mode configuration
- HomePage dark mode styles (example)

⏳ **To Do:**

- Add dark mode classes to all pages
- Add dark mode to components
- Test all pages in dark mode
- Adjust colors for better dark mode contrast

## Color Recommendations

### Dark Mode Palette

- Background: `bg-gray-900` (#111827)
- Surface: `bg-gray-800` (#1F2937)
- Text Primary: `text-white`
- Text Secondary: `text-gray-300`
- Borders: `border-gray-700`
- Accent: Keep brand colors (orange/blue work in both modes)

### Light Mode Palette (existing)

- Background: `bg-gray-50`
- Surface: `bg-white`
- Text Primary: `text-gray-900`
- Text Secondary: `text-gray-600`
- Borders: `border-gray-200`

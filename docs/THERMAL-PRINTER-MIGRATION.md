# 🔄 Thermal Printer Migration Guide

## For Existing Pizza POS Installations

If you're updating an existing Pizza POS system to add thermal printer support, follow these steps:

---

## 📋 Prerequisites

- Existing Pizza POS installation (v1.0.0+)
- Node.js 18+ installed
- Admin access to the system
- Xprinter XP-N160II thermal printer (optional, can configure later)

---

## 🚀 Step-by-Step Update

### 1. Backup Your Data

**Important:** Always backup before updating!

```bash
# Backup SQLite database
cp server/data/pos.db server/data/pos.db.backup

# Or if using MySQL
mysqldump -u root -p pizza_pos > pizza_pos_backup.sql
```

---

### 2. Update Code

```bash
# Navigate to project directory
cd /path/to/pizza-pos

# Pull latest changes (if using git)
git pull origin main

# Or download and extract updated files
```

---

### 3. Install New Dependencies

```bash
# Install printer libraries
cd server
npm install escpos escpos-usb --save

# Return to root
cd ..
```

---

### 4. Update Database Schema

**Option A: Automatic (Restart Server)**

The server will automatically add new columns on startup.

```bash
cd server
npm run dev
# Server will add printer_enabled, auto_print, print_copies columns
```

**Option B: Manual (MySQL)**

If using MySQL in production, run this SQL:

```sql
USE pizza_pos;

ALTER TABLE restaurant_settings 
ADD COLUMN printer_enabled TINYINT(1) NOT NULL DEFAULT 1,
ADD COLUMN auto_print TINYINT(1) NOT NULL DEFAULT 1,
ADD COLUMN print_copies INT NOT NULL DEFAULT 1;
```

**Option C: Manual (SQLite)**

```bash
sqlite3 server/data/pos.db

ALTER TABLE restaurant_settings ADD COLUMN printer_enabled INTEGER NOT NULL DEFAULT 1;
ALTER TABLE restaurant_settings ADD COLUMN auto_print INTEGER NOT NULL DEFAULT 1;
ALTER TABLE restaurant_settings ADD COLUMN print_copies INTEGER NOT NULL DEFAULT 1;

.quit
```

---

### 5. Rebuild Application

```bash
# Clean old builds
npm run clean

# Install all dependencies
npm install

# Build client and server
npm run build
```

---

### 6. Test the Update

```bash
# Start development server
npm run dev

# Access at http://localhost:5173
# Login to admin panel
# Navigate to Settings
# Verify "Thermal Printer Settings" section appears
```

---

### 7. Configure Printer (Optional)

If you have the Xprinter XP-N160II:

```bash
# Test printer detection
node scripts/test-printer.js
```

**In Admin Panel:**
1. Go to **Settings**
2. Scroll to **Thermal Printer Settings**
3. Click **Test Print**
4. Verify receipt prints

---

### 8. Deploy to Production

```bash
# Build for production
npm run deploy:build

# Start production server
npm run start:production

# Or with PM2
pm2 restart ecosystem.config.js
```

---

## ✅ Verification Checklist

After update, verify these features work:

- [ ] Application starts without errors
- [ ] Admin Settings page loads
- [ ] "Thermal Printer Settings" section visible
- [ ] Existing restaurant settings preserved
- [ ] Can toggle printer enabled/disabled
- [ ] Can change number of copies (1-5)
- [ ] Orders can be created and completed
- [ ] No errors in browser console (F12)
- [ ] No errors in server logs

**With Printer Connected:**
- [ ] Test script detects printer
- [ ] Test Print button works
- [ ] Auto-print works when order marked complete

---

## 🔧 Troubleshooting Migration Issues

### "Cannot find module 'escpos'"

**Solution:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

---

### "Column 'printer_enabled' doesn't exist"

**Solution:** Database wasn't updated. Run manual SQL (Step 4, Option B or C).

---

### Settings page shows old version

**Solution:**
```bash
# Clear browser cache
# Or hard refresh: Ctrl + Shift + R (Windows) / Cmd + Shift + R (Mac)

# Rebuild client
cd client
rm -rf dist
npm run build
```

---

### Printer features missing in UI

**Solution:**
```bash
# Pull latest client files
cd client
npm install
npm run build

# Restart server
cd ../server
npm run dev
```

---

## 🔄 Rollback (If Needed)

If you encounter issues and need to rollback:

```bash
# Restore database backup
cp server/data/pos.db.backup server/data/pos.db

# Or for MySQL
mysql -u root -p pizza_pos < pizza_pos_backup.sql

# Checkout previous version (if using git)
git checkout <previous-commit>

# Reinstall dependencies
npm run clean
npm run install:all

# Rebuild
npm run build
```

---

## 📊 What Changed?

### New Files
- `server/src/services/PrinterService.ts` - Printer communication
- `server/src/types/escpos.d.ts` - TypeScript definitions
- `scripts/test-printer.js` - Printer testing utility
- `docs/THERMAL-PRINTER-SETUP.md` - Complete setup guide
- `docs/THERMAL-PRINTER-MIGRATION.md` - This file

### Modified Files
- `server/src/db/database.ts` - Added printer columns to schema
- `server/src/routes/orders.ts` - Added auto-print on order complete
- `server/src/routes/settings.ts` - Added printer endpoints
- `client/src/pages/AdminSettingsPage.tsx` - Added printer UI
- `server/package.json` - Added escpos dependencies
- `README.md` - Added printer documentation link

### Database Changes
- `restaurant_settings` table:
  - `printer_enabled` TINYINT(1) DEFAULT 1
  - `auto_print` TINYINT(1) DEFAULT 1
  - `print_copies` INT DEFAULT 1

---

## 💡 Post-Migration Tips

1. **Test without printer first**: Disable printer in settings to test core functionality
2. **Configure incrementally**: Enable printer → Test Print → Enable Auto-Print
3. **Monitor logs**: Watch for printer errors during first few orders
4. **Keep backup**: Don't delete backup until you're sure everything works
5. **Document settings**: Write down your restaurant info and tax rates

---

## 🆘 Need Help?

**Common questions:**

**Q: Do I need the printer hardware to update?**
A: No! You can update the software and configure printer settings later. Just keep printer disabled until you have the hardware.

**Q: Will my existing orders be affected?**
A: No. Database migration only adds new columns. Existing data is preserved.

**Q: Can I test printing before buying the printer?**
A: Yes! The Test Print button will show an error if no printer is connected, but you can configure all settings and see the UI.

**Q: What if I use a different printer model?**
A: The code supports ESC/POS compatible printers. You may need to adjust vendor IDs in `PrinterService.ts`.

---

## 📅 Migration Timeline

**Estimated time:** 10-30 minutes

- Backup: 2 minutes
- Install dependencies: 5 minutes
- Database update: 1 minute
- Rebuild: 5 minutes
- Testing: 10 minutes
- Configuration: 5 minutes

---

## ✅ Success!

After successful migration:

1. **Old features** continue to work unchanged
2. **New printer features** available in Admin Settings
3. **Optional hardware** - works without printer
4. **Future-proof** - ready for thermal printing when needed

---

**🎉 Migration complete! Your Pizza POS now supports thermal receipt printing.**

For printer setup, see: `docs/THERMAL-PRINTER-SETUP.md`

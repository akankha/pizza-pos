import express from 'express';
import { MenuService } from '../services/MenuService.js';

const router = express.Router();
const menuService = new MenuService();

// Get all menu data (sizes, crusts, toppings, sides, drinks)
router.get('/', async (req, res) => {
  try {
    const menuData = await menuService.getMenuData();
    res.json({ success: true, data: menuData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get toppings only
router.get('/toppings', async (req, res) => {
  try {
    const toppings = await menuService.getToppings();
    res.json({ success: true, data: toppings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

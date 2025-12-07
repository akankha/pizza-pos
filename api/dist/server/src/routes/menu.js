"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const MenuService_js_1 = require("../services/MenuService.js");
const router = express_1.default.Router();
const menuService = new MenuService_js_1.MenuService();
// Get all menu data (sizes, crusts, toppings, sides, drinks)
router.get('/', async (req, res) => {
    try {
        const menuData = await menuService.getMenuData();
        res.json({ success: true, data: menuData });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Get toppings only
router.get('/toppings', async (req, res) => {
    try {
        const toppings = await menuService.getToppings();
        res.json({ success: true, data: toppings });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;

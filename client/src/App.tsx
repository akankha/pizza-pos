import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NewOrderPage from './pages/NewOrderPage';
import PizzaBuilderPage from './pages/PizzaBuilderPage';
import SpecialtyPizzasPage from './pages/SpecialtyPizzasPage';
import ComboDealPage from './pages/ComboDealPage';
import ComboCustomizePage from './pages/ComboCustomizePage';
import SidesAndDrinksPage from './pages/SidesAndDrinksPage';
import CheckoutPage from './pages/CheckoutPage';
import KitchenViewPage from './pages/KitchenViewPage';
import ActiveOrdersPage from './pages/ActiveOrdersPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import { MenuProvider } from './contexts/MenuContext';

function App() {
  return (
    <BrowserRouter>
      <MenuProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new-order" element={<NewOrderPage />} />
          <Route path="/pizza-builder" element={<PizzaBuilderPage />} />
          <Route path="/specialty-pizzas" element={<SpecialtyPizzasPage />} />
          <Route path="/combos" element={<ComboDealPage />} />
          <Route path="/combo-customize" element={<ComboCustomizePage />} />
          <Route path="/sides-drinks" element={<SidesAndDrinksPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/active-orders" element={<ActiveOrdersPage />} />
          <Route path="/kitchen" element={<KitchenViewPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/menu" element={<AdminMenuPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MenuProvider>
    </BrowserRouter>
  );
}

export default App;

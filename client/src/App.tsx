import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { MenuProvider } from "./contexts/MenuContext";
import ActiveOrdersPage from "./pages/ActiveOrdersPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminMenuPage from "./pages/AdminMenuPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import CheckoutPage from "./pages/CheckoutPage";
import ComboCustomizePage from "./pages/ComboCustomizePage";
import ComboDealPage from "./pages/ComboDealPage";
import HomePage from "./pages/HomePage";
import KitchenViewPage from "./pages/KitchenViewPage";
import NewOrderPage from "./pages/NewOrderPage";
import PizzaBuilderPage from "./pages/PizzaBuilderPage";
import SidesAndDrinksPage from "./pages/SidesAndDrinksPage";
import SpecialtyPizzasPage from "./pages/SpecialtyPizzasPage";
import StaffLoginPage from "./pages/StaffLoginPage";

function App() {
  return (
    <BrowserRouter>
      <MenuProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<StaffLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Main Routes - No login required for basic POS functionality */}
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

          {/* Admin Routes - Protected */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "super_admin", "restaurant_admin"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "super_admin", "restaurant_admin"]}>
                <AdminMenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager", "super_admin", "restaurant_admin"]}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin", "restaurant_admin"]}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin", "restaurant_admin"]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MenuProvider>
    </BrowserRouter>
  );
}

export default App;

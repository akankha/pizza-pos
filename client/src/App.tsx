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

          {/* Protected Routes - All staff */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-order"
            element={
              <ProtectedRoute allowedRoles={["cashier", "manager", "admin"]}>
                <NewOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pizza-builder"
            element={
              <ProtectedRoute allowedRoles={["cashier", "manager", "admin"]}>
                <PizzaBuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/specialty-pizzas"
            element={
              <ProtectedRoute allowedRoles={["cashier", "manager", "admin"]}>
                <SpecialtyPizzasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/combos"
            element={
              <ProtectedRoute allowedRoles={["cashier", "manager", "admin"]}>
                <ComboDealPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/combo-customize"
            element={
              <ProtectedRoute allowedRoles={["cashier", "manager", "admin"]}>
                <ComboCustomizePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sides-drinks"
            element={
              <ProtectedRoute allowedRoles={["cashier", "manager", "admin"]}>
                <SidesAndDrinksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["cashier", "manager", "admin"]}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/active-orders"
            element={
              <ProtectedRoute allowedRoles={["cashier", "manager", "admin"]}>
                <ActiveOrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Kitchen Route - Kitchen & Manager access */}
          <Route
            path="/kitchen"
            element={
              <ProtectedRoute allowedRoles={["kitchen", "manager", "admin"]}>
                <KitchenViewPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes - Admin & Manager access */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AdminMenuPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin", "manager"]}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
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

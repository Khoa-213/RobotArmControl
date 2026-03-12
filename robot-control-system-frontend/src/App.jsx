import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/Layout/AdminLayout";
import DashboardPage from "./pages/admin/dashboard/DashboardPage";
import FactoriesPage from "./pages/admin/factories/FactoriesPage";
import AreasPage from "./pages/admin/areas/AreasPage";
import HubsPage from "./pages/admin/hubs/HubsPage";
import DevicesPage from "./pages/admin/devices/DevicesPage";
import HomePage from "./pages/homepage/HomePage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="factories" element={<FactoriesPage />} />
          <Route path="areas" element={<AreasPage />} />
          <Route path="hubs" element={<HubsPage />} />
          <Route path="devices" element={<DevicesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import AdminLayout from "./Layout/AdminLayout";
import ControlAreasPage from "./pages/admin/control/areas/ControlAreasPage";
import ControlPage from "./pages/admin/control/ControlPage";
import ControlDevicesPage from "./pages/admin/control/devices/ControlDevicesPage";
import ControlFactoriesPage from "./pages/admin/control/factories/ControlFactoriesPage";
import ControlFactoryDetail from "./pages/admin/control/factories/detail/ControlFactoryDetail";
import ControlHubsPage from "./pages/admin/control/hubs/ControlHubsPage";
import DashboardPage from "./pages/admin/dashboard/DashboardPage";
import SettingsPage from "./pages/admin/settings/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Giữ dashboard làm trang mặc định */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="control" element={<ControlPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="control/factories" element={<ControlFactoriesPage />} />
          <Route path="control/areas" element={<ControlAreasPage />} />
          <Route path="control/hubs" element={<ControlHubsPage />} />
          <Route path="control/devices" element={<ControlDevicesPage />} />
          <Route
            path="control/factories/:factoryId/*"
            element={<ControlFactoryDetail />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

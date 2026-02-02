import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/Layout/AdminLayout";
import DashboardPage from "./pages/admin/dashboard/DashboardPage";
import ControlPage from "./pages/admin/control/ControlPage";
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
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
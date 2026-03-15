import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DashboardOutlined,
  BankOutlined,
  ApartmentOutlined,
  ClusterOutlined,
  RobotOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { getRole, isAdminRole, isOperatorRole } from "../../utils/auth";

function SidebarAdmin({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const role = getRole();
  const isAdmin = isAdminRole(role);
  const isOperator = isOperatorRole(role);

  const items = isAdmin
    ? [
        { key: "/admin/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
        { key: "/admin/factories", label: "Factories", icon: <BankOutlined /> },
        { key: "/admin/areas", label: "Areas", icon: <ApartmentOutlined /> },
        { key: "/admin/hubs", label: "Hubs", icon: <ClusterOutlined /> },
        { key: "/admin/devices", label: "Devices", icon: <RobotOutlined /> },
        { key: "/admin/users", label: "Users", icon: <UserOutlined /> },
      ]
    : isOperator
      ? [
          { key: "/admin/dashboard", label: "Logs", icon: <DashboardOutlined /> },
          { key: "/admin/ai-camera", label: "Control Robot", icon: <VideoCameraOutlined /> },
          { key: "/admin/factories", label: "Factories", icon: <BankOutlined /> },
          { key: "/admin/areas", label: "Areas", icon: <ApartmentOutlined /> },
          { key: "/admin/hubs", label: "Hubs", icon: <ClusterOutlined /> },
          { key: "/admin/devices", label: "Devices", icon: <RobotOutlined /> },
        ]
      : [
          { key: "/admin/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
          { key: "/admin/factories", label: "Factories", icon: <BankOutlined /> },
          { key: "/admin/areas", label: "Areas", icon: <ApartmentOutlined /> },
          { key: "/admin/hubs", label: "Hubs", icon: <ClusterOutlined /> },
          { key: "/admin/devices", label: "Devices", icon: <RobotOutlined /> },
          { key: "/admin/ai-camera", label: "AI Camera Control", icon: <VideoCameraOutlined /> },
        ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-50 h-screen",
        "bg-neutral-950 text-white",
        "border-r border-white/10",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      <div className="h-16 px-4 flex items-center border-b border-white/10">
        <div className="font-semibold tracking-wide select-none">
          {collapsed ? "RA" : "RoboArm"}
        </div>
      </div>

      <nav className="p-2">
        <ul className="space-y-1">
          {items.map((it) => {
            const active = isActive(it.key);
            return (
              <li key={it.key}>
                <button
                  type="button"
                  onClick={() => navigate(it.key)}
                  className={[
                    "relative w-full flex items-center gap-3",
                    "px-3 py-3 rounded-lg text-left",
                    "transition",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5",
                    collapsed ? "justify-center" : "",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-white/80" />
                  )}

                  <span className="text-lg">{it.icon}</span>
                  {!collapsed && <span className="text-sm">{it.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

export default SidebarAdmin;
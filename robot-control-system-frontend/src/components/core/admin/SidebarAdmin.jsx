import {
  AndroidOutlined,
  DashboardOutlined,
  DesktopOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  RobotOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

function SidebarAdmin({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
    },
    {
      key: "/admin/control",
      icon: <AndroidOutlined />,
      label: "Điều khiển",
      children: [
        {
          key: "/admin/control/factories",
          icon: <HomeOutlined />,
          label: "Nhà máy",
        },
        {
          key: "/admin/control/areas",
          icon: <EnvironmentOutlined />,
          label: "Khu vực",
        },
        {
          key: "/admin/control/hubs",
          icon: <RobotOutlined />,
          label: "Trung tâm",
        },
        {
          key: "/admin/control/devices",
          icon: <DesktopOutlined />,
          label: "Thiết bị",
        },
      ],
    },
    {
      key: "/admin/settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={80}
      theme="light"
      width={200}
      className="sidebar"
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        textAlign: "left",
      }}
    >
      <div className="logoContainer flex justify-center items-center h-24">
        <img
          src={null}
          alt="logo"
          style={{
            height: collapsed ? 32 : 40,
            width: "auto",
            maxWidth: "80%",
            objectFit: "contain",
            margin: "0 auto",
            display: "block",
          }}
        />
      </div>

      <Menu
        theme="light"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
}

export default SidebarAdmin;

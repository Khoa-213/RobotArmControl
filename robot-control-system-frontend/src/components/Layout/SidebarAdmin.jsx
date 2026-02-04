
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  AndroidOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.jpg";


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
        position:"sticky",
        top:0,
      }}
    >
      <div className="logoContainer flex justify-center items-center h-24">
        <img
          src={logo}
          alt="logo.svg"
          style={{
            height: collapsed ? 32 : 40,
            width:  "auto",
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
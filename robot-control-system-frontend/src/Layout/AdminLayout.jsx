import React, { useState } from "react";
import { Layout, message } from "antd";
import { Outlet } from "react-router-dom";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import SidebarAdmin from "../components/core/admin/SidebarAdmin";
import HeaderAdmin from "../components/core/admin/HeaderAdmin";

const { Header, Content } = Layout;

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  //hardcode nhà máy
  const factories = [
    { id: 1, name: "Nhà máy Bảo Ân", location: "Huế", status: "Hoạt động" },
    {
      id: 2,
      name: "Nhà máy Anh Khoa",
      location: "Hồ Chí Minh",
      status: "Hoạt động",
    },
    {
      id: 3,
      name: "Nhà máy Đình Duy",
      location: "Gia lai",
      status: "Không hoạt động",
    },
    {
      id: 4,
      name: "Nhà máy Trọng Nhã",
      location: "Hà Nội",
      status: "Không hoạt động",
    },
    {
      id: 5,
      name: "Nhà máy Trần Quang",
      location: "Đà Nẵng",
      status: "Hoạt động",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw" }}>
      <SidebarAdmin collapsed={collapsed} />

      <Layout style={{ background: "#fff" }}>
        <Header
          style={{
            height: 64,
            lineHeight: "64px",
            padding: "0 0px",
            backgroundColor: "#ffffff",
            position: "sticky",
            top: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Nút thu gọn/mở rộng */}
          <div
            style={{
              padding: "0 10px",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="h-10 w-10 flex items-center justify-center border rounded leading-none"
              style={{ backgroundColor: "#ffffff", borderColor: "#ffffff" }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </div>

          {/* Search & Avatar */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <HeaderAdmin
              factories={factories}
              user={{ name: "Admin", avatarUrl: "" }}
              onSelectFactory={(f) =>
                message.success(`Chọn factory: ${f.name}`)
              }
              onProfile={() => message.info("Thông tin")}
              onSetting={() => message.info("Cài đặt")}
              onLogout={() => message.warning("Đăng xuất")}
            />
          </div>
        </Header>

        {/*Phần content */}

        <Content
          className="p-6"
          style={{ backgroundColor: "#fff", minHeight: 100 }}
        >
          <div
            style={{
              background: "#f5f5f5",
              borderRadius: 10,
              padding: 24,
              minHeight: "calc(100vh - 64px - 48px)",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;

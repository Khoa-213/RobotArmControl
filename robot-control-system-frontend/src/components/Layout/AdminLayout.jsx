import React, { useState } from "react";
import { Layout } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import SidebarAdmin from "./SidebarAdmin";

const { Header, Content } = Layout;

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "200vh", minWidth: "100vw" }}>
      {/* Sidebar */}
      <SidebarAdmin collapsed={collapsed} />

      {/* Main content */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header className="bg-white shadow px-4 flex items-center" style={{ backgroundColor: '#f5f5f5',position: 'sticky', top: 0, zIndex: 100 }}>
    <button
        onClick={() => setCollapsed(!collapsed)}
        className="px-3 py-1 border rounded hover:bg-gray-200"
        style={{ backgroundColor: '#fff', borderColor: '#d9d9d9' }}
    >
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
    </button>
    </Header>

        <Content className="p-6" style={{ backgroundColor: '#fff', minHeight: 100 }}>
          <h1 className="text-xl font-semibold" style={{ color: '#000' }}>
            Admin Content Here
          </h1>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;

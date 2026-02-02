import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Table,
  Tag,
  Button,
  List,
  Progress,
  Divider,
} from "antd";
import {
  BankOutlined,
  ClusterOutlined,
  ApartmentOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  ReloadOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

const statCardStyle = {
  borderRadius: 12,
  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
  border: "1px solid rgba(5, 5, 5, 0.06)",
  height: 140,
};

function StatCard({ title, value, icon, iconBg, iconColor }) {
  return (
    <Card style={statCardStyle} 
    bodyStyle={{ 
        padding: 16,
        height: "100%",
        display: "flex",
        alignItems: "center",
         justifyContent: "center",
        textAlign: "center",
         }}>
      <Space align="center" size={14}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            background: iconBg,
            color: iconColor,
            flex: "0 0 auto",
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {title}
          </Text>
          <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>
            {value}
          </div>
        </div>
      </Space>
    </Card>
  );
}

export default function DashboardPage() {
  // ===== Mock summary numbers =====
  const stats = [
    {
      value: 5,
      title: "Nhà máy",
      icon: <BankOutlined style={{ fontSize: 50 }} />,
      iconBg: "rgba(22, 119, 255, 0.12)",
      iconColor: "#1677ff",
    },
    {
      title: "Khu vực",
      value: 12,
      icon: <ApartmentOutlined style={{ fontSize: 50 }} />,
      iconBg: "rgba(82, 196, 26, 0.12)",
      iconColor: "#52c41a",
    },
    {
      title: "Bộ điều khiển",
      value: 9,
      icon: <ClusterOutlined style={{ fontSize: 50 }} />,
      iconBg: "rgba(250, 173, 20, 0.14)",
      iconColor: "#faad14",
    },
    {
      title: "Thiết bị",
      value: 28,
      icon: <RobotOutlined style={{ fontSize: 50 }} />,
      iconBg: "rgba(114, 46, 209, 0.12)",
      iconColor: "#722ed1",
    },
  ];


  const logs = [
    {
      key: "l1",
      time: "2026-02-02 09:21",
      actor: "Admin",
      action: "Tạo thiết bị",
      target: "Robot Arm #10",
      status: "success",
    },
    {
      key: "l2",
      time: "2026-02-02 09:05",
      actor: "Admin",
      action: "Tạo bộ điều khiển",
      target: "Hub-01 (Khu A)",
      status: "success",
    },
    {
      key: "l3",
      time: "2026-02-01 16:48",
      actor: "Admin",
      action: "Gửi lệnh điều khiển",
      target: "Robot Arm #07",
      status: "queued",
    },
  ];

  const logColumns = [
    { title: "Thời gian", dataIndex: "time", key: "time", width: 160 },
    { title: "Thực hiện", dataIndex: "actor", key: "actor", width: 120 },
    { title: "Hành động", dataIndex: "action", key: "action", width: 170 },
    { title: "Đối tượng", dataIndex: "target", key: "target" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (v) => {
        const map = {
          success: { color: "green", label: "Success" },
          queued: { color: "geekblue", label: "Queued" },
          failed: { color: "red", label: "Failed" },
        };
        const cfg = map[v] || { color: "default", label: String(v) };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
  ];

  // ===== Mock: System Health + Quick Actions =====
  const health = {
    onlineDevices: 24,
    totalDevices: 28,
    hubOnline: 8,
    hubTotal: 9,
    alerts: 2,
  };

  const onlinePct =
    health.totalDevices === 0
      ? 0
      : Math.round((health.onlineDevices / health.totalDevices) * 100);

  const todoItems = [
    {
      key: "t1",
      title: "Kiểm tra Hub-03 (mất kết nối)",
    },
    {
      key: "t2",
      title: "Gán thiết bị mới vào Khu A",
    },
    {
      key: "t3",
      title: "Rà soát quyền người dùng",
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          textAlign: "left",
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Tổng quan
        </Title>
        <Paragraph style={{ margin: 0, marginTop: 6, fontSize: 13 }}>
          <Text style={{ color: "#1677ff", fontSize: 13 }}>Tổng quan nhanh hệ thống RobotArm ccontrol</Text>
        </Paragraph>
      </div>

      {/* Top stats */}
      <Row gutter={[16, 16]}>
        {stats.map((s) => (
          <Col key={s.title} xs={24} sm={12} lg={6}>
            <StatCard {...s} />
          </Col>
        ))}
      </Row>

      <Divider style={{ margin: "16px 0" }} />

      {/* Bottom: 2 big blocks */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Hoạt động gần đây"
            bodyStyle={{ padding: 16 }}
            headStyle={{
                background: "#507cba",
                color: "#fff",
                fontWeight: 600,
                borderBottom: "1px solid #1677ff",
                }}
                style={{
                borderColor: "rgba(22, 119, 255, 0.35)",
                width:"100%"
                }}
          >
            <Table
              size="small"
              rowKey="key"
              columns={logColumns}
              dataSource={logs}
              pagination={{ pageSize: 5 }}
            />

          </Card>
        </Col>

        {/* System Health + Quick Actions */}
        <Col xs={24} lg={8}>
          <Card
            title="Tình trạng hệ thống "
            bodyStyle={{ padding: 16 }}
            headStyle={{
                background: "#507cba",
                color: "#fff",
                fontWeight: 600,
                borderBottom: "1px solid #1677ff",
                }}
                style={{
                borderColor: "rgba(22, 119, 255, 0.35)",
                width:"100%"
                }}
            
          >
            <List
              style={{ marginTop: 8 }}
              dataSource={todoItems}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="done" size="small">
                      Done
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space size={8}>
                        {item.tag}
                        <span>{item.title}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />

            <Divider style={{ margin: "12px 0" }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
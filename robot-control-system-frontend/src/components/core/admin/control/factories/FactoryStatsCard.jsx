import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Card, Statistic } from "antd";

const FactoryStatsCard = ({ stats }) => {
  if (!stats) return null;

  const getStatusConfig = (stats) => {
    // Handle total count first
    if (
      stats.status === "total" ||
      stats.label?.toLowerCase().includes("tổng số")
    ) {
      return {
        label: stats.label || "Tổng số",
        icon: <CheckCircleOutlined />,
        color: "#1890ff",
        count: stats.value || stats.count || 0,
      };
    }

    // Check offline first (more specific)
    if (
      stats.status === "offline" ||
      stats.label?.toLowerCase().includes("ngưng hoạt động")
    ) {
      return {
        label: stats.label || "Ngưng hoạt động",
        icon: <ExclamationCircleOutlined />,
        color: "#8c8c8c",
        count: stats.value || stats.count || 0,
      };
    }

    if (
      stats.status === "active" ||
      stats.label?.toLowerCase().includes("hoạt động")
    ) {
      return {
        label: stats.label || "Hoạt động",
        icon: <CheckCircleOutlined />,
        color: "#3f8600",
        count: stats.value || stats.count || 0,
      };
    }

    // Default fallback
    return {
      label: stats.label || "Unknown",
      icon: <CheckCircleOutlined />,
      color: "#1890ff",
      count: stats.value || stats.count || 0,
    };
  };

  const statusConfig = getStatusConfig(stats);

  return (
    <Card size="small" style={{ textAlign: "center", marginBottom: "16px" }}>
      <Statistic
        title={statusConfig.label}
        value={statusConfig.count}
        prefix={statusConfig.icon}
        valueStyle={{ color: statusConfig.color, fontSize: "24px" }}
      />
    </Card>
  );
};

export default FactoryStatsCard;

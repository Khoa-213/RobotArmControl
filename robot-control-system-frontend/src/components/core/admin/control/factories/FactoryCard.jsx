import {
  DesktopOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";
import { useNavigate } from "react-router-dom";

const FactoryCard = ({ factory }) => {
  const navigate = useNavigate();

  const {
    id,
    name = "Unknown Factory",
    areas = 0,
    hubs = 0,
    devices = 0,
  } = factory || {};

  const handleCardClick = () => {
    if (id) {
      navigate(`/admin/control/factories/${id}`);
    }
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <HomeOutlined />
          <span>{name}</span>
        </div>
      }
      hoverable
      onClick={handleCardClick}
      style={{
        marginBottom: "16px",
        cursor: id ? "pointer" : "default",
      }}
    >
      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Khu vực"
            value={areas}
            prefix={<EnvironmentOutlined />}
            valueStyle={{ color: "#3f8600" }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Trung tâm"
            value={hubs}
            prefix={<RobotOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Thiết bị"
            value={devices}
            prefix={<DesktopOutlined />}
            valueStyle={{ color: "#cf1322" }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default FactoryCard;

import {
  DesktopOutlined,
  EnvironmentOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import { Table, Tag } from "antd";

const FactoryDevicesTab = ({ areas }) => {
  const deviceData = areas.flatMap((area) =>
    area.hubs.flatMap((hub) =>
      hub.devices.map((device) => ({
        ...device,
        hubName: hub.name,
        areaName: area.name,
      })),
    ),
  );

  return (
    <Table
      dataSource={deviceData}
      columns={[
        {
          title: "Tên thiết bị",
          dataIndex: "name",
          key: "name",
          render: (text) => (
            <span>
              <DesktopOutlined style={{ marginRight: 8, color: "#faad14" }} />
              {text}
            </span>
          ),
        },
        {
          title: "Trung tâm robot",
          dataIndex: "hubName",
          key: "hubName",
          render: (text) => (
            <Tag color="green">
              <RobotOutlined style={{ marginRight: 4 }} />
              {text}
            </Tag>
          ),
        },
        {
          title: "Khu vực",
          dataIndex: "areaName",
          key: "areaName",
          render: (text) => (
            <Tag color="blue">
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {text}
            </Tag>
          ),
        },
      ]}
      pagination={false}
      size="small"
      rowKey="id"
    />
  );
};

export default FactoryDevicesTab;

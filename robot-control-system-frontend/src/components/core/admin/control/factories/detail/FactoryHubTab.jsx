import { EnvironmentOutlined, RobotOutlined } from "@ant-design/icons";
import { Table, Tag } from "antd";

const FactoryHubTab = ({ areas }) => {
  const hubData = areas.flatMap((area) =>
    area.hubs.map((hub) => ({ ...hub, areaName: area.name })),
  );

  return (
    <Table
      dataSource={hubData}
      columns={[
        {
          title: "Tên trung tâm",
          dataIndex: "name",
          key: "name",
          render: (text) => (
            <span>
              <RobotOutlined style={{ marginRight: 8, color: "#52c41a" }} />
              {text}
            </span>
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
        {
          title: "Số thiết bị",
          dataIndex: "devices",
          key: "devices",
          render: (devices) => devices.length,
        },
      ]}
      pagination={false}
      size="small"
      rowKey="id"
    />
  );
};

export default FactoryHubTab;

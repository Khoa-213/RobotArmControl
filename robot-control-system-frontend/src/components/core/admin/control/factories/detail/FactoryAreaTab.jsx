import { EnvironmentOutlined } from "@ant-design/icons";
import { Table } from "antd";

const FactoryAreaTab = ({ areas }) => {
  return (
    <Table
      dataSource={areas}
      columns={[
        {
          title: "Tên khu vực",
          dataIndex: "name",
          key: "name",
          render: (text) => (
            <span>
              <EnvironmentOutlined
                style={{ marginRight: 8, color: "#1890ff" }}
              />
              {text}
            </span>
          ),
        },
        {
          title: "Số trung tâm robot",
          dataIndex: "hubs",
          key: "hubs",
          render: (hubs) => hubs.length,
        },
        {
          title: "Số thiết bị",
          key: "devices",
          render: (_, record) =>
            record.hubs.reduce((sum, hub) => sum + hub.devices.length, 0),
        },
      ]}
      pagination={false}
      size="small"
      rowKey="id"
    />
  );
};

export default FactoryAreaTab;

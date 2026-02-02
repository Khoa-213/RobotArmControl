import {
    DeleteOutlined,
    DesktopOutlined,
    EditOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    RobotOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Form, Input, Row, Tabs } from "antd";
import { useEffect } from "react";
import ContentTitle from "../../../../../Layout/ContentTitle";
import FactoryAreaTab from "../../../../../components/core/admin/control/factories/detail/FactoryAreaTab";
import FactoryDevicesTab from "../../../../../components/core/admin/control/factories/detail/FactoryDevicesTab";
import FactoryHubTab from "../../../../../components/core/admin/control/factories/detail/FactoryHubTab";
const { TextArea } = Input;
const { TabPane } = Tabs;

export default function ControlFactoryDetail() {
  const [form] = Form.useForm();

  const MOCK_FACTORY = {
    id: "factory-001",
    name: "Nhà máy Sản xuất Robot A1",
    location: "123 Đường Công Nghiệp, Khu Công Nghệ Cao, TP. Hồ Chí Minh",
    description:
      "Nhà máy chuyên sản xuất các loại robot công nghiệp và dịch vụ với công nghệ tiên tiến.",
    areas: [
      {
        id: "area-001",
        name: "Khu vực Lắp ráp",
        hubs: [
          {
            id: "hub-001",
            name: "Trung tâm Lắp ráp 1",
            devices: [
              { id: "device-001", name: "Robot Lắp ráp A1" },
              { id: "device-002", name: "Robot Lắp ráp A2" },
            ],
          },
          {
            id: "hub-002",
            name: "Trung tâm Lắp ráp 2",
            devices: [{ id: "device-005", name: "Robot Lắp ráp B1" }],
          },
        ],
      },
      {
        id: "area-002",
        name: "Khu vực Kiểm tra chất lượng",
        hubs: [
          {
            id: "hub-003",
            name: "Trung tâm Kiểm tra 1",
            devices: [
              { id: "device-003", name: "Robot Kiểm tra A1" },
              { id: "device-004", name: "Robot Kiểm tra A2" },
            ],
          },
        ],
      },
      {
        id: "area-003",
        name: "Khu vực Đóng gói",
        hubs: [
          {
            id: "hub-004",
            name: "Trung tâm Đóng gói 1",
            devices: [{ id: "device-006", name: "Robot Đóng gói A1" }],
          },
        ],
      },
    ],
  };

  useEffect(() => {
    form.setFieldsValue({
      name: MOCK_FACTORY.name,
      location: MOCK_FACTORY.location,
      description: MOCK_FACTORY.description,
    });
  }, [form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      console.log("Updated factory data:", values);
      // Here you would typically send the data to your API
    });
  };

  const handleDelete = () => {
    console.log("Delete factory:", MOCK_FACTORY.id);
    // Here you would typically send a delete request to your API
    // and navigate back to the factories list
  };

  return (
    <div>
      <ContentTitle
        title={MOCK_FACTORY.name}
        subtitle="Chi tiết và quản lý nhà máy"
      />

      <Row gutter={[24, 24]}>
        {/* Factory Metadata Form */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <EditOutlined />
                Thông tin nhà máy
              </div>
            }
            extra={
              <div style={{ display: "flex", gap: "8px" }}>
                <Button type="primary" onClick={handleSave}>
                  Lưu thay đổi
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                >
                  Xóa nhà máy
                </Button>
              </div>
            }
          >
            <Form form={form} layout="vertical">
              <Form.Item
                label="Tên nhà máy"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nhà máy" },
                ]}
              >
                <Input prefix={<HomeOutlined />} />
              </Form.Item>

              <Form.Item
                label="Địa chỉ"
                name="location"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input prefix={<EnvironmentOutlined />} />
              </Form.Item>

              <Form.Item label="Mô tả" name="description">
                <TextArea rows={4} />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Related Resources */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <RobotOutlined />
                Tài nguyên liên quan
              </div>
            }
          >
            <Tabs defaultActiveKey="areas" type="card">
              <TabPane
                tab={
                  <span>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    Khu vực ({MOCK_FACTORY.areas.length})
                  </span>
                }
                key="areas"
              >
                <FactoryAreaTab areas={MOCK_FACTORY.areas} />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <RobotOutlined style={{ marginRight: 8 }} />
                    Trung tâm robot (
                    {MOCK_FACTORY.areas.reduce(
                      (sum, area) => sum + area.hubs.length,
                      0,
                    )}
                    )
                  </span>
                }
                key="hubs"
              >
                <FactoryHubTab areas={MOCK_FACTORY.areas} />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <DesktopOutlined style={{ marginRight: 8 }} />
                    Thiết bị (
                    {MOCK_FACTORY.areas.reduce(
                      (sum, area) =>
                        sum +
                        area.hubs.reduce(
                          (hubSum, hub) => hubSum + hub.devices.length,
                          0,
                        ),
                      0,
                    )}
                    )
                  </span>
                }
                key="devices"
              >
                <FactoryDevicesTab areas={MOCK_FACTORY.areas} />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";

const { Title, Paragraph, Text } = Typography;

const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export default function ControlPage() {
  // ===== Mock state =====
  const [factories, setFactories] = useState([
    { id: "f1", name: " Trần Quang", desc: "Factory demo" },
    { id: "f2", name: " Anh Khoa", desc: "Factory demo" },
  ]);

  const [areas, setAreas] = useState([
    { id: "a1", factoryId: "f1", name: "Khu A", desc: "Area demo" },
    { id: "a2", factoryId: "f1", name: "Khu B", desc: "Area demo" },
    { id: "a3", factoryId: "f2", name: "Khu C", desc: "Area demo" },
  ]);

  const [hubs, setHubs] = useState([
    { id: "h1", areaId: "a1", name: "Hub 01", desc: "Hub demo" },
    { id: "h2", areaId: "a1", name: "Hub 02", desc: "Hub demo" },
    { id: "h3", areaId: "a2", name: "Hub 03", desc: "Hub demo" },
  ]);

  const [devices, setDevices] = useState([
    { id: "d1", hubId: "h1", name: "Robot Arm #1", desc: "Device demo" },
    { id: "d2", hubId: "h1", name: "Robot Arm #2", desc: "Device demo" },
    { id: "d3", hubId: "h2", name: "Robot Arm #3", desc: "Device demo" },
  ]);

 
  const [factoryForm] = Form.useForm();
  const [areaForm] = Form.useForm();
  const [hubForm] = Form.useForm();
  const [deviceForm] = Form.useForm();

  
  // Area
  const [areaFactoryId, setAreaFactoryId] = useState(null);

  // Hub
  const [hubFactoryId, setHubFactoryId] = useState(null);
  const [hubAreaId, setHubAreaId] = useState(null);

  // Device
  const [deviceFactoryId, setDeviceFactoryId] = useState(null);
  const [deviceAreaId, setDeviceAreaId] = useState(null);
  const [deviceHubId, setDeviceHubId] = useState(null);

 
  const factoryOptions = useMemo(
    () => factories.map((f) => ({ value: f.id, label: f.name })),
    [factories]
  );

  const areaOptionsByFactory = useMemo(() => {
    const byFactory = new Map();
    for (const f of factories) {
      byFactory.set(
        f.id,
        areas
          .filter((a) => a.factoryId === f.id)
          .map((a) => ({ value: a.id, label: a.name }))
      );
    }
    return byFactory;
  }, [factories, areas]);

  const hubOptionsByArea = useMemo(() => {
    const byArea = new Map();
    for (const a of areas) {
      byArea.set(
        a.id,
        hubs
          .filter((h) => h.areaId === a.id)
          .map((h) => ({ value: h.id, label: h.name }))
      );
    }
    return byArea;
  }, [areas, hubs]);

  // ===== Filtered lists for tables =====
  const areasFiltered = useMemo(() => {
    if (!areaFactoryId) return [];
    return areas.filter((a) => a.factoryId === areaFactoryId);
  }, [areas, areaFactoryId]);

  const hubsFiltered = useMemo(() => {
    if (!hubAreaId) return [];
    return hubs.filter((h) => h.areaId === hubAreaId);
  }, [hubs, hubAreaId]);

  const devicesFiltered = useMemo(() => {
    if (!deviceHubId) return [];
    return devices.filter((d) => d.hubId === deviceHubId);
  }, [devices, deviceHubId]);

  // ===== Table columns =====
  const factoryColumns = [
    { title: "Tên nhà máy", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "desc", key: "desc", ellipsis: true },
  ];

  const areaColumns = [
    { title: "Tên khu vực", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "desc", key: "desc", ellipsis: true },
  ];

  const hubColumns = [
    { title: "Tên bộ điều khiển", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "desc", key: "desc", ellipsis: true },
  ];

  const deviceColumns = [
    { title: "Tên thiết bị", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "desc", key: "desc", ellipsis: true },
  ];

  // ===== Disable rules =====
  const noFactoryYet = factories.length === 0;
  const noAreaYet = areas.length === 0;
  const noHubYet = hubs.length === 0;

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{
                marginBottom: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start", 
                textAlign: "left", }}
                >
        <Title level={2} style={{ margin: 0 }}>
          Điều khiển
        </Title>
        <Paragraph style={{ margin: 0, marginTop: 10, fontSize: 13 }}>
          Lưu ý tạo như sau:{" "}
          <Text style={{ color: "#1677ff", fontSize: 13 }}>Nhà máy → Khu vực → Bộ điều khiển → Thiết bị</Text>
        </Paragraph>
      </div>

       <Row gutter={[16, 16]} align="stretch">

        <Col xs={24} md={12} style={{ display: "flex" }}>
         <Card
                title="1. Tạo nhà máy"
                bordered
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
            <Form
              form={factoryForm}
              layout="vertical"
              onFinish={(values) => {
                const newFactory = {
                  id: makeId("f"),
                  name: values.name?.trim(),
                  desc: values.desc?.trim() || "",
                };
                setFactories((prev) => [newFactory, ...prev]);
                message.success("Đã tạo nhà máy");
                factoryForm.resetFields();
              }}
            >
              <Form.Item
                label="Tên nhà máy"
                name="name"
                rules={[{ required: true, message: "Nhập tên nhà máy" }]}
              >
                <Input placeholder="Ví dụ: Nhà máy A" />
              </Form.Item>

              <Form.Item label="Mô tả" name="desc">
                <Input.TextArea rows={2} placeholder="Mô tả ngắn (tuỳ chọn)" />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit">
                  Tạo
                </Button>
              </Space>
            </Form>

            <Divider style={{ margin: "12px 0" }} />

            <Table
              size="small"
              rowKey="id"
              columns={factoryColumns}
              dataSource={factories}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </Col>

        {/* B) Create Area */}
        <Col xs={24} md={12} style={{ display: "flex" }}>
          <Card
                title="2. Tạo khu vực"
                bordered
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
            {noFactoryYet && (
              <div style={{ marginBottom: 12 }}>
                <Text type="warning">Cần tạo nhà máy trước.</Text>
              </div>
            )}

            <Form
              form={areaForm}
              layout="vertical"
              disabled={noFactoryYet}
              onFinish={(values) => {
                const newArea = {
                  id: makeId("a"),
                  factoryId: values.factoryId,
                  name: values.name?.trim(),
                  desc: values.desc?.trim() || "",
                };
                setAreas((prev) => [newArea, ...prev]);
                message.success("Đã tạo nhà máy (mock)");

                setAreaFactoryId(values.factoryId);

                areaForm.setFieldsValue({ name: "", desc: "" });
              }}
            >
              <Row gutter={[12, 12]}>
                 <Col xs={24} sm={12}>
              <Form.Item
                label="Chọn nhà máy "
                name="factoryId"
                rules={[{ required: true, message: "Chọn nhà máy" }]}
              >
                <Select
                  placeholder="Chọn nhà máy"
                  options={factoryOptions}
                  value={areaFactoryId}
                  onChange={(v) => setAreaFactoryId(v)}
                  allowClear
                />
              </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
              <Form.Item
                label="Tên khu vực"
                name="name"
                rules={[{ required: true, message: "Nhập tên khu vực" }]}
              >
                <Input placeholder="Ví dụ: Khu A" />
              </Form.Item>
             </Col>
             </Row>
              <Form.Item label="Mô tả" name="desc">
                <Input.TextArea rows={2} placeholder="Mô tả ngắn (tuỳ chọn)" />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" disabled={noFactoryYet}>
                  Tạo
                </Button>
              </Space>
            </Form>

            <Divider style={{ margin: "12px 0" }} />

            {!areaFactoryId ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chọn nhà máy để xem danh sách khu vực"
              />
            ) : (
              <Table
                size="small"
                rowKey="id"
                columns={areaColumns}
                dataSource={areasFiltered}
                pagination={{ pageSize: 5 }}
              />
            )}
          </Card>
        </Col>

        {/* C) Create Hub */}
        <Col xs={24} md={12}>
            <Card
                title="3. Tạo bộ điều khiển"
                bordered
                headStyle={{
                background: "#507cba",
                color: "#fff",
                fontWeight: 600,
                borderBottom: "1px solid #1677ff",
                }}
                style={{
                borderColor: "rgba(22, 119, 255, 0.35)",
                }}
            >
            {noAreaYet && (
              <div style={{ marginBottom: 12 }}>
                <Text type="warning">Cần tạo khu vực trước.</Text>
              </div>
            )}

            <Form
              form={hubForm}
              layout="vertical"
              disabled={noAreaYet}
              onFinish={(values) => {
                const newHub = {
                  id: makeId("h"),
                  areaId: values.areaId,
                  name: values.name?.trim(),
                  desc: values.desc?.trim() || "",
                };
                setHubs((prev) => [newHub, ...prev]);
                message.success("Đã tạo bộ điều khiển (mock)");

                // giữ selection để filter table
                setHubFactoryId(values.factoryId);
                setHubAreaId(values.areaId);

                hubForm.setFieldsValue({ name: "", desc: "" });
              }}
            >
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Chọn nhà máy"
                    name="factoryId"
                    rules={[{ required: true, message: "Chọn nhà máy" }]}
                  >
                    <Select
                      placeholder="Chọn nhà máy"
                      options={factoryOptions}
                      value={hubFactoryId}
                      onChange={(v) => {
                        setHubFactoryId(v);
                        setHubAreaId(null); // reset cấp dưới
                        hubForm.setFieldsValue({ areaId: null });
                      }}
                      allowClear
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Chọn khu vực"
                    name="areaId"
                    rules={[{ required: true, message: "Chọn khu vực" }]}
                  >
                    <Select
                      placeholder="Chọn khu vực"
                      options={hubFactoryId ? areaOptionsByFactory.get(hubFactoryId) || [] : []}
                      value={hubAreaId}
                      onChange={(v) => setHubAreaId(v)}
                      disabled={!hubFactoryId || noAreaYet}
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Tên bộ điều khiển"
                name="name"
                rules={[{ required: true, message: "Nhập tên bộ điều khiển" }]}
              >
                <Input placeholder="Ví dụ: Bộ điều khiển 01" />
              </Form.Item>

              <Form.Item label="Mô tả" name="desc">
                <Input.TextArea rows={2} placeholder="Mô tả ngắn (tuỳ chọn)" />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" disabled={noAreaYet}>
                  Tạo 
                </Button>
              </Space>
            </Form>

            <Divider style={{ margin: "12px 0" }} />

            {!hubAreaId ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chọn nhà máy và khu vực để xem danh sách bộ điều khiển"
              />
            ) : (
              <Table
                size="small"
                rowKey="id"
                columns={hubColumns}
                dataSource={hubsFiltered}
                pagination={{ pageSize: 5 }}
              />
            )}
          </Card>
        </Col>

        {/* D) Create Device */}
        <Col xs={24} md={12}>
          <Card
                title="4. Tạo thiết bị"
                bordered
                headStyle={{
                background: "#507cba",
                color: "#fff",
                fontWeight: 600,
                borderBottom: "1px solid #1677ff",
                }}
                style={{
                borderColor: "rgba(22, 119, 255, 0.35)",
                }}
            >
            {noHubYet && (
              <div style={{ marginBottom: 12 }}>
                <Text type="warning">Cần tạo bộ điều khiển trước.</Text>
              </div>
            )}

            <Form
              form={deviceForm}
              layout="vertical"
              disabled={noHubYet}
              onFinish={(values) => {
                const newDevice = {
                  id: makeId("d"),
                  hubId: values.hubId,
                  name: values.name?.trim(),
                  desc: values.desc?.trim() || "",
                };
                setDevices((prev) => [newDevice, ...prev]);
                message.success("Đã tạo thiết bị (mock)");

                // giữ selection để filter table
                setDeviceFactoryId(values.factoryId);
                setDeviceAreaId(values.areaId);
                setDeviceHubId(values.hubId);

                deviceForm.setFieldsValue({ name: "", desc: "" });
              }}
            >
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Chọn nhà máy"
                    name="factoryId"
                    rules={[{ required: true, message: "Chọn nhà máy" }]}
                  >
                    <Select
                      placeholder="Chọn nhà máy"
                      options={factoryOptions}
                      value={deviceFactoryId}
                      onChange={(v) => {
                        setDeviceFactoryId(v);
                        setDeviceAreaId(null);
                        setDeviceHubId(null);
                        deviceForm.setFieldsValue({ areaId: null, hubId: null });
                      }}
                      allowClear
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Chọn khu vực"
                    name="areaId"
                    rules={[{ required: true, message: "Chọn khu vực" }]}
                  >
                    <Select
                      placeholder="Chọn khu vực"
                      options={deviceFactoryId ? areaOptionsByFactory.get(deviceFactoryId) || [] : []}
                      value={deviceAreaId}
                      onChange={(v) => {
                        setDeviceAreaId(v);
                        setDeviceHubId(null);
                        deviceForm.setFieldsValue({ hubId: null });
                      }}
                      disabled={!deviceFactoryId || noHubYet}
                      allowClear
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Chọn bộ điều khiển"
                    name="hubId"
                    rules={[{ required: true, message: "Chọn bộ điều khiển" }]}
                  >
                    <Select
                      placeholder="Chọn bộ điều khiển"
                      options={deviceAreaId ? hubOptionsByArea.get(deviceAreaId) || [] : []}
                      value={deviceHubId}
                      onChange={(v) => setDeviceHubId(v)}
                      disabled={!deviceAreaId || noHubYet}
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Tên thiết bị"
                name="name"
                rules={[{ required: true, message: "Nhập tên thiết bị" }]}
              >
                <Input placeholder="Ví dụ: Robot Arm #10" />
              </Form.Item>

              <Form.Item label="Mô tả" name="desc">
                <Input.TextArea rows={2} placeholder="Mô tả ngắn (tuỳ chọn)" />
              </Form.Item>

              <Space>
                <Button type="primary" htmlType="submit" disabled={noHubYet}>
                  Tạo
                </Button>
              </Space>
            </Form>

            <Divider style={{ margin: "12px 0" }} />

            {!deviceHubId ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chọn nhà máy + khu vực + bộ điều khiển để xem danh sách thiết bị"
              />
            ) : (
              <Table
                size="small"
                rowKey="id"
                columns={deviceColumns}
                dataSource={devicesFiltered}
                pagination={{ pageSize: 5 }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
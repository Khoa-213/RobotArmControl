import { Col, Row } from "antd";
import ContentTitle from "../../../../Layout/ContentTitle";
import FactoryCard from "../../../../components/core/admin/control/factories/FactoryCard";
import FactoryStatsCard from "../../../../components/core/admin/control/factories/FactoryStatsCard";

export default function ControlFactories() {
  const MOCK_FACTORIES_STATS = [
    { label: "Tổng số nhà máy", value: 8, status: "total" },
    { label: "Nhà máy hoạt động", value: 6, status: "active" },
    { label: "Nhà máy ngưng hoạt động", value: 2, status: "offline" },
  ];

  const MOCK_FACTORIES = [
    {
      id: 1,
      name: "Nhà máy A - Khu công nghiệp Bắc Ninh",
      areas: 5,
      hubs: 10,
      devices: 50,
      status: "Hoạt động",
    },
    {
      id: 2,
      name: "Nhà máy B - Khu công nghiệp Long Hậu",
      areas: 3,
      hubs: 7,
      devices: 30,
      status: "Ngưng hoạt động",
    },
    {
      id: 3,
      name: "Nhà máy C - Khu công nghiệp Bình Dương",
      areas: 4,
      hubs: 8,
      devices: 40,
      status: "Hoạt động",
    },
    {
      id: 4,
      name: "Nhà máy D - Khu công nghiệp Hải Phòng",
      areas: 6,
      hubs: 12,
      devices: 60,
      status: "Hoạt động",
    },
    {
      id: 5,
      name: "Nhà máy E - Khu công nghiệp Đồng Nai",
      areas: 2,
      hubs: 5,
      devices: 25,
      status: "Hoạt động",
    },
    {
      id: 6,
      name: "Nhà máy F - Khu công nghiệp Thái Nguyên",
      areas: 4,
      hubs: 9,
      devices: 45,
      status: "Ngưng hoạt động",
    },
    {
      id: 7,
      name: "Nhà máy G - Khu công nghiệp Quảng Ninh",
      areas: 7,
      hubs: 15,
      devices: 75,
      status: "Hoạt động",
    },
    {
      id: 8,
      name: "Nhà máy H - Khu công nghiệp Bà Rịa Vũng Tàu",
      areas: 3,
      hubs: 6,
      devices: 35,
      status: "Hoạt động",
    },
  ];
  return (
    <div>
      <ContentTitle
        title="Quản lý nhà máy"
        subtitle="Quản lý các nhà máy điều khiển robot trong hệ thống."
      />

      {/* Thống kê trạng thái */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {MOCK_FACTORIES_STATS.map((stat, index) => (
          <Col xs={24} sm={8} key={index}>
            <FactoryStatsCard stats={stat} />
          </Col>
        ))}
      </Row>

      {/* Danh sách nhà máy */}
      {MOCK_FACTORIES.map((factory) => (
        <FactoryCard key={factory.id} factory={factory} />
      ))}
    </div>
  );
}

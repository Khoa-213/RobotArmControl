import { Typography } from "antd";
export default function ContentTitle({ title, subtitle }) {
  const { Title, Paragraph, Text } = Typography;

  return (
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
        {title}
      </Title>
      <Paragraph style={{ margin: 0, marginTop: 6, fontSize: 13 }}>
        <Text style={{ color: "#6d6d6d", fontSize: 13 }}>{subtitle}</Text>
      </Paragraph>
    </div>
  );
}

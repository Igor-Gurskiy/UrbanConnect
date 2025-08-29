import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export const HomePage = () => {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <Title level={1}>UrbanConnect</Title>

      <Paragraph style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        Место для общения с соседями и вашим районом
      </Paragraph>

      <Paragraph type="secondary" style={{ marginTop: "4rem" }}>
        Учебный проект для практики веб-разработки
      </Paragraph>
    </div>
  );
};

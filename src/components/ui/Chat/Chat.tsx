import { type FC, useState } from "react";
import { Avatar, Typography, List, Button, Input } from "antd";
import {
  SmileOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { TChat, TMessage } from "./types";
export const Chat: FC<TChat> = ({ name, avatar, isOnline, onSend, messages, handleSmileClick, handleFileAttach, user }) => {
  const avatarContent = () => {
    if (avatar) return null;
    return name.slice(0, 1).toUpperCase();
  };

  const [messageText, setMessageText] = useState("");
  const handleSend = () => {
    if (messageText.trim()) {
      onSend(messageText);
      setMessageText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "20px",
          backgroundColor: "#f0f0f0",
          padding: "10px",
        }}
      >
        <Avatar src={avatar} size="large" style={{ fontSize: "1.5rem" }}>
          {avatarContent()}
        </Avatar>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography.Paragraph style={{ margin: 0, fontSize: "1.2rem" }}>
            {name}
          </Typography.Paragraph>
          <Typography.Paragraph style={{ margin: 0, fontSize: "1rem" }}>
            {isOnline ? "Online" : "Offline"}
          </Typography.Paragraph>
        </div>
      </div>
      <div>
        <List
          dataSource={messages}
          renderItem={(item: TMessage) => (
            <List.Item
              style={{
                display: "flex",
                justifyContent: item.user === user ? "flex-end" : "flex-start",
                padding: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  maxWidth: "70%",
                  padding: "8px 12px",
                  borderRadius:
                    item.user === user
                      ? "18px 18px 0 18px"
                      : "18px 18px 18px 0",
                  backgroundColor: item.user === user ? "#1890ff" : "#e6e6e6",
                }}
              >
                <Typography.Paragraph
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    color: item.user === user ? "#fff" : "#000",
                  }}
                >
                  {item.text}
                </Typography.Paragraph>
                <div
                  style={{
                    fontSize: "10px",
                    textAlign: "right",
                    color: item.user === user ? "#fff" : "#000",
                    alignContent: "flex-end",
                  }}
                >
                  {new Date(item.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </List.Item>
          )}
        ></List>
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "end",
          gap: "20px",
          backgroundColor: "#f0f0f0",
          padding: "10px",
        }}
      >
        <Button
          type="text"
          icon={<SmileOutlined />}
          onClick={handleSmileClick}
        ></Button>
        <Button
          type="text"
          icon={<PaperClipOutlined />}
          onClick={handleFileAttach}
        ></Button>
        <Input.TextArea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          autoSize={{ minRows: 1, maxRows: 6 }}
          placeholder="Напишите сообщение..."
          style={{
            flex: 1,
            borderRadius: "0px",
            padding: "8px 12px",
            resize: "none",
            lineHeight: "1.5",
          }}
        ></Input.TextArea>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!messageText.trim}
        ></Button>
      </div>
    </>
  );
};

import { type FC, useState, useEffect, useRef } from "react";
import { Avatar, Typography, List, Button, Input } from "antd";
import {
  SmileOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { TChatDialog, TMessage } from "./types";
export const ChatDialogUI: FC<TChatDialog> = ({
  name,
  avatar,
  isOnline,
  onSend,
  messages,
  handleSmileClick,
  handleFileAttach,
  user,
  type,
}) => {
  const [messageText, setMessageText] = useState("");
  const isCurrentUserMessage = (message: TMessage): boolean => {
    return !!user?.id && message.user === user.id;
  };

  const avatarContent = avatar ? null : name.slice(0, 1).toUpperCase();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim() && user) {
      onSend(messageText);
      setMessageText("");
    }
  };

  return (
    <>
      <div
        style={{ display: "flex", flexDirection: "column", padding: "16px", height: "80vh" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            backgroundColor: "#f0f0f0",
            padding: "10px",
            maxHeight: "10vh",
            // flexShrink: 0,
          }}
        >
          <Avatar src={avatar} size="large" style={{ fontSize: "1.5rem" }}>
            {avatarContent}
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
            <Typography.Paragraph
              style={{
                margin: 0,
                fontSize: "1rem",
                opacity: type === "private" ? 1 : 0,
              }}
            >
              {isOnline ? "Online" : "Offline"}
            </Typography.Paragraph>
          </div>
        </div>
        <div style={{  overflowY: "auto", flex: 1, minHeight: 0, }}>
          <List
            ref={listRef}
            style={{ width: "100%" }}
            dataSource={messages}
            renderItem={(item: TMessage) => {
              const isCurrentUser = isCurrentUserMessage(item);
              return (
                <List.Item
                  style={{
                    display: "flex",
                    justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                    padding: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      width: "60%",
                      padding: "8px 12px",
                      borderRadius: isCurrentUser
                        ? "18px 18px 0 18px"
                        : "18px 18px 18px 0",
                      backgroundColor: isCurrentUser ? "#1890ff" : "#e6e6e6",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography.Paragraph
                      style={{
                        margin: 0,
                        fontSize: "1rem",
                        color: isCurrentUser ? "#fff" : "#000",
                      }}
                    >
                      {item.text}
                    </Typography.Paragraph>
                    <div
                      style={{
                        fontSize: "10px",
                        textAlign: "right",
                        color: isCurrentUser ? "#fff" : "#000",
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
              );
            }}
          ></List>
          <div ref={messagesEndRef} />
        </div>
        <div
          style={{
            backgroundColor: "#f0f0f0",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxHeight: "18vh"
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%" }}>
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
              autoSize={{ minRows: 1, maxRows: 3 }}
              placeholder="Message"
              style={{
                flex: 1,
                borderRadius: "0px",
                padding: "8px 12px",
                resize: "none",
                lineHeight: "1.5"
              }}
            ></Input.TextArea>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!messageText.trim}
            ></Button>
          </div>
        </div>
      </div>
    </>
  );
};

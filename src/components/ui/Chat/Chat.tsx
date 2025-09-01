import { type FC, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Avatar, Typography, List, Button, Input } from "antd";
import {
  SmileOutlined,
  PaperClipOutlined,
  SendOutlined,
} from "@ant-design/icons";
import type { TChatDialog } from "./types";
import type { TMessage } from "../../../utils/types";
import { MessageItemUI } from '../MessageItem/MessageItem';
import React from "react";

export const ChatDialogUI: FC<TChatDialog> = React.memo(({
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

  const isCurrentUserMessage = useCallback((message: TMessage): boolean => {
    return !!user?.id && message.user === user.id;
  }, [user?.id]);

  const handleSendMessage = useCallback(() => {
    if (messageText.trim() && user) {
      onSend(messageText);
      setMessageText("");
    }
  }, [messageText, onSend, user]);

  const avatarContent = useMemo(() => avatar ? null : name.slice(0, 1).toUpperCase(), [avatar, name]);
  const chatName = useMemo(() => type === 'private' ? name.replace('-', ' ') : name, [type, name]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const listRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const formatMessageDate = useCallback((dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}, []);

const isSameDay = useCallback((date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
}, []);

  const MessageItem = useCallback((item: TMessage, index: number) => {
    const isCurrentUser = isCurrentUserMessage(item);
    const showDate = index === 0 || !isSameDay(item.createdAt, messages[index - 1].createdAt);
    
    return (
      <>
        {showDate && (
          <div style={{
            textAlign: 'center',
            padding: '8px',
            margin: '10px 0',
            color: '#666',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {formatMessageDate(item.createdAt)}
          </div>
        )}
        <MessageItemUI item={item} isCurrentUser={isCurrentUser} />
      </>
    );
  }, [isCurrentUserMessage, messages]);

  return (
    <>
      <div
        style={{ display: "flex", flexDirection: "column", padding: "16px", height: "80vh" }}
      >
        {/* Заголовок чата */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            backgroundColor: "#f0f0f0",
            padding: "10px",
            maxHeight: "10vh"
          }}
        >
          <Avatar src={avatar} size="large" style={{ fontSize: "1.5rem" }}>
            {avatarContent}
          </Avatar>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              justifyContent: "center",
            }}
          >
            <Typography.Paragraph style={{ margin: 0, fontSize: "1.2rem" }}>
              {chatName}
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
        {/* Область сообщений с виртуализацией */}
        <div style={{  overflowY: "auto", flex: 1, minHeight: 0, }}>
          <List
            ref={listRef}
            style={{ width: "100%" }}
            dataSource={messages}
            renderItem={MessageItem}
          />
          <div ref={messagesEndRef} />
        </div>
        {/* Форма ввода сообщения */}
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
              onKeyDown={handleKeyPress}
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
              disabled={!messageText.trim()}
            ></Button>
          </div>
        </div>
      </div>
    </>
  );
});

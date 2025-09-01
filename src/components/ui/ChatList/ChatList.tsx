import { Avatar, List, Typography } from "antd";
import { useCallback, type FC } from "react";
import type { TChatList } from "./types";
import type { TChat } from "../../../utils/types";

export const ChatListUI: FC<TChatList> = ({ chats, onChatSelect }) => {
  
  const avatarContent = useCallback((chat: TChat) => {
    const avatar = chat.avatar ? null : chat.name.slice(0, 1).toUpperCase();
    return avatar;
  }, []);

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const chatName = (chat: TChat) => {
    if (chat.type === "group") return chat.name;
    return chat.name.replace("-", " ");
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          padding: "16px",
        }}
      >
        <List
          style={{
            width: "100%",
            maxWidth: 400,
          }}
          dataSource={chats}
          renderItem={(chat) => (
            <List.Item
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "12px 16px",
                borderBottom: "1px solid #f0f0f0",
              }}
              onClick={() => onChatSelect(chat)}
            >
              {" "}
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <Avatar>{avatarContent(chat)}</Avatar>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    maxWidth: "200px",
                  }}
                >
                  <Typography.Paragraph
                    style={{
                      fontWeight: "bold",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {chatName(chat)}
                  </Typography.Paragraph>
                  <Typography.Paragraph
                    style={{
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {chat.lastMessage?.text}
                  </Typography.Paragraph>
                </div>
              </div>
              {chat.lastMessage && (
                <Typography.Paragraph>
                  {formatTime(chat.lastMessage.createdAt)}
                </Typography.Paragraph>
              )}
            </List.Item>
          )}
        ></List>
      </div>
    </>
  );
};

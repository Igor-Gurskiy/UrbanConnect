import { Avatar, List, Typography } from "antd";
import { type FC } from "react";
import type { TChatList, TChat } from "./types";

export const ChatListUI: FC<TChatList> = ({
  chats,
  onChatSelect,
  user,
  users,
}) => {
  const avatarContent = (chat: TChat) => {
    if (chat.avatar === undefined) return null;
    return chat.name?.slice(0, 1).toUpperCase();
  };

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
    const otherUserId = chat.users.find((u) => u !== user?.id);
    if (!otherUserId) return "Unknown";
    const otherUser = users.find((u) => u.id === otherUserId);
    return otherUser ? otherUser.name : "Unknown 2";
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          padding: "16px"
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
              onClick={() => onChatSelect(chat.id)}
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
                    {chat.lastMessage.text}
                  </Typography.Paragraph>
                </div>
              </div>
              <Typography.Paragraph>
                {formatTime(chat.lastMessage.createdAt)}
              </Typography.Paragraph>
            </List.Item>
          )}
        ></List>
      </div>
    </>
  );
};

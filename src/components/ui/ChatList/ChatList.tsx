import { Avatar, List, Typography } from "antd";
import { type FC } from "react";
import type { TChatList, TChat } from "./types";

export const ChatList: FC<TChatList> = ({ chats }) => {
    const avatarContent = (chat: TChat) => {
    if (chat.avatar) return null;
    return chat.name.slice(0, 1).toUpperCase();
  };
    return (
        <>
        <div>
            <List
            dataSource={chats}
            renderItem={(chat) => (
                <List.Item>
                    <Avatar>{avatarContent(chat)}</Avatar>
                    <Typography.Paragraph>{chat.name}</Typography.Paragraph>
                    <Typography.Paragraph>{chat.lastMessage.createdAt}</Typography.Paragraph>
                    <Typography.Paragraph>{chat.lastMessage.text}</Typography.Paragraph>
                </List.Item>
            )}></List>
        </div>
        </>
    )
}
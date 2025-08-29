import { type TUser } from "../../../utils/urbanConnect-api";

export type TChat = {
  id: string;
  avatar?: string;
  type: string;
  users: string[];
  lastMessage: TMessage;
  messages?: TMessage[];
  name: string;
};

export type TMessage = {
  id: string;
  text: string;
  createdAt: string;
  user: string;
};

export type TChatList = {
  chats: TChat[];
  onChatSelect: (chatId: string) => void;
  user: TUser;
  users: TUser[];
};

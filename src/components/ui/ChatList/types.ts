import type { TChat } from "../../../utils/types";

export type TChatList = {
  chats: TChat[];
  onChatSelect: (chat: TChat) => void;
};

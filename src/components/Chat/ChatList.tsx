import type { FC } from "react";
import { useCallback, useEffect } from "react";
import { ChatListUI } from "../ui/ChatList/ChatList";
import { useSelector, useDispatch } from "../../services/store";
import {
  selectUser,
  getUsers,
} from "../../services/slices/Profile/Profile";
import type { TChat } from "../../utils/types";
import React from "react";
// import React from "react";

interface IChatListProps {
  chats: TChat[];
  onChatSelect: (chat: TChat) => void;
}
export const ChatList: FC<IChatListProps> = React.memo(({ chats, onChatSelect }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleChatSelect = useCallback((chat: TChat) => {
    onChatSelect(chat);
  }, [onChatSelect]);

  return (
    user && (
      <ChatListUI
        chats={chats}
        onChatSelect={handleChatSelect }
      />
    )
  );
});

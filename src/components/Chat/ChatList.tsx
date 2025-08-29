import type { FC } from "react";
import { useEffect } from "react";
import { ChatListUI } from "../ui/ChatList/ChatList";
import { useSelector, useDispatch } from "../../services/store";
import { selectChats, getChats } from "../../services/slices/Chat/Chat";
import {
  selectUser,
  selectUsers,
  getUsers,
} from "../../services/slices/Profile/Profile";

interface IChatListProps {
  onChatSelect: (chatId: string) => void;
}
export const ChatList: FC<IChatListProps> = ({ onChatSelect }) => {
  const dispatch = useDispatch();
  const chats = useSelector(selectChats);
  const user = useSelector(selectUser);
  const users = useSelector(selectUsers);

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getChats());
  }, [dispatch]);
  
  return (
    user && (
      <ChatListUI
        chats={chats}
        onChatSelect={onChatSelect}
        user={user}
        users={users}
      />
    )
  );
};

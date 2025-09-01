import { ChatDialog } from "./ChatDialog";
import { ChatList } from "./ChatList";
import type { FC } from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { selectUser } from "../../services/slices/Profile/Profile";
import { useSelector, useDispatch } from "../../services/store";
import { webSocketService } from "../../../socket";
import {
  getChats,
  getChatById,
  selectChats,
} from "../../services/slices/Chat/Chat";
import { ChatSearch } from "./ChatSearch";
import { v4 as uuidv4 } from "uuid";
import type { TChat, TUser } from "../../utils/types";

export const Chat: FC = () => {
  const [selectedChat, setSelectedChat] = useState<TChat | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<TUser | null>(null);
  const userAuth = useSelector(selectUser);
  const chats = useSelector(selectChats);
  const dispatch = useDispatch();

  const handleChatSelect = useCallback((chat: TChat) => {
    setSelectedChat(chat);
    setSelectedUser(null);
  }, []);

  const handleChatCreated = useCallback(
    async (createdChat: TChat) => {
      // Обновляем выбранный чат на созданный
      setSelectedChat(createdChat);
      setSelectedUser(null);
      await dispatch(getChats());
    },
    [dispatch]
  );

  const findExistingChat = useCallback(
    (userId: string, chats: TChat[], currentUserId: string): TChat | null => {
      return (
        chats.find(
          (chat) =>
            chat.type === "private" &&
            chat.users.includes(userId) &&
            chat.users.includes(currentUserId)
        ) || null
      );
    },
    []
  );

  const handleUserSelect = useCallback(
    (user: TUser) => {
      setSelectedUser(user);
      setSearch("");

      const existingChat = findExistingChat(userAuth.id, chats, user.id);

      if (existingChat) {
        // Если чат уже существует - открываем его
        setSelectedChat(existingChat);
      } else {
        // Если чата нет - создаем временный
        setSelectedChat(null);
      }
    },
    [userAuth.id, chats, findExistingChat]
  );

  const tempChat = useMemo(() => {
    if (!selectedUser || !userAuth) return null;

    return {
      id: "temp-" + uuidv4(),
      name: selectedUser.name,
      type: "private",
      avatar: selectedUser.avatar,
      users: [userAuth.id, selectedUser.id],
      messages: [],
      lastMessage: null,
    } as TChat;
  }, [selectedUser, userAuth]);

  const currentChat = selectedChat || tempChat;

  useEffect(() => {
    dispatch(getChats());
  }, [dispatch]);

  useEffect(() => {
    if (selectedChat && !selectedChat.id.startsWith("temp-")) {
      // Находим актуальную версию чата из хранилища
      const updatedChat = chats.find((chat) => chat.id === selectedChat.id);
      if (updatedChat && updatedChat !== selectedChat) {
        setSelectedChat(updatedChat);
      }
    }
  }, [chats, selectedChat]);

  const handleWebSocketMessage = useCallback(
    (event: CustomEvent) => {
      const data = event.detail;
      console.log("Global WebSocket message:", data);

      if (data.type === "message" || data.type === "chat_created") {
        // Всегда обновляем список чатов при любых изменениях
        dispatch(getChats());
      }

      if (
        data.type === "message" &&
        selectedChat &&
        data.chatId === selectedChat?.id
      ) {
        dispatch(getChatById(selectedChat.id))
          .unwrap()
          .then((response) => {
            if (response.success) {
              setSelectedChat(response.chat);
            }
          });
      }
      // Обработка создания нового чата
      if (
        data.type === "chat_created" &&
        selectedUser?.id === data.participantId
      ) {
        if (data.chat) {
          setSelectedChat(data.chat);
          setSelectedUser(null);
        }
      }
    },
    [dispatch, selectedChat, selectedUser]
  );

  useEffect(() => {
    if (!userAuth) return;
    // Подключаемся к WebSocket для пользователя
    webSocketService.connect("global", userAuth.id); // chatId = 'global' для общего подключения

    window.addEventListener(
      "websocket-message",
      handleWebSocketMessage as EventListener
    );

    return () => {
      window.removeEventListener(
        "websocket-message",
        handleWebSocketMessage as EventListener
      );
      webSocketService.disconnect();
    };
  }, [userAuth, handleWebSocketMessage]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        height: "80vh",
      }}
    >
      <div>
        <ChatSearch
          search={search}
          setSearch={setSearch}
          onUserSelect={handleUserSelect}
        />
        <ChatList chats={chats} onChatSelect={handleChatSelect} />
      </div>
      {currentChat && (
        <ChatDialog chat={currentChat} onChatCreated={handleChatCreated} />
      )}
    </div>
  );
};

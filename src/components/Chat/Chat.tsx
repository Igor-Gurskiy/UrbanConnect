import { ChatDialog } from "./ChatDialog";
import { ChatList } from "./ChatList";
import type { FC } from "react";
import { useState, useEffect } from "react";
import { selectUser } from "../../services/slices/Profile/Profile";
import { useSelector, useDispatch } from "../../services/store";
import { webSocketService } from "../../../socket";
import { getChats, getChatById } from "../../services/slices/Chat/Chat";
import { ChatSearch } from "./ChatSearch";
import type { TUser } from "../../utils/urbanConnect-api";

export const Chat: FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<TUser | null>(null);
  const user = useSelector(selectUser);

  const dispatch = useDispatch();

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setSelectedUser(null);
  };
  const handleUserSelect = (user: TUser) => {
    setSelectedUser(user);
    console.log(selectedUser)
    setSearch('')
  };

  useEffect(() => {
    if (!user) return;
    // Подключаемся к WebSocket для пользователя
    webSocketService.connect("global", user.id); // chatId = 'global' для общего подключения

    const handleWebSocketMessage = (event: CustomEvent) => {
      const data = event.detail;
      console.log("Global WebSocket message:", data);

      if (data.type === "message") {
        // Обновляем список чатов при новом сообщении
        dispatch(getChats());
        // Если открыт тот же чат - обновляем его
        if (data.chatId === selectedChatId) {
          dispatch(getChatById(selectedChatId));
        }
      }
    };

    window.addEventListener("websocket-message", handleWebSocketMessage);

    return () => {
      window.removeEventListener("websocket-message", handleWebSocketMessage);
      webSocketService.disconnect();
    };
  }, [user, dispatch, selectedChatId]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        height: "80vh",
      }}
    >
      <div>
        <ChatSearch search={search} setSearch={setSearch} onUserSelect={handleUserSelect}/>
        <ChatList onChatSelect={handleChatSelect} />
      </div>
      {selectedChatId && <ChatDialog chatId={selectedChatId} />}
    </div>
  );
};

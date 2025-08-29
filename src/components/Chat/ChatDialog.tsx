import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { ChatDialogUI } from '../ui/Chat/Chat';
import { useSelector, useDispatch } from '../../services/store';
import { selectUser } from '../../services/slices/Profile/Profile';
import { createMessage } from '../../services/slices/Chat/Chat';
import { getUserByIdApi } from '../../utils/urbanConnect-api';
import type { TMessage } from '../ui/ChatList/types';
import { v4 as uuidv4 } from 'uuid';

interface IChatDialog {
  chatId: string
}
export const ChatDialog: FC<IChatDialog> = ({chatId}) => {

  const [chatName, setChatName] = useState('');
  const user = useSelector(selectUser);
  const chat = useSelector((state) => 
    state.chat.chats.find(c => c.id === chatId)
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!chat) return;
    if (chat.type === 'private') {
      const otherUserId = chat.users.find(id => id !== user?.id);
      if (otherUserId) {
        getUserByIdApi(otherUserId)
          .then(data => {
            setChatName(data.success ? data.user.name.replace('-', ' ') : otherUserId);
          })
          .catch(() => {
            setChatName(otherUserId);
          });
      }
    } else {
      setChatName(chat.name || '');
    }
  }, [chat, user]);

  const handleSend = (messageText: string) => {
    if (user && chatId && user.id) {
      const message: TMessage = {
        id: uuidv4(),
        text: messageText,
        createdAt: new Date().toISOString(),
        user: user.id
      }

      dispatch(createMessage({chatId, message}));
    }
  }
  const handleSmileClick = () => {
    alert('Smile clicked');
  };

  const handleFileAttach = () => {
    alert('File attach clicked');
  };

  return (
    <ChatDialogUI
      name={chatName}
      isOnline={false}
      onSend={handleSend}
      messages={chat?.messages || []}
      handleSmileClick={handleSmileClick}
      handleFileAttach={handleFileAttach}
      user={user}
      type={chat?.type || ''}
    />
  );
};
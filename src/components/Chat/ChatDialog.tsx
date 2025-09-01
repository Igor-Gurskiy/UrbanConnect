import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { ChatDialogUI } from '../ui/Chat/Chat';
import { useSelector, useDispatch } from '../../services/store';
import { selectUser } from '../../services/slices/Profile/Profile';
import { createChatPrivate, createMessage } from '../../services/slices/Chat/Chat';
import { v4 as uuidv4 } from 'uuid';
import type { TChat, TMessage } from '../../utils/types';
import React from 'react';

interface IChatDialog {
  chat: TChat;
  onChatCreated: (chat: TChat) => void
}
export const ChatDialog: FC<IChatDialog> = React.memo(({chat, onChatCreated}) => {

  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const handleSend = useCallback(async (messageText: string) => {
    if (!user || !chat) return;
    const message: TMessage = {
        id: uuidv4(),
        text: messageText,
        createdAt: new Date().toISOString(),
        user: user.id
      }

    if (chat.id.startsWith('temp-')) {
      // Создаем новый постоянный чат
      const newChat = {
        ...chat,
        id: uuidv4(),
        messages: [message],
        lastMessage: message
      }
      
      await dispatch(createChatPrivate(newChat))
          // Вызываем callback из родительского компонента
             onChatCreated(newChat);
        // await dispatch(getChats())
    } else {
      // Отправляем сообщение в существующий чат
      dispatch(createMessage({chatId: chat.id, message}));
    }
    
  }, [user, chat, dispatch, onChatCreated]);
  
  const handleSmileClick = useCallback(() => {
    alert('Smile clicked');
  }, []);

  const handleFileAttach = useCallback(() => {
    alert('File attach clicked');
  }, []);

  const chatDialogProps = useMemo(() => ({
    name: chat?.name || '',
    avatar: chat?.avatar,
    isOnline: false,
    onSend: handleSend,
    messages: chat?.messages || [],
    handleSmileClick,
    handleFileAttach,
    user: user,
    type: chat?.type || ''
  }), [chat, handleSend, handleSmileClick, handleFileAttach, user]);

  return <ChatDialogUI {...chatDialogProps} />;
}, (prevProps, nextProps) => {
  return (
    prevProps.chat?.id === nextProps.chat?.id &&
    prevProps.chat?.messages?.length === nextProps.chat?.messages?.length &&
    prevProps.onChatCreated === nextProps.onChatCreated
  );
});
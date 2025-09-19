import type { FC } from 'react';
import { memo, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { selectUser } from '../../services/slices/Profile/Profile';
import {
	createChatPrivate,
	createMessage,
	returnUser,
} from '../../services/slices/Chat/Chat';
import { v4 as uuidv4 } from 'uuid';
import type { TChat, TMessage } from '../../utils/types';
import { ChatHeaderUI } from '../ui/Chat/ChatHeader';
import { ChatBodyUI } from '../ui/Chat/ChatBody';
import { ChatFormUI } from '../ui/Chat/ChatForm';

interface IChatDialog {
	chat: TChat | null;
	onChatCreated: (chat: TChat) => void;
}

export const ChatDialog: FC<IChatDialog> = memo(
	({ chat, onChatCreated }) => {
		const user = useSelector(selectUser);
		const dispatch = useDispatch();

		const handleSend = useCallback(
			async (messageText: string) => {
				if (!user || !chat) return;

				const message: TMessage = {
					id: uuidv4(),
					text: messageText,
					createdAt: new Date().toISOString(),
					user: user.id,
				};

				if (chat.id.startsWith('temp-')) {
					const newChat = {
						...chat,
						id: uuidv4(),
						messages: [message],
						lastMessage: message,
						usersDeleted: [],
					};

					await dispatch(createChatPrivate(newChat));
					onChatCreated(newChat);
				} else {
					if (chat.usersDeleted.includes(user.id)) {
						await dispatch(returnUser(chat.id));
					}
					dispatch(createMessage({ chatId: chat.id, message }));
				}
			},
			[user?.id, chat?.id, dispatch, onChatCreated]
		);

		const handleSmileClick = useCallback(() => {
			alert('Smile clicked');
		}, []);

		const handleFileAttach = useCallback(() => {
			alert('File attach clicked');
		}, []);

		const chatHeader = useMemo(
			() => (
				<ChatHeaderUI
					name={chat?.name || ''}
					avatar={chat?.avatar}
					isOnline={false}
					type={chat?.type || ''}
				/>
			),
			[chat?.name, chat?.avatar, chat?.type]
		);

		const chatBody = useMemo(
			() => <ChatBodyUI messages={chat?.messages || []} user={user} />,
			[chat?.messages, user?.id]
		);
		const chatForm = useMemo(
			() => (
				<ChatFormUI
					onSend={handleSend}
					user={user}
					handleSmileClick={handleSmileClick}
					handleFileAttach={handleFileAttach}
				/>
			),
			[handleSend, user?.id, handleSmileClick, handleFileAttach]
		);

		return (
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					padding: '16px',
					height: '80vh',
				}}
			>
				{chatHeader}
				{chatBody}
				{chatForm}
			</div>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.chat?.id === nextProps.chat?.id &&
			prevProps.chat?.name === nextProps.chat?.name &&
			prevProps.chat?.avatar === nextProps.chat?.avatar &&
			prevProps.chat?.messages?.length === nextProps.chat?.messages?.length &&
			prevProps.onChatCreated === nextProps.onChatCreated
		);
	}
);

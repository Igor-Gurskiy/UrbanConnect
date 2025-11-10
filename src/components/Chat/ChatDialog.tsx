import { memo, useCallback, useEffect, useMemo, type FC } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { selectUser } from '../../services/slices/Profile/Profile';
import {
	createChatPrivate,
	createMessage,
	getChatById,
	returnUser,
} from '../../services/slices/Chat/Chat';
import { v4 as uuidv4 } from 'uuid';
import type { TChat, TMessage } from '../../utils/types';
import { ChatHeaderUI } from '../ui/Chat/ChatHeader';
import { ChatBodyUI } from '../ui/Chat/ChatBody';
import { ChatFormUI } from '../ui/Chat/ChatForm';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

interface IChatDialog {
	chat: TChat | null;
}

export const ChatDialog: FC<IChatDialog> = memo(
	({ chat }) => {
		const navigate = useNavigate();
		const { id } = useParams();
		const user = useSelector(selectUser);
		const location = useLocation();
		const dispatch = useDispatch();

		useEffect(() => {
			if (!chat && id) {
				dispatch(getChatById(id));
			}
		}, [chat, id, dispatch]);

		const handleEditGroup = () => {
			navigate(`/chat/${id}/edit-group`, { state: { background: location } });
		};

		const handleAddMember = () => {
			navigate(`/chat/${id}/add-member`, { state: { background: location } });
		};

		const handleSend = useCallback(
			async (messageText: string) => {
				if (!user || !chat) return;

				const message: TMessage = {
					id: uuidv4(),
					text: messageText,
					createdAt: new Date().toISOString(),
					user: user.id,
				};

				// if (chat.messages.length === 0 && chat.type === 'private') {
				// 	await dispatch(createChatPrivate(chat));
				// 	await dispatch(createMessage({ chatId: chat.id, message }));
				// 	id && dispatch(getChatById(id));
				// }
				if (chat.messages.length === 0 && chat.type === 'private') {
					// 1. Создаем чат
					const chatResult = await dispatch(createChatPrivate(chat));

					if (chatResult.payload?.id) {
						const newChatId = chatResult.payload.id;

						// 2. Отправляем сообщение
						await dispatch(
							createMessage({
								chatId: newChatId,
								message,
							})
						);

						// 3. Обновляем данные
						dispatch(getChatById(newChatId));

						// 4. Меняем URL если нужно
						if (id !== newChatId) {
							navigate(`/chat/${newChatId}`);
						}
					}
				} else {
					if (chat.usersDeleted.length > 0) {
						console.log('chat.usersDeleted', chat.id);
						await dispatch(returnUser(chat.id));
					}
					dispatch(createMessage({ chatId: chat.id, message }));
				}
			},
			[user, chat, dispatch]
		);

		const handleSmileClick = useCallback(() => {
			alert('Smile clicked');
		}, []);

		const handleFileAttach = useCallback(() => {
			alert('File attach clicked');
		}, []);
		const isGroupAdmin = chat?.type === 'group' && chat?.createdBy === user?.id;
		const chatHeader = useMemo(
			() => (
				<ChatHeaderUI
					name={chat?.name || ''}
					avatar={chat?.avatar}
					isOnline={false}
					type={chat?.type || ''}
					isAdmin={isGroupAdmin}
					onEditGroup={isGroupAdmin ? handleEditGroup : undefined}
					onAddMember={isGroupAdmin ? handleAddMember : undefined}
				/>
			),
			[chat?.id]
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
			<>
				<div
					style={{
						display: 'grid',
						gridTemplateRows: 'min-content 1fr min-content',
					}}
				>
					{chatHeader}

					{chatBody}

					{chatForm}
				</div>
			</>
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.chat?.id === nextProps.chat?.id &&
			prevProps.chat?.name === nextProps.chat?.name &&
			prevProps.chat?.avatar === nextProps.chat?.avatar &&
			prevProps.chat?.messages?.length === nextProps.chat?.messages?.length
		);
	}
);

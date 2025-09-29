import { useCallback, useEffect, type FC } from 'react';
import { Outlet } from 'react-router-dom';
import {
	getChatById,
	getChats,
	selectOpenChat,
} from '../../services/slices/Chat/Chat';
import { useDispatch, useSelector } from '../../services/store';
import { selectUser } from '../../services/slices/Profile/Profile';
import { webSocketService } from '../../../socket';

interface IChatLayoutProps {
	headerHeight: number;
}
export const ChatLayout: FC<IChatLayoutProps> = ({ headerHeight }) => {
	const dispatch = useDispatch();
	const userAuth = useSelector(selectUser);

	const currentChatId = useSelector(selectOpenChat);

	const handleWebSocketMessage = useCallback(
		(event: CustomEvent) => {
			const data = event.detail;
			console.log('Global WebSocket message:', data);
			if (!data || !data.type) return;
			switch (data.type) {
				case 'message':
					// Всегда обновляем список чатов при новом сообщении
					dispatch(getChats());

					// Если сообщение для текущего открытого чата - обновляем его
					if (currentChatId && data.chatId === currentChatId.id) {
						dispatch(getChatById(currentChatId.id));
					}
					break;

				case 'chat_created':
					// Обновляем список чатов при создании нового
					dispatch(getChats());

					// Если мы участник нового чата и он открыт - обновляем
					if (currentChatId && data.chat?.id === currentChatId) {
						dispatch(getChatById(currentChatId?.id));
					}
					break;

				case 'user_restored':
					// Пользователь вернулся в чат
					dispatch(getChats());
					if (currentChatId && data.chatId === currentChatId?.id) {
						dispatch(getChatById(currentChatId?.id));
					}
					break;

				case 'chat_deleted':
					// Чат удален
					dispatch(getChats());
					// Если удаленный чат был открыт - закрываем его
					if (data.chatId === currentChatId?.id) {
						// Здесь можно добавить навигацию назад или закрытие чата
						console.log('Current chat was deleted');
					}
					break;

				case 'user_typing':
					// Обработка индикатора набора текста
					// Можно добавить в стейт если нужно
					break;

				case 'user_online':
				case 'user_offline':
					// Обновление статуса пользователей
					dispatch(getChats());
					if (currentChatId) {
						dispatch(getChatById(currentChatId.id));
					}
					break;

				default:
					console.log('Unhandled WebSocket message type:', data.type);
			}
		},
		[dispatch, currentChatId]
	);

	useEffect(() => {
		if (!userAuth) return;
		webSocketService.connect(userAuth.id);
		const messageHandler = (event: Event) => {
			handleWebSocketMessage(event as CustomEvent);
		};
		window.addEventListener('websocket-message', messageHandler);

		return () => {
			window.removeEventListener('websocket-message', messageHandler);
		};
	}, [userAuth, handleWebSocketMessage]);

	return (
		<div
			className="d-flex justify-content-center"
			style={{ height: `calc(100vh - ${headerHeight}px)` }}
		>
			<Outlet context={{ headerHeight }} />
		</div>
	);
};

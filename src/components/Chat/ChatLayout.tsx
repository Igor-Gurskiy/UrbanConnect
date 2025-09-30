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
					currentChatId && dispatch(getChatById(currentChatId.id));
					break;

				case 'user_typing':
					// Обработка индикатора набора текста
					break;

				// case 'user_online':
				// case 'user_offline':
				// 	// Обновление статуса пользователей
				// 	dispatch(getChats());
				// 	if (currentChatId) {
				// 		dispatch(getChatById(currentChatId.id));
				// 	}
				// 	break;

				default:
					console.log('Unhandled WebSocket message type:', data.type);
			}
		},
		[dispatch, currentChatId]
	);

	useEffect(() => {
		if (!userAuth) return;
		dispatch(getChats());
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

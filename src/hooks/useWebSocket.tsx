// import { useCallback, useEffect, useRef } from 'react';
// import {
// 	getChatById,
// 	getChats,
// 	selectOpenChat,
// } from '../services/slices/Chat/Chat';
// // import { selectUser } from "../services/slices/Profile/Profile";
// import { useDispatch, useSelector } from '../services/store';

// export const useWebSocket = () => {
// 	const dispatch = useDispatch();
// 	//   const userAuth = useSelector(selectUser);
// 	const currentChatId = useSelector(selectOpenChat);

// 	// Используем ref для хранения актуальных значений
// 	const currentChatIdRef = useRef(currentChatId);
// 	const dispatchRef = useRef(dispatch);

// 	// Обновляем ref при изменении
// 	useEffect(() => {
// 		currentChatIdRef.current = currentChatId;
// 	}, [currentChatId]);

// 	useEffect(() => {
// 		dispatchRef.current = dispatch;
// 	}, [dispatch]);

// 	// Обработчик сообщений
// 	const handleWebSocketMessage = useCallback((event: Event) => {
// 		const data = (event as CustomEvent).detail;
// 		console.log('WebSocket message received:', data);

// 		if (!data?.type) return;

// 		const currentDispatch = dispatchRef.current;
// 		const currentChat = currentChatIdRef.current;

// 		switch (data.type) {
// 			case 'message':
// 				currentDispatch(getChats());
// 				if (currentChat && data.chatId === currentChat.id) {
// 					currentDispatch(getChatById(currentChat.id));
// 				}
// 				break;

// 			case 'chat_created':
// 				currentDispatch(getChats());
// 				if (currentChat && data.chat?.id === currentChat.id) {
// 					currentDispatch(getChatById(currentChat.id));
// 				}
// 				break;

// 			case 'user_restored':
// 			case 'user_online':
// 			case 'user_offline':
// 				currentDispatch(getChats());
// 				if (currentChat && data.chatId === currentChat?.id) {
// 					currentDispatch(getChatById(currentChat.id));
// 				}
// 				break;

// 			case 'chat_deleted':
// 				currentDispatch(getChats());
// 				if (data.chatId === currentChat?.id) {
// 					console.log('Current chat was deleted');
// 					// Можно добавить навигацию или закрытие чата
// 				}
// 				break;

// 			default:
// 				console.log('Unhandled WebSocket message type:', data.type);
// 		}
// 	}, []);

// 	return { handleWebSocketMessage };
// };

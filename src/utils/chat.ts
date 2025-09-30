// import { useCallback } from 'react';
// import type { TChat } from './types';

// export const generatePrivateChatId = (
// 	user1Id: string,
// 	user2Id: string
// ): string => {
// 	const sortedIds = [user1Id, user2Id].sort();
// 	return `private_${sortedIds[0]}_${sortedIds[1]}`;
// };

// export const findExistingChat = useCallback(
// 	(userId: string, chats: TChat[], currentUserId: string): TChat | null => {
// 		const expectedChatId = generatePrivateChatId(currentUserId, userId);
// 		return (
// 			chats.find(
// 				(chat) =>
// 					chat.id === expectedChatId ||
// 					(chat.type === 'private' &&
// 						chat.users.includes(currentUserId) &&
// 						(chat.users.includes(userId) || chat.usersDeleted.includes(userId)))
// 			) || null
// 		);
// 	},
// 	[]
// );

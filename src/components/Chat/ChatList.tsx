import type { FC } from 'react';
import { memo, useCallback, useEffect } from 'react';
import { ChatListUI } from '../ui/ChatList/ChatList';
import { useSelector, useDispatch } from '../../services/store';
import { selectUser, getUsers } from '../../services/slices/Profile/Profile';
import type { TChat } from '../../utils/types';
import { deleteChatById, getChats } from '../../services/slices/Chat/Chat';

interface IChatListProps {
	chats: TChat[];
	onChatSelect: (chat: TChat | null) => void;
}
export const ChatList: FC<IChatListProps> = memo(
	({ chats, onChatSelect }) => {
		const dispatch = useDispatch();
		const user = useSelector(selectUser);

		// useEffect(() => {
		// 	dispatch(getUsers());
		// }, [dispatch]);
		useEffect(() => {
			dispatch(getUsers());
		}, []);
		const handleChatSelect = useCallback(
			(chat: TChat) => {
				onChatSelect(chat);
			},
			[onChatSelect]
		);

		const onChatDelete = useCallback(
			async (chatId: string) => {
				if (!user) return;
				await dispatch(deleteChatById({ chatId, userAuth: user.id })).unwrap();
				await dispatch(getChats()).unwrap();
				onChatSelect(null);
			},
			[dispatch, onChatSelect, user]
		);

		return (
			user && (
				<ChatListUI
					chats={chats}
					onChatSelect={handleChatSelect}
					onChatDelete={onChatDelete}
				/>
			)
		);
	},
	(prevProps, nextProps) => {
		return (
			prevProps.chats === nextProps.chats &&
			prevProps.onChatSelect === nextProps.onChatSelect
		);
	}
);

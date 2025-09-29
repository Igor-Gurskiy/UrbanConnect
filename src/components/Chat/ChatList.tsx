import type { FC } from 'react';
import { memo, useCallback } from 'react';
import { ChatListUI } from '../ui/ChatList/ChatList';
import { useSelector, useDispatch } from '../../services/store';
import { selectUser } from '../../services/slices/Profile/Profile';
import type { TChat } from '../../utils/types';
import { deleteChatById } from '../../services/slices/Chat/Chat';

interface IChatListProps {
	chats: TChat[];
	onChatSelect: (chat: TChat | null) => void;
}
export const ChatList: FC<IChatListProps> = memo(
	({ chats, onChatSelect }) => {
		const dispatch = useDispatch();
		const user = useSelector(selectUser);

		const onChatDelete = useCallback(
			async (chatId: string) => {
				if (!user) return;
				console.log('chatId', chatId);
				console.log('user.id', user.id);
				await dispatch(deleteChatById({ chatId, userAuth: user.id })).unwrap();
			},
			[dispatch, user]
		);

		return (
			user && (
				<ChatListUI
					chats={chats}
					onChatSelect={onChatSelect}
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

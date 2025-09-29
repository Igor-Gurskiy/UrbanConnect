import { memo, useCallback } from 'react';
import { GroupChatUI } from '../ui/GroupChat/GroupChat';
import type { TChat } from '../../utils/types';
import { v4 as uuidv4 } from 'uuid';
import { createGroupChat } from '../../services/slices/Chat/Chat';
import { useDispatch, useSelector } from '../../services/store';
import { selectUser } from '../../services/slices/Profile/Profile';
import { useNavigate } from 'react-router-dom';

type TGroupChatForm = {
	ChatName: string;
	Avatar: string;
	Users: string;
};

export const GroupChat = memo(() => {
	const dispatch = useDispatch();
	const user = useSelector(selectUser);
	const navigate = useNavigate();
	const handleCreateChat = useCallback(
		async (chatData: TGroupChatForm) => {
			if (!user) return;

			try {
				const usersString = chatData.Users || '';
				const users =
					usersString.length > 0
						? usersString
								.split(',')
								.map((user) => user.trim())
								.filter(Boolean)
						: [];

				const newGroupChat: TChat = {
					id: uuidv4(),
					name: chatData.ChatName,
					avatar: chatData.Avatar || '',
					type: 'group',
					users: [user.id, ...users],
					messages: [],
					lastMessage: null,
					usersDeleted: [],
					createdBy: user.id,
				};

				await dispatch(createGroupChat(newGroupChat)).unwrap();
				navigate(`/chat/${newGroupChat.id}`);
			} catch (error) {
				console.log('Error creating group chat:', error);
			}
		},
		[dispatch, user]
	);
	const handleGoBack = useCallback(() => {
		navigate(-1);
	}, [navigate]);
	return (
		<>
			<GroupChatUI onCreateChat={handleCreateChat} onGoBack={handleGoBack} />
		</>
	);
});

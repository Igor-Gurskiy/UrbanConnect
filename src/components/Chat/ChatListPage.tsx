import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { ChatSearch } from './ChatSearch';
import { ChatList } from './ChatList';
import { Button } from 'antd';
import type { TChat, TUser } from '../../utils/types';
import { selectUser } from '../../services/slices/Profile/Profile';
import { useDispatch, useSelector } from '../../services/store';
import {
	getChats,
	selectChats,
	selectIsLoading,
	setOpenChat,
} from '../../services/slices/Chat/Chat';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Loader } from '../Loader/Loader';

export const ChatListPage: FC = () => {
	const navigate = useNavigate();

	const [search, setSearch] = useState('');
	const isLoading = useSelector(selectIsLoading);

	const userAuth = useSelector(selectUser);
	const chats = useSelector(selectChats);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(getChats());
		console.log('chats', chats);
	}, [dispatch]);

	const findExistingChat = useCallback(
		(userId: string, chats: TChat[], currentUserId: string): TChat | null => {
			return (
				chats.find(
					(chat) =>
						chat.type === 'private' &&
						chat.users.includes(userId) &&
						chat.usersDeleted.includes(currentUserId)
				) || null
			);
		},
		[]
	);

	const handleUserSelect = useCallback(
		(user: TUser) => {
			if (!userAuth) return;
			setSearch('');

			const existingChat = findExistingChat(user.id, chats, userAuth.id);
			console.log('existingChat', existingChat);
			if (existingChat) {
				dispatch(setOpenChat(existingChat));
				navigate(`/chat/${existingChat.id}`);
			} else {
				const newChat = {
					id: uuidv4(),
					name: user.name,
					type: 'private',
					avatar: user.avatar,
					users: [userAuth.id, user.id],
					messages: [],
					lastMessage: null,
					usersDeleted: [],
				};
				dispatch(setOpenChat(newChat));
				navigate(`/chat/${newChat.id}`, { state: { newChat } });
			}
		},
		[userAuth, chats, findExistingChat, navigate]
	);

	const handleChatSelect = useCallback((chat: TChat | null) => {
		dispatch(setOpenChat(chat));
		navigate(`/chat/${chat?.id}`);
	}, []);

	const renderButtonGroup = useMemo(
		() => (
			<Button
				className="h-100 px-2"
				type="default"
				onClick={() => navigate('/chat/new-group')}
				size="large"
			>
				+ GroupChat
			</Button>
		),
		[navigate]
	);
	const userChats = useMemo(() => {
		if (!userAuth) return [];
		return chats.filter((chat) => chat.users.includes(userAuth.id));
	}, [userAuth, chats]);

	const chatListProps = useMemo(
		() => ({
			chats: userChats,
			onChatSelect: handleChatSelect,
		}),
		[userChats, handleChatSelect]
	);
	if (isLoading) {
		return <Loader />;
	}
	return (
		<div className="mw-px-600 d-flex flex-column">
			<div
				className="align-items-center p-2 gap-2"
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr auto',
					flexShrink: 0,
				}}
			>
				<ChatSearch
					search={search}
					setSearch={setSearch}
					onUserSelect={handleUserSelect}
				/>
				{renderButtonGroup}
			</div>
			<ChatList {...chatListProps} />
		</div>
	);
};

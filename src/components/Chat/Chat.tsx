import { ChatDialog } from './ChatDialog';
import { ChatList } from './ChatList';
import type { FC } from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { selectUser } from '../../services/slices/Profile/Profile';
import { useSelector, useDispatch } from '../../services/store';
import { webSocketService } from '../../../socket';
import {
	getChats,
	getChatById,
	selectChats,
	clearError,
} from '../../services/slices/Chat/Chat';
import { ChatSearch } from './ChatSearch';
import { v4 as uuidv4 } from 'uuid';
import type { TChat, TUser } from '../../utils/types';
import { GroupChat } from './GroupChat';
import { Button } from 'antd';
import { ModalEditGroup } from './ModalEditGroup';
import { ModalAddMember } from './ModalAddMember';

export const Chat: FC = () => {
	const [selectedChat, setSelectedChat] = useState<TChat | null>(null);
	const [search, setSearch] = useState('');
	const [selectedUser, setSelectedUser] = useState<TUser | null>(null);
	const [editGroupModal, setEditGroupModal] = useState(false);
	const [addGroupModal, setAddGroupModal] = useState(false);
	const [groupForm, setGroupForm] = useState(false);

	const userAuth = useSelector(selectUser);
	const chats = useSelector(selectChats);

	const dispatch = useDispatch();

	const handleChatSelect = useCallback((chat: TChat | null) => {
		setSelectedChat(chat);
		setSelectedUser(null);
		setGroupForm(false);
	}, []);

	const handleChatCreated = useCallback(
		async (createdChat: TChat) => {
			setSelectedChat(createdChat);
			setSelectedUser(null);
			await dispatch(getChats());
		},
		[dispatch]
	);

	const findExistingChat = useCallback(
		(userId: string, chats: TChat[], currentUserId: string): TChat | null => {
			return (
				chats.find(
					(chat) =>
						chat.type === 'private' &&
						chat.users.includes(currentUserId) &&
						(chat.users.includes(userId) || chat.usersDeleted.includes(userId))
				) || null
			);
		},
		[]
	);

	const handleUserSelect = useCallback(
		(user: TUser) => {
			if (!userAuth) return;

			setSelectedUser(user);
			setSearch('');

			const existingChat = findExistingChat(user.id, chats, userAuth.id);
			setSelectedChat(existingChat);
		},
		[userAuth, chats, findExistingChat]
	);

	const tempChat = useMemo(() => {
		if (!selectedUser || !userAuth) return null;

		return {
			id: 'temp-' + uuidv4(),
			name: selectedUser.name,
			type: 'private',
			avatar: selectedUser.avatar,
			users: [userAuth.id, selectedUser.id],
			messages: [],
			lastMessage: null,
			usersDeleted: [],
		} as TChat;
	}, [selectedUser, userAuth]);

	const currentChat = selectedChat || tempChat;

	useEffect(() => {
		dispatch(getChats());
	}, [dispatch]);

	useEffect(() => {
		if (selectedChat && !selectedChat.id.startsWith('temp-')) {
			const updatedChat = chats.find((chat) => chat.id === selectedChat.id);
			if (updatedChat && updatedChat !== selectedChat) {
				setSelectedChat(updatedChat);
			}
		}
	}, [chats, selectedChat]);

	const handleWebSocketMessage = useCallback(
		(event: CustomEvent) => {
			const data = event.detail;
			console.log('Global WebSocket message:', data);

			if (
				data.type === 'message' ||
				data.type === 'chat_created' ||
				data.type === 'user_restored' ||
				data.type === 'chat_deleted'
			) {
				dispatch(getChats());
			}

			if (
				data.type === 'message' &&
				selectedChat &&
				data.chatId === selectedChat?.id
			) {
				dispatch(getChatById(selectedChat.id))
					.unwrap()
					.then((response) => {
						if (response.success) {
							setSelectedChat(response.chat);
						}
					});
			}
			if (
				data.type === 'chat_created' &&
				selectedUser?.id === data.participantId
			) {
				if (data.chat) {
					setSelectedChat(data.chat);
					setSelectedUser(null);
				}
			}
		},
		[dispatch, selectedChat, selectedUser]
	);

	useEffect(() => {
		if (!userAuth) return;
		webSocketService.connect('global', userAuth.id);

		window.addEventListener(
			'websocket-message',
			handleWebSocketMessage as EventListener
		);

		return () => {
			window.removeEventListener(
				'websocket-message',
				handleWebSocketMessage as EventListener
			);
			webSocketService.disconnect();
		};
	}, [userAuth, handleWebSocketMessage]);

	const userChats = useMemo(() => {
		if (!userAuth) return [];
		return chats.filter((chat) => chat.users.includes(userAuth.id));
	}, [userAuth, chats]);

	const handleGroupChatForm = useCallback(() => {
		setGroupForm((prev) => !prev);
		setSelectedChat(null);
		setSelectedUser(null);
	}, []);

	const handleEditGroup = useCallback(() => {
		setEditGroupModal(true);
	}, []);
	const handleAddGroup = useCallback(() => {
		setAddGroupModal(true);
	}, []);
	const handleCloseEditModal = useCallback(() => {
		dispatch(clearError());
		setEditGroupModal(false);
	}, []);
	const handleCloseAddModal = useCallback(() => {
		dispatch(clearError());
		setAddGroupModal(false);
	}, []);
	const chatSearchProps = useMemo(
		() => ({
			search,
			setSearch: setSearch,
			onUserSelect: handleUserSelect,
		}),
		[search, handleUserSelect]
	);

	const chatListProps = useMemo(
		() => ({
			chats: userChats,
			onChatSelect: handleChatSelect,
		}),
		[userChats, handleChatSelect]
	);

	const chatDialogProps = useMemo(
		() => ({
			chat: currentChat,
			onChatCreated: handleChatCreated,
		}),
		[currentChat, handleChatCreated]
	);

	const renderButtonGroup = useMemo(
		() => (
			<Button
				style={{
					borderColor: '#555ab9',
					color: '#555ab9',
					height: `calc(100% - 8px)`,
					paddingInline: '4px',
				}}
				type="text"
				onClick={handleGroupChatForm}
				size="large"
			>
				+ GroupChat
			</Button>
		),
		[handleGroupChatForm]
	);
	const renderButtonAdd = useMemo(
		() => (
			<Button
				style={{
					borderColor: '#555ab9',
					color: '#555ab9',
					height: `calc(100% - 8px)`,
					paddingInline: '4px',
				}}
				type="text"
				onClick={handleAddGroup}
				size="large"
			>
				+ Invite
			</Button>
		),
		[handleAddGroup]
	);
	const renderButtonEdit = useMemo(
		() => (
			<Button
				style={{
					borderColor: '#555ab9',
					color: '#555ab9',
					height: `calc(100% - 8px)`,
					paddingInline: '4px',
				}}
				type="text"
				onClick={handleEditGroup}
				size="large"
			>
				Edit
			</Button>
		),
		[handleEditGroup]
	);

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: '1fr 1fr',
				height: '80vh',
			}}
		>
			<div>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr auto',
						alignItems: 'center',
						gap: '2px',
					}}
				>
					<ChatSearch {...chatSearchProps} />
					{renderButtonGroup}
				</div>
				<ChatList {...chatListProps} />
			</div>
			{currentChat && (
				<div style={{ position: 'relative' }}>
					<ChatDialog {...chatDialogProps} />
					{currentChat?.createdBy === userAuth?.id && (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								position: 'absolute',
								padding: '4px',
								top: '16px',
								right: '16px',
								gap: '4px',
							}}
						>
							{renderButtonEdit}
							{renderButtonAdd}
						</div>
					)}
				</div>
			)}

			{groupForm && !currentChat && <GroupChat />}

			<ModalEditGroup
				open={editGroupModal}
				onClose={handleCloseEditModal}
				selectedChat={selectedChat}
			/>

			<ModalAddMember
				open={addGroupModal}
				onClose={handleCloseAddModal}
				selectedChat={selectedChat}
			/>
		</div>
	);
};

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
	getChatsApi,
	createMessageApi,
	getChatByIdApi,
	createChatApi,
	deleteChatByIdApi,
	returnUserApi,
	creatGroupChatApi,
	updateGroupChatApi,
	addUserToGroupChatApi,
} from '../../../utils/urbanConnect-api';
import type { TChat, TMessage } from '../../../utils/types';

type TChatState = {
	chats: TChat[];
	error: string;
	loading: boolean;
	openChat: TChat | null;
};

type TMessageData = {
	message: TMessage;
	chatId: string;
};

export const getChats = createAsyncThunk('chat/getChats', getChatsApi);

export const createMessage = createAsyncThunk(
	'chat/createMessage',
	async (data: TMessageData) => await createMessageApi(data)
);

export const createChatPrivate = createAsyncThunk(
	'chat/createChat',
	(data: TChat) => createChatApi(data)
);

export const createGroupChat = createAsyncThunk(
	'chat/createGroupChat',
	(data: TChat) => creatGroupChatApi(data)
);

export const getChatById = createAsyncThunk(
	'chat/getChatById',
	async (id: string) => {
		const response = await getChatByIdApi(id);
		return response;
	}
);

export const deleteChatById = createAsyncThunk(
	'chat/deleteChatById',
	async ({ chatId, userAuth }: { chatId: string; userAuth: string }) =>
		await deleteChatByIdApi(chatId, userAuth)
);

export const returnUser = createAsyncThunk(
	'chat/returnUser',
	async (id: string) => await returnUserApi(id)
);

export const updateGroupChat = createAsyncThunk(
	'chat/updateGroupChat',
	async (
		data: { id: string; name?: string; avatar?: string },
		{ rejectWithValue }
	) => {
		try {
			const response = await updateGroupChatApi(data);
			return {
				chatId: data.id,
				name: data.name,
				avatar: data.avatar,
				chat: response.chat,
				success: response.success,
			};
		} catch (error) {
			return rejectWithValue(error || 'Failed to update chat');
		}
	}
);

export const addUserToGroupChat = createAsyncThunk(
	'chats/addUserToGroup',
	async (data: { id: string; user: string }, { rejectWithValue }) => {
		try {
			const response = await addUserToGroupChatApi(data);

			return {
				chatId: data.id,
				user: data.user,
				chat: response.chat,
				success: response.success,
			};
		} catch (error) {
			return rejectWithValue(error || 'Failed to add user');
		}
	}
);
export const initialState: TChatState = {
	chats: [],
	error: '',
	loading: false,
	openChat: null,
};

export const ChatSlice = createSlice({
	name: 'chat',
	initialState,
	reducers: {
		clearError: (state) => {
			state.error = '';
		},
		setOpenChat: (state, action) => {
			state.openChat = action.payload;
		},
		clearOpenChat: (state) => {
			state.openChat = null;
		},
	},
	selectors: {
		selectChats: (state) => state.chats,
		selectOpenChat: (state) => state.openChat,
		selectChatIsLoading: (state) => state.loading,
		selectError: (state) => state.error,
		selectChatById: (state, chatId: string) => {
			return state.chats.find((chat) => chat.id === chatId) || null;
		},
		selectIsLoading: (state) => state.loading,
	},
	extraReducers(builder) {
		builder
			.addCase(getChats.fulfilled, (state, action) => {
				state.loading = false;
				state.chats = action.payload;
				state.error = '';
			})
			.addCase(getChats.rejected, (state, action) => {
				state.error = action.error.message || '';
				state.loading = false;
			})
			.addCase(getChats.pending, (state) => {
				state.error = '';
				state.loading = true;
			})
			.addCase(createMessage.fulfilled, (state, action) => {
				const { chatId, message } = action.meta.arg;
				const chat = state.chats.find((chat) => chat.id === chatId);
				if (chat) {
					chat.messages.push(message);
					chat.lastMessage = message;
				}
				state.error = '';
			})
			.addCase(createMessage.rejected, (state, action) => {
				state.error = action.error.message || '';
			})
			.addCase(createMessage.pending, (state) => {
				state.error = '';
			})
			.addCase(createChatPrivate.fulfilled, (state, action) => {
				const newChat = action.meta.arg;
				state.chats.push(newChat);
				state.error = '';
			})
			.addCase(createChatPrivate.rejected, (state, action) => {
				state.error = action.error.message || '';
			})
			.addCase(createChatPrivate.pending, (state) => {
				state.error = '';
			})
			.addCase(getChatById.fulfilled, (state, action) => {
				state.loading = false;
				state.error = '';
				const openChat = action.payload.chat;
				state.openChat = openChat;
			})
			.addCase(getChatById.rejected, (state, action) => {
				state.error = action.error.message || '';
				state.loading = false;
			})
			.addCase(getChatById.pending, (state) => {
				state.error = '';
				state.loading = true;
			})
			.addCase(deleteChatById.fulfilled, (state, action) => {
				state.loading = false;
				state.error = '';
				const deletedChat = action.payload.id;
				state.chats = state.chats.filter((chat) => chat.id !== deletedChat);
			})
			.addCase(deleteChatById.rejected, (state, action) => {
				state.error = action.error.message || '';
				state.loading = false;
			})
			.addCase(deleteChatById.pending, (state) => {
				state.error = '';
				state.loading = true;
			})
			.addCase(returnUser.fulfilled, (state, action) => {
				state.loading = false;
				state.error = '';
				const restoredChat = action.payload;
				const index = state.chats.findIndex(
					(chat) => chat.id === restoredChat.id
				);
				if (index !== -1) {
					state.chats[index] = restoredChat;
				} else {
					state.chats.push(restoredChat);
				}
			})
			.addCase(returnUser.rejected, (state, action) => {
				state.error = action.error.message || '';
				state.loading = false;
			})
			.addCase(returnUser.pending, (state) => {
				state.error = '';
				state.loading = true;
			})
			.addCase(createGroupChat.fulfilled, (state, action) => {
				const newChat = action.meta.arg;
				state.chats.push(newChat);
				state.error = '';
			})
			.addCase(createGroupChat.rejected, (state, action) => {
				state.error = action.error.message || '';
			})
			.addCase(createGroupChat.pending, (state) => {
				state.error = '';
			})
			.addCase(updateGroupChat.fulfilled, (state, action) => {
				const { chatId, name, avatar } = action.payload;
				const index = state.chats.findIndex((chat) => chat.id === chatId);
				if (index !== -1) {
					state.chats[index].name = name || state.chats[index].name;
					state.chats[index].avatar = avatar;
				}
				state.error = '';
			})
			.addCase(updateGroupChat.rejected, (state, action) => {
				const errorPayload = action.payload as any;
				state.error = errorPayload.message || '';
			})
			.addCase(updateGroupChat.pending, (state) => {
				state.error = '';
			})
			.addCase(addUserToGroupChat.fulfilled, (state, action) => {
				const { chatId, user, success } = action.payload;

				if (success) {
					const index = state.chats.findIndex((chat) => chat.id === chatId);
					if (index !== -1 && !state.chats[index].users.includes(user)) {
						state.chats[index].users.push(user);
					}
				}
				state.error = '';
				state.loading = false;
			})
			.addCase(addUserToGroupChat.rejected, (state, action) => {
				const errorData = action.payload as any;
				state.error = errorData?.message || 'Failed to add user to group';
				state.loading = false;
			})
			.addCase(addUserToGroupChat.pending, (state) => {
				state.error = '';
				state.loading = true;
			});
	},
});

export const {
	selectChats,
	selectChatIsLoading,
	selectError,
	selectOpenChat,
	selectChatById,
	selectIsLoading,
} = ChatSlice.selectors;
export const { clearError, setOpenChat, clearOpenChat } = ChatSlice.actions;
export default ChatSlice.reducer;

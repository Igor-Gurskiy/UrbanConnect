import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getChatsApi,
  createMessageApi,
  getChatByIdApi,
  createChatApi,
} from "../../../utils/urbanConnect-api";
import type { TChat, TMessage } from "../../../utils/urbanConnect-api";

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

export const getChats = createAsyncThunk("chat/getChats", getChatsApi);

export const createMessage = createAsyncThunk(
  "chat/createMessage",
  async (data: TMessageData) => await createMessageApi(data)
);

export const createChat = createAsyncThunk(
  "chat/createChat",
  async (data: { otherUserId: string; message: string }) =>
    await createChatApi(data.otherUserId, data.message)
);

export const getChatById = createAsyncThunk(
  "chat/getChatById",
  async (id: string) => await getChatByIdApi(id)
);

export const initialState: TChatState = {
  chats: [],
  error: "",
  loading: false,
  openChat: null,
};

export const ChatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  selectors: {
    selectChats: (state) => state.chats,
    selectChatIsLoading: (state) => state.loading,
  },
  extraReducers(builder) {
    builder
      .addCase(getChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
        state.error = "";
      })
      .addCase(getChats.rejected, (state, action) => {
        state.error = action.error.message || "";
        state.loading = false;
      })
      .addCase(getChats.pending, (state) => {
        state.error = "";
        state.loading = true;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        const { chatId, message } = action.meta.arg;
        const chat = state.chats.find((chat) => chat.id === chatId);
        if (chat) {
          chat.messages.push(message);
          chat.lastMessage = message;
        }
        state.error = "";
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.error = action.error.message || "";
      })
      .addCase(createMessage.pending, (state) => {
        state.error = "";
      })
      // .addCase(createChat.fulfilled, (state, action) => {
      //   // const newChat = action.payload.chat;
      //   // state.chats.push(newChat);
      //   // state.openChat = newChat;
      //   state.error = "";
      // })
      .addCase(createChat.rejected, (state, action) => {
        state.error = action.error.message || "";
      })
      .addCase(createChat.pending, (state) => {
        state.error = "";
      })
      .addCase(getChatById.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";
        const openChat = action.payload.chat;
        const index = state.chats.findIndex((chat) => chat.id === openChat.id);
        if (index !== -1) {
          state.chats[index] = openChat;
        } else {
          state.chats.push(openChat);
        }
      })
      .addCase(getChatById.rejected, (state, action) => {
        state.error = action.error.message || "";
        state.loading = false;
      })
      .addCase(getChatById.pending, (state) => {
        state.error = "";
        state.loading = true;
      });
  },
});

export const { selectChats, selectChatIsLoading } = ChatSlice.selectors;

// export const { addMessage } = ChatSlice.actions;

export default ChatSlice.reducer;

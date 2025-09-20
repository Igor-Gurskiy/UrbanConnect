import { setCookie, getCookie } from './cookies';
import type { TChat, TMessage, TUser } from './types';

const URL = import.meta.env.VITE_API_BASE_URL || 'https://urbanconnect.onrender.com';

const checkResponse = <T>(res: Response): Promise<T> =>
	res.ok ? res.json() : res.json().then((err) => Promise.reject(err));

export type TServerResponse<T> = {
	success: boolean;
} & T;

export type TRefreshResponse = TServerResponse<{
	refreshToken: string;
	accessToken: string;
}>;

export const refreshToken = (): Promise<TRefreshResponse> =>
	fetch(`${URL}/api/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
		body: JSON.stringify({
			token: localStorage.getItem('refreshToken'),
		}),
	})
		.then((res) => checkResponse<TRefreshResponse>(res))
		.then((refreshData) => {
			if (!refreshData.success) {
				return Promise.reject(refreshData);
			}
			localStorage.setItem('refreshToken', refreshData.refreshToken);
			setCookie('accessToken', refreshData.accessToken, { expires: 3600 });
			return refreshData;
		});

export const fetchWithRefresh = async <T>(
	url: RequestInfo,
	options: RequestInit
) => {
	try {
		const res = await fetch(url, options);
		return await checkResponse<T>(res);
	} catch (error) {
		if ((error as { message: string }).message === 'jwt expired') {
			const refreshData = await refreshToken();

			if (options.headers) {
				(
					options.headers as {
						[key: string]: string;
					}
				).authorization = refreshData.accessToken;
			}
			const res = await fetch(url, options);
			return await checkResponse<T>(res);
		} else {
			return Promise.reject(error);
		}
	}
};

export type TRegisterData = {
	email: string;
	name: string;
	password: string;
};

export type TUserResponse = TServerResponse<{ user: TUser }>;

// export const updateUserApi = (user: Partial<TRegisterData>) =>
//   fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json;charset=utf-8",
//       authorization: getCookie("accessToken"),
//     } as HeadersInit,
//     body: JSON.stringify(user),
//   });

export const getUserApi = () =>
	fetchWithRefresh<TUserResponse>(`${URL}/api/user`, {
		method: 'GET',
		headers: {
			authorization: getCookie('accessToken'),
		} as HeadersInit,
	});

export const getUserByIdApi = (id: string) =>
	fetch(`${URL}/api/user/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then((res) => {
		return checkResponse<TUserResponse>(res);
	});

export type TUsersResponse = TServerResponse<{ users: TUser[] }>;

export const getUsersApi = (filter: { search?: string } = {}) =>
	fetch(`${URL}/api/users?${new URLSearchParams(filter).toString()}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			authorization: getCookie('accessToken'),
		} as HeadersInit,
	}).then((res) => {
		return checkResponse<TUsersResponse>(res);
	});

export type TLogoutResponse = {
	success: boolean;
	message?: string;
};

export const logoutUserApi = () =>
	fetch(`${URL}/api/logout`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
		body: JSON.stringify({
			token: localStorage.getItem('refreshToken'),
		}),
	}).then((res) => checkResponse<TServerResponse<TLogoutResponse>>(res));

export type TLoginData = {
	email: string;
	password: string;
	remember?: boolean;
};

export type TAuthResponse = TServerResponse<{
	refreshToken: string;
	accessToken: string;
	user: TUser;
	message: string;
}>;

export const loginUserApi = (data: TLoginData) =>
	fetch(`${URL}/api/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
		body: JSON.stringify({
			email: data.email,
			password: data.password,
			remember: data.remember,
		}),
	})
		.then((res) => checkResponse<TAuthResponse & { remember: boolean }>(res))
		.then((data) => {
			if (data?.success) return data;
			return Promise.reject(data);
		});

export const registerUserApi = (data: TRegisterData) =>
	fetch(`${URL}/api/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
		body: JSON.stringify(data),
	})
		.then((res) => {
			return checkResponse<TAuthResponse>(res);
		})
		.then((data) => {
			if (data?.success) return data;
			return Promise.reject(data);
		});

type TChatsResponse = TServerResponse<{
	chats: TChat[];
	message?: string;
}>;

export const getChatsApi = () =>
	fetchWithRefresh<TChatsResponse>(`${URL}/api/chats`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
			authorization: getCookie('accessToken'),
		} as HeadersInit,
	}).then((data) => {
		if (data?.success) return data.chats;
		return Promise.reject(data);
	});

type TChatResponse = TServerResponse<{
	chat: TChat;
	message?: string;
}>;

export const getChatByIdApi = (id: string) =>
	fetch(`${URL}/api/chat/${id}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	}).then((res) => {
		return checkResponse<TChatResponse>(res);
	});

type TNewMessageResponse = TServerResponse<{
	message: TMessage;
}>;

export const createMessageApi = (data: { message: TMessage; chatId: string }) =>
	fetchWithRefresh<TNewMessageResponse>(`${URL}/api/message`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
			authorization: getCookie('accessToken'),
		} as HeadersInit,
		body: JSON.stringify(data),
	}).then((data) => {
		if (data?.success) return data.message;
		return Promise.reject(data);
	});

type TNewChatResponse = TServerResponse<{
	message: TMessage;
	chat: TChat;
}>;

export const createChatApi = (chat: TChat) => {
	fetchWithRefresh<TNewChatResponse>(`${URL}/api/chat/private`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
			authorization: getCookie('accessToken'),
		} as HeadersInit,
		body: JSON.stringify(chat),
	}).then((data) => {
		if (data?.success) return data.chat;
		return Promise.reject(data);
	});
};

export const creatGroupChatApi = (chat: TChat) => {
	fetchWithRefresh<TNewChatResponse>(`${URL}/api/chat/group`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
			authorization: getCookie('accessToken'),
		} as HeadersInit,
		body: JSON.stringify(chat),
	}).then((data) => {
		if (data?.success) return data.chat;
		return Promise.reject(data);
	});
};

type TDeletedChatResponse = TServerResponse<{
	message: TMessage;
	deletedChat: TChat;
}>;

export const deleteChatByIdApi = (chatId: string, userAuth: string) =>
	fetchWithRefresh<TDeletedChatResponse>(`${URL}/api/chats/${chatId}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
			authorization: getCookie('accessToken'),
		} as HeadersInit,
		body: JSON.stringify({ userAuth }),
	}).then((data) => {
		if (data?.success) return data.deletedChat;
		return Promise.reject(data);
	});

export const returnUserApi = (id: string) =>
	fetchWithRefresh<TNewChatResponse>(`${URL}/api/chats/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
			authorization: getCookie('accessToken'),
		} as HeadersInit,
	}).then((data) => {
		if (data?.success) return data.chat;
		return Promise.reject(data);
	});

type TUpdateChatResponse = TServerResponse<{
	chat: TChat;
	message?: string;
}>;

export const updateGroupChatApi = (data: {
	id: string;
	name?: string;
	avatar?: string;
}) => {
	return fetchWithRefresh<TUpdateChatResponse>(
		`${URL}/api/chats/group/edit/${data.id}`,
		{
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
				authorization: getCookie('accessToken'),
			} as HeadersInit,
			body: JSON.stringify({
				name: data.name,
				avatar: data.avatar,
			}),
		}
	).then((response) => {
		if (response?.success) {
			return response;
		} else {
			return Promise.reject(response);
		}
	});
};

export const addUserToGroupChatApi = (data: { id: string; user: string }) => {
	return fetchWithRefresh<TUpdateChatResponse>(
		`${URL}/api/chats/group/addUser/${data.id}`,
		{
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json;charset=utf-8',
				authorization: getCookie('accessToken'),
			} as HeadersInit,
			body: JSON.stringify({
				user: data.user,
			}),
		}
	).then((response) => {
		if (response?.success) {
			return response;
		} else {
			return Promise.reject(response);
		}
	});
};

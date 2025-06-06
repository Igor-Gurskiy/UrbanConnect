import { setCookie, getCookie } from "./cookies";

const URL = process.env.API_BASE_URL

export const checkResponse = <T>(response: Response): Promise<T> => {
    return response.ok ? response.json() : Promise.reject(response);
};

export type TServerResponse<T> = {
    success: boolean;
} & T;

export type TRefreshResponse = TServerResponse<{
    refreshToken: string;
    accessToken: string;
}>

export const refreshToken = (): Promise<TRefreshResponse> => 
    fetch(`${URL}/auth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            token: getCookie("refreshToken"),
        }),
    })
        .then((res) => checkResponse<TRefreshResponse>(res))
        .then((refreshData) => {
            if(!refreshData.success) {
                return Promise.reject(refreshData);
            }
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            setCookie("accessToken", refreshData.accessToken);
            return refreshData;
        })
        .catch((error) => {
            console.log(error);
            return Promise.reject(error);
    })


export const fetchWithRefresh = async <T>(
    url: RequestInfo,
    options: RequestInit
) => {
    try {
        const res = await fetch(url, options);
        return await checkResponse<T>(res);
    } catch (error) {
        if((error as {message: string}).message === 'jwt expired') {
            const refreshData = await refreshToken();
            if(options.headers) {
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
}

export type TUser = {
    email: string,
    name: string
}

export type TRegisterData = {
  email: string;
  name: string;
  password: string;
};

export type TUserResponse = TServerResponse<{user: TUser}>

export const updateUserApi = (user: Partial<TRegisterData>) =>
    fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
            authorization: getCookie("accessToken"),
        } as HeadersInit,
        body: JSON.stringify(user),
    });

export const getUserApi = () =>
    fetchWithRefresh<TUserResponse>(`${URL}/auth/user`, {
        method: "GET",
        headers: {
            authorization: getCookie("accessToken"),
        } as HeadersInit,
    });

export type TLogoutResponse = {
  success: boolean;
  message?: string;
};
export const logoutUserApi = () => 
    fetch(`${URL}/auth/logout`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
            token: localStorage.getItem('refreshToken')
        })
    }).then((res) => checkResponse<TServerResponse<TLogoutResponse>>(res));

export type TLoginData = {
  email: string;
  password: string;
};

export type TAuthResponse = TServerResponse<{
  refreshToken: string;
  accessToken: string;
  user: TUser;
}>;

export const loginUserApi = (user: TLoginData) =>
    fetch(`${URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(user),
    })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
        if (data?.success) return data;
        return Promise.reject(data);
    })

export const registerUserApi = (data: TRegisterData) =>
    fetch(`${URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(data),
    })
    .then((res) => checkResponse<TAuthResponse>(res))
    .then((data) => {
        if (data?.success) return data;
        return Promise.reject(data);
    })
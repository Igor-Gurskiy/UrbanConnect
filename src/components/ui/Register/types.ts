export type TRegister = {
	username: string;
	email: string;
	password: string;
	setUsername: (value: string) => void;
	setEmail: (value: string) => void;
	setPassword: (value: string) => void;
	handleSubmit: () => void;
	error: string | null;
};

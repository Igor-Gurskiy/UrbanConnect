export type TUser = {
	id: string;
	name: string;
	avatar?: string;
	email: string;
};

export type TMessage = {
	id: string;
	text: string;
	createdAt: string;
	user: string;
};

export type TChat = {
	id: string;
	avatar?: string;
	type: string;
	users: string[];
	lastMessage: TMessage | null;
	messages: TMessage[];
	name: string;
	usersDeleted: string[];
	createdBy?: string;
};

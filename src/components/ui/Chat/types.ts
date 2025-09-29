import type { TMessage, TUser } from '../../../utils/types';

export type TChatDialog = {
	name: string;
	isOnline: boolean;
	avatar?: string;
	onSend: (message: string) => void;
	messages: TMessage[];
	user: TUser | null;
	type: string;
	handleSmileClick: () => void;
	handleFileAttach: () => void;
	messageText: string;
	setMessageText: (text: string) => void;
};

export type TChatHeader = {
	name: string;
	isOnline: boolean;
	avatar?: string;
	type: string;
	isAdmin?: boolean;
	onEditGroup?: () => void | undefined;
	onAddMember?: () => void | undefined;
};

export type TChatBody = {
	messages: TMessage[];
	user: TUser | null;
};

export type TChatForm = {
	onSend: (message: string) => void;
	user: TUser | null;
	handleSmileClick: () => void;
	handleFileAttach: () => void;
};
